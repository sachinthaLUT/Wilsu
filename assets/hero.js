/* Hero animation: 3D badminton rally. Started by home.js when SETTINGS.hero is "animation". */
function startHeroAnimation(){

/* ---------- World in metres. Net at y = 0, near baseline y = -6.7, up = z ---------- */
const NS = "http://www.w3.org/2000/svg";
const svg = document.getElementById("scene");
const W = 600, H = 600;
svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

const v3 = (x, y, z) => ({ x, y, z });
const sub = (a, b) => v3(a.x - b.x, a.y - b.y, a.z - b.z);
const add = (a, b) => v3(a.x + b.x, a.y + b.y, a.z + b.z);
const mul = (a, k) => v3(a.x * k, a.y * k, a.z * k);
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a, b) => v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
const norm = a => mul(a, 1 / Math.hypot(a.x, a.y, a.z));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* Camera: starts almost top-down (like the old flat court), then tilts into a broadcast view */
const CAM_START = { pos: v3(0.01, -1.2, 22), target: v3(0, 0, 0) };
const CAM_END   = { pos: v3(-8.5, -11.5, 10.5), target: v3(0.2, 0.6, 1.0) };
let cam, fit = { s: 1, ox: 0, oy: 0 };

function setCamera(t){
  const e = ease(t);
  const pos = v3(lerp(CAM_START.pos.x, CAM_END.pos.x, e), lerp(CAM_START.pos.y, CAM_END.pos.y, e), lerp(CAM_START.pos.z, CAM_END.pos.z, e));
  const tg = v3(lerp(CAM_START.target.x, CAM_END.target.x, e), lerp(CAM_START.target.y, CAM_END.target.y, e), lerp(CAM_START.target.z, CAM_END.target.z, e));
  const f = norm(sub(tg, pos));
  const r = norm(cross(f, v3(0, 0, 1)));
  const u = cross(r, f);
  cam = { pos, f, r, u };
  /* Fit the court, net and every point of the rally inside the frame, so nothing is ever cropped */
  const pts = FIT_POINTS.map(rawProject);
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const pad = 42, s = Math.min((W - 2 * pad) / (maxX - minX), (H - 2 * pad) / (maxY - minY));
  fit = { s, ox: (W - s * (maxX + minX)) / 2, oy: (H - s * (maxY + minY)) / 2 };
}
function rawProject(p){
  const d = sub(p, cam.pos), zc = dot(d, cam.f);
  return { x: dot(d, cam.r) / zc, y: -dot(d, cam.u) / zc, depth: zc };
}
function P(p){
  const q = rawProject(p);
  return { x: fit.ox + fit.s * q.x, y: fit.oy + fit.s * q.y, depth: q.depth };
}
const pts2 = arr => arr.map(p => { const q = P(p); return q.x.toFixed(1) + "," + q.y.toFixed(1); }).join(" ");

/* ---------- The rally: six shots that end where they started ---------- */
const SHOTS = [
  { a: v3(-1.0,-5.2,2.6), b: v3( 1.3, 5.3,2.4), h: 3.0, d: 1.9,  k: 1.6 },  // clear
  { a: v3( 1.3, 5.3,2.4), b: v3(-0.5,-2.3,0.7), h: 0.6, d: 1.25, k: 1.2 },  // drop
  { a: v3(-0.5,-2.3,0.7), b: v3( 1.0, 4.9,2.6), h: 2.6, d: 1.6,  k: 1.4 },  // lift
  { a: v3( 1.0, 4.9,3.0), b: v3(-1.2,-4.0,0.9), h: 0.25,d: 0.62, k: 0.6 },  // smash
  { a: v3(-1.2,-4.0,0.9), b: v3( 0.4, 4.6,1.5), h: 0.9, d: 0.95, k: 0.8 },  // drive
  { a: v3( 0.4, 4.6,1.5), b: v3(-1.0,-5.2,2.6), h: 3.0, d: 1.9,  k: 1.6 }   // clear
];
const PAUSE = 0.18;
const RALLY = SHOTS.reduce((s, x) => s + x.d + PAUSE, 0);

