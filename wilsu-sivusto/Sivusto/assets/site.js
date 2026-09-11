/* Shared logic for every page. Volunteers don't need to edit this file. */

const DAYS = ["Sunnuntai","Maanantai","Tiistai","Keskiviikko","Torstai","Perjantai","Lauantai"];
const SHORT = ["Su","Ma","Ti","Ke","To","Pe","La"];
const MONTHS = ["tammikuuta","helmikuuta","maaliskuuta","huhtikuuta","toukokuuta","kesäkuuta","heinäkuuta","elokuuta","syyskuuta","lokakuuta","marraskuuta","joulukuuta"];
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, "0");
const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const D = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
const fi = s => { const d = D(s); return `${d.getDate()}.${d.getMonth()+1}.`; };
const fiFull = s => fi(s) + s.slice(0,4);
const fiTime = t => t.replace(":", ".");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const safeUrl = u => /^(https?:|mailto:|tel:)/i.test(u || "") ? u : "";
const mapsUrl = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
const routeUrl = q => "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q);
const slug = n => (n.date + "-" + n.title).toLowerCase()
  .replace(/[äå]/g,"a").replace(/ö/g,"o").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

/* Google Drive share links become resized image addresses */
function imageUrl(link, width = 1600){
  if (!link) return "";
  const m = link.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
  if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w${width}`;
  return safeUrl(link) || link.replace(/^javascript:/i, "");
}
function img(src, alt, onFail, width){
  const i = new Image(); i.loading = "lazy"; i.decoding = "async"; i.alt = alt || "";
  i.onerror = () => onFail && onFail(i);
  i.src = imageUrl(src, width);
  return i;
}
const DECO = `<svg class="deco" viewBox="0 0 300 300" aria-hidden="true">
  <circle cx="170" cy="130" r="120" fill="#12604A"/>
  <path d="M120 60 L200 200 M150 40 L215 190 M185 35 L228 182" stroke="#1B7458" stroke-width="10" stroke-linecap="round"/>
  <path d="M95 75 L185 215 L245 170 L205 30 Z" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="222" cy="200" r="26" fill="#F5D547"/></svg>`;

/* Text from the sheet → safe paragraphs with clickable links */
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

const MAPPERS = {
  schedule: rows => rows.map(r => ({
    id: r["tunnus"], day: DAYMAP[(r["päivä"] || "").toLowerCase()], start: parseTime(r["alkaa"]), end: parseTime(r["päättyy"]),
    group: GROUPMAP[(r["ryhmä"] || "").toLowerCase()] || "aikuiset", title: r["nimi"],
    venue: (r["paikka"] || "").toLowerCase().startsWith("urheilu") ? "urheilutalo" : "huhtiniemi",
    from: parseDate(r["alkaen"]), tba: yes(r["alkaa myöhemmin"])
  })).filter(s => s.id && s.day !== undefined && (s.tba || (s.start && s.end))),
  cancellations: rows => rows.map(r => ({ slot: r["vuoro"], date: parseDate(r["päivämäärä"]), reason: r["syy"] || "vuoro on peruttu" }))
    .filter(c => c.slot && c.date),
  news: rows => rows.filter(r => !/^ei$/i.test(r["julkaistu"] || "")).map(r => ({
    date: parseDate(r["päivämäärä"]), cat: r["luokka"] || "Tiedote", title: r["otsikko"], summary: r["tiivistelmä"],
    body: r["teksti"], image: r["kuva"], caption: r["kuvateksti"]
  })).filter(n => n.date && n.title),
  events: rows => rows.map(r => ({
    date: parseDate(r["päivämäärä"]), title: r["nimi"], place: r["paikka"], desc: r["kuvaus"],
    linkText: r["linkin teksti"], link: r["linkki"], result: r["tulos"], resultsLink: r["tulokset-linkki"]
  })).filter(e => e.date && e.title),
  gallery: rows => rows.map(r => ({ image: r["kuva"], caption: r["kuvateksti"] })).filter(g => g.image)
};

async function loadContent(){
  const out = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  await Promise.all(Object.entries(SHEETS).filter(([, url]) => url).map(async ([key, url]) => {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(res.status);
      const data = MAPPERS[key](parseCSV(await res.text()));
      if (data.length || key === "cancellations") out[key] = data;
    } catch (e) { console.warn(`Taulukon "${key}" lataus epäonnistui, käytetään varasisältöä.`, e); }
    finally { clearTimeout(t); }
  }));
  out.news.forEach(n => n.id = slug(n));
  out.news.sort((a, b) => b.date.localeCompare(a.date));
  return out;
}

/* ---------- Header, footer, cancellation banner ---------- */
const LOGO = `<svg width="38" height="38" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#F5D547"/><path d="M13 12 L20 29 L27 12" fill="none" stroke="#0B3B2E" stroke-width="3.2" stroke-linejoin="round"/><path d="M16.5 12 L20 21 L23.5 12" fill="none" stroke="#0B3B2E" stroke-width="2"/><circle cx="20" cy="30" r="3.2" fill="#0B3B2E"/></svg>`;
const IG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>`;

function logoHtml(size){
  const src = typeof SETTINGS !== "undefined" && SETTINGS.logo ? imageUrl(SETTINGS.logo, 400) : "";
  return src ? `<img src="${esc(src)}" alt="" style="height:${size}px" onerror="this.outerHTML=LOGO">` : LOGO;
}
function renderChrome(current){
  if (typeof SETTINGS !== "undefined" && SETTINGS.logo){
    let l = document.querySelector('link[rel="icon"]'); if (l) l.href = imageUrl(SETTINGS.logo, 128);
  }
  const nav = [
    ["index.html#pelaa","Pelaa kanssamme","pelaa"], ["index.html#vuorot","Harjoitusajat","vuorot"],
    ["uutiset.html","Uutiset","uutiset"], ["tapahtumat.html","Tapahtumat","tapahtumat"],
    ["index.html#galleria","Galleria","galleria"], ["index.html#seura","Historia","seura"], ["index.html#jasenyys","Liity","liity"]
  ];
  const header = document.createElement("header");
  header.className = "site";
  header.innerHTML = `<div class="wrap">
    <a class="brand" href="index.html">${logoHtml(40)}<span>WilSu<small>Willimiehen Sulka ry</small></span></a>
    <nav class="main" id="nav" aria-label="Päävalikko"><ul>
      ${nav.map(([h, t, k]) => `<li><a href="${h}"${k === current ? ' aria-current="page"' : ""}>${t}</a></li>`).join("")}
      <li><a class="ig-link" href="https://www.instagram.com/wilsubadminton" aria-label="Wilsu Instagramissa">${IG}<span>Instagram</span></a></li>
    </ul></nav>
    <button class="menu-btn" id="menu-btn" aria-expanded="false" aria-controls="nav" aria-label="Avaa valikko">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button></div>`;
  const alert = document.createElement("div");
  alert.className = "alert"; alert.id = "alert"; alert.hidden = true;
  alert.innerHTML = `<div class="wrap"><span class="alert-dot" aria-hidden="true"></span><span id="alert-text"></span></div>`;
  document.body.prepend(alert, header);

  const footer = document.createElement("footer");
  footer.className = "site";
  footer.innerHTML = `<div class="wrap">
    <div class="cols">
      <div><a class="brand" href="index.html" style="color:#fff">${logoHtml(44)}<span>WilSu<small>Willimiehen Sulka ry, Lappeenranta</small></span></a>
        <p style="max-width:32ch">Kysyttävää vuoroista tai jäsenyydestä? Kirjoita meille.</p>
        <p><a href="mailto:puheenjohtaja@wilsu.fi">puheenjohtaja@wilsu.fi</a><br><a href="mailto:laskutus@wilsu.fi">laskutus@wilsu.fi</a></p></div>
      <div><h4>Pelaa</h4><ul><li><a href="index.html#pelaa">Ryhmät</a></li><li><a href="index.html#vuorot">Harjoitusajat</a></li><li><a href="index.html#paikat">Paikat ja kartat</a></li><li><a href="index.html#jasenyys">Liity jäseneksi</a></li></ul></div>
      <div><h4>Seura</h4><ul><li><a href="uutiset.html">Uutiset</a></li><li><a href="tapahtumat.html">Tapahtumat ja tulokset</a></li><li><a href="index.html#seura">Historia</a></li><li><a href="index.html#linkit">Linkit</a></li><li><a href="https://seurakauppa.intersport.fi/seurat/willimiehen-sulka">Seurakauppa</a></li></ul></div>
      <div><h4>Seuraa</h4><ul><li><a href="https://www.instagram.com/wilsubadminton">Instagram</a></li><li><a href="https://www.facebook.com/profile.php?id=61566355680608">Facebook</a></li></ul></div>
    </div>
    <div class="partners"><span>Yhteistyössä</span>
      <a href="https://www.intersport.fi/fi/kauppa/lappeenranta/">Intersport Lappeenranta</a><a href="https://www.liikuntakeskus.com">Liikuntakeskus</a><a href="https://www.foreverclub.fi">Forever</a><a href="https://as-huolto.fi/korjaus-ja-huolto/">AS-Huolto</a></div>
    <div class="legal"><span>© ${new Date().getFullYear()} Willimiehen Sulka ry</span><a href="tietosuojaseloste.html">Tietosuojaseloste</a></div>
  </div>`;
  document.body.append(footer);

  const btn = $("menu-btn"), navEl = $("nav");
  btn.addEventListener("click", () => btn.setAttribute("aria-expanded", navEl.classList.toggle("open")));
  navEl.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { navEl.classList.remove("open"); btn.setAttribute("aria-expanded", false); }));
}

function renderAlert(c){
  const today = iso(new Date()), limit = new Date(); limit.setDate(limit.getDate() + 14);
  const up = c.cancellations.filter(x => x.date >= today && x.date <= iso(limit)).sort((a, b) => a.date.localeCompare(b.date));
  if (!up.length) return;
  const x = up[0], s = c.schedule.find(v => v.id === x.slot), d = D(x.date);
  const what = s ? `${esc(s.title.toLowerCase())} klo ${fiTime(s.start)}` : esc(x.slot);
  $("alert-text").innerHTML = `<strong>Peruttu ${SHORT[d.getDay()].toLowerCase()} ${fi(x.date)}:</strong> ${what}, ${esc(x.reason)}.`
    + (up.length > 1 ? ` <a href="index.html#vuorot" style="color:#fff">+${up.length - 1} muuta</a>` : "");
  $("alert").hidden = false;
}

/* News card used on the homepage and the archive */
function newsCard(n, lead){
  const a = document.createElement("a");
  a.href = "uutinen.html?id=" + encodeURIComponent(n.id);
  a.className = "ncard" + (lead ? " lead" : "");
  a.innerHTML = `<div><span class="cat">${esc(n.cat)}</span><time datetime="${n.date}">${fiFull(n.date)}</time></div>
    <h3>${esc(n.title)}</h3><p>${esc(n.summary)}</p>`;
  const noImg = () => { a.classList.add("noimg"); a.insertAdjacentHTML("afterbegin", DECO); };
  if (n.image) a.prepend(img(n.image, "", el => { el.remove(); noImg(); }, lead ? 1600 : 900)); else noImg();
  return a;
}
