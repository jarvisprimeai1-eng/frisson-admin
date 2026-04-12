import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { C, T, S, R, F, label, body, heading, card } from "../lib/ui";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const [meds, books, tests, users] = await Promise.all([
        supabase.from("meditations").select("id", { count: "exact", head: true }),
        supabase.from("books").select("id", { count: "exact", head: true }),
        supabase.from("tests").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        meds: meds.count || 0,
        books: books.count || 0,
        tests: tests.count || 0,
        users: users.count || 0,
      });
    })();
  }, []);

  const cards = [
    { label: "Медитации", value: stats?.meds, color: C.accent, icon: "🎧" },
    { label: "Книги", value: stats?.books, color: "#F08838", icon: "📚" },
    { label: "Тесты", value: stats?.tests, color: "#9F7BD8", icon: "💫" },
    { label: "Пользователи", value: stats?.users, color: "#3BA88A", icon: "👥" },
  ];

  return (
    <div style={{ padding: S.xxl, maxWidth: 1000 }}>
      <div style={{ marginBottom: S.xl }}>
        <div style={{ ...label(T.xs), color: C.textMuted, marginBottom: S.xs }}>Обзор</div>
        <div style={{ ...heading(T.xxl), color: C.text }}>Frisson Admin</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: S.md, marginBottom: S.xxl }}>
        {cards.map((c) => (
          <div key={c.label} style={{ ...card, borderLeft: `3px solid ${c.color}` }}>
            <div style={{ fontSize: 22, marginBottom: S.sm }}>{c.icon}</div>
            <div style={{ ...heading(T.xxl), color: C.text, lineHeight: 1 }}>{c.value ?? "—"}</div>
            <div style={{ ...label(T.xs), color: C.textMuted, marginTop: S.xs }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card }}>
        <div style={{ ...heading(T.lg), color: C.text, marginBottom: S.md }}>Добро пожаловать</div>
        <div style={{ ...body(T.base), color: C.textMuted, lineHeight: 1.7 }}>
          Это админ-панель Frisson. Отсюда ты управляешь всем контентом — медитациями, книгами, тестами.
          Всё, что ты публикуешь здесь, появится в приложении в течение нескольких секунд.
          <br/><br/>
          Начни с раздела <b style={{ color: C.accent }}>«Медитации»</b> — загрузи MP3, заполни описание, нажми «Опубликовать».
        </div>
      </div>
    </div>
  );
}
