# PufferOne Contracts

Foundry workspace for PufferOne mock contracts deployed to Sepolia.

## Mock Contracts (Phase 1)

These are **mock contracts** for the Sepolia testnet demo. The real PufferVault and UniFi
vaults are mainnet-only — Puffer Finance does not deploy a full protocol to Sepolia.
PufferOne uses Sepolia for sign-and-broadcast UX validation; production behavior is
documented in the project README.

Already deployed on Sepolia (third party, used by the app):
- `MockNonRebasingLST` (pufETH mock): `0x83e6aebe17f41b17f99f99d0c9234cf9e5e4c9c4`

To be deployed from this workspace:
- `MockStETH` — rebasing-style stETH stand-in (ERC-20 + public mint faucet)
- `MockWstETH` — wrapped stETH stand-in (ERC-20 + public mint faucet)
- `MockPufferDepositor` — accepts ETH / stETH / wstETH, mints to existing mock pufETH
- `MockUniFiVault` — ERC-4626-style vault with configurable share rate
- `MockUniFiVaultFactory` — deploys 4 named vaults (unifiETH / unifiUSD / unifiBTC / pufETHs)
- `MockSwapRouter` — minimal Uniswap-V3-style multi-hop for any-token → pufETH demos

## Setup

```bash
cp .env.example .env
# Edit .env with your local PRIVATE_KEY (NEVER share this file)
forge build
forge test
```

## Deploy to Sepolia

```bash
source .env
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify  # optional, requires ETHERSCAN_API_KEY
```

After deploy, addresses land in `broadcast/Deploy.s.sol/11155111/run-latest.json`.
Pipe them into `../apps/web/src/lib/contracts.ts`.

## Security

- `.env` is git-ignored. Never commit it. Never share its contents with AI tools or chat.
- All contracts here are **mock** — do not reuse on mainnet.
- See `../SECURITY.md` for the project-wide security policy.
