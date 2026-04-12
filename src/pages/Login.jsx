import { useState } from "react";
import { supabase } from "../lib/supabase";
import { C, T, S, R, F, label, body, heading, btn, input } from "../lib/ui";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin"); // or 'signup'
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg({ t: "info", m: "Проверьте почту — отправили ссылку для подтверждения." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setMsg({ t: "error", m: err.message || "Ошибка входа" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: S.xl, background: `radial-gradient(circle at 30% 20%, rgba(230,77,168,.12), transparent 60%), radial-gradient(circle at 70% 80%, rgba(240,136,56,.08), transparent 60%), ${C.bg}` }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: S.xxl }}>
          <div style={{ ...heading(T.xxl), color: C.text, letterSpacing: ".02em" }}>Frisson</div>
          <div style={{ ...label(T.xs), color: C.accent, marginTop: 4 }}>ADMIN</div>
        </div>

        <div style={{ ...label(T.xs), color: C.textMuted, marginBottom: S.sm }}>Email</div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          placeholder="anastasiyazvanok@gmail.com"
          required
          style={{ ...input, marginBottom: S.md }}
        />

        <div style={{ ...label(T.xs), color: C.textMuted, marginBottom: S.sm }}>Пароль</div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "signup" ? "мин. 6 символов" : ""}
          required
          minLength={6}
          style={{ ...input, marginBottom: S.lg }}
        />

        {msg && (
          <div style={{
            padding: S.md, borderRadius: R.md, marginBottom: S.md,
            background: msg.t === "error" ? "rgba(196,64,64,.1)" : "rgba(59,168,138,.1)",
            border: `1px solid ${msg.t === "error" ? "rgba(196,64,64,.3)" : "rgba(59,168,138,.3)"}`,
            color: msg.t === "error" ? "#E88" : "#8E8",
            fontSize: T.sm,
          }}>{msg.m}</div>
        )}

        <button type="submit" disabled={loading} style={{ ...btn("primary"), width: "100%", padding: S.md, opacity: loading ? 0.6 : 1 }}>
          {loading ? "..." : (mode === "signup" ? "Создать аккаунт" : "Войти")}
        </button>

        <div style={{ textAlign: "center", marginTop: S.lg, fontSize: T.sm, color: C.textMuted }}>
          {mode === "signin" ? (
            <>Первый раз? <a onClick={() => setMode("signup")} style={{ cursor: "pointer" }}>Создать аккаунт</a></>
          ) : (
            <>Уже есть аккаунт? <a onClick={() => setMode("signin")} style={{ cursor: "pointer" }}>Войти</a></>
          )}
        </div>
      </form>
    </div>
  );
}
