import type { ReactNode } from 'react'

/// 手机壳容器：外部暗 grid 装饰背景，内部居中 460px 容器。
/// 在桌面端模拟手机 portrait 体验，在移动端自然填满全屏。
export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid-bg min-h-screen w-full">
      <div className="mobile-shell pb-[88px]">{children}</div>
    </div>
  )
}
