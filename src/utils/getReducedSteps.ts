import type { Line } from '../components/Grid';

const defaultSteps = [
  0.001, 0.01, 0.1, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 10000, 100000,
  1000000, 10000000,
];

export default function getReducedSteps(
  lines: Line[],
  reduceBy: number,
  axis: 'x' | 'y',
  steps?: number[]
) {
  const targetLength = lines.length * reduceBy;

  const reducedSteps = (steps ?? defaultSteps)
    .map((step) => {
      return lines.filter((line) => line[axis] % step === 0);
    })
    .filter((s) => {
      return s.length < targetLength;
    })
    .sort((a, b) => b.length - a.length)
    .at(0);

  return reducedSteps;
}
