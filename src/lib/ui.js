// Shared UI tokens — match the Frisson brand
export const C = {
  bg: "#0a0610",
  bgElev: "#140a1c",
  bgCard: "rgba(255,255,255,.04)",
  border: "rgba(255,255,255,.08)",
  borderStrong: "rgba(230,77,168,.28)",
  text: "#f0e8f0",
  textMuted: "rgba(240,232,240,.55)",
  textDim: "rgba(240,232,240,.32)",
  accent: "#E64DA8",
  accentSoft: "rgba(230,77,168,.15)",
  success: "#3BA88A",
  danger: "#C44040",
};

export const T = {
  xs: 11, sm: 13, base: 15, lg: 17, xl: 22, xxl: 32,
};

export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 36 };
export const R = { sm: 8, md: 12, lg: 18 };

export const F = {
  sans: "'Plus Jakarta Sans', system-ui, sans-serif",
  serif: "'Cormorant', Georgia, serif",
};

export const label = (size = T.xs) => ({
  fontFamily: F.sans,
  fontSize: size,
  letterSpacing: ".12em",
  textTransform: "uppercase",
  fontWeight: 500,
});

export const body = (size = T.base) => ({
  fontFamily: F.sans,
  fontSize: size,
  fontWeight: 400,
  lineHeight: 1.5,
});

export const heading = (size = T.xl) => ({
  fontFamily: F.serif,
  fontSize: size,
  fontWeight: 400,
  lineHeight: 1.2,
});

export const input = {
  width: "100%",
  padding: `${S.md}px ${S.md}px`,
  borderRadius: R.md,
  background: "rgba(0,0,0,.3)",
  border: `1px solid ${C.border}`,
  color: C.text,
  fontFamily: F.sans,
  fontSize: T.base,
  outline: "none",
};

export const btn = (variant = "primary") => {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: S.sm,
    padding: `${S.md}px ${S.lg}px`,
    borderRadius: R.md,
    border: "none",
    fontFamily: F.sans,
    fontSize: T.sm,
    fontWeight: 500,
    letterSpacing: ".04em",
    cursor: "pointer",
    transition: "all .15s ease",
  };
  if (variant === "primary") return {
    ...base,
    background: `linear-gradient(135deg, ${C.accent}, #F08838)`,
    color: "#fff",
    boxShadow: "0 4px 16px rgba(230,77,168,.3)",
  };
  if (variant === "ghost") return {
    ...base,
    background: "transparent",
    color: C.textMuted,
    border: `1px solid ${C.border}`,
  };
  if (variant === "danger") return {
    ...base,
    background: "rgba(196,64,64,.15)",
    color: C.danger,
    border: `1px solid rgba(196,64,64,.3)`,
  };
  return base;
};

export const card = {
  background: C.bgCard,
  border: `1px solid ${C.border}`,
  borderRadius: R.lg,
  padding: S.lg,
};
