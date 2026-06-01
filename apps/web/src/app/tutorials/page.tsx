import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { AdSlot } from "@doctool/ui";
import { adsConfig } from "@/config/ads";
import { isDesktopApp } from "@/config/appMode";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "使用教程 - 万能格式转换器",
  path: "/tutorials",
  description: "图片裁切、尺寸调整、水印、压缩、PDF 转图片、Word 转图片、Excel 转图片、视频转换、音频转换和视频提取音频的使用方法。"
});

const tutorials = [
  {
    title: "如何裁切图片",
    intro: "裁切主要是把图片里不需要的边缘去掉，或者把图片改成平台要求的比例。做头像、封面、商品主图时，不要一上来就随便拖，先想清楚这张图最后要发到哪里。",
    steps: [
      "先点击“图片裁切”功能卡片，再在下方添加 JPG、PNG、WEBP 或 BMP 图片。",
      "如果只是去掉边缘杂物，选择“自由裁切”。自由裁切可以按自己的眼睛判断，不会被比例限制。",
      "做头像时选“头像 1:1”，人物脸部尽量放在中间，头顶和下巴不要贴得太紧。",
      "做横向封面时选“16:9 横屏”；做短视频封面或竖版海报时选“9:16 竖屏”。",
      "证件照类图片不要随意拉伸，优先选一寸或二寸证件照比例，再微调人物位置。",
      "方向不对时先用左转、右转调整；如果是自拍镜像，可以再用水平翻转。",
      "选好导出格式和质量后点击开始处理。下载前看一下裁切边缘，确认没有把主体切掉。"
    ],
    tips: ["照片一般导出 JPG 就够用；透明背景图片要导出 PNG。", "裁切后觉得模糊，多半是原图本身太小，不是裁切功能的问题。"]
  },
  {
    title: "如何调整图片尺寸",
    intro: "尺寸调整用来改变图片的宽高。它和压缩不一样：尺寸调整会改变图片像素，压缩主要改变体积。上传头像、资料图、网页图片时，经常会用到这个功能。",
    steps: [
      "先选择“尺寸调整”，再添加需要处理的图片。",
      "如果只是想把图片整体变小，选择“按百分比”。50% 会把宽高都缩小一半，图片体积通常也会明显变小。",
      "如果平台明确要求宽高，比如 800 x 800，就选择“按像素”，手动输入宽度和高度。",
      "不想让图片被拉扁或拉长时，打开“锁定原图比例”。输入宽度后，高度会自动跟着变化。",
      "证件照、商品图和人物照一般不要强行改成不同比例，否则人脸和物体会变形。",
      "右侧会自动生成尺寸预览。预览看起来没问题，再点击开始处理。",
      "导出格式按用途选：照片选 JPG，透明图选 PNG，网页图可以选 WEBP。"
    ],
    tips: ["按像素改尺寸时，如果关闭锁定比例，图片可能变形。", "图片已经很小的话，不建议再放大到 200%，容易发虚。"]
  },
  {
    title: "如何给图片添加水印",
    intro: "添加水印适合给自己的图片加来源、客户样图标识、内部资料标记。文字水印最省事，图片水印适合放 logo 或店铺标识。",
    steps: [
      "先选择“添加水印”，再上传要加水印的原图。",
      "做普通说明时选择文字水印，输入例如“样图”“仅供确认”“请勿外传”等文字。",
      "调整文字大小时，不要只看数字，要看预览里水印和主体的关系。太小看不清，太大会影响图片内容。",
      "文字颜色建议和背景拉开一点。浅色背景用深色，深色背景用浅色，必要时降低透明度。",
      "如果要放 logo，切换为图片水印，然后上传 logo 图片。透明 PNG logo 效果通常更干净。",
      "角落水印适合正式展示图，平铺水印适合样张或防止被直接二次使用。",
      "右侧预览更新后，确认水印没有挡住人脸、商品细节或重要文字，再开始处理。"
    ],
    tips: ["透明度常用 20% 到 45%，太实会影响阅读。", "水印只能保护自己有权处理的图片，不要用于处理别人的版权内容。"]
  },
  {
    title: "如何压缩图片",
    intro: "压缩图片常用于网页上传、邮件发送、报名表、证照提交和减少存储占用。压缩不是越小越好，体积小了，画质也可能下降。",
    steps: [
      "先选择“图片压缩”，再上传 JPG、PNG 或 WEBP 图片。",
      "输出会统一保存为 JPG，这样在多数报名系统、网站后台和表单里兼容性更好。",
      "目标大小可以选 200KB、100KB、50KB、25KB。一般照片先试 200KB，不够再继续压小。",
      "文字截图、证件照和带二维码的图片不要一开始就选 25KB，容易糊或影响识别。",
      "如果原图特别大，可以设置最大宽高，让图片先缩小尺寸，再压缩体积。",
      "处理完成后看压缩前后大小和压缩率。重要图片建议下载后打开放大检查。"
    ],
    tips: ["二维码、证件照、票据截图压缩后一定要复查。", "如果 25KB 下看不清，就不要硬压到 25KB，换 50KB 或 100KB 更稳。"]
  },
  {
    title: "如何把 PDF 转成图片",
    intro: "PDF 转图片适合把资料页做成图片预览，或者上传到只支持图片的平台。这个功能不会改 PDF 内容，只是把页面按图片渲染出来。",
    steps: [
      "先选择“PDF 转图片”，再添加 PDF 文件。",
      "如果只需要几页，不要选全部。页码可以写成 1-3,5,8-10 这种格式。",
      "选择“逐页导出”时，每一页都会生成一张图片；多页会自动打包成 ZIP。",
      "选择“合成一页导出”时，选中的页面会从上到下拼成一张长图，适合发给别人快速查看。",
      "格式方面，PNG 更清楚，适合文字资料；JPG 体积更小，适合普通预览；WEBP 适合网页使用。",
      "清晰度越高越慢，占用内存也越多。普通资料用高清就够，超清适合需要放大看的图纸或页面。",
      "处理完成后先打开结果看页码顺序，再决定是否重新选择页码范围处理。"
    ],
    tips: ["移动端处理大 PDF 会比较慢，建议分批选择页码。", "如果 PDF 能打开但转换失败，先另存一份新 PDF 再试。"]
  },
  {
    title: "如何把 Word 转成图片",
    intro: "Word 转图片适合把文档内容发给别人预览，或者做成长图保存。这个功能更像“把文档打印成图片”，不是把 Word 重新排版成另一个文档。",
    steps: [
      "先选择“Word 转图片”，再添加 .docx 文件。旧版 .doc 文件需要先在 Word 或 WPS 里另存为 .docx。",
      "普通文档建议导出 PNG，文字边缘更清楚；如果只是临时预览，可以选 JPG 减小体积。",
      "选择“逐页导出”时，工具会按页面顺序生成图片，适合归档或单独发送某一页。",
      "选择“合成一页导出”时，会把页面拼成长图，适合聊天发送、移动端查看或做资料预览。",
      "文档里如果有表格，导出后重点检查表格顺序、列宽和换行位置。",
      "文档里如果有艺术字、浮动图片、复杂页眉页脚，建议下载后打开仔细看一遍。",
      "结果不理想时，可以先在 Word 里把页面整理成更规整的版式，再重新上传转换。"
    ],
    tips: ["本地转换不会上传文档内容。", "特别正式的合同、报价、证明材料，导出图片后仍要人工核对。"]
  },
  {
    title: "如何把 Excel 转成图片",
    intro: "Excel 转图片适合把表格做成清单图、报价图、课程表、值班表或库存表。别人不需要打开 Excel，也能直接看内容。",
    steps: [
      "先选择“Excel 转图片”，再添加 xlsx 或 csv 文件。旧版 xls 建议先用 Excel/WPS 另存为 xlsx。",
      "如果工作簿里有多个工作表，工具会按工作表顺序处理。",
      "表格行数较多时，会自动拆成多张图片，避免单张图片太长导致打开困难。",
      "选择“逐页导出”时，各段图片会打包成 ZIP，适合保留为多个文件。",
      "选择“合成一页导出”时，会把所有表格图片拼成长图，适合发给别人快速浏览。",
      "下载后重点检查表头、金额、日期、编号、小数点和较长文字。",
      "如果表格非常宽，建议先在 Excel 里隐藏不需要的列，或者把列宽整理好再转换。"
    ],
    tips: ["金额、库存、成绩、日期这类数据不要只看缩略图，最好打开原尺寸核对。", "太宽的表格在手机上看会比较费劲，可以先拆成几张表。"]
  },
  {
    title: "如何转换视频格式",
    intro: "视频格式转换适合处理手机、相机、剪辑软件导出的视频。比如有的平台只收 MP4，有的素材是 MOV，发给别人后打不开，就可以先转成更通用的格式。",
    steps: [
      "先选择“视频格式转换”，再在下方添加 MP4、MOV、AVI、MKV 或 WebM 视频。",
      "看一下“可用性检查”。如果显示当前环境可用，就可以继续；如果浏览器不支持，建议换离线版处理。",
      "不知道选什么格式时，优先选 MP4。MP4 在手机、电脑、微信、网页后台里通常更容易播放。",
      "如果要继续剪辑，可以保留较高质量；如果只是发送预览，可以选择更轻的质量，文件会小一些。",
      "视频尺寸建议先保持原尺寸。只有在文件太大、上传平台有限制时，再改成 1080p、720p 等较小尺寸。",
      "点击开始处理后，电脑风扇变响或页面变慢是正常现象，说明本机正在转码。不要关闭页面或程序。",
      "下载后务必完整播放一遍，至少检查开头、中间、结尾，确认画面、声音、时长都正常。"
    ],
    tips: ["视频只在当前设备处理，不上传服务器。", "长视频、高清视频更适合用离线版，并提前留出足够磁盘空间。"]
  },
  {
    title: "如何转换音频格式",
    intro: "音频格式转换常用于录音整理、课件素材、播客音频、短视频配音和后台上传。不同平台支持的格式不一样，转换前先看清楚平台要求。",
    steps: [
      "先选择“音频格式转换”，再添加 MP3、WAV、AAC、M4A 或 FLAC 音频。",
      "如果只是发给别人听，通常选 MP3，兼容性好、体积也比较小。",
      "如果要放进剪辑软件继续加工，WAV 更稳，但文件会明显变大。",
      "AAC 和 M4A 适合手机端、视频素材和部分平台上传；FLAC 更适合保留较高音质。",
      "码率不要盲目调太高。普通语音 128k 通常够用，音乐素材可以适当提高。",
      "开始处理后保持页面打开。处理完成后下载文件，再用常用播放器试听一遍。",
      "试听时重点听开头有没有被截掉、结尾有没有少一段、整体音量是否正常。"
    ],
    tips: ["WAV 和 FLAC 体积会比较大，上传前留意平台大小限制。", "如果浏览器处理失败，换离线版通常更稳定。"]
  },
  {
    title: "如何从视频中提取音频",
    intro: "视频提取音频适合把录屏、课程、会议、采访或素材视频里的声音单独保存出来。它不会改原视频，只是从视频里取出一份新的音频文件。",
    steps: [
      "先选择“视频提取音频”，再添加带声音的视频文件。",
      "普通保存和分享可以选 MP3；后续剪辑可以选 WAV；手机端使用可以选 M4A 或 AAC。",
      "如果视频很长，建议先确认电脑剩余空间。提取过程中会生成临时数据。",
      "点击开始处理，工具会在本地读取音频轨道并生成新的音频文件。",
      "如果提示没有音频轨道，说明视频本身可能静音，或文件编码无法被本地内核读取。",
      "下载结果后试听，确认声音完整、没有明显截断。",
      "如果只需要其中一小段声音，当前版本建议先提取完整音频，再用专门音频剪辑工具裁剪。"
    ],
    tips: ["提取的是音频轨道，不会改善原视频里已经存在的噪声。", "会议、课程等内容可能涉及隐私或版权，处理前先确认你有合法使用权。"]
  },
  {
    title: "在线版和离线安装版有什么区别",
    intro: "在线版和离线安装版的核心处理顺序一致：先选功能，再添加文件，再设置参数。在线版是网页工具台；离线版安装后直接进入专业工具箱，更适合批量、敏感文件和断网办公。",
    steps: [
      "在线版适合临时处理，比如裁一张图、压缩一张照片、把一份普通 PDF 转成图片。",
      "离线版安装到 Windows 后使用，不依赖网站服务器，断网也能打开核心功能。",
      "如果文件很大，或者是公司资料、客户资料、证件照、内部表格，建议直接使用离线版。",
      "在线版可能会加载页面资源和广告脚本，但文件处理本身仍在当前设备完成。",
      "离线版不加载在线广告容器，界面会显示左侧工具箱、中央任务队列和右侧参数面板。",
      "批量导入会跟随当前选中的转换工具，不需要单独进入“批量处理”功能页。"
    ],
    tips: ["公司电脑、资料电脑、无网电脑建议安装离线版。", "浏览器处理大文件卡顿时，不要反复刷新，换离线版更合适。"]
  },
  {
    title: "如何确认文件没有上传服务器",
    intro: "如果你想自己确认文件有没有上传，可以用浏览器的开发者工具看网络请求。这个方法不用懂代码，只要看有没有可疑的文件上传请求。",
    steps: [
      "打开在线版页面后，按 F12。如果是笔记本，可能需要同时按 Fn + F12。",
      "在开发者工具里找到 Network，中文浏览器里可能叫“网络”。",
      "先清空一次记录，再上传一张图片、一个 PDF、一个 Word/Excel、一段音频或一段视频并执行处理。",
      "处理过程中看请求列表。正常情况下，不会出现把原始文件、转换结果或 OCR/转换内容上传到外部接口的请求。",
      "你可能会看到页面资源、字体、广告脚本或本地静态资源请求，这些不等于上传你的文件。",
      "如果文件非常敏感，最简单的办法是使用离线安装版，并在断网状态下处理。这样连广告和网页资源请求也不会发生。"
    ],
    tips: ["如果你不确定某个文件是否敏感，就按敏感文件处理。", "不要把身份证件、合同原件、财务资料通过邮件发给任何人让对方代处理。"]
  }
];

