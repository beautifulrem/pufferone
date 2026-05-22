# PufferOne — 收尾增强计划（2026-05-22 截止）

## 目标

对比比赛题目原文 + 两个竞品（cutehamster、pufeth）后，把 5 个差距点补完，让
PufferOne 在 imToken 十周年 Puffer 合作伙伴专项上覆盖题目全部要求，并多覆盖
「AI 共创」主题与 imToken 适配两个加分维度。

## 现状（已完成）

- 6 条题目核心要求覆盖（连接钱包、三币种质押、余额/rate 展示、UniFi Vault 机会、安全引导、DEX 聚合器）
- 4 个金库（含 APY/TVL/sparkline/intro/大折线图/产品链接）
- 5 步教学 + 5 项安全保障
- 闪兑滑点 preset、percent chips、AddressAvatar、收款 QR、风险话术行业化、主题三档
- 退出/赎回完整流程

## 缺口（要补）

| # | 项目 | 题目对应 | 时间 |
|---|---|---|---|
| A | 主网实时汇率 + 协议规模看板 | 题目第 3 条「rate 展示」 | 20 分钟 |
| B | DEX 聚合器扩代币（USDC/USDT/DAI/WBTC/cbETH/rETH）| 题目进阶项「任意代币」 | 30 分钟 |
| C | AI 风险解读卡 | 比赛主题「AI 共创」 | 45 分钟 |
| D | 发送（转账）功能 | 钱包基础体验 | 60-90 分钟 |
| E | imToken App 深度优化 | imToken 主办适配 | 20-30 分钟 |

合计 ~3 小时。按 ROI 顺序：A → B → C → E → D。

## 依赖关系

```
A (主网数据)  独立
B (扩代币)    独立  ← 用 tokenIcons + 前端 mock 路径
C (AI 卡)     独立  ← 接入 TxSummaryCard
D (发送)      独立  ← 新 hook + Modal
E (imToken)   独立  ← useWallet + viewport meta
```

5 个任务完全无依赖，可以并行或串行任意排。但按时间紧迫和复杂度递增的顺序串行最稳。

## 垂直切片（每个任务都是一个完整可发布的功能）

---

### 任务 A — 主网实时汇率 + 协议规模看板

**目标**：把质押页的 mock 0.96 汇率改成实时调用 Puffer mainnet API
得到的 0.929... 真实汇率；资产页角落加一个协议规模 stat 卡。

**触及文件**：
- `apps/web/src/hooks/usePufferAPI.ts` — 给 usePufETHRate / useProtocolTVL 加合理 staleTime
- `apps/web/src/pages/stake-page.tsx` — 顶部收益卡接入 usePufETHRate
- `apps/web/src/components/StakeForm.tsx` — RATE_BPS 取真实汇率（fallback 96）
- `apps/web/src/pages/home-page.tsx` — 资产页底部加协议规模 stat 卡（LRT TVL / UniFi TVL / pufETH APY）

**新增**：无新文件

**验收**：
- 质押页顶部显示 `1 ETH → 0.9298 pufETH（主网实时）`，API 失败时降级为 0.96
- 资产页底部出现一张「Puffer 协议规模」卡片，含 LRT TVL、UniFi TVL、pufETH APY 三个数字
- 数据来自 `api-v2.puffer.fi/imtoken-hackathon`，DevTools Network 可见
- API 失败时整页不崩，cards 显示 fallback 值并标注「离线估算」

**验证步骤**：
1. `pnpm --filter @repo/web typecheck` 全绿
2. 在 dev server 打开 `/stake` 看顶部数字
3. 在 DevTools Network 过滤 `puffer.fi` 看到请求
4. 临时改 BASE_URL 为非法地址，验证 fallback 显示

---

### 任务 B — DEX 聚合器扩代币

**目标**：闪兑页输入 token 选择器从 2 个（stETH/wstETH）扩到 6-8 个
（USDC/USDT/DAI/WBTC/cbETH/rETH），让题目「任意代币」对题。

**约束**：Sepolia 上我们只部署了 stETH/wstETH/pufETH 三个 ERC-20 mock。
新加的 token 在测试网没有真实合约，所以走「展示路径 + 透明提示」策略：
- token 选择器展示所有 token（带 icon）
- 选 stETH/wstETH 时正常签名
- 选 USDC/USDT/DAI/WBTC/cbETH/rETH 时显示「主网可用，Sepolia 暂未部署」并禁用按钮，附跳转到主网 Puffer 入口

