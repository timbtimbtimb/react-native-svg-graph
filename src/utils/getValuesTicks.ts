export default function getValuesTicks(
  min: number,
  max: number,
  axis: 'x' | 'y'
): [number, number][] {
  return Array.from(
    {
      length: Math.ceil(max - min),
    },
    (_, i) => {
      return axis === 'x' ? [Math.ceil(min) + i, 0] : [0, Math.ceil(min) + i];
    }
  );
}
