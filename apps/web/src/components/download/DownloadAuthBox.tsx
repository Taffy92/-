"use client";

import { useMemo, useState } from "react";
import { Download, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { downloadAuthConfig } from "@/config/downloadAuth";
import { downloadsConfig } from "@/config/downloads";

type AuthResponse = {
  downloadUrl?: string;
  expiresAt?: string | number;
  fileName?: string;
  message?: string;
  error?: string;
};

export function DownloadAuthBox() {
  const [password, setPassword] = useState("");
  const [packageType, setPackageType] = useState<"exe" | "msi">("exe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AuthResponse | null>(null);

  const canRequest = useMemo(() => {
    return downloadAuthConfig.enabled && Boolean(downloadAuthConfig.endpoint);
  }, []);

  async function requestDownload() {
    const normalizedPassword = password.trim();
    if (!normalizedPassword) {
      setError("请输入作者提供的下载口令。");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(downloadAuthConfig.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: normalizedPassword,
          packageType,
          appName: downloadsConfig.appName,
          version: downloadsConfig.version
        })
      });
      const payload = (await response.json().catch(() => ({}))) as AuthResponse;
      if (!response.ok || !payload.downloadUrl) {
        throw new Error(payload.error || payload.message || "下载口令校验未通过，请检查口令或联系作者。");
      }
      setResult(payload);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "";
      setError(
        message === "Failed to fetch"
          ? "无法连接授权下载服务，请刷新页面后重试；如果仍然失败，请联系作者获取安装包。"
          : message || "下载口令校验失败，请稍后重试。"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-sm border border-cyan-300/15 bg-slate-950/70 p-5 text-slate-100 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-sm border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
            <ShieldCheck size={15} />
            授权下载
          </p>
          <h2 className="mt-3 text-xl font-bold text-slate-50">离线专业版需要输入下载口令</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
            为避免安装包被随意传播，离线版不在静态网站中公开直链。请联系作者获取下载口令，
            输入正确后系统会生成短时有效的安装包下载链接。CloudBase 只校验口令并生成下载链接，不接触用户处理文件。
          </p>
        </div>
        <a
          href={`mailto:${downloadAuthConfig.contactEmail}?subject=申请万能格式转换器离线专业版下载口令`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-cyan-300/30 bg-slate-900 px-5 text-sm font-semibold text-slate-100 hover:bg-cyan-400/10"
        >
          <Mail size={17} />
          联系作者
        </a>
      </div>

      {canRequest ? (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {downloadsConfig.packages.map((item) => (
              <label
                key={item.type}
                className={`cursor-pointer rounded-sm border p-4 transition ${
                  packageType === item.type ? "border-cyan-300 bg-cyan-400/10 ring-4 ring-cyan-400/10" : "border-cyan-300/12 bg-slate-900/60 hover:border-cyan-300/30"
                }`}
              >
                <input
                  type="radio"
                  name="download-package"
                  value={item.type}
                  checked={packageType === item.type}
                  onChange={() => setPackageType(item.type)}
                  className="sr-only"
                />
                <span className="text-sm font-semibold text-slate-50">{item.label}</span>
                <span className="mt-1 block text-xs text-slate-400">{item.fileName}</span>
                <span className="mt-2 block text-xs text-slate-300">大小：{item.fileSize}</span>
              </label>
            ))}
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="text-xs font-semibold text-slate-300">下载口令</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="请输入作者提供的下载口令"
                className="mt-2 h-12 w-full rounded-sm border border-cyan-300/20 bg-slate-950 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-400/15"
              />
            </label>
            <button
              type="button"
              onClick={requestDownload}
              disabled={loading}
              className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-sm border border-cyan-300/50 bg-cyan-400 px-6 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500 lg:mt-auto"
            >
              <KeyRound size={17} />
              {loading ? "正在校验" : `获取 ${packageType.toUpperCase()} 下载链接`}
            </button>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-sm border border-cyan-300/12 bg-slate-900/70 p-5 text-sm leading-7 text-slate-300">
          当前网站尚未接入自动下载口令接口。请通过邮箱联系作者获取离线安装版授权和下载方式：
          <a className="ml-1 font-semibold text-cyan-200 hover:underline" href={`mailto:${downloadAuthConfig.contactEmail}`}>
            {downloadAuthConfig.contactEmail}
          </a>
        </div>
      )}

      {error ? <p className="mt-4 rounded-sm border border-red-400/20 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</p> : null}

      {result?.downloadUrl ? (
        <div className="mt-5 rounded-sm border border-emerald-300/20 bg-emerald-950/35 p-5">
          <p className="font-semibold text-emerald-100">下载口令校验通过</p>
          <p className="mt-1 text-sm text-emerald-100/85">
            下载链接为临时链接，请尽快下载。下载后可复制到 U 盘，在无网络电脑上安装使用。
          </p>
          {result.expiresAt ? (
            <p className="mt-1 text-xs text-emerald-100/75">有效期：{formatExpiresAt(result.expiresAt)}</p>
          ) : null}
          <a
            href={result.downloadUrl}
            className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-emerald-400 px-6 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
          >
            <Download size={18} />
            下载 {result.fileName || downloadsConfig.fileName}
          </a>
        </div>
      ) : null}
    </section>
  );
}

function formatExpiresAt(value: string | number) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleString("zh-CN", { hour12: false });
}
