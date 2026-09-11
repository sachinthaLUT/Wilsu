/* Shared logic for every page. Volunteers don't need to edit this file. */

/* ---------- Language ---------- */
const LANG = (() => {
  const q = new URLSearchParams(location.search).get("lang");
  let saved = null;
  try { saved = localStorage.getItem("wilsu-lang"); } catch (e) {}
  const l = (q || saved || "fi").toLowerCase();
  if (q) { try { localStorage.setItem("wilsu-lang", l); } catch (e) {} }
  return l === "en" ? "en" : "fi";
})();
document.documentElement.lang = LANG;
const EN_ON = LANG === "en";
const t = s => (EN_ON && typeof EN !== "undefined" && EN[s]) || s;

function setLang(l){
  try { localStorage.setItem("wilsu-lang", l); } catch (e) {}
  const u = new URL(location.href);
  if (l === "en") u.searchParams.set("lang", "en"); else u.searchParams.delete("lang");
  location.href = u.toString();
}

const DAYS = EN_ON ? ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] : ["Sunnuntai","Maanantai","Tiistai","Keskiviikko","Torstai","Perjantai","Lauantai"];
const SHORT = EN_ON ? ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] : ["Su","Ma","Ti","Ke","To","Pe","La"];
const MONTHS = EN_ON ? ["January","February","March","April","May","June","July","August","September","October","November","December"]
  : ["tammikuuta","helmikuuta","maaliskuuta","huhtikuuta","toukokuuta","kesäkuuta","heinäkuuta","elokuuta","syyskuuta","lokakuuta","marraskuuta","joulukuuta"];

/* ---------- Helpers ---------- */
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, "0");
const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const D = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
const fi = s => { const d = D(s); return `${d.getDate()}.${d.getMonth()+1}.`; };
const fiFull = s => fi(s) + s.slice(0,4);
const longDate = s => { const d = D(s); return EN_ON ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const fiTime = x => EN_ON ? x : x.replace(":", ".");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const safeUrl = u => /^(https?:|mailto:|tel:)/i.test(u || "") ? u : "";
const mapsUrl = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
const routeUrl = q => "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q);
const slug = n => (n.date + "-" + (n.titleFi || n.title)).toLowerCase()
  .replace(/[äå]/g,"a").replace(/ö/g,"o").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
/* Backup content can carry English in an "en" field */
const loc = o => (EN_ON && o && o.en) ? Object.assign({}, o, o.en) : o;

/* ---------- Images (Google Drive links supported) ---------- */
const DRIVE_RE = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/;
function imageUrl(link, width = 1600){
  if (!link) return "";
  const m = link.match(DRIVE_RE);
  if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w${width}`;
  return safeUrl(link) || (/^[\w./-]+$/.test(link) ? link : "");
}
function img(src, alt, onFail, width){
  const i = new Image(); i.loading = "lazy"; i.decoding = "async"; i.alt = alt || "";
  const m = (src || "").match(DRIVE_RE);
  let triedBackup = false;
  i.onerror = () => {
    if (m && !triedBackup){ triedBackup = true; i.src = `https://lh3.googleusercontent.com/d/${m[1]}=w${width || 1600}`; return; }
    onFail && onFail(i);
  };
  i.src = imageUrl(src, width);
  return i;
}
const DECO = `<svg class="deco" viewBox="0 0 300 300" aria-hidden="true">
  <circle cx="170" cy="130" r="120" fill="#12604A"/>
  <path d="M120 60 L200 200 M150 40 L215 190 M185 35 L228 182" stroke="#1B7458" stroke-width="10" stroke-linecap="round"/>
  <path d="M95 75 L185 215 L245 170 L205 30 Z" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="222" cy="200" r="26" fill="#F5D547"/></svg>`;

