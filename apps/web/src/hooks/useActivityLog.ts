import { useCallback, useEffect, useState } from 'react'

/// 简易的本地交易历史：最近 10 笔签名活动，存 localStorage。
///
/// 钱包本身就有完整 tx 历史（Etherscan / imToken 内置），所以我们只
/// 记录 PufferOne 业务级别的语义事件（"质押 0.5 ETH"），方便用户在
/// 应用内回看做过什么操作 — 比纯 hash 列表友好得多。

const STORAGE_KEY = 'pufferone:activity-log'
const MAX_ENTRIES = 10

export type ActivityType =
  | 'stake'
  | 'unstake'
  | 'swap'
  | 'vault-deposit'
  | 'vault-withdraw'
  | 'transfer'

export type ActivityEntry = {
  id: string
  type: ActivityType
  /// 一句话动作描述（"质押 0.5 ETH → pufETH"）
  label: string
  /// 链上 tx hash（用户可点 Etherscan 看）
  txHash: string
  /// Unix ms
  ts: number
}

function read(): ActivityEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(entries: ActivityEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {
    /* quota / disabled — silent */
  }
}

/// React hook — 订阅 localStorage 变化，让多 tab 也能同步
export function useActivityLog() {
  const [entries, setEntries] = useState<ActivityEntry[]>(() => read())

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setEntries(read())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const add = useCallback((entry: Omit<ActivityEntry, 'id' | 'ts'>) => {
    const next: ActivityEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(),
    }
    const merged = [next, ...read()].slice(0, MAX_ENTRIES)
    write(merged)
    setEntries(merged)
  }, [])

  const clear = useCallback(() => {
    write([])
    setEntries([])
  }, [])

  return { entries, add, clear }
}
