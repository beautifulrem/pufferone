import { Button } from '@repo/ui/components/button'
import { Compass } from 'lucide-react'
import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10">
        <Compass size={28} className="text-primary" />
      </span>
      <div>
        <p className="font-bold text-foreground text-2xl">页面不存在</p>
        <p className="mt-1 text-text-tertiary text-sm">
          你访问的链接已失效或拼写错误。
        </p>
      </div>
      <Button asChild className="cta-gradient mt-2 rounded-full font-mono">
        <Link to="/">回到资产页</Link>
      </Button>
    </div>
  )
}
