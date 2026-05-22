import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { type Address, createPublicClient, custom } from 'viem'
import { CHAIN, CHAIN_ID, createWalletClientFromProvider, getPublicClient } from '../lib/viem'
import {
  detectInjectedKind,
  detectInjectedProvider,
  type ExtendedProvider,
  type InjectedWalletKind,
} from '../lib/wallet'

const STORAGE_KEY = 'pufferone:lastConnector'

type Connector = 'injected' | 'walletconnect' | null

type WalletState = {
  connector: Connector
  provider: ExtendedProvider | null
  address: Address | null
  chainId: number | null
  injectedKind: InjectedWalletKind
  isConnecting: boolean
  error: string | null
}

const initialState: WalletState = {
  connector: null,
  provider: null,
  address: null,
  chainId: null,
  injectedKind: 'unknown',
  isConnecting: false,
  error: null,
}

type WalletContextValue = WalletState & {
  isConnected: boolean
  isCorrectChain: boolean
  publicClient: ReturnType<typeof getPublicClient>
  walletClient: ReturnType<typeof createWalletClientFromProvider> | null
  connectInjected: () => Promise<void>
  disconnect: () => void
  switchToSepolia: () => Promise<void>
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(initialState)

  const connectInjected = useCallback(async () => {
    const provider = detectInjectedProvider()
    if (!provider) {
      setState((s) => ({
        ...s,
        error: 'No browser wallet detected. Install MetaMask or open in imToken.',
      }))
      return
    }

    setState((s) => ({ ...s, isConnecting: true, error: null }))

    try {
      const accounts = (await provider.request({
        method: 'eth_requestAccounts',
      })) as Address[]
      const chainHex = (await provider.request({ method: 'eth_chainId' })) as string
      const chainId = Number.parseInt(chainHex, 16)

      window.localStorage.setItem(STORAGE_KEY, 'injected')

      setState({
        connector: 'injected',
        provider,
        address: accounts[0] ?? null,
        chainId,
        injectedKind: detectInjectedKind(),
        isConnecting: false,
        error: null,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect.'
      setState((s) => ({ ...s, isConnecting: false, error: message }))
    }
  }, [])

  const disconnect = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setState(initialState)
  }, [])

  /// Subscribe to account / chain change events on the active provider.
  useEffect(() => {
    const provider = state.provider
    if (!provider) return

    const handleAccountsChanged = (accounts: unknown) => {
      const list = accounts as Address[]
      if (list.length === 0) {
        disconnect()
        return
      }
      setState((s) => ({ ...s, address: list[0] ?? null }))
    }

    const handleChainChanged = (chain: unknown) => {
      const next = typeof chain === 'string' ? Number.parseInt(chain, 16) : Number(chain)
      setState((s) => ({ ...s, chainId: next }))
    }

    const p = provider as ExtendedProvider & {
      on?: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
    }
    p.on?.('accountsChanged', handleAccountsChanged)
    p.on?.('chainChanged', handleChainChanged)
    return () => {
      p.removeListener?.('accountsChanged', handleAccountsChanged)
      p.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [state.provider, disconnect])

  /// Auto-reconnect if the user previously connected via injected provider.
  // biome-ignore lint/correctness/useExhaustiveDependencies: connectInjected is stable; only run once on mount
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'injected' && !state.address) {
      void connectInjected()
    }
  }, [])

  const switchToSepolia = useCallback(async () => {
    const provider = state.provider
    if (!provider) return
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
      })
    } catch (err) {
      const code = (err as { code?: number }).code
      if (code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${CHAIN_ID.toString(16)}`,
              chainName: 'Sepolia',
              nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        })
      }
    }
  }, [state.provider])

  const walletClient = useMemo(() => {
    if (!state.provider || !state.address) return null
    return createWalletClientFromProvider(state.provider, state.address)
  }, [state.provider, state.address])

  /// 钱包连接后，simulate/读取走钱包自己的 RPC（通常显著快于公开 HTTP RPC，
  /// 比如 publicnode.com 高峰期能慢到 5+ 秒）。未连接时退回 HTTP fallback。
  const publicClient = useMemo(() => {
    if (state.provider && state.chainId === CHAIN_ID) {
      return createPublicClient({ chain: CHAIN, transport: custom(state.provider) })
    }
    return getPublicClient()
  }, [state.provider, state.chainId])

  const value = useMemo<WalletContextValue>(
    () => ({
      ...state,
      isConnected: state.address !== null,
      isCorrectChain: state.chainId === CHAIN_ID,
      publicClient,
      walletClient,
      connectInjected,
      disconnect,
      switchToSepolia,
    }),
    [state, walletClient, publicClient, connectInjected, disconnect, switchToSepolia],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext)
  if (!ctx) {
    throw new Error('useWallet must be used inside <WalletProvider>')
  }
  return ctx
}
