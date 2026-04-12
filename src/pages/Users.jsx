import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { C, T, S, R, label, body, heading, card } from "../lib/ui";
import { Empty } from "./Books";

export default function Users() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setRows(data || []);
    })();
  }, []);

  return (
    <div style={{ padding: S.xxl, maxWidth: 1000 }}>
      <div style={{ marginBottom: S.xl }}>
        <div style={{ ...label(T.xs), color: C.textMuted, marginBottom: S.xs }}>Аналитика</div>
        <div style={{ ...heading(T.xxl), color: C.text }}>Пользователи</div>
        <div style={{ ...body(T.sm), color: C.textMuted, marginTop: S.xs }}>{rows.length} зарегистрированных</div>
      </div>

      {rows.length === 0 ? <Empty icon="👥" title="Пока нет пользователей" hint="Они появятся здесь после регистрации в приложении" /> : (
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          {rows.map((u, i) => (
            <div key={u.id} style={{
              padding: S.md,
              borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none",
              display: "flex", alignItems: "center", gap: S.md,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: u.is_admin ? `${C.accent}33` : "rgba(255,255,255,.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: T.sm, color: u.is_admin ? C.accent : C.textMuted,
              }}>{(u.name || "?").charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ ...body(T.base), color: C.text }}>{u.name || "—"}</div>
                <div style={{ fontSize: T.xs, color: C.textMuted }}>
                  {u.is_admin ? "Администратор · " : ""}
                  {u.premium_until && new Date(u.premium_until) > new Date() ? "Премиум · " : ""}
                  {new Date(u.created_at).toLocaleDateString("ru-RU")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