/* Shuttles slow down quickly in the air: fast off the racket, steep fall at the end */
function shotPos(s, t){
  const hz = (1 - Math.exp(-s.k * t)) / (1 - Math.exp(-s.k));
  return v3(lerp(s.a.x, s.b.x, hz), lerp(s.a.y, s.b.y, hz), lerp(s.a.z, s.b.z, t) + s.h * Math.sin(Math.PI * t));
}
function rallyAt(time){
  let t = time % RALLY;
  for (let i = 0; i < SHOTS.length; i++){
    const s = SHOTS[i];
    if (t < s.d){ const u = t / s.d; return { i, u, p: shotPos(s, u), v: norm(sub(shotPos(s, Math.min(1, u + .01)), shotPos(s, Math.max(0, u - .01)))) }; }
    t -= s.d;
    if (t < PAUSE){ const p = s.b, n = SHOTS[(i + 1) % SHOTS.length]; return { i, u: 1, p, v: norm(sub(shotPos(n, .02), n.a)), hold: true }; }
    t -= PAUSE;
  }
  return rallyAt(0);
}

const FIT_POINTS = [];
[[-3.05,-6.7],[3.05,-6.7],[3.05,6.7],[-3.05,6.7]].forEach(([x, y]) => FIT_POINTS.push(v3(x, y, 0)));
[-3.05, 3.05].forEach(x => FIT_POINTS.push(v3(x, 0, 1.55)));
SHOTS.forEach(s => { for (let t = 0; t <= 1; t += .05) FIT_POINTS.push(add(shotPos(s, t), v3(0, 0, .35))); });

/* ---------- SVG layers ---------- */
const g = (parent, tag, attrs = {}) => { const el = document.createElementNS(NS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); parent.appendChild(el); return el; };
svg.innerHTML = `<defs>
  <radialGradient id="cork" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#FFF6DA"/><stop offset=".55" stop-color="#E9D29A"/><stop offset="1" stop-color="#A8894A"/></radialGradient>
  <linearGradient id="skirt" x1="0" x2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F1F4F2"/><stop offset="1" stop-color="#C9D3CE"/></linearGradient>
  <pattern id="mesh" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 0L7 7M7 0L0 7" stroke="rgba(255,255,255,.28)" stroke-width=".8"/></pattern>
</defs>`;
const L = { floor: g(svg, "g"), lines: g(svg, "g"), shadow: g(svg, "g"), far: g(svg, "g"), net: g(svg, "g"), near: g(svg, "g"), fx: g(svg, "g") };

const floorPoly = g(L.floor, "polygon", { fill: "#12604A" });
const LW = 0.05;
const LINES = [
  [-3.05,-6.7, 3.05,-6.7], [-3.05,6.7, 3.05,6.7], [-3.05,-6.7,-3.05,6.7], [3.05,-6.7,3.05,6.7],
  [-2.59,-6.7,-2.59,6.7], [2.59,-6.7,2.59,6.7],
  [-3.05,-1.98,3.05,-1.98], [-3.05,1.98,3.05,1.98], [-3.05,-5.94,3.05,-5.94], [-3.05,5.94,3.05,5.94],
  [0,-6.7,0,-1.98], [0,1.98,0,6.7]
].map((c, i) => ({ c, el: g(L.lines, "polygon", { fill: "#fff", style: `opacity:0;transition:opacity .5s ease ${0.15 + i * 0.05}s` }) }));

const shadow = g(L.shadow, "ellipse", { fill: "#000" });
const trail = g(L.far, "polyline", { fill: "none", stroke: "rgba(255,255,255,.35)", "stroke-width": 2.5, "stroke-linecap": "round", "stroke-linejoin": "round" });

const netMesh = g(L.net, "polygon", { fill: "url(#mesh)" });
const netTape = g(L.net, "polygon", { fill: "#FFFFFF" });
const posts = [g(L.net, "polygon", { fill: "#F5D547" }), g(L.net, "polygon", { fill: "#F5D547" })];
const postCaps = [g(L.net, "ellipse", { fill: "#F5D547" }), g(L.net, "ellipse", { fill: "#F5D547" })];

