# PufferOne

> 把 Puffer 质押的每一条要求做到底 — imToken 十周年 Puffer 合作伙伴专项作品

兼容 imToken 的 Puffer 质押 Mini App，正面回应 [Puffer 专项题目](https://10th.token.im/#showcase) 的 6 条要求：连接钱包、ETH/stETH/wstETH → pufETH、余额/汇率展示、UniFi Vault 真实存入（Mini App 内）、安全引导、DEX 聚合一站式。附加 5 个具体安全机制 + 5 步新手教学。

- **演示链接**：https://pufferone.vercel.app（待部署）
- **演示视频**：待录制
- **演示钱包**：`0xbA64397d50D71fE0c38a86B51fc77BedB580C8A4`（Sepolia 演示用，非真实资产）

## 项目状态

| Phase | 描述 | 状态 |
|---|---|---|
| 0 | Monorepo + GitHub + Vercel | 🟡 In progress |
| 1 | 6 个 mock 合约 + Sepolia 部署 | ⏳ |
| 2 | 钱包连接层（imToken + MetaMask + WC） | ⏳ |
| 3 | ETH → pufETH 端到端 | ⏳ |
| 4 | stETH / wstETH 输入路径 | ⏳ |
| 5 | 4 个 UniFi Vault 真实存入 | ⏳ |
| 6 | DEX 聚合 swap | ⏳ |
| 7 | 5 个安全机制可视化层 | ⏳ |
| 8 | 新手教学 modal | ⏳ |
| 9 | Portfolio dashboard | ⏳ |
| 10 | Exit / 赎回流程 | ⏳ |
| 11 | 端到端测试 + 打磨 | ⏳ |
| 12 | 提交比赛 | ⏳ |

## Token Core 使用说明

PufferOne 通过 imToken 浏览器注入的 EIP-1193 Provider（即 Token Core 的 Web 接口）完成全部钱包能力：账户连接（`eth_requestAccounts`）、消息签名、合约调用、链 ID 检查。所有 secret material 始终保留在用户的 imToken / MetaMask / WalletConnect 钱包中，本应用不处理、不传输、不储存任何私钥、助记词或密码。同时兼容桌面端 MetaMask 与 WalletConnect 2.0 标准，让评委在任意环境下都能完整体验。所有交易在签名前通过 `eth_call` 静态调用模拟，确保用户在签名前看到准确的预期输出与风险。

UI 组件库基于 [Token UI Starter Kit](https://github.com/consenlabs/token-ui)（imToken 官方设计系统），通过 `@repo/ui/components/*` 复用 60+ 个钱包风格组件；设计语言重写为 Web3 暗底 + 电光青绿 + 高级感。

## 安全模型

- ❌ 永远不接受 / 不储存任何 secret material（私钥、API key、助记词、密码、token）
- ✅ 所有签名经用户钱包完成
- ✅ Sepolia 测试网；演示钱包专用，非真实资产
- ✅ Mock 合约（参见 `contracts/README.md`）前端明确标注
- ✅ 5 个安全机制：交易模拟、风险评分、滑点保护、精确授权、签前总结卡
- 详细安全策略见 `SECURITY.md` 与 `security/SKILL.md`

## 仓库结构

```
.
├── apps/web/                 ← Vite + React SPA（Vercel 部署）
├── packages/ui/              ← Token UI 组件库副本（@repo/ui）
├── tooling/tsconfig/         ← 共享 TypeScript 配置
├── contracts/                ← Foundry mock 合约（独立部署）
├── DESIGN.md                 ← UI 设计规范（继承 Token UI + Web3 主题覆盖）
├── SECURITY.md               ← 安全策略
└── security/SKILL.md         ← imToken 官方安全 Skill
```

## 本地开发

```bash
# 1. 安装依赖（Node ≥ 22.12，pnpm ≥ 10.30）
pnpm install

# 2. 启动开发服务器
pnpm dev
# → http://localhost:5173

# 3. 类型检查 + Lint
pnpm typecheck
pnpm check

# 4. 智能合约（可选 — 复用已有部署即可）
cd contracts
cp .env.example .env  # 填入本地 PRIVATE_KEY（不要提交）
forge build
forge test
```

## 部署

### Vercel（前端）
- Framework Preset: **Vite**
- Root Directory: `apps/web`
- Build Command: `pnpm --filter @repo/web build`
- Output Directory: `dist`
- Install Command: `cd ../.. && pnpm install --frozen-lockfile`

### Sepolia（合约）
见 `contracts/README.md`。

## 致谢

- [imToken Token UI Starter Kit](https://github.com/consenlabs/token-ui) — UI 组件库与设计系统
- [Puffer Finance Hackathon Resources](https://github.com/PufferFinance/puffer-imtoken-hackathon) — API 与 SDK 参考
- imToken 团队提供的 [Sepolia mock pufETH 合约](https://sepolia.etherscan.io/address/0x83e6aebe17f41b17f99f99d0c9234cf9e5e4c9c4)

## License

MIT — 见 `LICENSE`。
