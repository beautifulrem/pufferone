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
}

export const CONTRACTS: DeployedContracts = {
  pufETH: PLACEHOLDER,
  stETH: PLACEHOLDER,
  wstETH: PLACEHOLDER,
  depositor: PLACEHOLDER,
  vaultFactory: PLACEHOLDER,
  unifiETH: PLACEHOLDER,
  unifiUSD: PLACEHOLDER,
  unifiBTC: PLACEHOLDER,
  pufETHs: PLACEHOLDER,
  swapRouter: PLACEHOLDER,
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
