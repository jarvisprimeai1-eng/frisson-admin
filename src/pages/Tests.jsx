import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { C, T, S, R, label, body, heading, btn, input, card } from "../lib/ui";
import { Empty, Modal, LabeledInput, Footer } from "./Books";

export default function Tests() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("tests").select("*").order("sort_order");
    setRows(data || []);
  }

  return (
    <div style={{ padding: S.xxl, maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: S.xl }}>
        <div>
          <div style={{ ...label(T.xs), color: C.textMuted, marginBottom: S.xs }}>Контент</div>
          <div style={{ ...heading(T.xxl), color: C.text }}>Тесты</div>
        </div>
        <button onClick={() => setEditing({})} style={btn("primary")}>+ Новый тест</button>
      </div>

      {rows.length === 0 && <Empty icon="💫" title="Пока нет тестов" hint="Добавь первый тест" />}

      <div style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
        {rows.map((r) => (
          <div key={r.id} onClick={() => setEditing(r)} style={{ ...card, cursor: "pointer", padding: S.md }}>
            <div style={{ ...body(T.base), color: C.text, fontWeight: 500 }}>{r.title}</div>
            <div style={{ fontSize: T.xs, color: C.textMuted, marginTop: 2 }}>{r.slug} · {r.questions?.length || 0} вопросов</div>
          </div>
        ))}
      </div>

      {editing && <TestEditor initial={editing} onClose={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function TestEditor({ initial, onClose }) {
  const [form, setForm] = useState({
    slug: initial.slug || "",
    title: initial.title || "",
    description: initial.description || "",
    questions: JSON.stringify(initial.questions || [{ q: "Вопрос 1", options: [{ text: "Вариант 1", score: 1 }, { text: "Вариант 2", score: 2 }] }], null, 2),
    is_premium: initial.is_premium ?? false,
    active: initial.active ?? true,
  });
  const isNew = !initial.id;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    try {
      const payload = { ...form, questions: JSON.parse(form.questions) };
      if (isNew) await supabase.from("tests").insert(payload);
      else await supabase.from("tests").update(payload).eq("id", initial.id);
      onClose();
    } catch (e) {
      alert("Ошибка в JSON: " + e.message);
    }
  }
  async function remove() {
    if (!confirm("Удалить тест?")) return;
    await supabase.from("tests").delete().eq("id", initial.id);
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ ...heading(T.xl), color: C.text, marginBottom: S.xl }}>{isNew ? "Новый тест" : "Редактировать"}</div>
      <LabeledInput label="Slug (англ., короткий ID)" value={form.slug} onChange={(v) => set("slug", v)} />
      <LabeledInput label="Название" value={form.title} onChange={(v) => set("title", v)} />
      <LabeledInput label="Описание" value={form.description} onChange={(v) => set("description", v)} multiline />
      <div style={{ marginBottom: S.md }}>
        <div style={{ ...label(T.xs), color: C.textMuted, marginBottom: S.sm }}>Вопросы (JSON)</div>
        <textarea value={form.questions} onChange={(e) => set("questions", e.target.value)} rows={10} style={{ ...input, fontFamily: "monospace", fontSize: T.sm, resize: "vertical" }} />
      </div>
      <Footer onSave={save} onCancel={onClose} onDelete={isNew ? null : remove} />
    </Modal>
  );
}
