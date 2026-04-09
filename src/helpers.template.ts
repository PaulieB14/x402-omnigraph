import { BigInt, BigDecimal, Bytes, Address } from '@graphprotocol/graph-ts'
import {
  X402AddressSummary,
  X402DailyStats,
  Facilitator
} from '../generated/schema'

// ── Chain config (generated via mustache from config/<network>.json) ─────────
export const CHAIN_ID = BigInt.fromI32({{chainId}})
export const NETWORK = '{{caip2}}'
export const USDC_ADDRESS = Address.fromString('{{usdcAddress}}')
export const USDC_SYMBOL = 'USDC'
export const USDC_DECIMALS = 6

// Transfer event topic: keccak256('Transfer(address,address,uint256)')
export const TRANSFER_TOPIC = Bytes.fromHexString(
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
)

export const ZERO_BI = BigInt.fromI32(0)
export const ONE_BI = BigInt.fromI32(1)
export const ZERO_BD = BigDecimal.zero()
const SECONDS_PER_DAY = BigInt.fromI32(86400)

// Best practice: pair BigInt (raw) with BigDecimal (human-readable)
const USDC_DIVISOR = BigDecimal.fromString('1000000') // 10^6

export function toDecimal(amount: BigInt): BigDecimal {
  return amount.toBigDecimal().div(USDC_DIVISOR)
}

// ── Bytes ID helpers (best practice: Bytes IDs are 2x more efficient) ───────
export function addressToBytes(address: Address): Bytes {
  return Bytes.fromHexString(address.toHexString())
}

export function makeSummaryId(role: string, address: Bytes): Bytes {
  let prefix = Bytes.fromI32(role == 'PAYER' ? 0 : 1)
  return prefix.concat(address)
}

export function makeDayId(epochDay: BigInt): Bytes {
  return Bytes.fromI32(epochDay.toI32())
}

export function makePaymentId(txHash: Bytes, logIndex: BigInt): Bytes {
  return txHash.concatI32(logIndex.toI32())
}

// ── Facilitator aggregate update ────────────────────────────────────────────
export function updateFacilitatorAggregates(
  facilitator: Facilitator,
  amount: BigInt
): void {
  facilitator.totalSettlements = facilitator.totalSettlements.plus(ONE_BI)
  facilitator.totalVolume = facilitator.totalVolume.plus(amount)
  facilitator.totalVolumeDecimal = facilitator.totalVolumeDecimal.plus(toDecimal(amount))
  facilitator.save()
}

// ── Address summary (payer or recipient) ────────────────────────────────────
export function updateAddressSummary(
  address: Bytes,
  role: string,
  amount: BigInt,
  timestamp: BigInt
): void {
  let id = makeSummaryId(role, address)
  let summary = X402AddressSummary.load(id)
  if (summary == null) {
    summary = new X402AddressSummary(id)
    summary.address = address
    summary.role = role
    summary.totalPayments = ZERO_BI
    summary.totalVolume = ZERO_BI
    summary.totalVolumeDecimal = ZERO_BD
    summary.firstPaymentTimestamp = timestamp
  }
  summary.totalPayments = summary.totalPayments.plus(ONE_BI)
  summary.totalVolume = summary.totalVolume.plus(amount)
  summary.totalVolumeDecimal = summary.totalVolumeDecimal.plus(toDecimal(amount))
  summary.lastPaymentTimestamp = timestamp
  summary.save()
}

// ── Daily stats ──────────────────────────────────────────────────────────────
export function updateDailyStats(
  timestamp: BigInt,
  amount: BigInt,
  isEip3009: bool
): void {
  let epochDay = timestamp.div(SECONDS_PER_DAY)
  let dayId = makeDayId(epochDay)

  let stats = X402DailyStats.load(dayId)
  if (stats == null) {
    stats = newDailyStats(dayId, epochDay)
  }
  stats.totalPayments = stats.totalPayments.plus(ONE_BI)
  stats.totalVolume = stats.totalVolume.plus(amount)
  stats.totalVolumeDecimal = stats.totalVolumeDecimal.plus(toDecimal(amount))
  if (isEip3009) {
    stats.eip3009Payments = stats.eip3009Payments.plus(ONE_BI)
  } else {
    stats.permit2Payments = stats.permit2Payments.plus(ONE_BI)
  }
  stats.save()
}

// ── Transfer-event daily stats (matches x402scan methodology) ────────────────
export function updateTransferDailyStats(timestamp: BigInt, amount: BigInt): void {
  let epochDay = timestamp.div(SECONDS_PER_DAY)
  let dayId = makeDayId(epochDay)
  let stats = X402DailyStats.load(dayId)
  if (stats == null) {
    stats = newDailyStats(dayId, epochDay)
  }
  stats.transferEvents = stats.transferEvents.plus(ONE_BI)
  stats.transferVolume = stats.transferVolume.plus(amount)
  stats.transferVolumeDecimal = stats.transferVolumeDecimal.plus(toDecimal(amount))
  stats.save()
}

// ── Construct a fresh X402DailyStats with all fields zeroed ──────────────────
function newDailyStats(dayId: Bytes, epochDay: BigInt): X402DailyStats {
  let stats = new X402DailyStats(dayId)
  stats.date = epochDayToDateString(epochDay)
  stats.totalPayments = ZERO_BI
  stats.totalVolume = ZERO_BI
  stats.totalVolumeDecimal = ZERO_BD
  stats.eip3009Payments = ZERO_BI
  stats.permit2Payments = ZERO_BI
  stats.transferEvents = ZERO_BI
  stats.transferVolume = ZERO_BI
  stats.transferVolumeDecimal = ZERO_BD
  return stats
}

// ── Date string helper ───────────────────────────────────────────────────────
function epochDayToDateString(epochDay: BigInt): string {
  let z = epochDay.toI32() + 719468
  let era = (z >= 0 ? z : z - 146096) / 146097
  let doe = z - era * 146097
  let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365
  let y = yoe + era * 400
  let doy = doe - (365 * yoe + yoe / 4 - yoe / 100)
  let mp = (5 * doy + 2) / 153
  let d = doy - (153 * mp + 2) / 5 + 1
  let m = mp + (mp < 10 ? 3 : -9)
  if (m <= 2) y = y + 1

  let yStr = y.toString()
  let mStr = m < 10 ? '0' + m.toString() : m.toString()
  let dStr = d < 10 ? '0' + d.toString() : d.toString()
  return yStr + '-' + mStr + '-' + dStr
}
