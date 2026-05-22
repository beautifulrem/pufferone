/// PufferOne 主 logo — 基于 Puffer 官方 pufETH 图标 (app.puffer.fi/icons/tokens/pufETH.svg)，
/// 把原来的紫 → 蓝 → 绿渐变 (#874FFF → #36AFE2 → #57FF68) 换成 PufferOne 自家的
/// 粉 → 紫 → 青三色 (#FC72FF → #A78BFA → #7DD3FC)，跟全站主色调一致。
///
/// 原 SVG 保留在 /public/icons/tokens/pufETH.svg；改色版位于 /public/pufferone-logo.svg。
const logoUrl = `${import.meta.env.BASE_URL}pufferone-logo.svg`

export function PufferOneLogo({ size = 28 }: { size?: number }) {
  return (
    <img
      src={logoUrl}
      alt="PufferOne"
      width={size}
      height={size}
      className="shrink-0"
      style={{ display: 'block' }}
    />
  )
}
