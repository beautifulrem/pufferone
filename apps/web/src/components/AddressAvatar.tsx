/// AddressAvatar — 4 色方格头像，基于地址哈希生成。
///
/// 灵感来自 jazzicon（Metamask 风格）。比真 jazzicon 简化：用 4 个固定色块
/// 拼成 2×2 网格，避免引入额外 dependency。每个地址都得到稳定的视觉指纹，
/// 让用户能一眼区分多个钱包。

const PALETTE = [
  '#FC72FF', // brand pink
  '#A78BFA', // brand purple
  '#7DD3FC', // brand cyan
  '#FBBF24', // amber
  '#4ADE80', // green
  '#F87171', // red
  '#FF9FFF', // light pink
  '#38BDF8', // bright blue
] as const

function hashCode(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) - h + input.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function pickColor(seed: number, exclude: string[]): string {
  for (let i = 0; i < PALETTE.length; i++) {
    const candidate = PALETTE[(seed + i) % PALETTE.length] as string
    if (!exclude.includes(candidate)) return candidate
  }
  return PALETTE[0]
}

export function AddressAvatar({ address, size = 20 }: { address: string; size?: number }) {
  const seed = hashCode(address.toLowerCase())
  const c1 = pickColor(seed, [])
  const c2 = pickColor(seed >> 3, [c1])
  const c3 = pickColor(seed >> 6, [c1, c2])
  const c4 = pickColor(seed >> 9, [c1, c2, c3])
  return (
    <span
      className="inline-block shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="grid h-full w-full grid-cols-2 grid-rows-2"
        style={{ transform: `rotate(${(seed % 360)}deg)` }}
      >
        <span style={{ background: c1 }} />
        <span style={{ background: c2 }} />
        <span style={{ background: c3 }} />
        <span style={{ background: c4 }} />
      </span>
    </span>
  )
}
