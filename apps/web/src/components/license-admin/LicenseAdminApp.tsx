"use client";

import { useCallback, useState } from "react";
import { Download, LogOut, ShieldCheck } from "lucide-react";
import {
  LicenseAdminApiError,
  downloadEncryptedBackup,
  generateLicense,
  loadHistory,
  login,
  logout
} from "@/lib/license-admin/client";
import type {
  LicenseDraft,
  LicenseHistoryItem,
  LicenseHistoryPage,
  LicenseResult as LicenseResultType
} from "@/lib/license-admin/types";
import { IssuePanel } from "./IssuePanel";
import { LicenseHistory } from "./LicenseHistory";
import { LicenseResult } from "./LicenseResult";
import { LoginPanel } from "./LoginPanel";
import styles from "./license-admin.module.css";

const initialDraft: LicenseDraft = {
  customerName: "",
  machineCode: "",
  duration: 30,
  remark: "",
  parentRecordId: null,
  renewalMachineCode: ""
};

const emptyHistory: LicenseHistoryPage = {
  page: 1,
  pageSize: 20,
  total: 0,
  items: []
};

export function LicenseAdminApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [draft, setDraft] = useState(initialDraft);
  const [issueBusy, setIssueBusy] = useState(false);
  const [issueError, setIssueError] = useState("");
  const [result, setResult] = useState<LicenseResultType | null>(null);
  const [history, setHistory] = useState(emptyHistory);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const refreshHistory = useCallback(async (query = "") => {
    setHistoryLoading(true);
    try {
      const next = await loadHistory(query);
      setHistory(next);
      setAuthenticated(true);
    } catch (error) {
      if (error instanceof LicenseAdminApiError && error.status === 401) {
        setAuthenticated(false);
      } else {
        setNotice(messageFrom(error));
      }
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  async function handleLogin(password: string) {
    setLoginBusy(true);
    setLoginError("");
    try {
      await login(password);
      setAuthenticated(true);
      await refreshHistory();
    } catch (error) {
      setLoginError(messageFrom(error));
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setAuthenticated(false);
      setDraft(initialDraft);
      setResult(null);
      setHistory(emptyHistory);
      setNotice("");
    }
  }

  async function handleGenerate() {
    setIssueBusy(true);
    setIssueError("");
    setNotice("");
    try {
      const generated = await generateLicense(draft);
      setResult(generated);
      setDraft({
        ...initialDraft,
        customerName: draft.customerName,
        duration: draft.duration
      });
      await refreshHistory();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (error instanceof LicenseAdminApiError && error.status === 401) {
        setAuthenticated(false);
      } else {
        setIssueError(messageFrom(error));
      }
    } finally {
      setIssueBusy(false);
    }
  }

  function beginRenewal(item: LicenseHistoryItem) {
    setDraft({
      customerName: item.customerName,
      machineCode: "",
      duration: 30,
      remark: "",
      parentRecordId: item.recordId,
      renewalMachineCode: item.maskedMachineCode
    });
    setResult(null);
    setIssueError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleBackup() {
    setNotice("");
    try {
      await downloadEncryptedBackup();
      setNotice("加密备份已下载。");
    } catch (error) {
      if (error instanceof LicenseAdminApiError && error.status === 401) {
        setAuthenticated(false);
      } else {
        setNotice(messageFrom(error));
      }
    }
  }

  if (authenticated !== true) {
    return (
      <LoginPanel
        busy={loginBusy}
        error={loginError}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <main className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <div className={styles.brandRow}>
          <div className={styles.brandIcon} aria-hidden="true"><ShieldCheck size={22} /></div>
          <div>
            <p className={styles.eyebrow}>私人管理工具</p>
            <h1>离线授权后台</h1>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.textButton} onClick={handleBackup}>
            <Download size={16} />
            加密备份
          </button>
          <button type="button" className={styles.textButton} onClick={handleLogout}>
            <LogOut size={16} />
            退出
          </button>
        </div>
      </header>

      {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
      <div className={styles.contentGrid}>
        <div className={styles.primaryColumn}>
          <IssuePanel
            draft={draft}
            busy={issueBusy}
            error={issueError}
            onChange={setDraft}
            onSubmit={handleGenerate}
            onCancelRenewal={() => setDraft(initialDraft)}
          />
          {result ? <LicenseResult result={result} /> : null}
        </div>
        <LicenseHistory
          items={history.items}
          total={history.total}
          loading={historyLoading}
          onSearch={refreshHistory}
          onRenew={beginRenewal}
        />
      </div>
    </main>
  );
}

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : "操作失败，请稍后重试。";
}
