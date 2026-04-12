import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { C, T, S, R, label, body, heading, btn, input, card } from "../lib/ui";

export default function Books() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("books").select("*").order("sort_order");
    setRows(data || []);
  }

  return (
    <div style={{ padding: S.xxl, maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: S.xl }}>
        <div>
          <div style={{ ...label(T.xs), color: C.textMuted, marginBottom: S.xs }}>Контент</div>
          <div style={{ ...heading(T.xxl), color: C.text }}>Книги</div>
        </div>
        <button onClick={() => setEditing({})} style={btn("primary")}>+ Новая книга</button>
      </div>

      {rows.length === 0 && <Empty icon="📚" title="Пока нет книг" hint="Добавь первую — нажми кнопку справа наверху" />}

      <div style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
        {rows.map((b) => (
          <div key={b.id} onClick={() => setEditing(b)} style={{ ...card, cursor: "pointer", padding: S.md }}>
            <div style={{ ...body(T.base), color: C.text, fontWeight: 500 }}>{b.title}</div>
            {b.author && <div style={{ fontSize: T.xs, color: C.textMuted, marginTop: 2 }}>{b.author}</div>}
          </div>
        ))}
      </div>

      {editing && <BookEditor initial={editing} onClose={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function BookEditor({ initial, onClose }) {
  const [form, setForm] = useState({
    title: initial.title || "",
    author: initial.author || "",
    short_description: initial.short_description || "",
    full_description: initial.full_description || "",
    is_premium: initial.is_premium ?? true,
    active: initial.active ?? true,
  });
  const isNew = !initial.id;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (isNew) await supabase.from("books").insert(form);
    else await supabase.from("books").update(form).eq("id", initial.id);
    onClose();
  }
  async function remove() {
    if (!confirm("Удалить книгу?")) return;
    await supabase.from("books").delete().eq("id", initial.id);
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ ...heading(T.xl), color: C.text, marginBottom: S.xl }}>{isNew ? "Новая книга" : "Редактировать"}</div>
      <LabeledInput label="Название" value={form.title} onChange={(v) => set("title", v)} />
      <LabeledInput label="Автор" value={form.author} onChange={(v) => set("author", v)} />
      <LabeledInput label="Краткое описание" value={form.short_description} onChange={(v) => set("short_description", v)} />
      <LabeledInput label="Полное описание" value={form.full_description} onChange={(v) => set("full_description", v)} multiline />
      <Footer onSave={save} onCancel={onClose} onDelete={isNew ? null : remove} />
    </Modal>
  );
}

export function Empty({ icon, title, hint }) {
  return (
    <div style={{ ...card, textAlign: "center", padding: S.xxl, color: C.textMuted }}>
      <div style={{ fontSize: 48, marginBottom: S.md, opacity: 0.3 }}>{icon}</div>
      <div style={{ ...heading(T.lg), color: C.text, marginBottom: S.sm }}>{title}</div>
      <div style={{ ...body(T.base), color: C.textMuted }}>{hint}</div>
    </div>
  );
}

export function Modal({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(6,2,12,.8)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: S.xl, overflowY: "auto",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.bgElev, borderRadius: R.lg,
        maxWidth: 640, width: "100%", padding: S.xl,
        border: `1px solid ${C.border}`, boxShadow: "0 20px 60px rgba(0,0,0,.6)",
      }}>{children}</div>
    </div>
  );
}

export function LabeledInput({ label: l, value, onChange, multiline, type = "text" }) {
  return (
    <div style={{ marginBottom: S.md }}>
      <div style={{ ...label(T.xs), color: C.textMuted, marginBottom: S.sm }}>{l}</div>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} style={{ ...input, resize: "vertical" }} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={input} />
      )}
    </div>
  );
}

export function Footer({ onSave, onCancel, onDelete }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: S.md, borderTop: `1px solid ${C.border}`, paddingTop: S.lg, marginTop: S.lg }}>
      {onDelete ? <button onClick={onDelete} style={btn("danger")}>Удалить</button> : <div />}
      <div style={{ display: "flex", gap: S.sm }}>
        <button onClick={onCancel} style={btn("ghost")}>Отмена</button>
        <button onClick={onSave} style={btn("primary")}>Сохранить</button>
      </div>
    </div>
  );
}
