/**
 * PufferOne — Sepolia contract addresses and ABIs.
 *
 * Addresses are filled in after running `contracts/script/Deploy.s.sol` to
 * Sepolia. After deployment, paste the addresses below (the values are
 * intentionally `0x0…` placeholders pre-deploy).
 *
 * To regenerate: see contracts/README.md.
 */

export const SEPOLIA_CHAIN_ID = 11_155_111 as const

export type SepoliaAddress = `0x${string}`

const PLACEHOLDER = '0x0000000000000000000000000000000000000000' as SepoliaAddress

export type DeployedContracts = {
  pufETH: SepoliaAddress
  stETH: SepoliaAddress
  wstETH: SepoliaAddress
  depositor: SepoliaAddress
  vaultFactory: SepoliaAddress
  unifiETH: SepoliaAddress
  unifiUSD: SepoliaAddress
  unifiBTC: SepoliaAddress
  pufETHs: SepoliaAddress
  swapRouter: SepoliaAddress
  ethUnstake: SepoliaAddress
}

/// PufferOne deployed contracts on Sepolia (chain 11155111).
/// Deployed via contracts/script/Deploy.s.sol on 2026-05-22.
/// MockEthUnstake added 2026-05-22 via DeployEthUnstake.s.sol (pre-funded 0.3 ETH).
export const CONTRACTS: DeployedContracts = {
  pufETH: '0xd44387034102491Af58292fF1c7405AED4e7Eb04',
  stETH: '0xB59271CD9158Bb50125c3F9AC5CA013eE2fa7AF6',
  wstETH: '0x0353908C9a9b58108E7A6446619B567A9207336D',
  depositor: '0x8628C68227EAfe1B435eb3F918e5358aE5b1c390',
  vaultFactory: '0xBEd71c18e2275F0A10c56c8f22EbFE774f05Ef3c',
  unifiETH: '0x4D42919570c9dF3356afa44A0236198168933CCD',
  unifiUSD: '0x4C0234A302650E5B56A5D658A037143f6B72948f',
  unifiBTC: '0xEae62881Bbeeb18bDAE3a9C5edAB4B7eF33128e4',
  pufETHs: '0xE8EAB43253f09C674B49b39451Bd3647cB21AeEb',
  swapRouter: '0xF69507F745dC5b4a92f34c824A06e5308578361a',
  ethUnstake: '0x24842fcD8c000d23F5e19BB3dFdda4a764802D11',
}

/// True when the user has populated the addresses post-deploy.
export const isDeployed = (): boolean => CONTRACTS.pufETH !== PLACEHOLDER

/**
 * ABIs — manually trimmed to the surface the frontend actually calls.
 * Keep these in sync with `contracts/src/*.sol` if the contracts change.
 */

export const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'name',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
] as const

export const FAUCET_ABI = [
  {
    type: 'function',
    name: 'faucetMint',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'faucetCap',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const

export const DEPOSITOR_ABI = [
  {
    type: 'function',
    name: 'depositETH',
    stateMutability: 'payable',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'depositStETH',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'depositWstETH',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'quoteETH',
    stateMutability: 'pure',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'quoteStETH',
    stateMutability: 'pure',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'quoteWstETH',
    stateMutability: 'pure',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
] as const

export const VAULT_ABI = [
  {
    type: 'function',
    name: 'deposit',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'assets', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'withdraw',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'previewDeposit',
    stateMutability: 'view',
    inputs: [{ name: 'assets', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'previewRedeem',
    stateMutability: 'view',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'sharePrice',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const

export const SWAP_ROUTER_ABI = [
  {
    type: 'function',
    name: 'quote',
    stateMutability: 'view',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'path', type: 'address[]' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'swapExactTokensForTokens',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'minAmountOut', type: 'uint256' },
      { name: 'path', type: 'address[]' },
    ],
    outputs: [{ type: 'uint256' }],
  },
] as const

export const ETH_UNSTAKE_ABI = [
  {
    type: 'function',
    name: 'unstakeETH',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'pufETHIn', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'quoteUnstake',
    stateMutability: 'view',
    inputs: [{ name: 'pufETHIn', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'ethReserve',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'rate',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const
