# x402-omnigraph

Standardized, open-source subgraphs for the [x402 payment protocol](https://www.x402.org/) across 5 EVM chains. Every on-chain x402 payment settlement is queryable via GraphQL through [The Graph](https://thegraph.com/).


## Live Deployments

| Chain | Status | Studio |
|-------|--------|--------|
| **Base** | Syncing | In Process|
| Ethereum | Planned | — |
| Polygon | Planned | — |
| Arbitrum | Planned | — |
| Optimism | Planned | — |

**Query endpoint (Base):**
```
https://api.studio.thegraph.com/query/1745687/x-402-base/v0.3.0
```

## What It Indexes

x402 payments settle on-chain through two mechanisms. This subgraph captures both:

### 1. EIP-3009 Path (`transferWithAuthorization`)
For tokens with native EIP-3009 support (USDC, EURC). The facilitator calls `transferWithAuthorization` on the token contract.

- **Event:** `AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce)` on USDC
- **Filtering:** Only processes transfers where `msg.sender` is a registered facilitator in the on-chain `FacilitatorRegistry`
- **Receipt parsing:** Extracts `to` and `amount` from the paired `Transfer` event in the same transaction

### 2. Permit2 Path (`settle` / `settleWithPermit`)
For tokens using Uniswap's Permit2 via the `x402ExactPermit2Proxy` contract.

- **Events:** `Settled()` and `SettledWithPermit()` on the Permit2Proxy
- **Self-identifying:** These events only fire from x402 flows — no facilitator gate needed
- **Receipt parsing:** Extracts payment details from the USDC `Transfer` event in the receipt

## Architecture

```
FacilitatorRegistry (on-chain)        x402ExactPermit2Proxy
    │ FacilitatorAdded events              │ Settled() events
    │ FacilitatorRemoved events            │ SettledWithPermit() events
    ▼                                      ▼
┌─────────────────────────────────────────────────┐
│              Subgraph Mappings                   │
│                                                  │
│  registry.ts    usdc.ts       permit2proxy.ts    │
│  (facilitator   (EIP-3009     (Permit2 path,     │
│   CRUD)          + gate)       self-identifying)  │
└──────────────────────┬──────────────────────────┘
                       ▼
              Standardized Schema
              (identical all chains)
```

## On-Chain Contracts (Base)

| Contract | Address |
|----------|---------|
| FacilitatorRegistry | [`0x67C75c4FD5BbbF5f6286A1874fe2d7dF0024Ebe8`](https://basescan.org/address/0x67C75c4FD5BbbF5f6286A1874fe2d7dF0024Ebe8) |
| USDC (FiatTokenV2_2) | [`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`](https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) |
| x402ExactPermit2Proxy | [`0x402085c248EeA27D92E8b30b2C58ed07f9E20001`](https://basescan.org/address/0x402085c248EeA27D92E8b30b2C58ed07f9E20001) |

## FacilitatorRegistry

The registry is an on-chain `Ownable` contract that tracks known x402 facilitator addresses. **Adding a new facilitator does not require redeploying the subgraph** — just call `addFacilitator()` on-chain and the subgraph picks it up on the next block.

Currently seeded with **103 facilitator addresses** across 27 operators, sourced from [x402scan.com](https://www.x402scan.com/):

| Facilitator | Addresses | Notes |
|-------------|-----------|-------|
| Coinbase CDP | 25 | Primary production facilitator |
| PayAI | 15 | |
| Thirdweb | 10 | |
| Questflow | 10 | |
| Heurist | 9 | |
| X402rs | 6 | |
| CodeNut | 4 | |
| AurraCloud | 3 | |
| + 19 more | 21 | Daydreams, Meridian, Bitrefill, RelAI, etc. |

## Schema

One canonical GraphQL schema deployed identically across all chains:

```graphql
type X402Payment @entity(immutable: true) {
  id: Bytes!                       # txHash.concatI32(logIndex)
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: Bytes!
  from: Bytes!                     # payer
  to: Bytes!                       # recipient (resource server)
  facilitator: Facilitator         # nullable for Permit2 path
  amount: BigInt!                  # atomic units
  amountDecimal: BigDecimal!       # human-readable
  asset: Bytes!                    # token contract
  assetSymbol: String
  nonce: Bytes                     # EIP-3009 nonce
  transferMethod: TransferMethod!  # EIP3009 or PERMIT2
  chainId: BigInt!
  network: String!                 # CAIP-2 e.g. "eip155:8453"
}

type Facilitator @entity { ... }
type X402AddressSummary @entity { ... }
type X402DailyStats @entity { ... }
```

See [schema.graphql](schema.graphql) for the full schema.

## Graph Best Practices Applied

1. **Immutable entities** — `X402Payment @entity(immutable: true)` for ~28% faster indexing
2. **Bytes IDs** — 2x more storage-efficient than string IDs
3. **@derivedFrom** — `Facilitator.payments` avoids duplicate arrays
4. **No eth_calls** — pure event-driven, store lookups only
5. **Pruning** — `indexerHints: prune: auto` in manifest
6. **Grafting ready** — commented config for hotfix deploys
7. **BigDecimal** — paired with BigInt for human-readable volumes
8. **Optimized start blocks** — no wasted sync on pre-x402 data

## Example Queries

### Recent payments
```graphql
{
  x402Payments(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
    amountDecimal
    from
    to
    transferMethod
    blockTimestamp
    facilitator { name }
  }
}
```

### Top recipients by volume
```graphql
{
  x402AddressSummaries(
    where: { role: RECIPIENT }
    orderBy: totalVolume
    orderDirection: desc
    first: 20
  ) {
    address
    totalPayments
    totalVolumeDecimal
  }
}
```

### Facilitator leaderboard
```graphql
{
  facilitators(orderBy: totalVolume, orderDirection: desc) {
    name
    isActive
    totalSettlements
    totalVolumeDecimal
  }
}
```

### Daily stats
```graphql
{
  x402DailyStats_collection(orderBy: id, orderDirection: desc, first: 7) {
    date
    totalPayments
    totalVolumeDecimal
    eip3009Payments
    permit2Payments
  }
}
```

## Multi-Chain Deploy

Uses mustache templating — one schema, per-chain config:

```bash
# Build for any chain
npm run build:base
npm run build:mainnet
npm run build:polygon
npm run build:arbitrum
npm run build:optimism

# Deploy
npm run deploy:base
```

Each chain has a config file in `config/` with network-specific addresses and start blocks. The `scripts/prepare.js` script renders `subgraph.template.yaml` and `src/helpers.template.ts` with the correct values.

## Project Structure

```
x402-omnigraph/
├── config/                          Per-chain configs (5 chains)
├── facilitators/                    Seed data from x402scan.com
├── contracts/FacilitatorRegistry.sol
├── scripts/
│   ├── DeployRegistry.s.sol         Foundry CREATE2 deploy
│   ├── SeedTop.s.sol                Seed facilitator addresses
│   └── prepare.js                   Mustache template renderer
├── schema.graphql                   Canonical schema (all chains)
├── subgraph.template.yaml           Mustache template
├── src/
│   ├── helpers.template.ts          Chain constants template
│   ├── registry.ts                  Facilitator CRUD handlers
│   ├── usdc.ts                      EIP-3009 path
│   └── permit2proxy.ts              Permit2 path
└── abis/                            Minimal ABIs (3 contracts)
```

## Adding a New Facilitator

No subgraph redeployment needed:

```bash
# On-chain registration (owner only)
cast send 0x67C75c4FD5BbbF5f6286A1874fe2d7dF0024Ebe8 \
  "addFacilitator(address,string,string)" \
  0xNEW_ADDRESS "Facilitator Name" "https://endpoint.url" \
  --rpc-url https://mainnet.base.org \
  --private-key $OWNER_KEY
```

The subgraph picks up the `FacilitatorAdded` event on the next block and starts indexing payments from that address.

## References

- [x402 Protocol](https://www.x402.org/) — official site
- [coinbase/x402](https://github.com/coinbase/x402) — protocol implementation
- [x402scan.com](https://www.x402scan.com/) — ecosystem explorer (facilitator source data)
- [Merit-Systems/x402scan](https://github.com/Merit-Systems/x402scan) — x402scan source
- [The Graph on x402](https://thegraph.com/blog/understanding-x402-erc8004/) — The Graph's x402 coverage
- [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009) — transferWithAuthorization standard
- [CDP x402 Docs](https://docs.cdp.coinbase.com/x402/network-support) — Coinbase facilitator docs

## License

MIT
