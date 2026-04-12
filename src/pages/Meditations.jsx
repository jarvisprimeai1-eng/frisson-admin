import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { C, T, S, R, F, label, body, heading, btn, input, card } from "../lib/ui";

export default function Meditations() {
  const [meds, setMeds] = useState([]);
  const [sections, setSections] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: s } = await supabase.from("sections").select("*").order("sort_order");
    setSections(s || []);
    const { data } = await supabase.from("meditations").select("*, sections(name, color)").order("sort_order");
    setMeds(data || []);
  }

  return (
    <div style={{ padding: S.xxl, maxWidth: 1100 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: S.xl }}>
        <div>
          <div style={{ ...label(T.xs), color: C.textMuted, marginBottom: S.xs }}>Контент</div>
          <div style={{ ...heading(T.xxl), color: C.text }}>Медитации</div>
          <div style={{ ...body(T.sm), color: C.textMuted, marginTop: S.xs }}>{meds.length} практик в библиотеке</div>
        </div>
        <button onClick={() => setEditing({})} style={btn("primary")}>+ Новая медитация</button>
      </div>

      {meds.length === 0 && (
        <div style={{ ...card, textAlign: "center", padding: S.xxl, color: C.textMuted }}>
          <div style={{ fontSize: 48, marginBottom: S.md, opacity: 0.3 }}>🎧</div>
          <div style={{ ...heading(T.lg), color: C.text, marginBottom: S.sm }}>Пока нет медитаций</div>
          <div style={{ ...body(T.base), color: C.textMuted, marginBottom: S.lg }}>Загрузи первую — нажми кнопку справа наверху</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
        {meds.map((m) => (
          <div key={m.id} onClick={() => setEditing(m)} style={{
            ...card, cursor: "pointer", display: "flex", alignItems: "center", gap: S.lg,
            padding: S.md, borderLeftColor: m.sections?.color || C.accent,
            borderLeft: `3px solid ${m.sections?.color || C.accent}`,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: R.md,
              background: `${m.sections?.color || C.accent}22`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>{m.cover_emoji || "◦"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ ...body(T.base), color: C.text, fontWeight: 500 }}>{m.title}</div>
              <div style={{ fontSize: T.xs, color: C.textMuted, marginTop: 2 }}>
                {m.sections?.name || "Без раздела"} · {m.duration_seconds ? `${Math.round(m.duration_seconds/60)} мин` : "—"} · {m.is_premium ? "Премиум" : "Бесплатно"}
              </div>
            </div>
            <div style={{ fontSize: T.xs, color: m.active ? "#8E8" : C.textDim, padding: `${S.xs}px ${S.sm}px`, borderRadius: R.sm, background: m.active ? "rgba(59,168,138,.1)" : "rgba(255,255,255,.03)" }}>
              {m.active ? "● Активна" : "○ Черновик"}
            </div>
          </div>
        ))}
      </div>

      {editing && <Editor initial={editing} sections={sections} onClose={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function Editor({ initial, sections, onClose }) {
  const [form, setForm] = useState({
    title: initial.title || "",
    short_description: initial.short_description || "",
    full_description: initial.full_description || "",
    section_id: initial.section_id || (sections[0]?.id || ""),
    cover_emoji: initial.cover_emoji || "◦",
    is_premium: initial.is_premium ?? true,
    active: initial.active ?? true,
    audio_url: initial.audio_url || "",
    duration_seconds: initial.duration_seconds || 0,
    sort_order: initial.sort_order || 0,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isNew = !initial.id;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function uploadAudio(file) {
    setUploading(true);
    try {
      // Auto-detect duration
      const audio = new Audio(URL.createObjectURL(file));
      await new Promise((r) => audio.addEventListener("loadedmetadata", r, { once: true }));
      const duration = Math.round(audio.duration);

      const fileName = `${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await supabase.storage.from("meditations").upload(fileName, file, { contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("meditations").getPublicUrl(fileName);
      set("audio_url", data.publicUrl);
      set("duration_seconds", duration);
    } catch (e) {
      alert("Ошибка загрузки: " + e.message);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const payload = { ...form, published_at: form.active ? new Date().toISOString() : null };
      if (isNew) {
        const { error } = await supabase.from("meditations").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("meditations").update(payload).eq("id", initial.id);
        if (error) throw error;
      }
      onClose();
    } catch (e) {
      alert("Ошибка сохранения: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Удалить медитацию? Это необратимо.")) return;
    await supabase.from("meditations").delete().eq("id", initial.id);
    onClose();
  }

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
      }}>
        <div style={{ ...heading(T.xl), color: C.text, marginBottom: S.xl }}>
          {isNew ? "Новая медитация" : "Редактировать"}
        </div>

        <Field label="Название"><input value={form.title} onChange={(e) => set("title", e.target.value)} style={input} /></Field>
        <Field label="Краткое описание (1 предложение)"><input value={form.short_description} onChange={(e) => set("short_description", e.target.value)} style={input} /></Field>
        <Field label="Полное описание (опционально)">
          <textarea value={form.full_description} onChange={(e) => set("full_description", e.target.value)} rows={3} style={{ ...input, resize: "vertical" }} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: S.md }}>
          <Field label="Раздел">
            <select value={form.section_id} onChange={(e) => set("section_id", e.target.value)} style={input}>
              {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Иконка (эмодзи)">
            <input value={form.cover_emoji} onChange={(e) => set("cover_emoji", e.target.value)} style={input} maxLength={4} />
          </Field>
        </div>

        <Field label="Аудио файл (MP3)">
          <div style={{ display: "flex", alignItems: "center", gap: S.md, flexWrap: "wrap" }}>
            <label style={{ ...btn("ghost"), cursor: "pointer" }}>
              {uploading ? "Загрузка..." : (form.audio_url ? "Заменить файл" : "Выбрать файл")}
              <input type="file" accept="audio/*" onChange={(e) => e.target.files[0] && uploadAudio(e.target.files[0])} style={{ display: "none" }} disabled={uploading} />
            </label>
            {form.audio_url && (
              <>
                <audio src={form.audio_url} controls style={{ height: 32, flex: 1, minWidth: 200 }} />
                <span style={{ fontSize: T.xs, color: C.textMuted }}>{Math.round(form.duration_seconds / 60)} мин</span>
              </>
            )}
          </div>
        </Field>

        <div style={{ display: "flex", gap: S.lg, marginTop: S.lg, marginBottom: S.xl, flexWrap: "wrap" }}>
          <Toggle checked={form.is_premium} onChange={(v) => set("is_premium", v)} label="Премиум" hint="Доступна только по подписке" />
          <Toggle checked={form.active} onChange={(v) => set("active", v)} label="Активна" hint="Видна пользователям" />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: S.md, borderTop: `1px solid ${C.border}`, paddingTop: S.lg }}>
          {!isNew ? <button onClick={remove} style={btn("danger")}>Удалить</button> : <div />}
          <div style={{ display: "flex", gap: S.sm }}>
            <button onClick={onClose} style={btn("ghost")}>Отмена</button>
            <button onClick={save} disabled={saving || !form.title} style={{ ...btn("primary"), opacity: (saving || !form.title) ? 0.5 : 1 }}>
              {saving ? "..." : (isNew ? "Опубликовать" : "Сохранить")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label: l, children }) {
  return (
    <div style={{ marginBottom: S.md }}>
      <div style={{ ...label(T.xs), color: C.textMuted, marginBottom: S.sm }}>{l}</div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label: l, hint }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: S.md, cursor: "pointer", flex: 1, minWidth: 200 }}>
      <div onClick={() => onChange(!checked)} style={{
        width: 40, height: 22, borderRadius: 11, padding: 2,
        background: checked ? C.accent : "rgba(255,255,255,.1)",
        transition: "all .2s",
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: "50%",
          background: "#fff",
          transform: `translateX(${checked ? 18 : 0}px)`,
          transition: "transform .2s",
        }} />
      </div>
      <div>
        <div style={{ ...body(T.sm), color: C.text }}>{l}</div>
        <div style={{ fontSize: T.xs, color: C.textMuted }}>{hint}</div>
      </div>
    </label>
  );
}
