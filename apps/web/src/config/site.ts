export const siteConfig = {
  name: "万能格式转换器",
  shortName: "万能格式转换器",
  description:
    "免费在线处理图片、PDF、Word、Excel、音频和视频，支持图片格式与元数据处理、PDF 页面整理、音视频裁剪、图片与 PDF 本地 OCR，以及原有格式转换功能。所有处理尽量在浏览器本地完成，文件不上传服务器。",
  developer: "MR.谢",
  wechat: "___Skyblue",
  email: "370298218@qq.com",
  copyright: "© 2026 MR.谢. All rights reserved.",
  icp: {
    text: "鲁ICP备2026028326号",
    url: "https://beian.miit.gov.cn/"
  },
  publicSecurity: {
    text: "鲁公网安备37048102006986号",
    url: "https://beian.mps.gov.cn/#/query/webSearch?code=37048102006986",
    icon: "/icons/beian-gongan.png"
  },
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://gszhmrx.cn",
  links: {
    home: "/",
    tools: "/tools",
    localTools: "/local-tools",
    download: "/download",
    tutorials: "/tutorials",
    about: "/about",
    privacy: "/privacy",
    terms: "/terms",
    licenses: "/licenses",
    contact: "/contact",
    changelog: "/changelog"
  }
};