const quickGuide = [
  {
    title: "先看文件类型",
    text: "图片就去图片工具，PDF、Word、Excel 去文档工具，视频和音频去音视频工具。不要先纠结格式，先把入口选对。"
  },
  {
    title: "再看最终用途",
    text: "要上传表单，通常先压缩或改尺寸；要发给别人预览，通常转成图片；要继续剪辑，视频和音频尽量保留较高质量。"
  },
  {
    title: "最后再调参数",
    text: "第一次处理不要把质量、尺寸、页码一次调到极限。先按推荐值生成一版，看结果，再决定是否压得更小或导出更高清。"
  }
];

export default function TutorialsPage() {
  return (
    <main className="document-page mx-auto max-w-7xl px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <section className="rounded-sm tech-panel p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 border border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--accent-blue)]">
              <BookOpen size={17} /> 使用教程
            </div>
            <h1 className="mt-5 text-3xl font-bold text-slate-50 sm:text-4xl">常用功能怎么用</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              下面这些说明按真实使用顺序写：先判断该选哪个功能，再添加文件，最后调整参数。第一次用可以照着做，熟悉后直接进工具台选择对应入口。
            </p>
          </div>
          <Link href={siteConfig.links.tools} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-cyan-300/50 bg-cyan-400 px-5 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
            {isDesktopApp ? "打开所有功能" : "进入在线工具"} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {quickGuide.map((item) => (
          <div key={item.title} className="border border-[var(--border-soft)] bg-white p-5">
            <h2 className="text-base font-bold text-slate-950">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-6">
        {tutorials.map((item, index) => (
          <article key={item.title} className="rounded-sm tech-panel p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-cyan-300">教程 {String(index + 1).padStart(2, "0")}</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-50">{item.title}</h2>
              </div>
              <span className="inline-flex w-fit items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={15} /> 本地处理
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">{item.intro}</p>
            <ol className="mt-5 list-decimal space-y-2 pl-6 text-sm leading-7 text-slate-300">
              {item.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className="mt-5 border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4">
              <p className="text-sm font-semibold text-slate-50">使用时留意</p>
              <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-300">
                {item.tips.map((tip) => (
                  <li key={tip}>- {tip}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      {!isDesktopApp ? (
        <div id="ad-container" className="mt-8">
          <AdSlot config={adsConfig} name="tutorialBottom" />
        </div>
      ) : null}
    </main>
  );
}
