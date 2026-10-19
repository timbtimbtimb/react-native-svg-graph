export type Bounds = ReturnType<typeof getBounds>;

// `yDomain`, when given, is the vertical range itself rather than the data's:
// what falls outside it is clipped by `Lines`.
export default function getBounds(
  values: [number, number][],
  zeroVisible: boolean,
  yDomain?: [number, number]
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
  const minValueY =
    yDomain?.[0] ?? Math.min(...values.map(([_, y]) => y as number));
  const maxValueY =
    yDomain?.[1] ?? Math.max(...values.map(([_, y]) => y as number));

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
