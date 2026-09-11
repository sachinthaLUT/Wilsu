/* Homepage. Content comes from loadContent() in site.js */
const ORDER = [1,2,3,4,5,6,0];
let C;

function nextSession(now){
  const cancelled = (s, ds) => C.cancellations.some(c => c.slot === s.id && c.date === ds);
  for (let i = 0; i < 21; i++){
    const d = new Date(now); d.setDate(now.getDate() + i); d.setHours(0,0,0,0);
    const ds = iso(d);
    const hit = C.schedule
      .filter(s => s.day === d.getDay() && !s.tba && (!s.from || s.from <= ds) && !cancelled(s, ds))
      .map(s => { const [h, m] = s.start.split(":"); const t = new Date(d); t.setHours(+h, +m); return { s, t }; })
      .filter(x => x.t > now).sort((a, b) => a.t - b.t)[0];
    if (hit) return hit;
  }
  return null;
}

function renderNext(){
  const now = new Date(), n = nextSession(now);
  if (!n){ $("next-when").textContent = "Kausi on tauolla"; $("next-meta").textContent = "Uudet vuorot julkaistaan tässä."; return; }
  const dayDiff = Math.round((new Date(n.t).setHours(0,0,0,0) - new Date(now).setHours(0,0,0,0)) / 864e5);
  const label = dayDiff === 0 ? "Tänään" : dayDiff === 1 ? "Huomenna" : DAYS[n.t.getDay()];
  $("next-when").textContent = `${label} klo ${fiTime(n.s.start)}`;
  $("next-badge").innerHTML = `${n.t.getDate()}.${n.t.getMonth()+1}.<span>${SHORT[n.t.getDay()]}</span>`;
  const ms = n.t - now, h = Math.floor(ms / 36e5), m = Math.floor(ms % 36e5 / 6e4);
  const left = h >= 24 ? `${Math.floor(h / 24)} pv ${h % 24} h` : `${h} h ${pad(m)} min`;
  const v = VENUES[n.s.venue];
  $("next-meta").innerHTML = `<b>${esc(n.s.title)}</b>, ${esc(v.short)}. <span class="countdown">Alkuun ${left}</span>`;
  $("next-map").href = routeUrl(v.maps);
}

function renderWeek(){
  const now = new Date(), upcoming = {};
  C.cancellations.forEach(c => { if (c.date >= iso(now) && (!upcoming[c.slot] || c.date < upcoming[c.slot].date)) upcoming[c.slot] = c; });
  $("week").innerHTML = ORDER.map(day => {
    const slots = C.schedule.filter(s => s.day === day).sort((a, b) => a.start.localeCompare(b.start));
    const items = slots.map(s => `
      <div class="slot ${s.group} ${s.tba ? "tba" : ""}" data-group="${s.group}">
        <b>${s.tba ? "Alkaa myöhemmin" : fiTime(s.start) + "–" + fiTime(s.end)}</b>
        ${esc(s.title)}<br><a class="where" href="${mapsUrl(VENUES[s.venue].maps)}" style="color:inherit">${esc(VENUES[s.venue].short)}</a>
        ${upcoming[s.id] ? `<span class="cancel">Peruttu ${fi(upcoming[s.id].date)}</span>` : ""}
      </div>`).join("");
    return `<div class="day ${day === now.getDay() ? "today" : ""} ${slots.length ? "" : "empty"}"><h4>${DAYS[day]}</h4><div>${items}</div></div>`;
  }).join("");
}

function setFilter(f){
  document.querySelectorAll(".filters button").forEach(b => b.setAttribute("aria-pressed", b.dataset.filter === f));
  document.querySelectorAll(".slot").forEach(el => el.classList.toggle("dim", f !== "kaikki" && el.dataset.group !== f));
}

