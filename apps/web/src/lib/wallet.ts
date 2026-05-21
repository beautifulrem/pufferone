import type { EIP1193Provider } from 'viem'

/// Identifies an injected EIP-1193 wallet by user-agent flags. We only consume
/// `provider.isImToken` and `provider.isMetaMask` to differentiate display labels;
/// connection behavior is the same regardless of which wallet injects the provider.
export type InjectedWalletKind = 'imToken' | 'metamask' | 'unknown'

export type ExtendedProvider = EIP1193Provider & {
  isImToken?: boolean
  isMetaMask?: boolean
}

declare global {
  interface Window {
    ethereum?: ExtendedProvider
  }
}

export function detectInjectedProvider(): ExtendedProvider | null {
  if (typeof window === 'undefined') return null
  return window.ethereum ?? null
}

export function detectInjectedKind(): InjectedWalletKind {
  const provider = detectInjectedProvider()
  if (!provider) return 'unknown'
  if (provider.isImToken) return 'imToken'
  if (provider.isMetaMask) return 'metamask'
  return 'unknown'
}

export const InjectedWalletLabel: Record<InjectedWalletKind, string> = {
  imToken: 'imToken',
  metamask: 'MetaMask',
  unknown: 'Browser Wallet',
}