这样既覆盖题目要求展示了「任意代币 → pufETH」的产品形态，又不撒谎说 mock 路径已实现。

**触及文件**：
- `apps/web/src/components/SwapForm.tsx` — 重构 token 选择器（2 chips → segmented 或 bottom-sheet）
- `apps/web/src/lib/tokenIcons.ts` — 已有 USDC/USDT/WBTC icon 映射，确认全部就绪
- `apps/web/src/lib/swapTokens.ts` — **新建**：定义可选 input token list + Sepolia 可签名标志 + 主网汇率

**新增**：`apps/web/src/lib/swapTokens.ts`

**验收**：
- 闪兑页输入 token 选择从 2 个扩到 6-8 个，每个带 TokenIcon
- 选 stETH/wstETH 正常签名（保持原流程）
- 选 USDC/USDT/DAI/WBTC/cbETH/rETH 显示提示「主网产品已上线，Sepolia 暂以 stETH/wstETH 演示」+ 主网入口链接，CTA 禁用
- 没有原生 `<select>`，全部是带 icon 的 chip
- 桌面端和手机端都能正常滚动选择

**验证步骤**：
1. `pnpm --filter @repo/web typecheck` 全绿
2. dev server 打开 `/swap`，点击 token 选择器看到 6+ 选项
3. 选 stETH 走真实签名（如果连接钱包）
4. 选 USDC 看到提示文案，CTA 禁用，无报错

---

### 任务 C — AI 风险解读卡

**目标**：比赛主题是「AI 共创」，但 PufferOne 目前零 AI 元素。在每笔交易
的 TxSummaryCard 上方加一张「AI 助手」卡，根据 vault.risk + 操作类型 +
金额 生成一句话风险评估。用预制模板（不调真 LLM API），但 UI 看起来是
AI 助手。

**模板规则**：
- 输入：operation 类型（`stake-eth` / `stake-erc20` / `swap` / `vault-deposit` / `withdraw`）+ riskLevel + 金额 + token
- 输出：1 段 2-3 句的"AI 助手"评估，含一个总结性 emoji（如 🤖 / ⚖️ / ⚠️）
- 例如：「这是一笔稳健型操作。0.1 ETH 是合理的小额尝试，模拟显示交易将成功执行。建议关注 pufETH 主网赎回率近期走势，做好长期持仓准备。」

**触及文件**：
- `apps/web/src/components/AIInsight.tsx` — **新建**：组件 + 模板逻辑
- `apps/web/src/components/TxSummaryCard.tsx` — 加 `aiInsight` prop 渲染 AI 卡
- `apps/web/src/components/VaultDepositModal.tsx` / `StakeForm` / `SwapForm` — 传入 operation 上下文

**新增**：`apps/web/src/components/AIInsight.tsx`

**视觉**：
- AI 卡背景使用 `--ai-subtle-bg` + `--ai-subtle-border`（已有 token）
- 左侧紫色 Sparkles icon，右上「AI 助手」标签
- 文本中关键数字 / 风险词用 `text-ai-emphasis` 高亮

**验收**：
- 三个签名场景（质押 / 闪兑 / 金库存入）都有 AI 评估卡
- 不同金额 / 不同风险等级生成不同文案（至少 6 种变体）
- 卡片视觉跟 5 项保护卡风格协调，紫色系区别于其他卡片
- 没有「打开开关」之类的交互，AI 卡自动渲染

**验证步骤**：
1. `pnpm --filter @repo/web typecheck` 全绿
2. 打开质押页 `/stake`，输入 0.1 ETH 看 AI 卡渲染
3. 切换到 1 ETH 看文案变化（金额档位）
4. 打开金库存入弹窗看 vault 风险等级影响文案
5. 截图：AI 卡视觉跟现有设计一致

---

### 任务 D — 发送（转账）功能

**目标**：资产页加「发送」快捷操作（4 个 → 5 个），新建 SendModal
允许把 pufETH / stETH / wstETH 转给任意地址。

**触及文件**：
- `apps/web/src/hooks/useTransfer.ts` — **新建**：mutation 包 ERC20 transfer
- `apps/web/src/components/SendModal.tsx` — **新建**：选 token + 输入地址 + 输入金额 + 确认
- `apps/web/src/pages/home-page.tsx` — QuickAction 加「发送」按钮
- `apps/web/src/components/TxSummaryCard.tsx` — Send 操作复用现有摘要卡

**新增**：`useTransfer.ts` + `SendModal.tsx`

