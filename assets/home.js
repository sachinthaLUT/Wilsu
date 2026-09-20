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
  if (!n){ $("next-when").textContent = t("Kausi on tauolla"); $("next-meta").textContent = t("Uudet vuorot julkaistaan tässä."); return; }
  const dayDiff = Math.round((new Date(n.t).setHours(0,0,0,0) - new Date(now).setHours(0,0,0,0)) / 864e5);
  const label = dayDiff === 0 ? t("Tänään") : dayDiff === 1 ? t("Huomenna") : DAYS[n.t.getDay()];
  $("next-when").textContent = `${label} ${EN_ON ? "at" : "klo"} ${fiTime(n.s.start)}`;
  $("next-badge").innerHTML = `${n.t.getDate()}.${n.t.getMonth()+1}.<span>${SHORT[n.t.getDay()]}</span>`;
  const ms = n.t - now, h = Math.floor(ms / 36e5), m = Math.floor(ms % 36e5 / 6e4);
  const left = h >= 24 ? `${Math.floor(h / 24)} ${EN_ON ? "d" : "pv"} ${h % 24} h` : `${h} h ${pad(m)} min`;
  const v = loc(VENUES[n.s.venue]);
  $("next-meta").innerHTML = `<span data-keep><b>${esc(n.s.title)}</b>, ${esc(v.short)}. <span class="countdown">${EN_ON ? "Starts in" : "Alkuun"} ${left}</span></span>`;
  $("next-map").href = routeUrl(v.maps);
}

