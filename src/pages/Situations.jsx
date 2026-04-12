import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { C, T, S, R, label, body, heading, btn, input, card } from "../lib/ui";
import { Empty, Modal, LabeledInput, Footer } from "./Books";

export default function Situations() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("situations").select("*").order("sort_order");
    setRows(data || []);
  }

  return (
    <div style={{ padding: S.xxl, maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: S.xl }}>
        <div>
          <div style={{ ...label(T.xs), color: C.textMuted, marginBottom: S.xs }}>Контент</div>
          <div style={{ ...heading(T.xxl), color: C.text }}>Ситуации</div>
          <div style={{ ...body(T.sm), color: C.textMuted, marginTop: S.xs }}>Жизненные ситуации и рекомендации к ним</div>
        </div>
        <button onClick={() => setEditing({})} style={btn("primary")}>+ Новая ситуация</button>
      </div>

      {rows.length === 0 && <Empty icon="🧭" title="Пока нет ситуаций" hint="Добавь первую ситуацию" />}

      <div style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
        {rows.map((r) => (
          <div key={r.id} onClick={() => setEditing(r)} style={{ ...card, cursor: "pointer", padding: S.md }}>
            <div style={{ ...body(T.base), color: C.text, fontWeight: 500 }}>{r.title}</div>
            {r.description && <div style={{ fontSize: T.xs, color: C.textMuted, marginTop: 2 }}>{r.description}</div>}
          </div>
        ))}
      </div>

      {editing && <SituationEditor initial={editing} onClose={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function SituationEditor({ initial, onClose }) {
  const [form, setForm] = useState({
    title: initial.title || "",
    description: initial.description || "",
    active: initial.active ?? true,
  });
  const isNew = !initial.id;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (isNew) await supabase.from("situations").insert(form);
    else await supabase.from("situations").update(form).eq("id", initial.id);
    onClose();
  }
  async function remove() {
    if (!confirm("Удалить ситуацию?")) return;
    await supabase.from("situations").delete().eq("id", initial.id);
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ ...heading(T.xl), color: C.text, marginBottom: S.xl }}>{isNew ? "Новая ситуация" : "Редактировать"}</div>
      <LabeledInput label="Название (например: Ревность)" value={form.title} onChange={(v) => set("title", v)} />
      <LabeledInput label="Описание" value={form.description} onChange={(v) => set("description", v)} multiline />
      <Footer onSave={save} onCancel={onClose} onDelete={isNew ? null : remove} />
    </Modal>
  );
}
