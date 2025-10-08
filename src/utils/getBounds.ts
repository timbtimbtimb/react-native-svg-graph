export type Bounds = ReturnType<typeof getBounds>;

export default function getBounds(values: [number, number][]) {
  const minValueX = Math.min(...values.map(([x]) => x as number));
  const maxValueX = Math.max(...values.map(([x]) => x as number));
  const minValueY = Math.min(...values.map(([_, y]) => y as number));
  const maxValueY = Math.max(...values.map(([_, y]) => y as number));

  const zeroVisibleMinValueY = Math.min(minValueY, 0);
  const zeroVisibleMaxValueY = Math.max(maxValueY, 0);

  return {
    minValueX,
    maxValueX,
    minValueY,
    maxValueY,
    zeroVisibleMinValueY,
    zeroVisibleMaxValueY,
  };
}
