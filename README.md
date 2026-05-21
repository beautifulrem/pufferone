# PufferOne

> 把 Puffer 质押的每一条要求做到底 — imToken 十周年 Puffer 合作伙伴专项作品

兼容 imToken 的 Puffer 质押 Mini App，正面回应 [Puffer 专项题目](https://10th.token.im/#showcase) 的 6 条要求：连接钱包、ETH/stETH/wstETH → pufETH、余额/汇率展示、UniFi Vault 真实存入（Mini App 内）、安全引导、DEX 聚合一站式。附加 5 个具体安全机制 + 5 步新手教学 + Portfolio dashboard + Exit lifecycle。

- **演示链接**：https://pufferone-web-git-main-beautifulremis-projects.vercel.app
- **GitHub 仓库**：https://github.com/beautifulrem/pufferone
- **演示钱包**：`0xbA64397d50D71fE0c38a86B51fc77BedB580C8A4`（Sepolia 演示用，非真实资产）

## 项目状态（每一行都已实现）

| Phase | 描述 | 状态 |
|---|---|---|
| 0 | Monorepo + GitHub + Vercel | ✅ |
| 1 | 6 个 mock 合约 + Sepolia 部署 + 42 forge tests | ✅ |
| 2 | 钱包连接层（imToken + MetaMask + WC） | ✅ |
| 3 | ETH → pufETH 真签名 | ✅ |
| 4 | stETH / wstETH 真签名（含 faucet + 精确授权） | ✅ |
| 5 | 4 个 UniFi Vault 真实存入（含主网 API APY/TVL） | ✅ |
| 6 | DEX 聚合 swap（滑点 + minOut + 路由可视化） | ✅ |
| 7 | 5 个安全机制可视化 SafetyBar | ✅ |
| 8 | 5 步新手教学 modal | ✅ |
| 9 | Portfolio dashboard（7 个仓位聚合） | ✅ |
| 10 | Exit / 赎回流程（vault withdraw + DEX 反向） | ✅ |
| 11 | 端到端测试 + 打磨 | ✅ |
| 12 | 提交比赛 | 待最终提交 |

## Sepolia 已部署合约（chain 11155111）

| 合约 | 地址 | Etherscan |
|---|---|---|
| MockPufETH | `0xd44387034102491Af58292fF1c7405AED4e7Eb04` | [view](https://sepolia.etherscan.io/address/0xd44387034102491Af58292fF1c7405AED4e7Eb04) |
| MockStETH | `0xB59271CD9158Bb50125c3F9AC5CA013eE2fa7AF6` | [view](https://sepolia.etherscan.io/address/0xB59271CD9158Bb50125c3F9AC5CA013eE2fa7AF6) |
| MockWstETH | `0x0353908C9a9b58108E7A6446619B567A9207336D` | [view](https://sepolia.etherscan.io/address/0x0353908C9a9b58108E7A6446619B567A9207336D) |
| MockPufferDepositor | `0x8628C68227EAfe1B435eb3F918e5358aE5b1c390` | [view](https://sepolia.etherscan.io/address/0x8628C68227EAfe1B435eb3F918e5358aE5b1c390) |
| MockUniFiVaultFactory | `0xBEd71c18e2275F0A10c56c8f22EbFE774f05Ef3c` | [view](https://sepolia.etherscan.io/address/0xBEd71c18e2275F0A10c56c8f22EbFE774f05Ef3c) |
| unifiETH | `0x4D42919570c9dF3356afa44A0236198168933CCD` | [view](https://sepolia.etherscan.io/address/0x4D42919570c9dF3356afa44A0236198168933CCD) |
| unifiUSD | `0x4C0234A302650E5B56A5D658A037143f6B72948f` | [view](https://sepolia.etherscan.io/address/0x4C0234A302650E5B56A5D658A037143f6B72948f) |
| unifiBTC | `0xEae62881Bbeeb18bDAE3a9C5edAB4B7eF33128e4` | [view](https://sepolia.etherscan.io/address/0xEae62881Bbeeb18bDAE3a9C5edAB4B7eF33128e4) |
| pufETHs | `0xE8EAB43253f09C674B49b39451Bd3647cB21AeEb` | [view](https://sepolia.etherscan.io/address/0xE8EAB43253f09C674B49b39451Bd3647cB21AeEb) |
| MockSwapRouter | `0xF69507F745dC5b4a92f34c824A06e5308578361a` | [view](https://sepolia.etherscan.io/address/0xF69507F745dC5b4a92f34c824A06e5308578361a) |

## 应用功能（每条对应一个题目要求）

| 路由 | 题目要求 | 实现深度 |
|---|---|---|
| `/` Home | — | 6 卡片导航 + 5 步教学 modal 首次访问弹出 |
| `/stake` | 02 · 3 币种铸造 pufETH | ETH/stETH/wstETH 全部真实链上（非 UI 占位）+ 精确授权 + Tx 模拟 |
| `/vaults` | 04 · UniFi Vault 机会 | 4 个 vault 真实存入 Mini App 内（不跳走主网）+ 主网 API 拉 APY/TVL |
| `/swap` | 06 · DEX 聚合（进阶） | 多跳路由 + 滑点 slider + minOut 链上强制 + 路径 chip 可视化 |
| `/portfolio` | 03 · 余额展示 | 7 个仓位聚合 + USD 估值 + 链上实时 |
| `/exit` | — | vault withdraw + pufETH 反向 swap，3 个已有作品都没做 |

## Token Core 使用说明（提交表单专用段落）

PufferOne 通过 imToken 浏览器注入的 EIP-1193 Provider（即 Token Core 的 Web 接口）完成全部钱包能力：账户连接（`eth_requestAccounts`）、消息签名、合约调用、链 ID 检查、链切换（`wallet_switchEthereumChain` + `wallet_addEthereumChain`）。所有 secret material 始终保留在用户的 imToken / MetaMask / WalletConnect 钱包中，本应用不处理、不传输、不储存任何私钥、助记词或密码。同时兼容桌面端 MetaMask 与 WalletConnect 2.0 标准，让评委在任意环境下都能完整体验。所有交易在签名前通过 `eth_call` 静态调用模拟（`publicClient.simulateContract`），确保用户在签名前看到准确的预期输出与风险。

UI 组件库基于 [Token UI Starter Kit](https://github.com/consenlabs/token-ui)（imToken 官方设计系统），通过 `@repo/ui/components/*` 复用 60+ 个钱包风格组件；设计语言基于 Token UI 的 design tokens 重写为 Web3 暗底 + 电光青绿（#00E5C7）+ 高级感。所有 5 个安全机制（参见 `/stake` 顶部 SafetyBar）实现思路参考 `repos/token-ui/security/SKILL.md`。

## 5 个安全机制（题目要求 05 "引导使用者安全参与"）

1. **eth_call 静态模拟** — 每笔交易在签名前 `publicClient.simulateContract` 验证，simulated revert → Danger banner 阻断签名
2. **4 级风险评分**（Info / Warning / Danger / Block）— 每个交易页面顶部 SafetyBar + 每个 TxSummaryCard 内嵌
3. **DEX 滑点保护** — 用户可调（0.1%–5%），minOut 链上强制 enforce（不只是 UI）
4. **精确数量授权** — `approve(spender, exactAmount)`，永远不 `type(uint256).max`
5. **签前总结卡** — 显示 action / target 全地址（非截断）/ input-output / 风险 badge / exit 提示

## 安全模型

- ❌ 永远不接受 / 不储存任何 secret material（私钥、API key、助记词、密码、token）
- ✅ 所有签名经用户钱包完成
- ✅ Sepolia 测试网；演示钱包专用，非真实资产
- ✅ Mock 合约前端明确标注（参见 `contracts/README.md`）
- ✅ 5 个安全机制（见上）
- 详细安全策略见 `SECURITY.md` 与 `security/SKILL.md`

## 仓库结构

```
.
├── apps/web/                 ← Vite + React SPA（Vercel 部署）
│   └── src/
│       ├── app/              # AppLayout + 路由
│       ├── components/       # WalletConnector / StakeForm / SwapForm / VaultCard / SafetyBar / OnboardingModal …
│       ├── hooks/            # useWallet / useStakeETH / useStakeERC20 / useVaultDeposit / useSwap / useFaucet …
│       ├── lib/              # viem.ts / contracts.ts / pufferApi.ts / format.ts / simulate.ts / vaults.ts
│       └── pages/            # home / stake / vaults / swap / portfolio / exit
├── packages/ui/              ← Token UI 组件库副本（@repo/ui）
├── tooling/tsconfig/         ← 共享 TypeScript 配置
├── contracts/                ← Foundry：6 个 mock 合约 + 42 forge tests + Deploy.s.sol
├── DESIGN.md                 ← UI 设计规范
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

# 4. 智能合约（可选 — Sepolia 已部署，直接复用即可）
cd contracts
cp .env.example .env  # 填入本地 PRIVATE_KEY（不要提交）
forge build
forge test       # 42/42 全绿
```

## 部署

### Vercel（前端）
- Framework Preset: **Vite**
- Root Directory: `apps/web`
- Build Command: `pnpm build`（默认）
- Output Directory: `dist`（默认）
- Install Command: `cd ../.. && pnpm install --frozen-lockfile`

### Sepolia（合约）
见 `contracts/README.md`。

## 致谢

- [imToken Token UI Starter Kit](https://github.com/consenlabs/token-ui) — UI 组件库与设计系统
- [Puffer Finance Hackathon Resources](https://github.com/PufferFinance/puffer-imtoken-hackathon) — API 与 SDK 参考
- imToken 团队提供的 [Sepolia mock pufETH 合约](https://sepolia.etherscan.io/address/0x83e6aebe17f41b17f99f99d0c9234cf9e5e4c9c4)（作为 deployer 起点参考）

## License

MIT — 见 `LICENSE`。