const shuttle = g(L.near, "g");
const skirtBack = g(shuttle, "polygon", { fill: "url(#skirt)", stroke: "#B9C6C0", "stroke-width": .6, "stroke-linejoin": "round" });
const skirtMouth = g(shuttle, "polygon", { fill: "#6F877D", stroke: "#FFFFFF", "stroke-width": 1.4, "stroke-linejoin": "round" });
const ribs = g(shuttle, "path", { stroke: "#AEBDB6", "stroke-width": .9, fill: "none" });
const band = g(shuttle, "polygon", { fill: "#F5D547" });
const cork = g(shuttle, "circle", { fill: "url(#cork)" });
const ring = g(L.fx, "circle", { r: 22, fill: "none", stroke: "#F5D547", "stroke-width": 2.5, opacity: 0, style: "transform-box:fill-box;transform-origin:center" });

/* ---------- Drawing ---------- */
function drawCourt(){
  floorPoly.setAttribute("points", pts2([v3(-3.5,-7.2,0), v3(3.5,-7.2,0), v3(3.5,7.2,0), v3(-3.5,7.2,0)]));
  LINES.forEach(({ c: [x1, y1, x2, y2], el }) => {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), nx = -dy / len * LW / 2, ny = dx / len * LW / 2;
    el.setAttribute("points", pts2([v3(x1 + nx, y1 + ny, 0), v3(x2 + nx, y2 + ny, 0), v3(x2 - nx, y2 - ny, 0), v3(x1 - nx, y1 - ny, 0)]));
  });
  netMesh.setAttribute("points", pts2([v3(-3.05,0,0.79), v3(3.05,0,0.79), v3(3.05,0,1.52), v3(-3.05,0,1.52)]));
  netTape.setAttribute("points", pts2([v3(-3.05,0,1.49), v3(3.05,0,1.49), v3(3.05,0,1.56), v3(-3.05,0,1.56)]));
  [-3.1, 3.1].forEach((x, i) => {
    const w = 0.045;
    posts[i].setAttribute("points", pts2([v3(x - w,0,0), v3(x + w,0,0), v3(x + w,0,1.58), v3(x - w,0,1.58)]));
    const top = P(v3(x, 0, 1.58)), side = P(v3(x + w, 0, 1.58));
    postCaps[i].setAttribute("cx", top.x); postCaps[i].setAttribute("cy", top.y);
    postCaps[i].setAttribute("rx", Math.abs(side.x - top.x) + .5); postCaps[i].setAttribute("ry", Math.abs(side.x - top.x) * .45 + .5);
  });
}

