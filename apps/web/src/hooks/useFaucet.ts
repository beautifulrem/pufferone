import { useMutation, useQueryClient } from '@tanstack/react-query'
import { parseUnits, type Address, type Hash } from 'viem'
import { FAUCET_ABI } from '../lib/contracts'
import { useWallet } from './useWallet'

export type FaucetInput = {
  token: Address
  amount: string // human-readable, e.g. "50"
}

/// Mints test tokens via the public faucet (MockStETH.faucetMint / MockWstETH.faucetMint).
/// Each call mints up to faucetCap (100 ether). No cooldown in this demo mock.
export function useFaucet() {
  const wallet = useWallet()
  const qc = useQueryClient()

  return useMutation<Hash, Error, FaucetInput>({
    mutationFn: async ({ token, amount }) => {
      if (!wallet.walletClient || !wallet.address) {
        throw new Error('Wallet not connected')
      }
      const wei = parseUnits(amount, 18)
      const txHash = await wallet.walletClient.writeContract({
        address: token,
        abi: FAUCET_ABI,
        functionName: 'faucetMint',
        args: [wei],
        account: wallet.address as Address,
        chain: wallet.walletClient.chain,
      })
      await wallet.publicClient.waitForTransactionReceipt({ hash: txHash })
      void qc.invalidateQueries({ queryKey: ['token-balance', token] })
      return txHash
    },
  })
}
