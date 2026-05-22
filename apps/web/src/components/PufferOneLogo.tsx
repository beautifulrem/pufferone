/// PufferOne app icon — 在 Figma 中手工绘制的版本，转译为 inline SVG。
///
/// 设计：
/// - 256×256 圆角方形（半径 56）做容器
/// - 对角线渐变背景：粉 #FC72FF → 紫 #A78BFA → 青 #7DD3FC
/// - 中间是 cute pufferfish 剪影：白身、左下粉脸颊、深色眼睛带高光、小嘴 + 粉色舌头
/// - 7 个白色 spike 三角形围绕身体辐射（右侧让位给尾巴）
/// - 右侧白色三角尾鳍
///
/// 用 viewBox 256x256，外层可缩放到任意 size。
export function PufferOneLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PufferOne"
    >
      <defs>
        <linearGradient id="po-bg" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FC72FF" />
          <stop offset="0.55" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#7DD3FC" />
        </linearGradient>
        <radialGradient id="po-hl" cx="128" cy="0" r="128" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="white" stopOpacity="0.4" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background rounded square */}
      <rect x="0" y="0" width="256" height="256" rx="56" fill="url(#po-bg)" />

      {/* Top highlight */}
      <rect x="0" y="0" width="256" height="120" rx="56" fill="url(#po-hl)" />

      {/* Spikes — 7 white triangles around the body, skipping the rightmost (tail) */}
      {/* Each spike: small triangle, tip pointing outward, ~22px tall */}
      {/* Computed from angle 0..2π starting at top (-π/2), skipping index 2 (right) */}

      {/* Spike 0 (top, angle -90°) */}
      <polygon points="128,38 122,58 134,58" fill="#FFFFFF" opacity="0.92" />
      {/* Spike 1 (top-right, angle -45°) */}
      <polygon
        points="182,60 168,72 178,82"
        fill="#FFFFFF"
        opacity="0.92"
        transform="rotate(-15 175 70)"
      />
      {/* Spike 3 skipped (rightmost — tail goes here) */}
      {/* Spike 3 (bottom-right, angle 45°) */}
      <polygon
        points="180,180 168,170 184,176"
        fill="#FFFFFF"
        opacity="0.92"
        transform="rotate(60 177 175)"
      />
      {/* Spike 4 (bottom, angle 90°) */}
      <polygon points="128,218 122,198 134,198" fill="#FFFFFF" opacity="0.92" />
      {/* Spike 5 (bottom-left, angle 135°) */}
      <polygon
        points="76,180 88,170 72,176"
        fill="#FFFFFF"
        opacity="0.92"
        transform="rotate(-60 78 175)"
      />
      {/* Spike 6 (left, angle 180°) */}
      <polygon points="38,128 58,122 58,134" fill="#FFFFFF" opacity="0.92" />
      {/* Spike 7 (top-left, angle 225°) */}
      <polygon
        points="74,60 88,72 78,82"
        fill="#FFFFFF"
        opacity="0.92"
        transform="rotate(15 78 70)"
      />

      {/* Tail — right-side triangle pointing right (replaces skipped spike 2) */}
      <polygon points="186,128 220,108 220,148" fill="#FFFFFF" opacity="0.95" />

      {/* Body — white ellipse */}
      <ellipse cx="128" cy="128" rx="56" ry="48" fill="#FFFFFF" />

      {/* Cheek blush — pink */}
      <ellipse cx="100" cy="138" rx="13" ry="8" fill="#FC72FF" opacity="0.55" />

      {/* Mouth (small dark) */}
      <ellipse cx="128" cy="150" rx="10" ry="7" fill="#4D2050" opacity="0.85" />

      {/* Tongue inside mouth */}
      <ellipse cx="128" cy="154" rx="6" ry="3" fill="#FC72FFB3" />

      {/* Eye — cream outer + dark pupil + white highlight */}
      <ellipse cx="148" cy="116" rx="14" ry="14" fill="#F5F5FA" />
      <circle cx="151" cy="119" r="9" fill="#0F0F19" />
      <circle cx="154" cy="116" r="3.5" fill="#FFFFFF" />
    </svg>
  )
}
