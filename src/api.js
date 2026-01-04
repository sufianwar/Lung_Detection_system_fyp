const API_BASE =
  import.meta.env.VITE_API_BASE?.trim() ||
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  "/api";

function buildUrl(path, params) {
  // If API_BASE is relative (/api), make it absolute using current origin
  const base = API_BASE.startsWith("http")
    ? API_BASE.replace(/\/+$/, "")
    : (window.location.origin + (API_BASE.startsWith("/") ? API_BASE : `/${API_BASE}`)).replace(/\/+$/, "");

  const p = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${p}`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }

  return url.toString();
}

export async function health() {
  const res = await fetch(buildUrl("/health"));
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.detail || "Backend offline");
  return json;
}

export async function analyzeImage(file, { threshold } = {}) {
  const form = new FormData();
  form.append("file", file);

  const url = buildUrl("/analyze", { threshold });

  const res = await fetch(url, { method: "POST", body: form });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.detail || "Analyze failed");
  return json;
}