function hull(points){
  const p = points.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  const c = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lo = [], up = [];
  for (const q of p){ while (lo.length > 1 && c(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()){ while (up.length > 1 && c(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

/* A real shuttle is ~9 cm long. It is drawn about 3x larger so it reads at hero size. */
const SCALE = 8, CORK_R = 0.013 * SCALE, SKIRT_LEN = 0.07 * SCALE, BASE_R = 0.033 * SCALE, NECK_R = 0.012 * SCALE;
function ringPts(center, axis, radius, n){
  const a = Math.abs(axis.z) < .9 ? v3(0, 0, 1) : v3(1, 0, 0);
  const e1 = norm(cross(axis, a)), e2 = cross(axis, e1), out = [];
  for (let i = 0; i < n; i++){ const t = i / n * Math.PI * 2; out.push(add(center, add(mul(e1, Math.cos(t) * radius), mul(e2, Math.sin(t) * radius)))); }
  return out;
}
function drawShuttle(p, dir){
  const neck = sub(p, mul(dir, CORK_R * .6));
  const base = sub(p, mul(dir, SKIRT_LEN + CORK_R * .6));
  const nRing = ringPts(neck, dir, NECK_R, 14), bRing = ringPts(base, dir, BASE_R, 14);
  const n2 = nRing.map(P), b2 = bRing.map(P);
  skirtBack.setAttribute("points", hull(n2.concat(b2)).map(q => q.x.toFixed(1) + "," + q.y.toFixed(1)).join(" "));
  /* The open end of the skirt is visible when it faces the camera */
  const facing = dot(mul(dir, -1), norm(sub(cam.pos, base)));
  skirtMouth.setAttribute("points", b2.map(q => q.x.toFixed(1) + "," + q.y.toFixed(1)).join(" "));
  skirtMouth.style.opacity = facing > 0 ? Math.min(1, facing * 1.6) : 0;
  let d = "";
  for (let i = 0; i < 14; i += 2){
    const toCam = dot(norm(sub(bRing[i], base)), norm(sub(cam.pos, base)));
    if (toCam > -0.2) d += `M${n2[i].x.toFixed(1)} ${n2[i].y.toFixed(1)}L${b2[i].x.toFixed(1)} ${b2[i].y.toFixed(1)}`;
  }
  ribs.setAttribute("d", d);
  const bandRing = ringPts(sub(p, mul(dir, CORK_R * .55)), dir, CORK_R * 1.02, 14).map(P);
  band.setAttribute("points", hull(bandRing.concat(ringPts(sub(p, mul(dir, CORK_R * .95)), dir, NECK_R * 1.2, 14).map(P))).map(q => q.x.toFixed(1) + "," + q.y.toFixed(1)).join(" "));
  const c = P(p), edge = P(add(p, mul(cam.r, CORK_R)));
  cork.setAttribute("cx", c.x); cork.setAttribute("cy", c.y); cork.setAttribute("r", Math.max(2, Math.hypot(edge.x - c.x, edge.y - c.y)));
  /* Cork in front of skirt when the shuttle flies toward the camera, behind it otherwise */
  const corkFront = dot(dir, norm(sub(cam.pos, p))) > -0.35;
  if (corkFront) shuttle.append(band, cork); else shuttle.prepend(cork, band);
}

/* ---------- Loop ---------- */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const INTRO = 1.6;
let clock = 0, last = null, paused = false, speed = 1, history = [], lastShot = -1;
/* Pause when the hero is off screen or the tab is hidden, to save battery */
new IntersectionObserver(([e]) => { paused = !e.isIntersecting; }).observe(svg);
document.addEventListener("visibilitychange", () => { last = null; });

function frame(now){
  const dt = last === null ? 0 : Math.min(.05, (now - last) / 1000); last = now;
  if (!paused) clock += dt * speed;
  const introT = Math.min(1, clock / INTRO);
  setCamera(reduce ? 1 : introT);
  drawCourt();

  const live = reduce ? true : clock > INTRO * .85;
  shuttle.style.opacity = live ? 1 : 0;
  shadow.style.opacity = live ? 1 : 0;
  if (live){
    const rt = reduce ? 0.55 : clock - INTRO * .85;
    const r = rallyAt(rt);
    drawShuttle(r.p, r.v);
    (r.p.y > 0 ? L.far : L.near).appendChild(shuttle);

    const sp = P(v3(r.p.x, r.p.y, 0)), se = P(v3(r.p.x + .22, r.p.y, 0)), sf = P(v3(r.p.x, r.p.y + .16, 0));
    const k = 1 / (1 + r.p.z * .45);
    shadow.setAttribute("cx", sp.x); shadow.setAttribute("cy", sp.y);
    shadow.setAttribute("rx", Math.abs(se.x - sp.x) * (1.2 - k * .4) + 2); shadow.setAttribute("ry", Math.abs(sf.y - sp.y) * (1.2 - k * .4) + 1);
    shadow.setAttribute("opacity", (.08 + .22 * k).toFixed(2));

    if (!paused){ history.push(r.p); if (history.length > 9) history.shift(); }
    if (r.hold) history = [];
    trail.setAttribute("points", history.map(P).map(q => q.x.toFixed(1) + "," + q.y.toFixed(1)).join(" "));
    (r.p.y > 0 ? L.far : L.near).insertBefore(trail, shuttle);

    if (r.i !== lastShot && !r.hold){
      lastShot = r.i;
      const hp = P(SHOTS[r.i].a);
      ring.setAttribute("cx", hp.x); ring.setAttribute("cy", hp.y);
      ring.animate([{ transform: "scale(.2)", opacity: .9 }, { transform: "scale(1.2)", opacity: 0 }], { duration: 380 / speed, easing: "ease-out" });
    }
  }
  if (!reduce) requestAnimationFrame(frame);
}

LINES.forEach(l => requestAnimationFrame(() => l.el.style.opacity = 1));
requestAnimationFrame(frame);

}
