const steps = [
  0.001, 0.01, 0.1, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 10000, 100000,
  1000000, 10000000,
];

export default function getSteppedRange(
  minValue: number,
  maxValue: number,
  availableRange: number,
  addMin: boolean = true,
  addMax: boolean = true
): number[] {
  const length = Math.floor(availableRange);
  if (length > 100000000) return [];

  const rawGrid = (maxValue - minValue) / length;

  const grid = steps
    .filter((step) => step >= rawGrid)
    .reduce(
      (prev, curr) =>
        Math.abs(curr - rawGrid) < Math.abs(prev - rawGrid) ? curr : prev,
      Infinity
    );

  const start = Math.ceil(minValue / grid) * grid;

  const range = Array.from({ length }).reduce<number[]>((acc, _, i) => {
    acc.push(start + i * grid);
    return acc;
  }, []);

  if (!range.includes(minValue) && addMin) range.push(minValue);
  if (!range.includes(maxValue) && addMax) range.push(maxValue);

  return [...new Set(range)]
    .sort((a, b) => a - b)
    .filter((i) => i >= minValue && i <= maxValue);
}
