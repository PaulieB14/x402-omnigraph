import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts'
import { AuthorizationUsed } from '../generated/USDC/FiatTokenV2_2'
import { Facilitator, X402Payment } from '../generated/schema'
import {
  CHAIN_ID, NETWORK, USDC_ADDRESS, USDC_SYMBOL,
  TRANSFER_TOPIC, ZERO_BI, ZERO_BD,
  updateFacilitatorAggregates,
  updateAddressSummary,
  updateDailyStats,
  makePaymentId,
  toDecimal
} from './helpers'
import { getStaticFacilitatorName } from './facilitators'

// Resolve a Facilitator entity — checks store first (fast path), then falls
// back to the compiled-in static allowlist for historical blocks before the
// FacilitatorRegistry was deployed. Creates the entity on first encounter.
function resolveFacilitator(address: Bytes): Facilitator | null {
  // Fast path: entity already in store (post-registry or previously created)
  let facilitator = Facilitator.load(address)
  if (facilitator != null) {
    return facilitator.isActive ? facilitator : null
  }

  // Fallback: check static allowlist (O(1) hash map lookup)
  let name = getStaticFacilitatorName(address.toHexString().toLowerCase())
  if (name == null) return null

  // First encounter — create entity so future lookups hit the store
  facilitator = new Facilitator(address)
  facilitator.address = address
  facilitator.name = name
  facilitator.isActive = true
  facilitator.addedAtBlock = ZERO_BI
  facilitator.addedAtTimestamp = ZERO_BI
  facilitator.totalSettlements = ZERO_BI
  facilitator.totalVolume = ZERO_BI
  facilitator.totalVolumeDecimal = ZERO_BD
  facilitator.save()

  return facilitator
}

export function handleAuthorizationUsed(event: AuthorizationUsed): void {
  // ── GATE: resolve facilitator from store or static allowlist ──────────
  let facilitatorId = event.transaction.from
  let facilitator = resolveFacilitator(facilitatorId)
  if (facilitator == null) return

  // ── Extract Transfer details from receipt logs ───────────────────────
  let receipt = event.receipt
  if (receipt == null) {
    log.warning('No receipt for tx {}', [event.transaction.hash.toHexString()])
    return
  }

  let found = false
  let transferTo = Address.zero()
  let transferValue = BigInt.zero()

  for (let i = 0; i < receipt.logs.length; i++) {
    let receiptLog = receipt.logs[i]

    if (receiptLog.topics.length < 3) continue
    if (!receiptLog.address.equals(USDC_ADDRESS)) continue
    if (!receiptLog.topics[0].equals(TRANSFER_TOPIC)) continue

    let logFrom = Address.fromBytes(
      Bytes.fromUint8Array(receiptLog.topics[1].slice(12))
    )

    if (!logFrom.equals(event.params.authorizer)) continue

    transferTo = Address.fromBytes(
      Bytes.fromUint8Array(receiptLog.topics[2].slice(12))
    )

    let dataBytes = receiptLog.data
    let reversed = new Uint8Array(dataBytes.length)
    for (let j = 0; j < dataBytes.length; j++) {
      reversed[j] = dataBytes[dataBytes.length - 1 - j]
    }
    transferValue = BigInt.fromUnsignedBytes(Bytes.fromUint8Array(reversed))
    found = true
    break
  }

  if (!found) {
    log.warning(
      'Could not find matching Transfer log in tx {} for authorizer {}',
      [event.transaction.hash.toHexString(), event.params.authorizer.toHexString()]
    )
    return
  }

  // ── Create X402Payment entity ────────────────────────────────────────
  let paymentId = makePaymentId(event.transaction.hash, event.logIndex)
  let payment = new X402Payment(paymentId)

  payment.blockNumber = event.block.number
  payment.blockTimestamp = event.block.timestamp
  payment.transactionHash = event.transaction.hash
  payment.from = event.params.authorizer
  payment.to = transferTo
  payment.facilitator = facilitatorId
  payment.amount = transferValue
  payment.amountDecimal = toDecimal(transferValue)
  payment.asset = USDC_ADDRESS
  payment.assetSymbol = USDC_SYMBOL
  payment.nonce = event.params.nonce
  payment.transferMethod = 'EIP3009'
  payment.chainId = CHAIN_ID
  payment.network = NETWORK
  payment.save()

  // ── Update aggregates ────────────────────────────────────────────────
  updateFacilitatorAggregates(facilitator as Facilitator, transferValue)
  updateAddressSummary(event.params.authorizer, 'PAYER', transferValue, event.block.timestamp)
  updateAddressSummary(transferTo, 'RECIPIENT', transferValue, event.block.timestamp)
  updateDailyStats(event.block.timestamp, transferValue, true)
}