function renderWeek(){
  const now = new Date(), upcoming = {};
  C.cancellations.forEach(c => { if (c.date >= iso(now) && (!upcoming[c.slot] || c.date < upcoming[c.slot].date)) upcoming[c.slot] = c; });
  $("week").innerHTML = ORDER.map(day => {
    const slots = C.schedule.filter(s => s.day === day).sort((a, b) => a.start.localeCompare(b.start));
    const items = slots.map(s => `
      <div class="slot ${s.group} ${s.tba ? "tba" : ""}" data-group="${s.group}">
        <b>${s.tba ? t("Alkaa myöhemmin") : fiTime(s.start) + "–" + fiTime(s.end)}</b>
        <span data-keep>${esc(s.title)}</span><br><a class="where" href="${mapsUrl(VENUES[s.venue].maps)}" style="color:inherit" data-keep>${esc(loc(VENUES[s.venue]).short)}</a>
        ${upcoming[s.id] ? `<span class="cancel" data-keep>${EN_ON ? "Cancelled" : "Peruttu"} ${fi(upcoming[s.id].date)}</span>` : ""}
      </div>`).join("");
    return `<div class="day ${day === now.getDay() ? "today" : ""} ${slots.length ? "" : "empty"}"><h4 data-keep>${DAYS[day]}</h4><div>${items}</div></div>`;
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
  $("places").innerHTML = Object.entries(VENUES).map(([key, v0]) => { const v = loc(v0);
    const days = [...new Set(C.schedule.filter(s => s.venue === key && !s.tba).sort((a, b) => ORDER.indexOf(a.day) - ORDER.indexOf(b.day)).map(s => SHORT[s.day]))];
    return `<article class="place"><div class="place-map">${roads}</div>
      <div class="place-body"><h3 data-keep>${esc(v.name)}</h3><p data-keep>${esc(v.info)}</p>
        <p data-keep><b style="color:var(--ink)">${EN_ON ? "Sessions" : "Vuorot"}:</b> ${days.join(", ") || t("ei vuoroja tällä hetkellä")}</p>
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
    return `<div class="event"><div class="date" data-keep>${d.getDate()}<small>${MONTHS[d.getMonth()]}</small></div>
      <div data-keep><h3>${esc(e.title)}</h3><p>${esc(e.place)}${e.desc ? ". " + esc(e.desc) : ""}</p></div>
      <a class="btn btn-dark" data-keep href="${href(e.link) || "tapahtumat.html"}"${href(e.link) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(e.linkText || t("Ilmoittaudu"))}</a></div>`;
  }).join("") || `<p>Uusia tapahtumia julkaistaan pian. Seuraa meitä Instagramissa.</p>`;
}

function renderLinks(){
  const arrow = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>`;
  $("links").innerHTML = LINKS.map(loc).filter(l => href(l.url)).map(l => `<a class="ext" href="${href(l.url)}" target="_blank" rel="noopener noreferrer" data-keep><b>${esc(l.name)}${arrow}</b><span>${esc(l.desc)}</span></a>`).join("");
}

/* Homepage gallery: highlights marked "Etusivulle" in the sheet (or the first 12 photos) */
function galleryHighlights(){
  const f = C.gallery.filter(p => p.featured);
  return (f.length ? f : C.gallery).slice(0, 12);
}
function renderGallery(){
  const P = galleryHighlights(), track = $("track"); track.innerHTML = "";
  const sec = $("galleria"); if (sec) sec.hidden = P.length === 0;
  if (!P.length) return;
  P.forEach((p, i) => {
    const b = document.createElement("button");
    b.className = "shot"; b.setAttribute("aria-label", `${t("Avaa kuva")} ${i + 1}/${P.length}`);
    b.appendChild(img(p.image, p.caption, el => { b.classList.add("missing"); el.remove(); }, 1200));
    b.insertAdjacentHTML("beforeend", `<span class="shot-cap" data-keep><span class="shot-cat">${esc(t(p.category))}</span>${p.caption ? `<span>${esc(p.caption)}</span>` : ""}</span>`);
    b.addEventListener("click", () => openLightbox(P, i));
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
  C.gallery.slice(0, 6).forEach(p => {
    const a = document.createElement("a");
    a.href = "https://www.instagram.com/wilsubadminton"; a.setAttribute("aria-label", "Avaa Wilsun Instagram");
    a.appendChild(img(p.image, "", el => el.remove(), 500)); grid.appendChild(a);
  });
  if (C.gallery[0]) $("now-photo").appendChild(img(C.gallery[0].image, t("Wilsun treenivuoro Huhtiniemessä"), el => el.remove(), 1600));

}

function renderArchive(){
  ARCHIVE.forEach((p, i) => {
    const frame = $("archive-" + (i + 1)); if (!frame) return;
    const cap = frame.parentElement.querySelector("figcaption");
    cap.textContent = t(p.caption || "");
    const ask = `<div class="archive-ask"><b>${t(i === 0 ? "Etsimme vanhoja kuvia" : "Löytyykö albumista?")}</b>${t(i === 0 ? "Onko sinulla kuvia 1980- tai 90-luvulta? Lähetä ne osoitteeseen puheenjohtaja@wilsu.fi, niin skannataan ne seuran arkistoon." : "Prisman ja Wilsun alkuvuosien kuvat ovat seuralle aarteita.")}</div>`;
    const fallback = () => { frame.innerHTML = ask; cap.style.visibility = "hidden"; };
    if (!p.image){ fallback(); return; }
    frame.appendChild(img(p.image, p.caption, fallback, 900));
  });
}

/* Hero: "animation" (3D rally), "video" (club video) or "slideshow" (gallery photos) */
function setupHero(){
  const mode = SETTINGS.hero || "animation";
  const hero = $("hero");
  if (mode === "animation"){
    hero.classList.add("hero-anim"); $("hero-stage").hidden = false;
    startHeroAnimation();
    return false;
  }
  hero.classList.add("hero-video");
  return true;
}
function renderHeroMedia(){
  const video = $("hero-video"), slides = $("hero-slides"), btn = $("media-toggle");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  const small = matchMedia("(max-width: 700px)").matches;
  const src = SETTINGS.hero === "video" ? ((small && SETTINGS.heroVideoMobile) || SETTINGS.heroVideo) : "";
  let playing = true, timer = null, idx = 0, onScreen = true;

  const setBtn = () => { btn.classList.toggle("paused", !playing); btn.setAttribute("aria-label", t(playing ? "Pysäytä video" : "Toista video")); };
  const poster = () => {
    const p = SETTINGS.heroPoster || (C.gallery[0] && C.gallery[0].image);
    if (p){ slides.innerHTML = ""; const d = document.createElement("div"); d.className = "slide on"; d.appendChild(img(p, "", null, 1920)); d.querySelector("img").style.animation = "none"; slides.appendChild(d); }
  };

  function startSlides(){
    const photos = galleryHighlights().slice(0, 6);
    if (!photos.length) return;
    slides.innerHTML = "";
    photos.forEach((p, i) => {
      const d = document.createElement("div"); d.className = "slide" + (i === 0 ? " on" : "");
      const im = img(p.image, "", el => d.remove(), 1920); im.loading = i === 0 ? "eager" : "lazy";
      d.appendChild(im); slides.appendChild(d);
    });
    if (reduce || photos.length < 2) return;
    btn.hidden = false; btn.setAttribute("aria-label", t("Pysäytä kuvaesitys"));
    const tick = () => {
      const all = slides.querySelectorAll(".slide"); if (all.length < 2) return;
      all[idx % all.length].classList.remove("on"); idx++; all[idx % all.length].classList.add("on");
    };
    const run = () => { clearInterval(timer); if (playing && onScreen) timer = setInterval(tick, 5500); };
    btn.onclick = () => { playing = !playing; setBtn(); run(); };
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; run(); }).observe(slides);
    run();
  }

  if (!src){ startSlides(); return; }
  if (reduce || saveData){ poster(); return; }

  if (SETTINGS.heroPoster){ video.poster = imageUrl(SETTINGS.heroPoster, 1920); poster(); }
  video.src = src; video.preload = "auto"; video.hidden = false;
  video.addEventListener("error", () => { video.hidden = true; startSlides(); }, { once: true });
  video.addEventListener("playing", () => { slides.innerHTML = ""; }, { once: true });
  btn.hidden = false;
  btn.onclick = () => { playing = !playing; setBtn(); playing ? video.play() : video.pause(); };
  new IntersectionObserver(([e]) => { if (!playing) return; e.isIntersecting ? video.play().catch(() => {}) : video.pause(); }).observe(video);
  video.play().catch(() => {});
}

/* Sponsor strip: logos scroll slowly to the left, pause on hover */
function renderSponsors(){
  const strip = $("sponsor-strip"), sec = $("kumppanit");
  if (!sec || !strip) return;
  const list = C.sponsors || [];
  sec.hidden = !list.length;
  if (!list.length) return;
  const item = sp => {
    const a = document.createElement("a");
    a.className = "sponsor"; a.href = "kumppanit.html"; a.setAttribute("aria-label", sp.name);
    a.innerHTML = `<span class="sponsor-name" data-keep>${esc(sp.name)}</span>`;
    if (sp.logo){
      const im = img(sp.logo, sp.name, el => el.remove(), 400);
      im.className = "sponsor-logo"; a.prepend(im);
    }
    return a;
  };
  strip.innerHTML = "";
  const run = document.createElement("div"); run.className = "sponsor-run";
  /* repeat short lists so the strip always fills the screen */
  const reps = Math.max(1, Math.ceil(8 / list.length));
  for (let r = 0; r < reps; r++) list.forEach(sp => run.appendChild(item(sp)));
  const run2 = run.cloneNode(true); run2.setAttribute("aria-hidden", "true");
  strip.append(run, run2);
  strip.style.setProperty("--speed", Math.max(24, list.length * reps * 5) + "s");
}

/* Membership: button opens the club's Google Form */
function renderJoin(){
  const s = (C && C.settings) || {};
  const form = membershipUrl(s.jasenlomake || SETTINGS.membershipForm);
  const link = $("join-link");
  link.href = form || "mailto:laskutus@wilsu.fi?subject=Jasenhakemus";
  if (form){ link.target = "_blank"; link.rel = "noopener noreferrer"; } else link.removeAttribute("target");
  $("price-normal").textContent = s.jasenmaksu || SETTINGS.priceNormal;
  $("price-forever").textContent = s.jasenmaksu_forever || SETTINGS.priceForever;
}

(async function init(){
  renderChrome("");
  const mediaHero = setupHero();
  document.querySelectorAll(".filters button").forEach(b => b.addEventListener("click", () => setFilter(b.dataset.filter)));
  document.querySelectorAll("[data-go]").forEach(a => a.addEventListener("click", () => setFilter(a.dataset.go)));
    renderLinks();
  C = await loadContent();
  afterLoad(C); renderNext(); renderWeek(); renderPlaces(); renderNews(); renderEvents(); renderJoin();
  renderGallery(); renderArchive(); renderSponsors(); if (mediaHero) renderHeroMedia();
  setInterval(renderNext, 30000);
})();
