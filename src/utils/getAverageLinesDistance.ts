import type { Line } from '../components/Grids';

export default function getAverageLinesDistance(
  lines: Line[],
  axis: 'x' | 'y'
) {
  const dist = Math.abs(
    lines.reduce<number>((acc, _, i, arr) => {
      if (i === 0) return 0;
      const v =
        axis === 'x'
          ? (arr[i]?.textX ?? 0) - (arr[i - 1]?.textX ?? 0)
          : (arr[i]?.textY ?? 0) - (arr[i - 1]?.textY ?? 0);
      return acc + v;
    }, 0) / lines.length
  );

  return dist;
}
