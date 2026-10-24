"use strict";

const TILE_BASE = "https://content-a.strava.com/identified/globalheat/";
const CF = ["Key-Pair-Id", "Policy", "Signature"];
const TEST_TILE = [12, 1497, 2230]; // Brasília

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

function cookieHeader() {
  return CF.map((k) => `CloudFront-${k}=${signature[k]}`).join(";");
}

function tilePath(z, x, y) {
  return `${TILE_BASE}${$("sport").value}/${$("color").value}/${z}/${x}/${y}.png`;
}

function render() {
  if (!signature) return;
  const plain = `${tilePath("{zoom}", "{x}", "{y}")}?${query()}`;
  $("josm").value = `tms[3,15]:${plain}`;
  $("plain").value = plain.replace("{zoom}", "{z}");
  $("josmHeader").value = `tms[3,15]:${tilePath("{zoom}", "{x}", "{y}")}{header(Cookie,${cookieHeader()})}`;
}

async function probe(url, opts) {
  try {
    const r = await fetch(url, { cache: "no-store", ...opts });
    return r.status;
  } catch (e) {
    return `erro (${e.message})`;
  }
}

// Simula o JOSM: request sem cookies do navegador, só com o header Cookie dos 3 CloudFront.
async function probeWithHeader(url) {
  const id = 1;
  try {
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [id],
      addRules: [{
        id,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [{ header: "Cookie", operation: "set", value: cookieHeader() }],
        },
        condition: { urlFilter: "jtest=1", resourceTypes: ["xmlhttprequest", "other"] },
      }],
    });
    return await probe(`${url}?jtest=1`, { credentials: "omit" });
  } catch (e) {
    return `erro (${e.message})`;
  } finally {
    chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [id] }).catch(() => {});
  }
}

const mark = (s) => (s === 200 ? "✔" : "✖");

async function runTests() {
  const base = tilePath(...TEST_TILE);
  const [q, h, c] = await Promise.all([
    probe(`${base}?${query()}`, { credentials: "omit" }),
    probeWithHeader(base),
    probe(base, { credentials: "include" }),
  ]);
  const exp = signature.expires ? `\nVálido até: ${signature.expires.toLocaleString()}` : "";
  const lines =
    `${mark(q)} URL sem header (assinatura na URL): HTTP ${q}\n` +
    `${mark(h)} URL com header Cookie (como o JOSM faz): HTTP ${h}\n` +
    `${mark(c)} Cookies do navegador: HTTP ${c}`;
  let tip;
  if (q === 200) tip = "→ Use \"Copiar para JOSM\".";
  else if (h === 200) tip = "→ O Strava não aceita a assinatura na URL. Use \"Copiar para JOSM (header)\".";
  else if (c === 200) tip = "→ O Strava exige outros cookies além dos CloudFront. Me mande este resultado.";
  else tip = "→ Nenhum funcionou. Abra o heatmap logado, dê zoom e tente de novo.";
  setStatus(`${lines}\n${tip}${exp}`, q === 200 || h === 200 ? "ok" : "err");
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
