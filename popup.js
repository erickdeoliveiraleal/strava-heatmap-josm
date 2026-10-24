"use strict";

const TILE_BASE = "https://content-a.strava.com/identified/globalheat/";
const CF = ["Key-Pair-Id", "Policy", "Signature"];

const $ = (id) => document.getElementById(id);
let signature = null; // { "Key-Pair-Id": ..., Policy: ..., Signature: ..., expires: Date|null }

function setStatus(text, cls) {
  $("status").textContent = text;
  $("status").className = cls || "";
}

// Com host_permissions, chrome.cookies enxerga também os cookies HttpOnly.
async function readSignature() {
  const all = [
    ...(await chrome.cookies.getAll({ url: TILE_BASE })),
    ...(await chrome.cookies.getAll({ domain: "strava.com" })),
  ];
  const sig = {};
  for (const c of all) {
    for (const k of CF) {
      if (c.name === `CloudFront-${k}` && !sig[k]) sig[k] = c.value;
    }
    if (c.name === "_strava_CloudFront-Expires") sig.expires = new Date(Number(c.value));
  }
  return CF.every((k) => sig[k]) ? sig : null;
}

// CloudFront aceita a mesma assinatura dos cookies como query string (signed URL).
function query() {
  return CF.map((k) => `${k}=${encodeURIComponent(signature[k])}`).join("&");
}

function tileUrl(z, x, y) {
  return `${TILE_BASE}${$("sport").value}/${$("color").value}/${z}/${x}/${y}.png?${query()}`;
}

function render() {
  if (!signature) return;
  const plain = tileUrl("{zoom}", "{x}", "{y}");
  $("josm").value = `tms[3,15]:${plain}`;
  $("plain").value = plain.replace("{zoom}", "{z}");
}

// Baixa um tile de teste sem cookies, para provar que a URL sozinha funciona.
async function testTile() {
  const url = tileUrl(12, 1497, 2230); // Brasília
  try {
    const r = await fetch(url, { credentials: "omit", cache: "no-store" });
    const exp = signature.expires ? `\nVálido até: ${signature.expires.toLocaleString()}` : "";
    if (r.ok) setStatus(`✔ Tile de teste OK (HTTP ${r.status}) — a URL funciona sem cookies.${exp}`, "ok");
    else setStatus(`✖ Tile de teste falhou: HTTP ${r.status}. Abra o heatmap logado e tente de novo.${exp}`, "err");
  } catch (e) {
    setStatus(`✖ Erro ao testar tile: ${e.message}`, "err");
  }
}

async function init() {
  // Usa atividade/cor da aba aberta no heatmap, se houver
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url && tab.url.includes("strava.com/maps/global-heatmap")) {
    const p = new URL(tab.url).searchParams;
    if (p.get("sport")) $("sport").value = p.get("sport").toLowerCase();
    if (p.get("gColor")) $("color").value = p.get("gColor").toLowerCase();
  }

  signature = await readSignature();
  if (!signature) {
    setStatus(
      "Cookies CloudFront não encontrados.\nAbra https://www.strava.com/maps/global-heatmap logado, dê zoom no mapa e abra este popup de novo.",
      "err"
    );
    return;
  }
  render();
  setStatus("Testando…");
  testTile();
}

$("sport").addEventListener("change", render);
$("color").addEventListener("change", render);
document.querySelectorAll("button[data-copy]").forEach((b) =>
  b.addEventListener("click", async () => {
    await navigator.clipboard.writeText($(b.dataset.copy).value);
    b.textContent = "Copiado!";
    setTimeout(() => (b.textContent = b.dataset.copy === "josm" ? "Copiar para JOSM" : "Copiar URL"), 1500);
  })
);

init();
