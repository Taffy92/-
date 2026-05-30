import Link from "next/link";
import { isDesktopApp } from "@/config/appMode";
import { siteConfig } from "@/config/site";

const webFooterLinks = [
  ["关于我们", siteConfig.links.about],
  ["隐私政策", siteConfig.links.privacy],
  ["使用条款", siteConfig.links.terms],
  ["开源许可证", siteConfig.links.licenses],
  ["联系我们", siteConfig.links.contact],
  ["下载专业版", siteConfig.links.download],
  ["使用教程", siteConfig.links.tutorials],
  ["更新日志", siteConfig.links.changelog]
] as const;

const desktopFooterLinks = [
  ["专业工作台", siteConfig.links.tools],
  ["使用教程", siteConfig.links.tutorials],
  ["隐私政策", siteConfig.links.privacy],
  ["使用条款", siteConfig.links.terms],
  ["开源许可证", siteConfig.links.licenses],
  ["关于我们", siteConfig.links.about]
] as const;

export function Footer() {
  const desktop = isDesktopApp;
  const footerLinks = desktop ? desktopFooterLinks : webFooterLinks;

  return (
    <footer className={desktop ? "border-t border-cyan-300/15 bg-slate-950" : "border-t border-slate-200 bg-white"}>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
        <div className="space-y-2">
          <h2 className={desktop ? "text-lg font-bold text-slate-50" : "text-lg font-bold text-slate-950"}>{siteConfig.name}</h2>
          <p className={desktop ? "text-sm text-slate-300" : "text-sm text-slate-600"}>开发者：{siteConfig.developer}</p>
          <p className={desktop ? "text-sm text-slate-300" : "text-sm text-slate-600"}>联系邮箱：{siteConfig.email}</p>
          <p className={desktop ? "text-sm text-slate-400" : "text-sm text-slate-500"}>{siteConfig.copyright}</p>
          <p className={desktop ? "text-xs leading-5 text-slate-500" : "max-w-3xl text-xs leading-5 text-slate-500"}>
            文件处理在本地完成。CloudBase 只用于下载授权，不接触用户处理文件；广告不接收 File、Blob、ArrayBuffer、Canvas 或转换结果。
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {footerLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={desktop
                ? "rounded-sm border border-transparent px-3 py-2 text-sm text-slate-400 hover:border-cyan-300/20 hover:bg-cyan-400/10 hover:text-cyan-100"
                : "rounded-sm border border-transparent px-3 py-2 text-sm text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
              }
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