function paragraphs(text){
  return String(text || "").split(/\n\s*\n|\n/).map(p => p.trim()).filter(Boolean)
    .map(p => "<p>" + esc(p).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" rel="noopener">$1</a>') + "</p>").join("");
}

/* ---------- Google Sheets loader ---------- */
function parseCSV(text){
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++){
    const c = text[i];
    if (q){
      if (c === '"' && text[i+1] === '"'){ cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r"){
      if (c === "\r" && text[i+1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length){ row.push(cell); rows.push(row); }
  const head = (rows.shift() || []).map(h => h.trim().toLowerCase());
  return rows.filter(r => r.some(v => v.trim())).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
}
function parseDate(v){
  v = (v || "").trim(); let m;
  if ((m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  if ((m = v.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/))) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  if ((m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/))) return `${m[3]}-${pad(m[1])}-${pad(m[2])}`;
  return "";
}
const parseTime = v => { const m = (v || "").match(/(\d{1,2})[.:](\d{2})/); return m ? `${pad(m[1])}:${m[2]}` : ""; };
const yes = v => /^(kyllä|kylla|k|x|yes|true)$/i.test((v || "").trim());
const DAYMAP = { sunnuntai:0, maanantai:1, tiistai:2, keskiviikko:3, torstai:4, perjantai:5, lauantai:6 };
const GROUPMAP = { juniorit:"juniorit", aikuiset:"aikuiset", kaksinpeli:"kilpa" };
/* Picks the English column ("Otsikko EN") when the site is in English and that cell isn't empty */
const L = (r, key) => (EN_ON && r[key + " en"] && !/^#/.test(r[key + " en"])) ? r[key + " en"] : r[key];

const GALLERY_CATS = ["Aikuisten treenit","Junioritreenit","Kevättapahtuma","Joulutapahtuma","Muut tapahtumat","Turnausvoitot","Yhteistyöt"];

const MAPPERS = {
  schedule: rows => rows.map(r => ({
    id: r["tunnus"], day: DAYMAP[(r["päivä"] || "").toLowerCase()], start: parseTime(r["alkaa"]), end: parseTime(r["päättyy"]),
    group: GROUPMAP[(r["ryhmä"] || "").toLowerCase()] || "aikuiset", title: L(r, "nimi"),
    venue: (r["paikka"] || "").toLowerCase().startsWith("urheilu") ? "urheilutalo" : "huhtiniemi",
    from: parseDate(r["alkaen"]), tba: yes(r["alkaa myöhemmin"])
  })).filter(s => s.id && s.day !== undefined && (s.tba || (s.start && s.end))),
  cancellations: rows => rows.map(r => ({ slot: r["vuoro"], date: parseDate(r["päivämäärä"]), reason: L(r, "syy") || t("vuoro on peruttu") }))
    .filter(c => c.slot && c.date),
  news: rows => rows.filter(r => !/^ei$/i.test(r["julkaistu"] || "")).map(r => ({
    date: parseDate(r["päivämäärä"]), cat: r["luokka"] || "Tiedote", titleFi: r["otsikko"], title: L(r, "otsikko"), summary: L(r, "tiivistelmä"),
    body: L(r, "teksti"), image: r["kuva"], caption: L(r, "kuvateksti")
  })).filter(n => n.date && n.title),
  events: rows => rows.map(r => ({
    date: parseDate(r["päivämäärä"]), title: L(r, "nimi"), place: L(r, "paikka"), desc: L(r, "kuvaus"),
    linkText: L(r, "linkin teksti"), link: r["linkki"], result: L(r, "tulos"), resultsLink: r["tulokset-linkki"]
  })).filter(e => e.date && e.title),
  gallery: rows => rows.map(r => ({
    image: r["kuva"], caption: L(r, "kuvateksti"),
    category: GALLERY_CATS.find(c => c.toLowerCase() === (r["kategoria"] || "").toLowerCase()) || "Muut tapahtumat",
    featured: yes(r["etusivulle"])
  })).filter(g => g.image),
  faq: rows => rows.map(r => ({ q: L(r, "kysymys"), a: L(r, "vastaus"), topic: r["aihe"] || "" })).filter(f => f.q && f.a),
  board: rows => rows.map(r => ({ name: r["nimi"], role: L(r, "rooli"), image: r["kuva"], bio: L(r, "esittely"), email: r["sähköposti"] })).filter(b => b.name)
};

async function loadContent(){
  const out = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  for (const k in out) out[k] = out[k].map(loc);
  await Promise.all(Object.entries(SHEETS).filter(([k, url]) => url && MAPPERS[k]).map(async ([key, url]) => {
    const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(res.status);
      const data = MAPPERS[key](parseCSV(await res.text()));
      if (data.length || key === "cancellations") out[key] = data;
    } catch (e) { console.warn(`Taulukon "${key}" lataus epäonnistui, käytetään varasisältöä.`, e); }
    finally { clearTimeout(tm); }
  }));
  out.news.forEach(n => n.id = slug(n));
  out.news.sort((a, b) => b.date.localeCompare(a.date));
  return out;
}

/* ---------- Automatic translation of the fixed page text ---------- */
const SKIP = new Set(["SCRIPT","STYLE","TEXTAREA","CODE"]);
function translateNode(root){
  if (!EN_ON || typeof EN === "undefined") return;
  if (root.nodeType === 3){ translateText(root); return; }
  if (root.closest && root.closest("[data-keep]")) return;
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => (n.parentElement && !SKIP.has(n.parentElement.tagName) && !n.parentElement.closest("[data-keep]")) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
  });
  const nodes = []; while (walk.nextNode()) nodes.push(walk.currentNode);
  nodes.forEach(translateText);
  [root, ...root.querySelectorAll("[aria-label],[placeholder],[alt],[title]")].forEach(el => ["aria-label","placeholder","alt","title"].forEach(a => {
    const v = el.getAttribute && el.getAttribute(a);
    if (v && EN[v.trim()]) el.setAttribute(a, EN[v.trim()]);
  }));
}
function translateText(n){
  if (!n.parentElement || n.parentElement.closest("[data-keep]")) return;
  const raw = n.nodeValue, key = raw.replace(/\s+/g, " ").trim();
  if (key && EN[key]){
    const lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
    n.nodeValue = lead + EN[key] + trail;
  }
}
function startTranslation(){
  if (!EN_ON) return;
  translateNode(document.body);
  if (EN[document.title]) document.title = EN[document.title];
  new MutationObserver(list => list.forEach(m => m.addedNodes.forEach(n => {
    if (n.nodeType === 1 || n.nodeType === 3) translateNode(n);
  }))).observe(document.body, { childList: true, subtree: true });
}

/* ---------- Header, footer, banner ---------- */
const LOGO = `<svg width="38" height="38" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#F5D547"/><path d="M13 12 L20 29 L27 12" fill="none" stroke="#0B3B2E" stroke-width="3.2" stroke-linejoin="round"/><path d="M16.5 12 L20 21 L23.5 12" fill="none" stroke="#0B3B2E" stroke-width="2"/><circle cx="20" cy="30" r="3.2" fill="#0B3B2E"/></svg>`;
const IG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>`;

function logoHtml(size){
  const src = typeof SETTINGS !== "undefined" && SETTINGS.logo ? imageUrl(SETTINGS.logo, 400) : "";
  return src ? `<img src="${esc(src)}" alt="" style="height:${size}px;width:auto" onerror="this.outerHTML=LOGO">` : LOGO;
}

function renderChrome(current){
  if (typeof SETTINGS !== "undefined" && SETTINGS.logo){
    const l = document.querySelector('link[rel="icon"]'); if (l) l.href = imageUrl(SETTINGS.logo, 128);
  }
  const nav = [
    ["index.html#pelaa","Pelaa kanssamme","pelaa"], ["index.html#vuorot","Harjoitusajat","vuorot"],
    ["uutiset.html","Uutiset","uutiset"], ["tapahtumat.html","Tapahtumat","tapahtumat"],
    ["galleria.html","Galleria","galleria"], ["hallitus.html","Hallitus","hallitus"],
    ["ukk.html","UKK","ukk"], ["index.html#jasenyys","Liity","liity"]
  ];
  const langBtn = `<button class="lang-btn" type="button" onclick="setLang('${EN_ON ? "fi" : "en"}')" lang="${EN_ON ? "fi" : "en"}" aria-label="${EN_ON ? "Suomeksi" : "In English"}" data-keep>${EN_ON ? "FI" : "EN"}</button>`;
  const header = document.createElement("header");
  header.className = "site";
  header.innerHTML = `<div class="wrap">
    <a class="brand" href="index.html">${logoHtml(42)}<span>WilSu<small>Willimiehen Sulka ry</small></span></a>
    <nav class="main" id="nav" aria-label="Päävalikko"><ul>
      ${nav.map(([h, tx, k]) => `<li><a href="${h}"${k === current ? ' aria-current="page"' : ""}>${tx}</a></li>`).join("")}
      <li><a class="ig-link" href="https://www.instagram.com/wilsubadminton" aria-label="Wilsu Instagramissa">${IG}</a></li>
    </ul></nav>
    <div class="head-tools">${langBtn}
      <button class="menu-btn" id="menu-btn" aria-expanded="false" aria-controls="nav" aria-label="Avaa valikko">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button></div></div>`;
  const alert = document.createElement("div");
  alert.className = "alert"; alert.id = "alert"; alert.hidden = true;
  alert.innerHTML = `<div class="wrap"><span class="alert-dot" aria-hidden="true"></span><span id="alert-text"></span></div>`;
  document.body.prepend(alert, header);

  const footer = document.createElement("footer");
  footer.className = "site";
  footer.innerHTML = `<div class="wrap">
    <div class="cols">
      <div><a class="brand" href="index.html" style="color:#fff">${logoHtml(48)}<span>WilSu<small>Willimiehen Sulka ry, Lappeenranta</small></span></a>
        <p style="max-width:32ch">Kysyttävää vuoroista tai jäsenyydestä? Kirjoita meille.</p>
        <p><a href="mailto:puheenjohtaja@wilsu.fi">puheenjohtaja@wilsu.fi</a><br><a href="mailto:laskutus@wilsu.fi">laskutus@wilsu.fi</a></p></div>
      <div><h4>Pelaa</h4><ul><li><a href="index.html#pelaa">Ryhmät</a></li><li><a href="index.html#vuorot">Harjoitusajat</a></li><li><a href="index.html#paikat">Paikat ja kartat</a></li><li><a href="ukk.html">Usein kysyttyä</a></li><li><a href="index.html#jasenyys">Liity jäseneksi</a></li></ul></div>
      <div><h4>Seura</h4><ul><li><a href="uutiset.html">Uutiset</a></li><li><a href="tapahtumat.html">Tapahtumat ja tulokset</a></li><li><a href="galleria.html">Galleria</a></li><li><a href="hallitus.html">Hallitus</a></li><li><a href="index.html#seura">Historia</a></li><li><a href="index.html#linkit">Linkit</a></li></ul></div>
      <div><h4>Seuraa</h4><ul><li><a href="https://www.instagram.com/wilsubadminton">Instagram</a></li><li><a href="https://www.facebook.com/profile.php?id=61566355680608">Facebook</a></li><li><a href="https://seurakauppa.intersport.fi/seurat/willimiehen-sulka">Seurakauppa</a></li></ul></div>
    </div>
    <div class="partners"><span>Yhteistyössä</span>
      <a href="https://www.intersport.fi/fi/kauppa/lappeenranta/">Intersport Lappeenranta</a><a href="https://www.liikuntakeskus.com">Liikuntakeskus</a><a href="https://www.foreverclub.fi">Forever</a><a href="https://as-huolto.fi/korjaus-ja-huolto/">AS-Huolto</a></div>
    <div class="legal"><span>© ${new Date().getFullYear()} Willimiehen Sulka ry</span><a href="tietosuojaseloste.html">Tietosuojaseloste</a></div>
  </div>`;
  document.body.append(footer);

  const btn = $("menu-btn"), navEl = $("nav");
  btn.addEventListener("click", () => btn.setAttribute("aria-expanded", navEl.classList.toggle("open")));
  navEl.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { navEl.classList.remove("open"); btn.setAttribute("aria-expanded", false); }));

  startTranslation();
  startStats();
}

/* Privacy-friendly visitor statistics (GoatCounter). Only loads if a code is set in SETTINGS. */
function startStats(){
  const code = typeof SETTINGS !== "undefined" && SETTINGS.statsCode;
  if (!code || location.protocol === "file:") return;
  const s = document.createElement("script");
  s.async = true; s.src = "https://gc.zgo.at/count.js";
  s.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
  document.head.appendChild(s);
}

function renderAlert(c){
  const today = iso(new Date()), limit = new Date(); limit.setDate(limit.getDate() + 14);
  const up = c.cancellations.filter(x => x.date >= today && x.date <= iso(limit)).sort((a, b) => a.date.localeCompare(b.date));
  if (!up.length) return;
  const x = up[0], s = c.schedule.find(v => v.id === x.slot), d = D(x.date);
  const what = s ? `${esc(s.title.toLowerCase())} ${EN_ON ? "at" : "klo"} ${fiTime(s.start)}` : esc(x.slot);
  $("alert-text").innerHTML = `<span data-keep><strong>${EN_ON ? "Cancelled" : "Peruttu"} ${SHORT[d.getDay()].toLowerCase()} ${fi(x.date)}:</strong> ${what}, ${esc(x.reason)}.</span>`
    + (up.length > 1 ? ` <a href="index.html#vuorot" style="color:#fff" data-keep>+${up.length - 1} ${EN_ON ? "more" : "muuta"}</a>` : "");
  $("alert").hidden = false;
}

/* News card used on the homepage and the archive */
function newsCard(n, lead){
  const a = document.createElement("a");
  a.href = "uutinen.html?id=" + encodeURIComponent(n.id);
  a.className = "ncard" + (lead ? " lead" : "");
  a.innerHTML = `<div><span class="cat">${esc(t(n.cat))}</span><time datetime="${n.date}">${fiFull(n.date)}</time></div>
    <h3 data-keep>${esc(n.title)}</h3><p data-keep>${esc(n.summary)}</p>`;
  const noImg = () => { a.classList.add("noimg"); a.insertAdjacentHTML("afterbegin", DECO); };
  if (n.image) a.prepend(img(n.image, "", el => { el.remove(); noImg(); }, lead ? 1600 : 900)); else noImg();
  return a;
}

/* ---------- Shared photo viewer ---------- */
let LB = { list: [], i: 0 };
function ensureLightbox(){
  if ($("lightbox")) return;
  const d = document.createElement("div");
  d.className = "lightbox"; d.id = "lightbox"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", t("Kuva isona"));
  d.innerHTML = `<button class="lb-close" id="lb-close" aria-label="${t("Sulje")}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <button class="lb-prev" id="lb-prev" aria-label="${t("Edellinen")}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>
    <figure class="lb-fig"><img id="lb-img" alt=""><figcaption class="lb-caption" id="lb-caption" data-keep></figcaption></figure>
    <button class="lb-next" id="lb-next" aria-label="${t("Seuraava")}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>`;
  document.body.appendChild(d);
  const close = () => { d.classList.remove("open"); document.body.style.overflow = ""; };
  $("lb-close").onclick = close; $("lb-prev").onclick = () => moveLb(-1); $("lb-next").onclick = () => moveLb(1);
  d.addEventListener("click", e => { if (e.target === d || e.target.classList.contains("lb-fig")) close(); });
  document.addEventListener("keydown", e => {
    if (!d.classList.contains("open")) return;
    if (e.key === "Escape") close(); if (e.key === "ArrowRight") moveLb(1); if (e.key === "ArrowLeft") moveLb(-1);
  });
  let x0 = null;
  d.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  d.addEventListener("touchend", e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) moveLb(dx < 0 ? 1 : -1); x0 = null; });
}
function showLb(){
  const p = LB.list[LB.i], im = $("lb-img");
  delete im.dataset.b;
  im.onerror = () => { const m = (p.image || "").match(DRIVE_RE); if (m && !im.dataset.b){ im.dataset.b = 1; im.src = `https://lh3.googleusercontent.com/d/${m[1]}=w2000`; } };
  im.src = imageUrl(p.image, 2000); im.alt = p.caption || "";
  $("lb-caption").innerHTML = `<span class="lb-count">${LB.i + 1} / ${LB.list.length}</span>${p.caption ? `<span>${esc(p.caption)}</span>` : ""}`;
}
function openLightbox(list, i){ ensureLightbox(); LB = { list, i }; showLb(); $("lightbox").classList.add("open"); document.body.style.overflow = "hidden"; $("lb-close").focus(); }
function moveLb(d){ LB.i = (LB.i + d + LB.list.length) % LB.list.length; showLb(); }

/* Initials avatar for board members without a photo */
const initials = name => name.split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
