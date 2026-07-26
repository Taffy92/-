"use client";

import { FormEvent, useState } from "react";
import { KeyRound } from "lucide-react";
import styles from "./license-admin.module.css";

export function LoginPanel({
  backendOnline,
  busy,
  error,
  onLogin
}: {
  backendOnline: boolean | null;
  busy: boolean;
  error: string;
  onLogin: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onLogin(password);
    setPassword("");
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginCard} aria-labelledby="login-title">
        <div className={styles.iconBadge} aria-hidden="true">
          <KeyRound size={22} />
        </div>
        <p className={styles.eyebrow}>私人管理工具</p>
        <h1 id="login-title">离线授权后台</h1>
        <p className={styles.lead}>输入管理员密码，生成或续期离线授权。</p>
        <div className={styles.backendStatus} role="status">
          <span className={backendOnline ? styles.statusDotOnline : styles.statusDot} />
          {backendOnline === null
            ? "正在检查后台"
            : backendOnline
              ? "后台可用"
              : "后台暂不可用"}
        </div>
        <form onSubmit={submit} className={styles.loginForm}>
          <label htmlFor="admin-password">管理员密码</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={busy}
            autoFocus
          />
          {error ? <p className={styles.errorText} role="alert">{error}</p> : null}
          <button type="submit" className={styles.primaryButton} disabled={busy || !password}>
            {busy ? "正在进入…" : "进入后台"}
          </button>
        </form>
      </section>
    </main>
  );
}
