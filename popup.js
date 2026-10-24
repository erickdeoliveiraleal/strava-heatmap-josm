"use strict";

const TILE_BASE = "https://content-a.strava.com/identified/globalheat/";
// Cookies que o servidor de tiles exige (assinatura CloudFront + _strava_idcf).
// A assinatura sozinha na URL não é aceita (HTTP 401), por isso vão no header Cookie.
const REQUIRED = ["CloudFront-Key-Pair-Id", "CloudFront-Policy", "CloudFront-Signature", "_strava_idcf"];
const TEST_TILE = [12, 1497, 2230]; // Brasília

const $ = (id) => document.getElementById(id);
let cookies = null; // Map nome -> valor de todos os cookies do Strava
let needed = REQUIRED; // cookies que vão no header do JOSM
let expires = null;

function setStatus(text, cls) {
  $("status").textContent = text;
  $("status").className = cls || "";
}

// Com host_permissions, chrome.cookies enxerga também os cookies HttpOnly.
async function readCookies() {
  const all = [
    ...(await chrome.cookies.getAll({ url: TILE_BASE })),
    ...(await chrome.cookies.getAll({ domain: "strava.com" })),
  ];
  const map = new Map();
  for (const c of all) if (!map.has(c.name)) map.set(c.name, c.value);
  if (map.has("_strava_CloudFront-Expires")) expires = new Date(Number(map.get("_strava_CloudFront-Expires")));
  return map;
}

function cookieHeader(names) {
  return names.map((n) => `${n}=${cookies.get(n)}`).join(";");
}

function tilePath(z, x, y) {
  return `${TILE_BASE}${$("sport").value}/${$("color").value}/${z}/${x}/${y}.png`;
}

function render() {
  if (!cookies) return;
  $("josm").value = `tms[3,15]:${tilePath("{zoom}", "{x}", "{y}")}{header(Cookie,${cookieHeader(needed)})}`;
}

// Simula o JOSM: request sem cookies do navegador, só com o header Cookie dado.
async function probeWithHeader(names) {
  const id = 1;
  try {
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [id],
      addRules: [{
        id,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [{ header: "Cookie", operation: "set", value: cookieHeader(names) }],
        },
        condition: { urlFilter: "jtest=1", resourceTypes: ["xmlhttprequest", "other"] },
      }],
    });
    const r = await fetch(`${tilePath(...TEST_TILE)}?jtest=1`, { credentials: "omit", cache: "no-store" });
    return r.status;
  } catch (e) {
    return `erro (${e.message})`;
  } finally {
    await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [id] }).catch(() => {});
  }
}

// Caso o Strava mude os requisitos: parte de todos os cookies e tira um por vez;
// se o tile continua 200, aquele não é necessário.
async function findNeeded() {
  let set = [...cookies.keys()];
  const order = [...set.filter((n) => !REQUIRED.includes(n)), ...REQUIRED];
  for (let i = 0; i < order.length; i++) {
    setStatus(`Procurando cookies necessários… ${i + 1}/${order.length}`);
    const without = set.filter((n) => n !== order[i]);
    if (without.length && (await probeWithHeader(without)) === 200) set = without;
  }
  return set;
}

async function runTests() {
  const exp = expires ? `\nVálido até: ${expires.toLocaleString()}` : "";
  const s = await probeWithHeader(needed);
  if (s === 200) {
    setStatus(`✔ Tile de teste OK.${exp}`, "ok");
    return;
  }
  if ((await probeWithHeader([...cookies.keys()])) !== 200) {
    setStatus(`✖ Tile de teste falhou (HTTP ${s}). Abra o heatmap logado, dê zoom e tente de novo.${exp}`, "err");
    return;
  }
  needed = await findNeeded();
  render();
  setStatus(`✔ O Strava mudou os cookies exigidos; link ajustado para: ${needed.join(", ")}${exp}`, "ok");
}

async function init() {
  // Usa atividade/cor da aba aberta no heatmap, se houver
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url && tab.url.includes("strava.com/maps/global-heatmap")) {
    const p = new URL(tab.url).searchParams;
    if (p.get("sport")) $("sport").value = p.get("sport").toLowerCase();
    if (p.get("gColor")) $("color").value = p.get("gColor").toLowerCase();
  }

  cookies = await readCookies();
  const missing = REQUIRED.filter((n) => !cookies.has(n));
  if (missing.length) {
    setStatus(
      `Cookies não encontrados: ${missing.join(", ")}.\nAbra https://www.strava.com/maps/global-heatmap logado, dê zoom no mapa e abra este popup de novo.`,
      "err"
    );
    cookies = null;
    return;
  }
  render();
  setStatus("Testando…");
  runTests();
}

$("sport").addEventListener("change", render);
$("color").addEventListener("change", render);
document.querySelectorAll("button[data-copy]").forEach((b) =>
  b.addEventListener("click", async () => {
    const label = b.textContent;
    await navigator.clipboard.writeText($(b.dataset.copy).value);
    b.textContent = "Copiado!";
    setTimeout(() => (b.textContent = label), 1500);
  })
);

init();
