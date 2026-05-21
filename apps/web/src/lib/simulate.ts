import type { Abi, Address, PublicClient } from 'viem'

export type SimulationResult<T = unknown> =
  | { ok: true; result: T }
  | { ok: false; error: string; revertReason?: string }

/// Wraps publicClient.simulateContract with consistent error handling.
/// Use this BEFORE every writeContract call (per security/SKILL.md §1.1).
///
/// On success, returns the simulated return value as `result`. On failure
/// (revert, RPC error, etc.), returns a human-readable error message that
/// downstream UI (RiskPanel, TxSummaryCard) can surface to the user.
export async function simulate<T = unknown>(
  client: PublicClient,
  params: {
    address: Address
    abi: Abi
    functionName: string
    args?: readonly unknown[]
    value?: bigint
    account: Address
  },
): Promise<SimulationResult<T>> {
  try {
    const { result } = await client.simulateContract({
      address: params.address,
      abi: params.abi,
      functionName: params.functionName,
      args: params.args as readonly unknown[],
      value: params.value,
      account: params.account,
    })
    return { ok: true, result: result as T }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    // viem's ContractFunctionRevertedError exposes `.reason` and `.shortMessage`
    const revertReason = extractRevertReason(err)
    return { ok: false, error: message, revertReason }
  }
}

function extractRevertReason(err: unknown): string | undefined {
  if (!err || typeof err !== 'object') return undefined
  const e = err as { reason?: string; shortMessage?: string; cause?: unknown }
  return e.reason ?? e.shortMessage ?? extractRevertReason(e.cause)
}