function renderPlaces(){
  const roads = `<svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path d="M-10 110 C 80 90, 140 130, 230 95 S 360 60, 420 80" stroke="#fff" stroke-width="14" fill="none"/>
      <path d="M120 -10 C 140 50, 150 90, 175 160" stroke="#fff" stroke-width="9" fill="none"/>
      <path d="M300 -10 L 270 160" stroke="#fff" stroke-width="6" fill="none"/>
      <path d="M-10 40 L 420 20" stroke="#fff" stroke-width="5" fill="none" opacity=".7"/>
      <ellipse cx="360" cy="150" rx="120" ry="40" fill="#B9D7E8"/>
      <g transform="translate(205 72)"><circle r="22" fill="#12604A" opacity=".18"/><path d="M0 8 C -12 -4 -12 -22 0 -22 C 12 -22 12 -4 0 8 Z" fill="#12604A"/><circle cy="-13" r="4.5" fill="#F5D547"/></g>
    </svg>`;
  $("places").innerHTML = Object.entries(VENUES).map(([key, v]) => {
    const days = [...new Set(C.schedule.filter(s => s.venue === key && !s.tba).sort((a, b) => ORDER.indexOf(a.day) - ORDER.indexOf(b.day)).map(s => SHORT[s.day]))];
    return `<article class="place"><div class="place-map">${roads}</div>
      <div class="place-body"><h3>${esc(v.name)}</h3><p>${esc(v.info)}</p>
        <p><b style="color:var(--ink)">Vuorot:</b> ${days.join(", ") || "ei vuoroja tällä hetkellä"}</p>
        <div class="place-actions"><a class="btn btn-dark" href="${routeUrl(v.maps)}">Reittiohjeet</a><a class="btn btn-line" href="${mapsUrl(v.maps)}">Avaa kartta</a></div>
      </div></article>`;
  }).join("");
}

function renderNews(){
  const box = $("news"); box.innerHTML = "";
  C.news.slice(0, 3).forEach((n, i) => box.appendChild(newsCard(n, i === 0)));
}

function renderEvents(){
  const today = iso(new Date());
  const up = C.events.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  $("events").innerHTML = up.map(e => {
    const d = D(e.date);
    return `<div class="event"><div class="date">${d.getDate()}<small>${MONTHS[d.getMonth()]}</small></div>
      <div><h3>${esc(e.title)}</h3><p>${esc(e.place)}${e.desc ? ". " + esc(e.desc) : ""}</p></div>
      <a class="btn btn-dark" href="${safeUrl(e.link) || "tapahtumat.html"}"${safeUrl(e.link) ? ' target="_blank" rel="noopener"' : ""}>${esc(e.linkText || "Ilmoittaudu")}</a></div>`;
  }).join("") || `<p>Uusia tapahtumia julkaistaan pian. Seuraa meitä Instagramissa.</p>`;
}

