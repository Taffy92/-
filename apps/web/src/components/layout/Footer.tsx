"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isDesktopApp } from "@/config/appMode";
import { siteConfig } from "@/config/site";

const webFooterGroups = [
  {
    title: "关于产品",
    links: [
      ["关于我们", siteConfig.links.about],
      ["联系我们", siteConfig.links.contact]
    ]
  },
  {
    title: "合规与安全",
    links: [
      ["隐私政策", siteConfig.links.privacy],
      ["使用条款", siteConfig.links.terms]
    ]
  },
  {
    title: "服务与开发",
    links: [
      ["使用教程", siteConfig.links.tutorials],
      ["下载专业版", siteConfig.links.download]
    ]
  },
  {
    title: "开源社区",
    links: [
      ["开源许可证", siteConfig.links.licenses],
      ["更新日志", siteConfig.links.changelog]
    ]
  }
] as const;

const desktopFooterGroups = [
  {
    title: "专业版",
    links: [
      ["专业工作台", siteConfig.links.tools],
      ["使用教程", siteConfig.links.tutorials]
    ]
  },
  {
    title: "合规与安全",
    links: [
      ["隐私政策", siteConfig.links.privacy],
      ["使用条款", siteConfig.links.terms]
    ]
  },
  {
    title: "项目文档",
    links: [
      ["开源许可证", siteConfig.links.licenses],
      ["关于我们", siteConfig.links.about]
    ]
  }
] as const;

export function Footer() {
  const desktop = isDesktopApp;
  const pathname = usePathname();
  const footerGroups = desktop ? desktopFooterGroups : webFooterGroups;

  if (pathname.startsWith(siteConfig.links.tools) || pathname.startsWith("/admin/license")) {
    return null;
  }

  return (
    <footer className={desktop ? "apple-footer apple-footer-desktop" : "apple-footer"}>
      <div className="footer-content-wrap">
        <div className="footer-directory">
          {footerGroups.map((group) => (
            <nav className="footer-col" key={group.title} aria-label={group.title}>
              <h2>{group.title}</h2>
              {group.links.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className="footer-legal-bar">
          <div>
            <p>
              开发者：{siteConfig.developer}
              <span> | </span>
              联系邮箱：{siteConfig.email}
            </p>
            <p>
              安全声明：网站与安装包由 EdgeOne 分发；用户处理文件和转换结果始终在本机处理，不上传服务器。
            </p>
          </div>
          <div className="footer-filing">
            {!desktop ? (
              <>
                <a className="footer-public-security" href={siteConfig.publicSecurity.url} target="_blank" rel="noreferrer">
                  <img src={siteConfig.publicSecurity.icon} alt="" aria-hidden="true" />
                  <span>{siteConfig.publicSecurity.text}</span>
                </a>
                <a href={siteConfig.icp.url} target="_blank" rel="noopener noreferrer">
                  {siteConfig.icp.text}
                </a>
              </>
            ) : null}
            <span>{siteConfig.copyright}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
