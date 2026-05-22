/// PufferOne 自绘 inline SVG logo.
/// 灵感：Puffer 河豚轮廓 + "1" 数字 + 渐变。完全离线（不依赖任何 CDN）。
/// 圆形 + 渐变背景（粉→紫 →淡蓝） + 中间一个 stylized 河豚剪影 / P1。
export function PufferOneLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PufferOne"
    >
      <defs>
        <linearGradient id="po-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FC72FF" />
          <stop offset="0.55" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#7DD3FC" />
        </linearGradient>
        <linearGradient id="po-fish" x1="20" y1="22" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Background rounded square */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#po-bg)" />

      {/* Subtle inner highlight */}
      <rect
        x="3"
        y="3"
        width="58"
        height="30"
        rx="15"
        fill="white"
        fillOpacity="0.12"
      />

      {/* Stylized pufferfish body (rounded triangle) + tail */}
      <path
        d="M40 26 C 46 26, 50 30, 50 36 C 50 42, 46 46, 40 46 L 40 44 L 50 50 L 50 36 L 50 22 L 40 28 Z"
        fill="url(#po-fish)"
        transform="translate(-2 0)"
      />
      {/* Fish body main blob */}
      <ellipse cx="30" cy="36" rx="13" ry="10" fill="url(#po-fish)" />
      {/* Spike dots around body */}
      <circle cx="22" cy="30" r="1.4" fill="white" fillOpacity="0.5" />
      <circle cx="22" cy="42" r="1.4" fill="white" fillOpacity="0.5" />
      <circle cx="34" cy="28" r="1.2" fill="white" fillOpacity="0.45" />
      <circle cx="34" cy="44" r="1.2" fill="white" fillOpacity="0.45" />
      {/* Eye */}
      <circle cx="35" cy="34" r="2" fill="#0F0F0F" />
      <circle cx="35.7" cy="33.3" r="0.6" fill="white" />
    </svg>
  )
}
