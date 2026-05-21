import { useMutation } from '@tanstack/react-query'
import { parseUnits, type Address, type Hash } from 'viem'
import { CONTRACTS, DEPOSITOR_ABI, isDeployed } from '../lib/contracts'
import { simulate } from '../lib/simulate'
import { useWallet } from './useWallet'

export type StakeToken = 'stETH' | 'wstETH'

export type StakeERC20Input = {
  token: StakeToken
  amount: string // human-readable e.g. "10"
}

export type StakeERC20Result = {
  txHash: Hash
  expectedPufETH: bigint
  inputWei: bigint
}

export type StakeERC20Error =
  | { kind: 'not-deployed' }
  | { kind: 'not-connected' }
  | { kind: 'wrong-chain' }
  | { kind: 'simulation-failed'; reason: string }
  | { kind: 'signing-rejected'; reason: string }
  | { kind: 'unknown'; reason: string }

const FUNCTION_BY_TOKEN: Record<StakeToken, 'depositStETH' | 'depositWstETH'> = {
  stETH: 'depositStETH',
  wstETH: 'depositWstETH',
}

export function useStakeERC20() {
  const wallet = useWallet()

  return useMutation<StakeERC20Result, StakeERC20Error, StakeERC20Input>({
    mutationFn: async ({ token, amount }) => {
      if (!isDeployed()) throw { kind: 'not-deployed' } satisfies StakeERC20Error
      if (!wallet.walletClient || !wallet.address) {
        throw { kind: 'not-connected' } satisfies StakeERC20Error
      }
      if (!wallet.isCorrectChain) throw { kind: 'wrong-chain' } satisfies StakeERC20Error

      const inputWei = parseUnits(amount, 18)
      const account: Address = wallet.address
      const fnName = FUNCTION_BY_TOKEN[token]

      // 1. Simulate
      const sim = await simulate<bigint>(wallet.publicClient, {
        address: CONTRACTS.depositor,
        abi: DEPOSITOR_ABI,
        functionName: fnName,
        args: [inputWei],
        account,
      })
      if (!sim.ok) {
        throw {
          kind: 'simulation-failed',
          reason: sim.revertReason ?? sim.error,
        } satisfies StakeERC20Error
      }

      // 2. Sign + broadcast
      try {
        const txHash = await wallet.walletClient.writeContract({
          address: CONTRACTS.depositor,
          abi: DEPOSITOR_ABI,
          functionName: fnName,
          args: [inputWei],
          account,
          chain: wallet.walletClient.chain,
        })
        return { txHash, expectedPufETH: sim.result, inputWei }
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err)
        throw {
          kind: /user rejected|denied/i.test(reason) ? 'signing-rejected' : 'unknown',
          reason,
        } satisfies StakeERC20Error
      }
    },
  })
}
