import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  FacilitatorAdded,
  FacilitatorRemoved
} from '../generated/FacilitatorRegistry/FacilitatorRegistry'
import { Facilitator } from '../generated/schema'
import { ZERO_BI, ZERO_BD } from './helpers'

export function handleFacilitatorAdded(event: FacilitatorAdded): void {
  // Best practice: Bytes ID — use raw address bytes
  let id = event.params.facilitator

  // Idempotent: re-activating a previously removed facilitator
  let facilitator = Facilitator.load(id)
  if (facilitator == null) {
    facilitator = new Facilitator(id)
    facilitator.address = event.params.facilitator
    facilitator.totalSettlements = ZERO_BI
    facilitator.totalVolume = ZERO_BI
    facilitator.totalVolumeDecimal = ZERO_BD
    facilitator.addedAtBlock = event.block.number
    facilitator.addedAtTimestamp = event.block.timestamp
  }

  facilitator.name = event.params.name
  facilitator.userDefined_url = event.params.url
  facilitator.isActive = true
  facilitator.removedAtBlock = null
  facilitator.removedAtTimestamp = null
  facilitator.save()
}

export function handleFacilitatorRemoved(event: FacilitatorRemoved): void {
  let id = event.params.facilitator
  let facilitator = Facilitator.load(id)
  if (facilitator == null) return

  facilitator.isActive = false
  facilitator.removedAtBlock = event.block.number
  facilitator.removedAtTimestamp = event.block.timestamp
  facilitator.save()
}
