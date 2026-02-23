export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  const p = 0.3;
  return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

const activeTweens = [];

export function tween(obj, props, duration = 500, easeFn = easeOutCubic) {
  return new Promise((resolve) => {
    const start = {};
    const target = {};
    for (const key of Object.keys(props)) {
      start[key] = obj[key];
      target[key] = props[key];
    }
    const startTime = performance.now();
    const tw = { obj, start, target, duration, easeFn, startTime, resolve, done: false };
    activeTweens.push(tw);
  });
}

export function updateTweens() {
  const now = performance.now();
  for (let i = activeTweens.length - 1; i >= 0; i--) {
    const tw = activeTweens[i];
    let t = (now - tw.startTime) / tw.duration;
    if (t >= 1) {
      t = 1;
      tw.done = true;
    }
    const eased = tw.easeFn(t);
    for (const key of Object.keys(tw.target)) {
      tw.obj[key] = lerp(tw.start[key], tw.target[key], eased);
    }
    if (tw.done) {
      activeTweens.splice(i, 1);
      tw.resolve();
    }
  }
}
