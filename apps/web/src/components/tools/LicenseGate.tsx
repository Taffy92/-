"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Copy, Download, KeyRound, Loader2, ShieldCheck, Upload } from "lucide-react";
import { activateLicenseCode, activateLicenseFileContent, createActivationRequest } from "@/lib/desktopLicense";
import type { DesktopLicenseStatus } from "@/lib/desktopLicense";

type LicenseGateProps = {
  status: DesktopLicenseStatus;
  onStatusChange: (status: DesktopLicenseStatus) => void;
};

export function LicenseGate({ status, onStatusChange }: LicenseGateProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [licenseCode, setLicenseCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const contact = status.contact;
  const title = status.reasonCode === "time_rollback" ? "系统时间异常" : status.reasonCode === "license_expired" ? "授权已过期" : "试用已结束";

  async function copyMachineId() {
    await navigator.clipboard?.writeText(status.machineId);
    setMessage("机器码已复制。");
  }

  async function exportActivationRequest() {
    setBusy(true);
    setMessage("");
    try {
      const request = await createActivationRequest();
      downloadTextFile("activation_request.mrx", JSON.stringify(request, null, 2));
      setMessage("授权申请文件已导出。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导出授权申请文件失败。");
    } finally {
      setBusy(false);
    }
  }

  async function activateWithCode() {
    if (!licenseCode.trim()) {
      setMessage("请输入授权码。");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const nextStatus = await activateLicenseCode(licenseCode.trim());
      onStatusChange(nextStatus);
      setMessage(nextStatus.allowed ? "激活成功。" : nextStatus.reason);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "激活失败。");
    } finally {
      setBusy(false);
    }
  }

  async function importLicenseFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      const content = await file.text();
      const nextStatus = await activateLicenseFileContent(content);
      onStatusChange(nextStatus);
      setMessage(nextStatus.allowed ? "授权文件激活成功。" : nextStatus.reason);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "授权文件激活失败。");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-[#0F1418] px-6 py-8 text-[#EDF3F7]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col justify-center">
        <div className="border border-[#50646F] bg-[#182229] p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#D56A6A]/60 bg-[#2C1D20] text-[#FFB4B4]">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#9FACB4]">万能格式转换器离线专业版</p>
              <h1 className="mt-2 text-2xl font-semibold leading-tight">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#CAD5DC]">{status.reason}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <section className="border border-[#50646F] bg-[#111A20] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4 text-[#76C77D]" />
                当前设备
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <code className="border border-[#50646F] bg-[#23313A] px-3 py-2 font-mono text-lg font-semibold text-[#F5F7FA]">{status.machineId}</code>
                <button className="inline-flex items-center gap-2 border border-[#50646F] px-3 py-2 text-sm hover:bg-[#32434D]" type="button" onClick={() => void copyMachineId()}>
                  <Copy className="h-4 w-4" />
                  复制
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 border border-[#50646F] bg-[#23313A] px-3 py-2 text-sm hover:bg-[#32434D] disabled:opacity-50" type="button" disabled={busy} onClick={() => void exportActivationRequest()}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  导出授权申请文件
                </button>
                <input ref={fileInputRef} className="hidden" type="file" accept=".mrx,application/json,text/plain" onChange={(event) => void importLicenseFile(event.target.files?.[0])} />
                <button className="inline-flex items-center gap-2 border border-[#50646F] px-3 py-2 text-sm hover:bg-[#32434D] disabled:opacity-50" type="button" disabled={busy} onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  导入 license.mrx
                </button>
              </div>
            </section>

            <section className="border border-[#50646F] bg-[#111A20] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <KeyRound className="h-4 w-4 text-[#76C77D]" />
                输入授权码
              </div>
              <textarea
                className="mt-3 h-28 w-full resize-none border border-[#50646F] bg-[#23313A] p-3 text-sm text-[#EDF3F7] outline-none focus:border-[#76C77D]"
                value={licenseCode}
                onChange={(event) => setLicenseCode(event.target.value)}
                placeholder="UFC1-..."
              />
              <button className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-[#76C77D] bg-[#1F3A31] px-3 py-2 text-sm font-semibold text-[#D8FFE0] hover:bg-[#28483D] disabled:opacity-50" type="button" disabled={busy} onClick={() => void activateWithCode()}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                激活
              </button>
            </section>
          </div>

          <footer className="mt-5 border-t border-[#50646F] pt-4 text-sm leading-7 text-[#CAD5DC]">
            <p>管理员微信：{contact.wechat}</p>
            <p>联系电话：{contact.phone}</p>
            <p>邮箱：{contact.email}</p>
            {message ? <p className="mt-2 text-[#76C77D]">{message}</p> : null}
          </footer>
        </div>
      </section>
    </main>
  );
}

function downloadTextFile(fileName: string, text: string) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
