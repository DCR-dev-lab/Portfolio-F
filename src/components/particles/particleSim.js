/**
 * particleSim — the brain of the particle stage (pure JS, no DOM, no WebGL).
 *
 * ONE pool of particles is the "atmosphere". Most of the time they drift as dust.
 * When a heading comes on screen, it RECRUITS particles from the dust (from all over the
 * screen, each with its own delay and curved path); when the heading leaves, it RELEASES
 * them back into the dust. Nothing waits in a box, nothing is hard-switched.
 *
 * Owned particles live in DOCUMENT coordinates (so page scrolling can't make them lag);
 * dust lives in SCREEN coordinates (so it can have its own parallax).
 */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (x) => x * x * (3 - 2 * x);

export const createSim = ({ P, W, H, reduced = false, rand = Math.random }) => {
  const px = new Float32Array(P), py = new Float32Array(P), pz = new Float32Array(P);
  const vx = new Float32Array(P), vy = new Float32Array(P), vz = new Float32Array(P);
  const own = new Int16Array(P).fill(-1);
  const slot = new Int32Array(P);
  const tRec = new Float32Array(P), dly = new Float32Array(P), dur = new Float32Array(P);
  const sw = new Int8Array(P);
  const ph = new Float32Array(P), par = new Float32Array(P);
  const dustR = new Float32Array(P), szv = new Float32Array(P);
  const szCur = new Float32Array(P), alCur = new Float32Array(P);
  const col = new Uint8Array(P);
  const free = new Int32Array(P);
  let freeCount = P;

  const pos = new Float32Array(P * 3); // what the GPU draws: x, y(screen), z

  for (let i = 0; i < P; i++) {
    px[i] = rand() * W;
    py[i] = rand() * H;
    ph[i] = rand() * TAU;
    par[i] = 0.05 + rand() * 0.3;
    dustR[i] = 0.6 + rand() * 0.9;
    szv[i] = 0.75 + rand() * 0.5;
    szCur[i] = dustR[i];
    alCur[i] = 0.2;
    const r = rand();
    col[i] = r < 0.9 ? 0 : r < 0.97 ? 1 : 2;
    free[i] = i;
  }

  const owners = [];
  const ownerIdxFree = [];
  const states = new Map();
  let t = 0;
  let scrollY = 0;
  let lastScroll = null;
  let scrollVel = 0;
  let w = W;
  let h = H;

  /* ---------- ownership ---------- */
  const makeState = (hd) => {
    const idx = ownerIdxFree.length ? ownerIdxFree.pop() : owners.length;
    const s = {
      id: hd.id, key: hd.key, N: hd.N, idx, hd,
      want: false, pendR: 0, pendX: 0,
      introDone: false,
      win: 0.45, dlyMax: 0.25, durMin: 1.0, durVar: 0.9, // how spread-out / how long a gather is
      slotState: new Uint8Array(hd.N), // 0 idle, 1 waiting to be recruited, 2 owned, 3 waiting to be released
      slotPart: new Int32Array(hd.N).fill(-1),
      slotAt: new Float32Array(hd.N),
    };
    owners[idx] = s;
    states.set(hd.id, s);
    return s;
  };

  const recruit = (s, k) => {
    if (freeCount === 0) return;
    const j = Math.floor(rand() * freeCount);
    const i = free[j];
    free[j] = free[--freeCount];
    own[i] = s.idx;
    slot[i] = k;
    tRec[i] = t;
    dly[i] = reduced ? 0 : rand() * s.dlyMax;
    dur[i] = s.durMin + rand() * s.durVar;
    sw[i] = rand() < 0.5 ? -1 : 1;
    py[i] += scrollY; // screen -> document coordinates (position stays continuous)
    vy[i] += scrollVel; // ...and so does its on-screen motion
    s.slotPart[k] = i;
    s.slotState[k] = 2;
    s.pendR--;
  };

  const release = (s, k) => {
    const i = s.slotPart[k];
    if (i >= 0) {
      own[i] = -1;
      py[i] -= scrollY; // document -> screen coordinates
      vy[i] -= scrollVel; // keep drifting away with the page instead of freezing in place
      vx[i] += (rand() - 0.5) * 420; // and diffuse, so the word dissolves instead of lingering as a ghost
      vy[i] += (rand() - 0.5) * 420;
      vz[i] += (rand() - 0.5) * 300;
      free[freeCount++] = i;
    }
    s.slotPart[k] = -1;
    s.slotState[k] = 0;
  };

  const releaseAll = (s) => {
    for (let k = 0; k < s.N; k++) if (s.slotState[k] === 2 || s.slotState[k] === 3) release(s, k);
    s.slotState.fill(0);
    s.pendR = s.pendX = 0;
  };

  const removeState = (s) => {
    releaseAll(s);
    owners[s.idx] = null;
    ownerIdxFree.push(s.idx);
    states.delete(s.id);
  };

  const setWant = (s, want) => {
    s.want = want;
    if (want) {
      // the very first gather of an `intro` heading (the hero name) is slower and more dramatic
      const big = !!s.hd.intro && !s.introDone;
      s.introDone = s.introDone || big;
      s.win = big ? 0.8 : 0.45;
      s.dlyMax = big ? 0.4 : 0.25;
      s.durMin = big ? 1.4 : 1.0;
      s.durVar = big ? 1.2 : 0.9;
    }
    for (let k = 0; k < s.N; k++) {
      const st = s.slotState[k];
      if (want) {
        if (st === 0) {
          s.slotState[k] = 1;
          s.slotAt[k] = t + (reduced ? 0 : rand() * s.win);
          s.pendR++;
        } else if (st === 3) {
          s.slotState[k] = 2;
          s.pendX--;
        }
      } else if (st === 2) {
        s.slotState[k] = 3;
        s.slotAt[k] = t + (reduced ? 0 : rand() * 0.3);
        s.pendX++;
      } else if (st === 1) {
        s.slotState[k] = 0;
        s.pendR--;
      }
    }
  };

  /* ---------- one frame ---------- */
  const step = (dt, scroll, list, ptr) => {
    t += dt;
    const dScroll = lastScroll === null ? 0 : scroll - lastScroll;
    lastScroll = scroll;
    scrollY = scroll;
    if (dt > 0) scrollVel += (clamp(dScroll / dt, -4000, 4000) - scrollVel) * Math.min(1, dt * 12);

    // 1) headings: create / update / switch on and off (with hysteresis)
    const seen = new Set();
    for (const hd of list) {
      seen.add(hd.id);
      let s = states.get(hd.id);
      if (s && s.key !== hd.key) {
        removeState(s);
        s = null;
      }
      if (!s) s = makeState(hd);
      s.hd = hd;
      const r = hd.rect;
      let want = s.want;
      if (!want) {
        if (r.top < 0.88 * h && r.bottom > 0.28 * h) want = true;
      } else if (r.top > 0.97 * h || r.bottom < 0.18 * h) {
        want = false;
      }
      if (want !== s.want) setWant(s, want);

      if (s.pendR > 0)
        for (let k = 0; k < s.N; k++) if (s.slotState[k] === 1 && t >= s.slotAt[k]) recruit(s, k);
      if (s.pendX > 0)
        for (let k = 0; k < s.N; k++)
          if (s.slotState[k] === 3 && t >= s.slotAt[k]) {
            release(s, k);
            s.pendX--;
          }
    }
    for (const s of [...states.values()]) if (!seen.has(s.id)) removeState(s);

    // 2) particles
    const dustA = clamp(2200 / Math.max(freeCount, 1), 0.07, 0.45);
    const mx = ptr.x;
    const my = ptr.y;
    const grow = Math.min(1, dt * 8);

    for (let i = 0; i < P; i++) {
      const o = own[i];
      let wantSz;
      let wantAl;

      if (o < 0) {
        /* ----- dust (screen space) ----- */
        if (!reduced) {
          let fx = (Math.sin(t * 0.2 + ph[i]) * 8 - vx[i]) * 1.2;
          let fy = (Math.cos(t * 0.17 + ph[i] * 1.3) * 5 - vy[i]) * 1.2;
          const dx = px[i] - mx;
          const dy = py[i] - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < 12100) {
            const d = Math.sqrt(d2) + 1e-3;
            const f = (1 - d / 110) ** 2 * 2200;
            fx += (dx / d) * f;
            fy += (dy / d) * f;
          }
          vx[i] += fx * dt;
          vy[i] += fy * dt;
          vz[i] += (-pz[i] * 3 - vz[i] * 2) * dt;
          px[i] += vx[i] * dt;
          py[i] += vy[i] * dt - dScroll * par[i]; // parallax
          pz[i] += vz[i] * dt;
          if (px[i] < -30) { px[i] += w + 60; alCur[i] = 0; }
          else if (px[i] > w + 30) { px[i] -= w + 60; alCur[i] = 0; }
          if (py[i] < -30) { py[i] += h + 60; alCur[i] = 0; }
          else if (py[i] > h + 30) { py[i] -= h + 60; alCur[i] = 0; }
        }
        wantSz = dustR[i];
        wantAl = dustA;
        pos[i * 3] = px[i];
        pos[i * 3 + 1] = py[i];
        pos[i * 3 + 2] = pz[i];
      } else {
        /* ----- part of a heading (document space) ----- */
        const s = owners[o];
        const hd = s.hd;
        const k = slot[i];
        const r = hd.rect;
        const tx = r.left + r.width * 0.5 + hd.lx[k];
        const ty = r.top + scrollY + r.height * 0.5 + hd.ly[k];
        const tz = hd.lz[k];
        const a = t - tRec[i] - dly[i];
        const rp = reduced ? 1 : a <= 0 ? 0 : smooth(Math.min(1, a / dur[i]));

        if (reduced) {
          px[i] = tx;
          py[i] = ty;
          pz[i] = tz;
          vx[i] = vy[i] = vz[i] = 0;
        } else {
          const kk = 0.8 + 20 * rp * rp; // weak pull while far away, firm when close
          const damp = 1.8 * Math.sqrt(kk) + 0.6; // ~critically damped: arrives without bouncing
          const dx = tx + Math.sin(t * 0.9 + ph[i]) * 0.5 - px[i];
          const dy = ty + Math.cos(t * 0.8 + ph[i] * 1.3) * 0.5 - py[i];
          let ax = dx * kk - vx[i] * damp;
          let ay = dy * kk - vy[i] * damp;
          let az = (tz - pz[i]) * kk - vz[i] * damp;

          if (rp < 1) {
            // curve the path while travelling, so particles swirl in instead of flying straight
            const dist = Math.hypot(dx, dy) + 1;
            const m = sw[i] * (1 - rp) * Math.min(dist, 600) * 0.45;
            ax += (-dy / dist) * m;
            ay += (dx / dist) * m;
          }

          const sx = px[i] - mx;
          const sy = py[i] - scrollY - my;
          const d2 = sx * sx + sy * sy;
          if (d2 < 4900) {
            const d = Math.sqrt(d2) + 1e-3;
            const f = (1 - d / 70) ** 2 * 4200;
            ax += (sx / d) * f;
            ay += (sy / d) * f;
            az += f * 0.4;
          }

          vx[i] += ax * dt;
          vy[i] += ay * dt;
          vz[i] += az * dt;
          const v2 = vx[i] * vx[i] + vy[i] * vy[i];
          if (v2 > 3240000) {
            const sc = 1800 / Math.sqrt(v2);
            vx[i] *= sc;
            vy[i] *= sc;
          }
          px[i] += vx[i] * dt;
          py[i] += vy[i] * dt;
          pz[i] = clamp(pz[i] + vz[i] * dt, -650, 650);
        }
        wantSz = dustR[i] + (hd.dotR * szv[i] - dustR[i]) * rp;
        wantAl = dustA + (0.92 - dustA) * rp;
        pos[i * 3] = px[i];
        pos[i * 3 + 1] = py[i] - scrollY;
        pos[i * 3 + 2] = pz[i];
      }

      szCur[i] += (wantSz - szCur[i]) * grow;
      alCur[i] += (wantAl - alCur[i]) * grow;
    }
  };

  /* ---------- interactions + helpers ---------- */
  const shatter = (id, cx, cy) => {
    const s = states.get(id);
    if (!s) return;
    for (let k = 0; k < s.N; k++) {
      if (s.slotState[k] !== 2) continue;
      const i = s.slotPart[k];
      const dx = px[i] - cx;
      const dy = py[i] - (cy + scrollY);
      const len = Math.hypot(dx, dy) + 1;
      const sp = 260 + rand() * 620;
      vx[i] += (dx / len) * sp + (rand() - 0.5) * 160;
      vy[i] += (dy / len) * sp + (rand() - 0.5) * 160;
      vz[i] += (rand() - 0.3) * 500;
      tRec[i] = t; // restart the ramp: weak pull first, then it slowly re-forms
      dly[i] = 0;
      dur[i] = 3.8 + rand() * 1.6;
    }
  };

  const stats = (id) => {
    const s = states.get(id);
    if (!s) return { owned: 0, meanErr: 0, want: false };
    let owned = 0;
    let err = 0;
    for (let k = 0; k < s.N; k++) {
      if (s.slotState[k] !== 2) continue;
      const i = s.slotPart[k];
      const r = s.hd.rect;
      const tx = r.left + r.width * 0.5 + s.hd.lx[k];
      const ty = r.top + scrollY + r.height * 0.5 + s.hd.ly[k];
      err += Math.hypot(tx - px[i], ty - py[i]);
      owned++;
    }
    return { owned, meanErr: owned ? err / owned : 0, want: s.want, free: freeCount };
  };

  const isOn = (id) => !!states.get(id)?.want;
  const resize = (nw, nh) => { w = nw; h = nh; };

  return { pos, size: szCur, alpha: alCur, col, step, shatter, stats, isOn, resize };
};
