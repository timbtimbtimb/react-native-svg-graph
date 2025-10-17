export default function svgCoords2SvgLineCoords(
  svgCoords: [number, number][],
  smooth: boolean = false
) {
  if (svgCoords.length < 2) return '';

  if (!smooth) {
    let d = `M ${svgCoords[0]?.[0]} ${svgCoords[0]?.[1]}`;

    for (let i = 1; i < svgCoords.length; i++) {
      const [x, y] = svgCoords[i] as [number, number];
      d += ` L ${x} ${y}`;
    }

    return d;
  }

  let d = `M ${svgCoords[0]?.[0]} ${svgCoords[0]?.[1]}`;

  for (let i = 0; i < svgCoords.length - 1; i++) {
    const [p0x, p0y] = svgCoords[i - 1] || (svgCoords[i] as [number, number]);
    const [p1x, p1y] = svgCoords[i] as [number, number];
    const [p2x, p2y] = svgCoords[i + 1] as [number, number];
    const [p3x, p3y] =
      svgCoords[i + 2] || (svgCoords[i + 1] as [number, number]);

    const outFlat = p1y === p2y || p0y === p1y;
    const inFlat = p2y === p3y || p1y === p2y;

    const cp1x = p1x + (p2x - p0x) / 6;
    const cp1y = p1y + (p2y - p0y) / 6;
    const cp2x = p2x - (p3x - p1x) / 6;
    const cp2y = p2y - (p3y - p1y) / 6;

    const cp1x_ = p1x + (p2x - p1x) / 2;
    const cp1y_ = p1y;
    const cp2x_ = p1x + (p2x - p1x) / 2;
    const cp2y_ = p2y;

    const cp = [
      (outFlat ? [cp1x_, cp1y_] : [cp1x, cp1y]).join(' '),
      (inFlat ? [cp2x_, cp2y_] : [cp2x, cp2y]).join(' '),
      [p2x, p2y].join(' '),
    ].join(',');

    d += ` C ${cp}`;
  }

  return d;
}
