// Draw/match logic:
// - A draw has 5 numbers between 1..45 (can tweak later).
// - A user "participates" by having scores; for now we map their last score value to a "ticket" number.
// - Match types: 3, 4, 5 matches (of the 5 draw numbers).

export function randomInt(min, maxInclusive) {
  return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
}

export function generateDrawNumbers({ count = 5, min = 1, max = 45 } = {}) {
  const set = new Set();
  while (set.size < count) set.add(randomInt(min, max));
  return Array.from(set).sort((a, b) => a - b);
}

export function countMatches(drawNumbers, userNumbers) {
  const drawSet = new Set(drawNumbers);
  let matches = 0;
  for (const n of userNumbers) if (drawSet.has(n)) matches += 1;
  return matches;
}

