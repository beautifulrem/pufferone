<div align="center">
  <img src="apps/web/public/pufferone-logo.svg" alt="PufferOne" width="96" height="96" />

  <h1>PufferOne</h1>

  <p><strong>再质押，更简单。</strong></p>
  <p>手机优先的 Puffer Finance 接入终端 — 让流动再质押像用钱包一样自然。</p>

  <p>
    <a href="https://pufferone-web-git-main-beautifulremis-projects.vercel.app">在线体验</a> ·
    <a href="#quick-start">快速开始</a> ·
    <a href="#-security">安全模型</a> ·
    <a href="https://github.com/beautifulrem/pufferone/issues">问题反馈</a>
  </p>

  <p>
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" />
    <img alt="Vite" src="https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white" />
    <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
    <img alt="viem" src="https://img.shields.io/badge/viem-2.x-FFB800" />
    <img alt="Solidity" src="https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity&logoColor=white" />
    <img alt="License" src="https://img.shields.io/badge/license-MIT-22c55e" />
  </p>
</div>

---

## ✨ Why PufferOne

Puffer Finance 是以太坊主网领先的流动再质押协议，但它的 Web 应用是为有经验的 DeFi 用户设计的。对于刚接触 Restaking 的钱包用户而言，仍然存在不小的认知门槛 — 什么是 LRT？AVS 风险有多大？金库怎么选？签名要看哪些信息？

**PufferOne 把这些抽象重新组织成一个手机原生的钱包体验**：

- 🐡 **5 类资产视图** — 持仓、收益、产品、闪兑、转账，一个底部 tab 切换搞定
- 📊 **可交互行情** — 主网实时 TVL / APY，所有指标都能点开看历史折线
- 🎓 **5 步带入门** — 第一次访问自动弹出，再质押概念到风险，3 分钟看懂
- 🛡️ **5 道安全护栏** — 交易模拟、风险分级、按需授权、签前摘要、合约可见，每次签名前自动执行
- 🌗 **三档主题** — 系统 / 亮色 / 暗色，跟随你的设备偏好

> PufferOne 不替代 Puffer 官方应用，而是把它的核心能力封装成一个对普通用户友好的钱包形态产品。

## 📸 Preview

<div align="center">
  <table>
    <tr>
      <td align="center"><strong>资产总览</strong><br><sub>持仓 · 协议规模 · 收款 / 发送</sub></td>
      <td align="center"><strong>金库收益</strong><br><sub>4 类策略 · APY 历史 · 风险分档</sub></td>
      <td align="center"><strong>交易安全保障</strong><br><sub>5 道签前检查</sub></td>
    </tr>
  </table>
</div>

## 🚀 核心功能

### 💎 流动再质押
- **三币种铸造 pufETH** — ETH / stETH / wstETH 任选其一，对齐 Puffer 官方 EigenLayer Restaking 通道
- **主网实时汇率** — 调用 Puffer 官方 API 获取 1 ETH ↔ pufETH 实时兑换率
- **预期年化收益** — 顶部展示 pufETH 当前 APY
- **百分比快捷输入** — 25% / 50% / 75% / MAX 一键填充，自动给 ETH 留 gas

### 🏛 UniFi 金库
- **4 种策略** — unifiETH（稳健型）/ unifiUSD（稳健型）/ unifiBTC（平衡型）/ pufETHs（进取型）
- **新手推荐徽章** — unifiETH 标 ✨ 推荐；pufETHs 标 🔥 最热
- **详细产品页** — 每只金库展示策略说明、风险分档、可交互 APY 折线、产品主页链接
- **风险话术** — 行业通用「稳健 / 平衡 / 进取」分档，避免「低 / 中 / 高风险」过于直白

### 🔄 一键闪兑
- **跟官方对齐** — 支持 stETH / wstETH / WETH（Puffer Stake 实测同款列表）
- **链上滑点保护** — preset 三档（0.1% / 0.5% / 1.0%）+ 自定义输入，自动 minOut
- **失败可读** — 价格偏离时自动取消，资金原路退回

### 💸 资产管理
- **钱包基础** — 收款（QR + 复制）/ 发送（地址校验 + AddressAvatar）/ 余额刷新
- **协议规模看板** — LRT TVL / UniFi TVL / pufETH APY，点击任一指标看大折线图
- **持仓分组** — 有余额的展开置顶，零余额折叠到「未持有的资产」抽屉

### 🛡 五道交易保护
每次签名前 PufferOne 会自动执行：

1. **交易模拟** — 通过 `publicClient.simulateContract` 链上预演，失败立即拦截
2. **风险分级** — 信息 / 注意 / 高风险 / 阻断 四档徽章
3. **精确数额授权** — `approve(spender, exactAmount)`，永远不无限授权
4. **签前摘要** — 输入 / 输出 / 风险 / 合约的一张摘要卡
5. **合约完整可见** — 始终展示完整地址，方便与官方公示核对

### 🎨 体验细节
- 三档主题（system / light / dark），localStorage 持久化
- imToken 适配：检测 App 内浏览器显示 chip；桌面端提供 deeplink + QR 跳转
- AddressAvatar — 从地址哈希生成的 4 色方格头像
- Sepolia 测试网 badge 用 Sepolia 品牌紫色

## 🏗 Tech Stack

| 层级 | 技术 |
|---|---|
| Frontend | Vite 8 · React 19 · TypeScript（strict）|
| State | @tanstack/react-query 5 · React Context |
| Chain | viem 2.50 · 直连 EIP-1193 / WalletConnect 2 |
| UI Kit | @repo/ui（基于 Token UI Starter Kit） |
| 样式 | Tailwind v4 · CSS variables · 主题切换 |
| 图表 | recharts（AreaChart + Tooltip）|
| 合约 | Foundry · Solidity 0.8.24 · ERC20Mintable 抽象 |
| 部署 | Vercel SPA · pnpm workspace |

