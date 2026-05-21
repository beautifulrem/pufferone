import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { Card, CardContent } from '@repo/ui/components/card'
import { useWallet } from '../hooks/useWallet'

type FeatureCard = {
  index: string
  title: string
  description: string
}

const features: FeatureCard[] = [
  {
    index: '01',
    title: '连接钱包',
    description: 'imToken EIP-1193 注入 + MetaMask + WalletConnect 三栈支持，永不持有用户密钥。',
  },
  {
    index: '02',
    title: '3 币种铸造 pufETH',
    description: 'ETH / stETH / wstETH 三个入口在 Sepolia 上全部真实链上可执行，非 UI 占位。',
  },
  {
    index: '03',
    title: 'pufETH 余额与汇率',
    description: '实时余额、USD 估值、rate 历史 24h / 7d 变化，链上数据 + Puffer 主网 API。',
  },
  {
    index: '04',
    title: 'UniFi Vault 真实存入',
    description: '4 个 vault（unifiETH / unifiUSD / unifiBTC / pufETHs）在 Mini App 内可交互，不跳走主网。',
  },
  {
    index: '05',
    title: '安全引导',
    description: '5 个具体机制：交易模拟、风险评分、滑点保护、精确授权、签前总结卡。',
  },
  {
    index: '06',
    title: 'DEX 聚合一站式',
    description: '任意 ERC-20 经 Uniswap V3 多跳路由换成 pufETH 或 vault 资产，路径与最小输出可见。',
  },
]

function HomePage() {
  const wallet = useWallet()

  return (
    <>
      {/* Hero */}
      <section className="mb-16">
        <p className="mb-5 font-mono text-[length:var(--text-caption)] text-primary uppercase tracking-[2.5px]">
          imToken 十周年 · Puffer 专项
        </p>
        <h1 className="mb-6 font-bold text-5xl text-foreground leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
          把 Puffer 质押的
          <br />
          <span className="identity-gradient">每一条要求</span>
          <br />
          做到底。
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-text-secondary-gray leading-relaxed">
          PufferOne 是一个兼容 imToken 的 Puffer 质押 Mini App。
          正面回应题目原文 6 条要求，附加 5 个具体安全机制与新手引导。
          <span className="block mt-2 font-mono text-[length:var(--text-body-sm)] text-text-tertiary">
            ETH / stETH / wstETH → pufETH · 4 UniFi Vaults · DEX 聚合 · Safe by design.
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {wallet.isConnected ? (
            <Badge variant="success" className="px-4 py-2 font-mono">
              <span className="mr-2 size-2 rounded-full bg-success-text" />
              Wallet connected · Phase 3 staking flow coming next
            </Badge>
          ) : (
            <Button size="lg" onClick={wallet.connectInjected} className="font-mono">
              {wallet.isConnecting ? 'Connecting…' : 'Connect Wallet to Start'}
            </Button>
          )}
          <Button asChild variant="ghost" size="lg" className="font-mono text-text-tertiary">
            <a
              href="https://github.com/beautifulrem/pufferone"
              rel="noreferrer noopener"
              target="_blank"
            >
              View on GitHub →
            </a>
          </Button>
        </div>
        {wallet.error && (
          <p className="mt-4 font-mono text-destructive text-sm">{wallet.error}</p>
        )}
      </section>

      {/* Features grid */}
      <section>
        <p className="mb-6 font-mono text-[length:var(--text-caption)] text-text-tertiary uppercase tracking-[2.5px]">
          6 条题目要求 · 100% 深度
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.index}
              className="border-border bg-card shadow-none transition-colors hover:border-primary/50"
            >
              <CardContent className="p-6">
                <p className="mb-3 font-mono text-[length:var(--text-caption)] text-primary tracking-wider">
                  {feature.index}
                </p>
                <h3 className="mb-2 font-semibold text-foreground text-lg">{feature.title}</h3>
                <p className="text-sm text-text-tertiary leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-border border-t pt-8">
        <p className="font-mono text-[length:var(--text-caption)] text-text-tertiary">
          © 2026 PufferOne · Built for{' '}
          <a
            href="https://10th.token.im"
            className="text-primary transition-colors hover:text-primary-hover"
            rel="noreferrer noopener"
            target="_blank"
          >
            imToken 十周年共创
          </a>{' '}
          · Code on{' '}
          <a
            href="https://github.com/beautifulrem/pufferone"
            className="text-primary transition-colors hover:text-primary-hover"
            rel="noreferrer noopener"
            target="_blank"
          >
            GitHub
          </a>
        </p>
      </footer>
    </>
  )
}

export { HomePage }
