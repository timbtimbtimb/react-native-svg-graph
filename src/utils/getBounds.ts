export type Bounds = ReturnType<typeof getBounds>;

export default function getBounds(
  values: [number, number][],
  zeroVisible: boolean
) {
  if (values.length === 0) {
    return {
      minValueX: 0,
      maxValueX: 0,
      minValueY: 0,
      maxValueY: 0,
      zeroVisibleMinValueY: 0,
      zeroVisibleMaxValueY: 0,
    };
  }

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
    zeroVisibleMinValueY: zeroVisible ? zeroVisibleMinValueY : minValueY,
    zeroVisibleMaxValueY: zeroVisible ? zeroVisibleMaxValueY : maxValueY,
  };
}
