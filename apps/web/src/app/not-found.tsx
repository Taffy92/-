import Link from "next/link";
import { ArrowLeft, FileQuestion, LayoutGrid } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-card" aria-labelledby="not-found-title">
        <div className="not-found-mark" aria-hidden="true">
          <FileQuestion size={28} strokeWidth={1.8} />
        </div>
        <p className="not-found-code">404 · 页面不存在</p>
        <h1 id="not-found-title">没有找到这个页面</h1>
        <p className="not-found-copy">
          地址可能已更新，或者输入有误。你可以返回首页，也可以直接前往在线工具目录。
        </p>
        <div className="not-found-actions">
          <Link href="/" className="not-found-primary">
            <ArrowLeft size={17} aria-hidden="true" />
            返回首页
          </Link>
          <Link href="/tools/" className="not-found-secondary">
            <LayoutGrid size={17} aria-hidden="true" />
            查看在线工具
          </Link>
        </div>
      </section>
    </main>
  );
}
