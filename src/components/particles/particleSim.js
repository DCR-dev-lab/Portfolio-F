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

/**
 * HOW SECTION TITLES GATHER (the hero's first entry has its own, slower timing below).
 * Pick a preset with PACE, or edit the numbers:
 *   win/dlyMax  how spread-out the start is (bigger = more staggered, more visible stream)
 *   durMin/Var  how long each particle takes to commit to its spot
 *   kBase       pull while still far away (smaller = lazier, more swirl, longer flight)
 *   kGain       extra pull when close (keeps the final settle firm and bounce-free)
 *   nearK       1 = dust from anywhere on screen (long dramatic flights), higher = nearer dust (shorter)
 *   startAt     begins gathering when the title is this many screen-heights below the top
 */
const PRESETS = {
  calm: {
    win: 0.7,
    dlyMax: 0.4,
    durMin: 1.1,
    durVar: 0.9,
    kBase: 2.0,
    kGain: 18,
    nearK: 1,
    startAt: 0.98,
    releaseAt: 1.06,
  },
  balanced: {
    win: 0.45,
    dlyMax: 0.25,
    durMin: 0.8,
    durVar: 0.6,
    kBase: 4.0,
    kGain: 18,
    nearK: 2,
    startAt: 0.98,
    releaseAt: 1.06,
  },
  snappy: {
    win: 0.25,
    dlyMax: 0.15,
    durMin: 0.4,
    durVar: 0.35,
    kBase: 12,
    kGain: 18,
    nearK: 12,
    startAt: 1.0,
    releaseAt: 1.08,
  },
};
const PACE = "balanced";
const G = PRESETS[PACE];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (x) => x * x * (3 - 2 * x);

/**
 * Turn a size-independent sample ("base": the glyph points inside the text bitmap) into positions for
 * the heading's CURRENT box. Resizing the window only re-runs this: the same particle keeps the same
 * point on the same letter and simply slides to the scaled spot (no re-shuffle, no re-gather).
 */
export const layoutFromBase = (b, boxW, boxH, align) => {
  const pxScale = Math.min((boxW * 0.96) / b.cw, (boxH * 0.96) / b.ch);
  const tW = b.cw * pxScale;
  const ox = align === "left" ? -boxW / 2 + tW / 2 - 20 * pxScale : 0;
  const N = b.N;
  const lx = new Float32Array(N);
  const ly = new Float32Array(N);
  for (let k = 0; k < N; k++) {
    lx[k] = ox + (b.gx[k] - b.cw / 2) * pxScale;
    ly[k] = (b.gy[k] - b.ch / 2) * pxScale;
  }
  return {
    lx,
    ly,
    dotR: clamp(Math.sqrt((b.area * pxScale * pxScale) / N) * 0.72, 0.8, 2.6),
  };
};

