export const FRAC_COLORS = {
  a: '#F7B84B',       // Warm mustard yellow (--primary-plus)
  b: '#8FC1E3',       // Calm desaturated blue (--primary-minus)
  result: '#89E894',  // Soft green (--badge-bg)
  remove: '#F8A1A4',  // Soft coral/rose
  purple: '#C9B1EE',  // Soft lavender for equivalent comparison
  empty: '#FDFBF7',   // Cream background
  ink: '#0F0F0F',     // Crisp black ink
};

export function gcd(a, b) {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a * b) / gcd(a, b));
}

export function simplify(n, d) {
  if (d === 0) return { n: 0, d: 1, factor: 1 };
  const sign = d < 0 ? -1 : 1;
  const num = n * sign;
  const den = Math.abs(d);
  if (num === 0) return { n: 0, d: 1, factor: den };
  const g = gcd(num, den);
  return { n: num / g, d: den / g, factor: g };
}

export function toMixed(n, d) {
  if (d <= 0) return { whole: 0, rem: 0, d: 1 };
  const absN = Math.abs(n);
  const whole = Math.floor(absN / d);
  const rem = absN % d;
  return { whole, rem, d, negative: n < 0 };
}

export function classifyFraction(n, d) {
  if (n === 0) return { type: 'zero', label: 'Zero' };
  if (n % d === 0) return { type: 'apparente', label: 'Apparente (intero)' };
  if (n < d) return { type: 'propria', label: 'Propria (< 1)' };
  return { type: 'impropria', label: 'Impropria (> 1)' };
}

export function addFractions(a, b) {
  const commonDen = lcm(a.d, b.d);
  const mulA = commonDen / a.d;
  const mulB = commonDen / b.d;
  const aScaled = a.n * mulA;
  const bScaled = b.n * mulB;
  const rawN = aScaled + bScaled;
  const simplified = simplify(rawN, commonDen);
  return {
    commonDen,
    mulA,
    mulB,
    aScaled,
    bScaled,
    raw: { n: rawN, d: commonDen },
    simplified,
    mixed: toMixed(simplified.n, simplified.d),
  };
}

export function subFractions(a, b) {
  const commonDen = lcm(a.d, b.d);
  const mulA = commonDen / a.d;
  const mulB = commonDen / b.d;
  const aScaled = a.n * mulA;
  const bScaled = b.n * mulB;
  const rawN = aScaled - bScaled;
  const simplified = simplify(rawN, commonDen);
  return {
    commonDen,
    mulA,
    mulB,
    aScaled,
    bScaled,
    isNegative: rawN < 0,
    raw: { n: rawN, d: commonDen },
    simplified,
    mixed: toMixed(simplified.n, simplified.d),
  };
}

export function mulFractions(a, b) {
  const rawN = a.n * b.n;
  const rawD = a.d * b.d;
  const simplified = simplify(rawN, rawD);
  return {
    raw: { n: rawN, d: rawD },
    simplified,
    mixed: toMixed(simplified.n, simplified.d),
  };
}

export function divFractions(a, b) {
  const commonDen = lcm(a.d, b.d);
  const aScaled = a.n * (commonDen / a.d);
  const bScaled = b.n * (commonDen / b.d);
  const rawN = a.n * b.d;
  const rawD = a.d * b.n;
  const simplified = simplify(rawN, rawD);
  return {
    commonDen,
    aScaled,
    bScaled,
    reciprocal: { n: b.d, d: b.n },
    raw: { n: rawN, d: rawD },
    simplified,
    mixed: toMixed(simplified.n, simplified.d),
  };
}

const DENOMINATOR_NAMES_SG = {
  1: 'intero',
  2: 'mezzo',
  3: 'terzo',
  4: 'quarto',
  5: 'quinto',
  6: 'sesto',
  7: 'settimo',
  8: 'ottavo',
  9: 'nono',
  10: 'decimo',
  11: 'undicesimo',
  12: 'dodicesimo',
};

const DENOMINATOR_NAMES_PL = {
  1: 'interi',
  2: 'mezzi',
  3: 'terzi',
  4: 'quarti',
  5: 'quinti',
  6: 'sesti',
  7: 'settimi',
  8: 'ottavi',
  9: 'noni',
  10: 'decimi',
  11: 'undicesimi',
  12: 'dodicesimi',
};

export function readFractionItalian(n, d) {
  if (n === 0) return 'zero';
  const sg = DENOMINATOR_NAMES_SG[d] || `${d}°`;
  const pl = DENOMINATOR_NAMES_PL[d] || `${d}esimi`;
  if (n === 1) return `un ${sg}`;
  return `${n} ${pl}`;
}
