import { SwapForm } from '../components/SwapForm'

export function SwapPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <p className="mb-3 font-mono text-[length:var(--text-caption)] text-primary uppercase tracking-[2.5px]">
          题目要求 06 · DEX 聚合（进阶）
        </p>
        <h1 className="mb-4 font-bold text-4xl text-foreground leading-[1.1] tracking-tight">
          Any → <span className="identity-gradient">pufETH</span>
        </h1>
        <p className="mb-6 text-text-secondary-gray leading-relaxed">
          题目进阶要求："集成 DEX 聚合器，探索任意代币到 pufETH 的一站式存入流程"。
          PufferOne 部署了 MockSwapRouter（Uniswap V3 风格），支持多跳路径 + 滑点保护
          + minOut 强制。前端展示完整路由 chip 链。
        </p>

        <ul className="space-y-3 font-mono text-sm text-text-tertiary">
          <li>
            <span className="text-primary">→</span> Path chip 链可视化路由
          </li>
          <li>
            <span className="text-primary">→</span> Slippage 滑块 0.1% – 5%
          </li>
          <li>
            <span className="text-primary">→</span> minOut 链上强制（不只是 UI）
          </li>
          <li>
            <span className="text-primary">→</span> 静态 simulate 在签名前验证
          </li>
        </ul>
      </div>

      <SwapForm />
    </div>
  )
}