function renderLinks(){
  const arrow = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>`;
  $("links").innerHTML = LINKS.map(l => `<a class="ext" href="${l.url}" target="_blank" rel="noopener"><b>${esc(l.name)}${arrow}</b><span>${esc(l.desc)}</span></a>`).join("");
}

let lbIndex = 0;
function renderGallery(){
  const P = C.gallery, track = $("track"); track.innerHTML = "";
  P.forEach((p, i) => {
    const b = document.createElement("button");
    b.className = "shot"; b.setAttribute("aria-label", `Avaa kuva ${i + 1}/${P.length}`);
    b.appendChild(img(p.image, p.caption, el => { b.classList.add("missing"); el.remove(); b.textContent = "Kuva " + (i + 1); }, 1200));
    b.addEventListener("click", () => openLb(i));
    track.appendChild(b);
  });
  const step = () => (track.querySelector(".shot")?.offsetWidth || 300) + 16;
  $("g-prev").onclick = () => track.scrollBy({ left: -step(), behavior: "smooth" });
  $("g-next").onclick = () => track.scrollBy({ left: step(), behavior: "smooth" });
  track.addEventListener("scroll", () => {
    const max = track.scrollWidth - track.clientWidth;
    $("g-bar").style.width = (20 + 80 * (max ? track.scrollLeft / max : 0)) + "%";
  }, { passive: true });
  track.addEventListener("keydown", e => { if (e.key === "ArrowRight") $("g-next").click(); if (e.key === "ArrowLeft") $("g-prev").click(); });

  const grid = $("ig-grid"); grid.innerHTML = "";
  P.slice(0, 6).forEach(p => {
    const a = document.createElement("a");
    a.href = "https://www.instagram.com/wilsubadminton"; a.setAttribute("aria-label", "Avaa Wilsun Instagram");
    a.appendChild(img(p.image, "", el => el.remove(), 500)); grid.appendChild(a);
  });
  if (P[0]) $("now-photo").appendChild(img(P[0].image, "Wilsun treenivuoro Huhtiniemessä", el => el.remove(), 1600));

  ARCHIVE.forEach((p, i) => {
    const frame = $("archive-" + (i + 1)); if (!frame) return;
    const cap = frame.parentElement.querySelector("figcaption");
    cap.textContent = p.caption || "";
    const ask = `<div class="archive-ask"><b>${i === 0 ? "Etsimme vanhoja kuvia" : "Löytyykö albumista?"}</b>${i === 0 ? "Onko sinulla kuvia 1980- tai 90-luvulta? Lähetä ne osoitteeseen puheenjohtaja@wilsu.fi, niin skannataan ne seuran arkistoon." : "Prisman ja Wilsun alkuvuosien kuvat ovat seuralle aarteita."}</div>`;
    const fallback = () => { frame.innerHTML = ask; cap.style.visibility = "hidden"; };
    if (!p.image){ fallback(); return; }
    frame.appendChild(img(p.image, p.caption, fallback, 900));
  });
}

function showLb(){
  const p = C.gallery[lbIndex], im = $("lb-img");
  im.src = imageUrl(p.image, 2000); im.alt = p.caption || "";
  $("lb-caption").textContent = `${lbIndex + 1} / ${C.gallery.length}${p.caption ? " · " + p.caption : ""}`;
}
function openLb(i){ lbIndex = i; showLb(); $("lightbox").classList.add("open"); document.body.style.overflow = "hidden"; $("lb-close").focus(); }
function closeLb(){ $("lightbox").classList.remove("open"); document.body.style.overflow = ""; }
function moveLb(d){ lbIndex = (lbIndex + d + C.gallery.length) % C.gallery.length; showLb(); }

function wireLightbox(){
  $("lb-close").onclick = closeLb; $("lb-prev").onclick = () => moveLb(-1); $("lb-next").onclick = () => moveLb(1);
  $("lightbox").addEventListener("click", e => { if (e.target.id === "lightbox") closeLb(); });
  document.addEventListener("keydown", e => {
    if (!$("lightbox").classList.contains("open")) return;
    if (e.key === "Escape") closeLb(); if (e.key === "ArrowRight") moveLb(1); if (e.key === "ArrowLeft") moveLb(-1);
  });
  let x0 = null;
  $("lightbox").addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  $("lightbox").addEventListener("touchend", e => {
    if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) moveLb(dx < 0 ? 1 : -1); x0 = null;
  });
}

/* Membership: button opens the club's Google Form */
function renderJoin(){
  const link = safeUrl(SETTINGS.membershipForm) || "mailto:laskutus@wilsu.fi?subject=Jäsenhakemus";
  $("join-link").href = link;
  if (!SETTINGS.membershipForm){ $("join-link").removeAttribute("target"); }
  $("price-normal").textContent = SETTINGS.priceNormal;
  $("price-forever").textContent = SETTINGS.priceForever;
}

(async function init(){
  renderChrome("");
  renderJoin(); wireLightbox();
  document.querySelectorAll(".filters button").forEach(b => b.addEventListener("click", () => setFilter(b.dataset.filter)));
  document.querySelectorAll("[data-go]").forEach(a => a.addEventListener("click", () => setFilter(a.dataset.go)));
    renderLinks();
  C = await loadContent();
  renderAlert(C); renderNext(); renderWeek(); renderPlaces(); renderNews(); renderEvents(); renderGallery();
  setInterval(renderNext, 30000);
})();
