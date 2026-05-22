# PufferOne — 收尾增强任务清单

> 详细计划见 `tasks/plan.md`

## A. 主网汇率 + 协议规模看板 (20 分钟)

- [ ] A.1 检查 `usePufETHRate` / `useProtocolTVL` 返回值结构 + 加 staleTime
- [ ] A.2 `stake-page.tsx` 顶部收益卡接入 usePufETHRate（fallback 0.96）
- [ ] A.3 `StakeForm.tsx` RATE_BPS 取实时汇率（保留 fallback）
- [ ] A.4 `home-page.tsx` 底部加协议规模 stat 卡（LRT TVL / UniFi TVL / pufETH APY）
- [ ] A.5 typecheck + 截图验证主页和质押页

**检查点 CP-A**：质押页 0.929... 实时汇率可见，资产页 stat 卡显示三个数字，API 失败时降级不崩

---

## B. DEX 聚合器扩代币 (30 分钟)

- [ ] B.1 新建 `lib/swapTokens.ts`：定义 input token list（含 USDC/USDT/DAI/WBTC/cbETH/rETH/stETH/wstETH）+ 每个 token 的 `sepoliaSignable` 标志 + 主网汇率 + Puffer 主网入口 URL
- [ ] B.2 `SwapForm.tsx`：把当前 2-chip selector 改成可滚动 8-chip token list
- [ ] B.3 选择不可签名的 token 时显示主网提示卡 + Puffer 入口链接，禁用 CTA
- [ ] B.4 选 stETH/wstETH 走原流程不变
- [ ] B.5 typecheck + 截图验证 token 列表 + 提示卡

**检查点 CP-B**：6-8 个 token 选项可见，stETH/wstETH 正常，其他显示「主网产品已上线，Sepolia 暂以 stETH/wstETH 演示」

---

## C. AI 风险解读卡 (45 分钟)

- [ ] C.1 新建 `components/AIInsight.tsx`：组件 + 模板函数 `generateInsight(ctx)`
- [ ] C.2 定义 6-8 个文案变体覆盖 stake / swap / vault-deposit × 稳健 / 平衡 / 进取
- [ ] C.3 视觉：紫色 ai-subtle-bg 卡 + Sparkles icon + "AI 助手" 标签 + 关键词高亮
- [ ] C.4 接入 `TxSummaryCard.tsx`：可选 `aiInsight` prop（前置渲染）
- [ ] C.5 `VaultDepositModal` / `StakeForm` / `SwapForm` 传入操作上下文
- [ ] C.6 typecheck + 截图三个签名场景

**检查点 CP-C**：三大签名场景顶部都有紫色 AI 卡，文案因金额 / 风险等级不同而变化

---

## E. imToken App 深度优化 (20 分钟)

- [ ] E.1 确认 `lib/wallet.ts` 的 `detectInjectedKind` 在 imToken 内正确返回 'imToken'
- [ ] E.2 `AppHeader.tsx` 当 isImToken 时显示一个橙色 chip「imToken 内置」
- [ ] E.3 `index.html` viewport meta 完善 `viewport-fit=cover` + theme-color
- [ ] E.4 `more-page.tsx` 加一行「在 imToken 中打开」，点击拼 deeplink 跳转
- [ ] E.5 typecheck + 桌面 + 移动模拟测试

**检查点 CP-E**：imToken in-app 时顶部有 chip；桌面浏览器「更多」页可见 deeplink 链接

---

## D. 发送（转账）功能 (60-90 分钟)

> 如果 A B C E 完成后时间不够，可砍 D 或简化（只支持 pufETH 单 token 发送）

- [ ] D.1 新建 `hooks/useTransfer.ts`：mutation 包 ERC20 transfer + simulate
- [ ] D.2 新建 `components/SendModal.tsx`：选 token + 输入地址 + 输入金额（PercentChips 复用）+ 确认
- [ ] D.3 地址校验：viem `isAddress`，错误时禁用按钮
- [ ] D.4 自己转给自己时弹警告但允许
- [ ] D.5 接入 `TxSummaryCard` + AI Insight（如 C 已完成）
- [ ] D.6 `home-page.tsx` QuickAction grid 改 5 列加「发送」按钮
- [ ] D.7 真实 Sepolia 测试转一笔 0.01 stETH
- [ ] D.8 typecheck + 截图

**检查点 CP-D**：资产页 5 个快捷操作；Send Modal 可走通一笔真实 Sepolia tx

---

## CP-Final

- [ ] `pnpm --filter @repo/web typecheck` 全绿
- [ ] 桌面 Chrome 走一遍 happy path（连钱包 → 看 AI 卡 → 质押 → 闪兑选 USDC 看主网提示 → 金库存入 → 看大图）
- [ ] git add + commit + push 触发 Vercel 自动部署
- [ ] 等 Vercel 部署完成（~1-2 分钟）后访问 production URL 二次验证