export const createSim = ({ P, W, H, reduced = false, rand = Math.random }) => {
  const px = new Float32Array(P),
    py = new Float32Array(P),
    pz = new Float32Array(P);
  const vx = new Float32Array(P),
    vy = new Float32Array(P),
    vz = new Float32Array(P);
  const own = new Int16Array(P).fill(-1);
  const slot = new Int32Array(P);
  const age = new Float32Array(P),
    dur = new Float32Array(P); // age < 0 = still waiting its turn
  const relT = new Float32Array(P); // > 0: just released from a heading, fading out before returning as dust elsewhere
  const sw = new Int8Array(P);
  const ph = new Float32Array(P),
    par = new Float32Array(P);
  const dustR = new Float32Array(P),
    szv = new Float32Array(P);
  const szCur = new Float32Array(P),
    alCur = new Float32Array(P);
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
      id: hd.id,
      key: hd.key,
      N: hd.N,
      idx,
      hd,
      want: false,
      pendR: 0,
      pendX: 0,
      introDone: false,
      win: G.win,
      dlyMax: G.dlyMax,
      durMin: G.durMin,
      durVar: G.durVar, // how spread-out / how long a gather is
      kBase: G.kBase,
      kGain: G.kGain,
      nearK: G.nearK, // spring: starting pull, extra pull when close; dust candidates compared
      slotState: new Uint8Array(hd.N), // 0 idle, 1 waiting to be recruited, 2 owned, 3 waiting to be released
      slotPart: new Int32Array(hd.N).fill(-1),
      slotAt: new Float32Array(hd.N),
    };
    owners[idx] = s;
    states.set(hd.id, s);
    return s;
  };

  // the same heading now needs a different number of points: grow or shrink its slots in place
  const resizeState = (s, N) => {
    const old = s.N;
    if (N === old) return;
    if (N < old) {
      for (let k = N; k < old; k++) {
        const st = s.slotState[k];
        if (st === 1) s.pendR--;
        else if (st === 2) release(s, k);
        else if (st === 3) {
          release(s, k);
          s.pendX--;
        }
      }
    }
    const keep = Math.min(old, N);
    const slotState = new Uint8Array(N);
    const slotPart = new Int32Array(N).fill(-1);
    const slotAt = new Float32Array(N);
    slotState.set(s.slotState.subarray(0, keep));
    slotPart.set(s.slotPart.subarray(0, keep));
    slotAt.set(s.slotAt.subarray(0, keep));
    s.slotState = slotState;
    s.slotPart = slotPart;
    s.slotAt = slotAt;
    s.N = N;
    if (s.want && N > old) {
      for (let k = old; k < N; k++) {
        s.slotState[k] = 1;
        s.slotAt[k] = t + (reduced ? 0 : rand() * s.win);
        s.pendR++;
      }
    }
  };

  const recruit = (s, k) => {
    if (freeCount === 0) return;
    let j = Math.floor(rand() * freeCount);
    if (s.nearK > 1) {
      // compare a few random dust particles and take the one closest to this slot's spot on screen
      const r = s.hd.rect;
      const gx = r.left + r.width * 0.5 + s.hd.lx[k];
      const gy = r.top + r.height * 0.5 + s.hd.ly[k];
      let best = Infinity;
      for (let c = 0; c < s.nearK; c++) {
        const jj = Math.floor(rand() * freeCount);
        const ii = free[jj];
        if (relT[ii] > 0) continue;
        const d = (px[ii] - gx) * (px[ii] - gx) + (py[ii] - gy) * (py[ii] - gy);
        if (d < best) {
          best = d;
          j = jj;
        }
      }
    }
    const i = free[j];
    free[j] = free[--freeCount];
    own[i] = s.idx;
    relT[i] = 0;
    slot[i] = k;
    age[i] = -(reduced ? 0 : rand() * s.dlyMax);
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
      relT[i] = 0.7 + rand() * 0.5; // dissolve: fade out first, then come back as dust elsewhere
      free[freeCount++] = i;
    }
    s.slotPart[k] = -1;
    s.slotState[k] = 0;
  };

  const releaseAll = (s) => {
    for (let k = 0; k < s.N; k++)
      if (s.slotState[k] === 2 || s.slotState[k] === 3) release(s, k);
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
      s.win = big ? 0.8 : G.win;
      s.dlyMax = big ? 0.4 : G.dlyMax;
      s.durMin = big ? 1.4 : G.durMin;
      s.durVar = big ? 1.2 : G.durVar;
      s.kBase = big ? 0.8 : G.kBase;
      s.kGain = big ? 20 : G.kGain;
      s.nearK = big ? 1 : G.nearK; // intro: dust from all over the screen
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
    if (dt > 0)
      scrollVel +=
        (clamp(dScroll / dt, -4000, 4000) - scrollVel) * Math.min(1, dt * 12);

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
      else if (s.N !== hd.N) resizeState(s, hd.N);
      s.hd = hd;
      const r = hd.rect;
      let want = s.want;
      if (!want) {
        if (r.top < (G.startAt ?? 0.98) * h && r.bottom > 0.02 * h) want = true;
      } else if (r.top > (G.releaseAt ?? 1.06) * h || r.bottom < -0.05 * h) {
        want = false;
      }
      if (want !== s.want) setWant(s, want);

      if (s.pendR > 0)
        for (let k = 0; k < s.N; k++)
          if (s.slotState[k] === 1 && t >= s.slotAt[k]) recruit(s, k);
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
    // scrolling fast? gather faster (up to ~2.6x) so titles still arrive in time; lingering = slow and cinematic
    const gatherBoost = 1 + clamp(Math.abs(scrollVel) / 800, 0, 1) * 1.6;

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
          if (px[i] < -30) {
            px[i] += w + 60;
            alCur[i] = 0;
          } else if (px[i] > w + 30) {
            px[i] -= w + 60;
            alCur[i] = 0;
          }
          if (py[i] < -30) {
            py[i] += h + 60;
            alCur[i] = 0;
          } else if (py[i] > h + 30) {
            py[i] -= h + 60;
            alCur[i] = 0;
          }
        }
        wantSz = dustR[i];
        wantAl = dustA;
        if (relT[i] > 0) {
          wantAl = 0;
          relT[i] -= dt;
          if (relT[i] <= 0) {
            // vanished where it was; now it drifts back in somewhere else on screen
            px[i] = rand() * w;
            py[i] = rand() * h;
            pz[i] = 0;
            vx[i] = vy[i] = vz[i] = 0;
            alCur[i] = 0;
            szCur[i] = dustR[i];
          }
        }
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
        const a = age[i];
        const rp = reduced ? 1 : a <= 0 ? 0 : smooth(Math.min(1, a / dur[i]));
        const dtE = rp < 1 ? dt * gatherBoost : dt;
        age[i] += dtE;

        if (reduced) {
          px[i] = tx;
          py[i] = ty;
          pz[i] = tz;
          vx[i] = vy[i] = vz[i] = 0;
        } else {
          const kk = s.kBase + s.kGain * rp * rp; // pull while far away, firmer when close
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

          vx[i] += ax * dtE;
          vy[i] += ay * dtE;
          vz[i] += az * dtE;
          const v2 = vx[i] * vx[i] + vy[i] * vy[i];
          if (v2 > 3240000) {
            const sc = 1800 / Math.sqrt(v2);
            vx[i] *= sc;
            vy[i] *= sc;
          }
          px[i] += vx[i] * dtE;
          py[i] += vy[i] * dtE;
          pz[i] = clamp(pz[i] + vz[i] * dtE, -650, 650);
        }
        wantSz = dustR[i] + (hd.dotR * szv[i] - dustR[i]) * rp;
        const lit = a <= 0 ? 0 : smooth(Math.min(1, a / 0.4)); // bright almost immediately, so the flight is visible
        wantAl = dustA + (0.8 - dustA) * lit + 0.12 * rp;
        pos[i * 3] = px[i];
        pos[i * 3 + 1] = py[i] - scrollY;
        pos[i * 3 + 2] = pz[i];
      }

      szCur[i] += (wantSz - szCur[i]) * grow;
      // dust: fades in gently (2.2/s); a dissolving heading fades out visibly (3.5/s); otherwise 6/s; heading particles keep the fast rate
      const rate =
        o < 0
          ? Math.min(1, dt * (wantAl > alCur[i] ? 2.2 : relT[i] > 0 ? 3.5 : 6))
          : grow;
      alCur[i] += (wantAl - alCur[i]) * rate;
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
      age[i] = 0; // restart the ramp: weak pull first, then it slowly re-forms
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
    return {
      owned,
      meanErr: owned ? err / owned : 0,
      want: s.want,
      free: freeCount,
    };
  };

  const isOn = (id) => !!states.get(id)?.want;

  /**
   * Affine Proportional Scaling on Resize:
   * Proportionally redistributes all ambient dust particles across the new viewport bounds.
   * Completely eliminates the black void/gap on the right side when widening the window
   * or rotating mobile screens from portrait to landscape.
   */
  const resize = (nw, nh) => {
    if (w > 0 && h > 0 && (nw !== w || nh !== h)) {
      const sx = nw / w;
      const sy = nh / h;
      for (let i = 0; i < P; i++) {
        // Only scale free ambient dust; owned heading particles stay anchored to their text slots
        if (own[i] < 0) {
          px[i] = clamp(px[i] * sx, 0, nw);
          py[i] = clamp(py[i] * sy, 0, nh);
        }
      }
    }
    w = nw;
    h = nh;
  };

  return {
    pos,
    size: szCur,
    alpha: alCur,
    col,
    step,
    shatter,
    stats,
    isOn,
    resize,
  };
};
