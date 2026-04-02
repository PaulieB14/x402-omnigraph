import { Address, BigInt, Bytes, ethereum, log } from '@graphprotocol/graph-ts'
import { Settled, SettledWithPermit } from '../generated/x402Permit2Proxy/x402ExactPermit2Proxy'
import { Facilitator, X402Payment } from '../generated/schema'
import {
  CHAIN_ID, NETWORK, USDC_ADDRESS, USDC_SYMBOL,
  TRANSFER_TOPIC,
  updateFacilitatorAggregates,
  updateAddressSummary,
  updateDailyStats,
  makePaymentId,
  toDecimal
} from './helpers'

// Both Settled() and SettledWithPermit() emit zero parameters.
// We extract payment details from the USDC Transfer event in the tx receipt.
// The Permit2Proxy is self-identifying — these events only fire from x402 flows.

function handleSettlement(
  txHash: Bytes,
  logIndex: BigInt,
  blockNumber: BigInt,
  blockTimestamp: BigInt,
  txFrom: Address,
  receiptLogs: Array<ethereum.Log>
): void {
  // Find the USDC Transfer event in the receipt
  let found = false
  let transferFrom = Address.zero()
  let transferTo = Address.zero()
  let transferValue = BigInt.zero()

  for (let i = 0; i < receiptLogs.length; i++) {
    let receiptLog = receiptLogs[i]

    if (receiptLog.topics.length < 3) continue
    if (!receiptLog.address.equals(USDC_ADDRESS)) continue
    if (!receiptLog.topics[0].equals(TRANSFER_TOPIC)) continue

    transferFrom = Address.fromBytes(
      Bytes.fromUint8Array(receiptLog.topics[1].slice(12))
    )
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
    log.warning('No USDC Transfer found in Permit2 settlement tx {}', [txHash.toHexString()])
    return
  }

  // Try to attribute to a registered facilitator
  let facilitatorId = txFrom as Bytes
  let facilitator = Facilitator.load(facilitatorId)

  let paymentId = makePaymentId(txHash, logIndex)
  let payment = new X402Payment(paymentId)

  payment.blockNumber = blockNumber
  payment.blockTimestamp = blockTimestamp
  payment.transactionHash = txHash
  payment.from = transferFrom
  payment.to = transferTo
  payment.facilitator = facilitator != null ? facilitatorId : null
  payment.amount = transferValue
  payment.amountDecimal = toDecimal(transferValue)
  payment.asset = USDC_ADDRESS
  payment.assetSymbol = USDC_SYMBOL
  payment.nonce = null
  payment.transferMethod = 'PERMIT2'
  payment.chainId = CHAIN_ID
  payment.network = NETWORK
  payment.save()

  if (facilitator != null) {
    updateFacilitatorAggregates(facilitator as Facilitator, transferValue)
  }
  updateAddressSummary(transferFrom, 'PAYER', transferValue, blockTimestamp)
  updateAddressSummary(transferTo, 'RECIPIENT', transferValue, blockTimestamp)
  updateDailyStats(blockTimestamp, transferValue, false)
}

export function handleSettled(event: Settled): void {
  let receipt = event.receipt
  if (receipt == null) {
    log.warning('No receipt for Settled tx {}', [event.transaction.hash.toHexString()])
    return
  }
  handleSettlement(
    event.transaction.hash,
    event.logIndex,
    event.block.number,
    event.block.timestamp,
    event.transaction.from,
    receipt.logs
  )
}

export function handleSettledWithPermit(event: SettledWithPermit): void {
  let receipt = event.receipt
  if (receipt == null) {
    log.warning('No receipt for SettledWithPermit tx {}', [event.transaction.hash.toHexString()])
    return
  }
  handleSettlement(
    event.transaction.hash,
    event.logIndex,
    event.block.number,
    event.block.timestamp,
    event.transaction.from,
    receipt.logs
  )
}