## 📦 仓库结构

```
.
├── apps/web/              ← Vite + React SPA（Vercel 部署）
│   ├── public/            ← 静态资源（logo / Puffer token SVG 镜像）
│   └── src/
│       ├── app/           # AppLayout + 路由
│       ├── components/    # 60+ 业务组件
│       ├── hooks/         # useWallet / useStakeETH / useTransfer …
│       ├── lib/           # viem / contracts / pufferApi / swapTokens …
│       └── pages/         # home · stake · vaults · swap · exit · more
├── packages/ui/           ← Token UI 组件库副本
├── tooling/tsconfig/      ← 共享 TS 配置
├── contracts/             ← Foundry mocks + 部署脚本
└── security/              ← 安全 skill 文档
```

## ⚡ Quick Start

```bash
# 要求：Node ≥ 22.12，pnpm ≥ 10.30
git clone https://github.com/beautifulrem/pufferone.git
cd pufferone
pnpm install

# 启动开发服务器
pnpm dev
# → http://localhost:5173

# 类型检查
pnpm typecheck

# Lint
pnpm check
```

### 合约（可选）

Sepolia 上已经部署了一套 mock 合约，可以直接使用。需要自行部署的话：

```bash
cd contracts
cp .env.example .env  # 填入 PRIVATE_KEY（不要提交）
forge build
forge test
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast
```

合约地址会写入 `broadcast/` 目录，同步到 `apps/web/src/lib/contracts.ts`。

## 🌐 已部署合约（Sepolia · chain 11155111）

| 合约 | 地址 |
|---|---|
| MockPufETH | [`0xd44387034102491Af58292fF1c7405AED4e7Eb04`](https://sepolia.etherscan.io/address/0xd44387034102491Af58292fF1c7405AED4e7Eb04) |
| MockStETH | [`0xB59271CD9158Bb50125c3F9AC5CA013eE2fa7AF6`](https://sepolia.etherscan.io/address/0xB59271CD9158Bb50125c3F9AC5CA013eE2fa7AF6) |
| MockWstETH | [`0x0353908C9a9b58108E7A6446619B567A9207336D`](https://sepolia.etherscan.io/address/0x0353908C9a9b58108E7A6446619B567A9207336D) |
| MockPufferDepositor | [`0x8628C68227EAfe1B435eb3F918e5358aE5b1c390`](https://sepolia.etherscan.io/address/0x8628C68227EAfe1B435eb3F918e5358aE5b1c390) |
| MockUniFiVaultFactory | [`0xBEd71c18e2275F0A10c56c8f22EbFE774f05Ef3c`](https://sepolia.etherscan.io/address/0xBEd71c18e2275F0A10c56c8f22EbFE774f05Ef3c) |
| unifiETH Vault | [`0x4D42919570c9dF3356afa44A0236198168933CCD`](https://sepolia.etherscan.io/address/0x4D42919570c9dF3356afa44A0236198168933CCD) |
| unifiUSD Vault | [`0x4C0234A302650E5B56A5D658A037143f6B72948f`](https://sepolia.etherscan.io/address/0x4C0234A302650E5B56A5D658A037143f6B72948f) |
| unifiBTC Vault | [`0xEae62881Bbeeb18bDAE3a9C5edAB4B7eF33128e4`](https://sepolia.etherscan.io/address/0xEae62881Bbeeb18bDAE3a9C5edAB4B7eF33128e4) |
| pufETHs Vault | [`0xE8EAB43253f09C674B49b39451Bd3647cB21AeEb`](https://sepolia.etherscan.io/address/0xE8EAB43253f09C674B49b39451Bd3647cB21AeEb) |
| MockSwapRouter | [`0xF69507F745dC5b4a92f34c824A06e5308578361a`](https://sepolia.etherscan.io/address/0xF69507F745dC5b4a92f34c824A06e5308578361a) |

## 🔒 Security

PufferOne 是一个钱包入口产品。我们认真对待用户的资产安全：

- 🚫 **永不接触秘密** — 私钥、助记词、密码、API key 全部留在用户的钱包里；本应用不读、不存、不传
- ✅ **所有签名由钱包完成** — 通过 EIP-1193 / WalletConnect 标准接口
- ✅ **签前必模拟** — `publicClient.simulateContract` 失败的交易直接拦截
- ✅ **精确数额授权** — 杜绝无限授权钓鱼
- ✅ **完整合约地址显示** — 不缩写，方便用户与官方核对
- ✅ **测试网先行** — 当前部署在 Sepolia，演示钱包无真实资产风险

详细策略见 [`SECURITY.md`](./SECURITY.md) 与 [`security/SKILL.md`](./security/SKILL.md)。

## 🛣 Roadmap

- [x] 三币种 pufETH 铸造（ETH / stETH / wstETH）
- [x] 4 个 UniFi 金库真实存入
- [x] 闪兑（含链上滑点保护）
- [x] 5 道交易安全保障
- [x] 主网实时汇率 / TVL / APY
- [x] 资产页转账 + 收款
- [x] 主题切换（system / light / dark）
- [ ] 接 1inch / Paraswap 真实聚合多 token → pufETH
- [ ] 主网部署
- [ ] i18n（中 / 英）

## 🙏 Acknowledgements

- [Puffer Finance](https://puffer.fi/) — 流动再质押协议本身
- [imToken Token UI](https://github.com/consenlabs/token-ui) — 钱包风格设计系统
- [viem](https://viem.sh/) · [Foundry](https://book.getfoundry.sh/) · [Vite](https://vitejs.dev/) — 核心工具链

## 📄 License

[MIT](./LICENSE) © 2026 PufferOne contributors
