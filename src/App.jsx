import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { C, T, S, R, F, label, body, heading, btn } from "./lib/ui";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Meditations from "./pages/Meditations";
import Books from "./pages/Books";
import Tests from "./pages/Tests";
import Situations from "./pages/Situations";
import Users from "./pages/Users";

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.id);
      else setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      if (s) loadProfile(s.user.id);
      else { setProfile(null); setLoading(false); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadProfile(uid) {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    setProfile(data);
    setLoading(false);
  }

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted }}>
      Загрузка...
    </div>
  );

  if (!session) return <Login />;

  if (!profile?.is_admin) return <NotAdmin email={session.user.email} />;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar profile={profile} />
      <main style={{ flex: 1, overflowY: "auto", background: C.bg }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/meditations" element={<Meditations />} />
          <Route path="/books" element={<Books />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/situations" element={<Situations />} />
          <Route path="/users" element={<Users />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function Sidebar({ profile }) {
  const loc = useLocation();
  const nav = useNavigate();
  const items = [
    { to: "/", label: "Обзор", icon: "◈" },
    { to: "/meditations", label: "Медитации", icon: "🎧" },
    { to: "/books", label: "Книги", icon: "📚" },
    { to: "/tests", label: "Тесты", icon: "💫" },
    { to: "/situations", label: "Ситуации", icon: "🧭" },
    { to: "/users", label: "Пользователи", icon: "👥" },
  ];
  async function logout() { await supabase.auth.signOut(); nav("/"); }

  return (
    <aside style={{ width: 260, background: C.bgElev, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", padding: S.lg }}>
      <div style={{ marginBottom: S.xxl, padding: `${S.sm}px ${S.xs}px` }}>
        <div style={{ ...heading(T.xl), color: C.text, letterSpacing: ".02em" }}>Frisson</div>
        <div style={{ ...label(T.xs), color: C.accent, marginTop: 2 }}>ADMIN</div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {items.map((it) => {
          const on = loc.pathname === it.to;
          return (
            <Link key={it.to} to={it.to} style={{
              display: "flex", alignItems: "center", gap: S.md,
              padding: `${S.md}px ${S.md}px`, borderRadius: R.md,
              background: on ? `${C.accentSoft}` : "transparent",
              color: on ? C.text : C.textMuted,
              fontWeight: on ? 500 : 400,
              fontSize: T.sm,
              borderLeft: on ? `2px solid ${C.accent}` : "2px solid transparent",
              transition: "all .15s",
            }}>
              <span style={{ fontSize: T.base, width: 20, textAlign: "center" }}>{it.icon}</span>
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: S.md, marginTop: S.md }}>
        <div style={{ ...body(T.sm), color: C.text, marginBottom: 2 }}>{profile.name || "Admin"}</div>
        <div style={{ fontSize: T.xs, color: C.textDim, marginBottom: S.sm }}>Администратор</div>
        <button onClick={logout} style={{ ...btn("ghost"), width: "100%", fontSize: T.xs, padding: `${S.sm}px ${S.md}px` }}>Выйти</button>
      </div>
    </aside>
  );
}

function NotAdmin({ email }) {
  async function logout() { await supabase.auth.signOut(); }
  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: S.lg, padding: S.xl, textAlign: "center" }}>
      <div style={{ ...heading(T.xxl), color: C.text }}>Доступ ограничен</div>
      <div style={{ ...body(T.base), color: C.textMuted, maxWidth: 400 }}>
        Вы вошли как <b>{email}</b>, но у этого аккаунта нет прав администратора.
      </div>
      <button onClick={logout} style={btn("ghost")}>Выйти</button>
    </div>
  );
}
