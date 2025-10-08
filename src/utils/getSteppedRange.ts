export default function getSteppedRange(
  min: number,
  max: number,
  grid: number = 100,
  addMin: boolean = true,
  addMax: boolean = true
): number[] {
  const start = Math.ceil(min / grid) * grid;
  const end = Math.ceil(max / grid) * grid;
  const length = (end - start) / grid + 1;

  if (length > 100000000) return [];

  const range = Array.from({ length }).reduce<number[]>((acc, _, i) => {
    acc.push(start + i * grid);
    return acc;
  }, []);

  if (!range.includes(min) && addMin) range.push(min);
  if (!range.includes(max) && addMax) range.push(max);

  return [...new Set(range)]
    .sort((a, b) => a - b)
    .filter((i) => i >= min && i <= max);
}
