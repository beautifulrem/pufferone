import {
  createPublicClient,
  createWalletClient,
  custom,
  fallback,
  http,
  type Address,
  type EIP1193Provider,
  type PublicClient,
  type WalletClient,
} from 'viem'
import { sepolia } from 'viem/chains'

export const CHAIN = sepolia
export const CHAIN_ID = sepolia.id // 11155111

const RPC_FALLBACKS = [
  import.meta.env.VITE_SEPOLIA_RPC_URL ?? 'https://ethereum-sepolia-rpc.publicnode.com',
  'https://rpc.sepolia.org',
  'https://rpc2.sepolia.org',
] as const

let cachedPublicClient: PublicClient | null = null

/// Public client for reads (eth_call, eth_getBalance, simulateContract, etc.).
/// Uses a fallback RPC list so the demo stays alive if one provider blips.
export function getPublicClient(): PublicClient {
  if (cachedPublicClient) return cachedPublicClient
  cachedPublicClient = createPublicClient({
    chain: CHAIN,
    transport: fallback(RPC_FALLBACKS.map((url) => http(url))),
  })
  return cachedPublicClient
}

/// Wallet client for writes (signing, broadcasting). Wraps any EIP-1193 provider
/// (window.ethereum from imToken / MetaMask, or a WalletConnect-derived provider).
/// The provider — not us — holds the private key.
export function createWalletClientFromProvider(
  provider: EIP1193Provider,
  account: Address,
): WalletClient {
  return createWalletClient({
    account,
    chain: CHAIN,
    transport: custom(provider),
  })
}