**SendModal 流程**：
1. 选 token：pufETH / stETH / wstETH segmented（带 icon）
2. 输入接收地址：粘贴 + 校验 ENS / 地址格式
3. 输入数量：复用 PercentChips
4. 显示 TxSummaryCard + AI Insight（如果任务 C 已完成）
5. 点签名 → simulateContract → 真实 transfer

**验收**：
- 资产页快捷操作 grid 变成 5 列（质押 / 金库 / 兑换 / 收款 / 发送）
- 发送 modal 完整流程可签名（最少 stETH 走通）
- 地址格式错误显示红色提示，按钮禁用
- 地址等于自己时警告但仍允许
- tx 成功后 modal 自动刷新余额

**验证步骤**：
1. `pnpm typecheck` 全绿
2. 用演示钱包 `0xbA64...` 发 0.01 stETH 给一个 burner 地址
3. Etherscan 上看 tx 成功
4. 资产页持仓 stETH 数量减少

**风险**：这个最长。如果时间不够可砍掉发送 modal 的 ENS 校验和 token 切换，只保留 pufETH 发送。

---

### 任务 E — imToken App 深度优化

**目标**：比赛是 imToken 主办，让 PufferOne 在 imToken in-app 浏览器
中体验拉满，并提供从外部浏览器跳到 imToken 的 deeplink。

**触及文件**：
- `apps/web/src/lib/wallet.ts` — 已有 `isImToken` 检测，确认正确
- `apps/web/src/components/AppHeader.tsx` — 检测到 imToken 时显示「imToken 内置」小标识
- `apps/web/src/pages/home-page.tsx` 或 `more-page.tsx` — 加「在 imToken 中打开 →」按钮（deeplink）
- `apps/web/index.html` — 完善 meta viewport（safe-area-inset + theme-color）

**imToken deeplink 格式**：`imtokenv2://navigate/DAppView?url=<encoded current URL>`

**验收**：
- 在 imToken App 内打开时，header 显示一个「imToken 内置」橙色 chip
- 在桌面 Chrome 打开时，「更多」页有一行「在 imToken 中打开 →」，点击拼出 deeplink 并 window.location.href
- viewport meta 完整支持 safe-area-inset-{top, bottom}
- index.html 的 `<meta name="theme-color">` 跟暗色主题协调

**验证步骤**：
1. `pnpm typecheck` 全绿
2. 手机 imToken App 浏览器打开 Vercel URL，看顶部「imToken 内置」chip
3. 桌面 Chrome 打开 `/more`，点击 deeplink 链接（不会跳走但 console 看 URL）
4. 用 Chrome DevTools mobile 模拟看 safe-area-inset 占位

---

## 检查点

- 🛑 **CP-A 后**：质押页 + 资产页都显示真实主网数据，整页不崩
- 🛑 **CP-B 后**：闪兑页 6+ token 选择，stETH/wstETH 可签，其他显示主网提示
- 🛑 **CP-C 后**：三大签名场景都有 AI 卡，文案因输入不同而变化
- 🛑 **CP-D 后**（如果时间够）：资产页 5 个快捷操作，可签名一笔 stETH 转账
- 🛑 **CP-E 后**：imToken in-app 浏览器实测 OK
- 🛑 **CP-Final**：`pnpm verify` / `pnpm typecheck` 全绿 + git push 触发 Vercel 自动部署

## 时间预算

| 阶段 | 预计 | 累计 |
|---|---|---|
| A | 20 分钟 | 0:20 |
| B | 30 分钟 | 0:50 |
| C | 45 分钟 | 1:35 |
| E | 20 分钟 | 1:55 |
| D | 60-90 分钟 | 2:55 – 3:25 |
| 收尾 typecheck + 推送 | 10 分钟 | 3:05 – 3:35 |

如果时间不够全做，砍 D（最长且偏题），保留 A B C E。

## 不在本计划中的事

- ❌ 不部署新 mock ERC-20 合约（用前端 mock 路径就够覆盖题目要求）
- ❌ 不接真 LLM API（用预制模板，零密钥）
- ❌ 不重构现有功能，只增量加新功能
- ❌ 不动 contracts/ 目录的 Solidity 合约
- ❌ 不接受私钥 / 助记词
- ❌ 不改 viewport 之外的 index.html 全局结构
- ❌ 不引入新依赖（除非 catalog 里已有）

## 实施顺序（按 ROI / 时间紧迫）

1. A — 最快、对题最直接
2. B — 对题题目进阶项
3. C — 对题「AI 共创」
4. E — 对题 imToken 主办
5. D — 钱包标配，时间允许才做
