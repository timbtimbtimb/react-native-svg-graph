export default function svgCoords2SvgLineCoords(svgCoords: [number, number][]) {
  if (svgCoords.length < 2) return '';

  let d = `M ${svgCoords[0]?.[0]} ${svgCoords[0]?.[1]}`;

  for (let i = 0; i < svgCoords.length - 1; i++) {
    const [p0x, p0y] = svgCoords[i - 1] || (svgCoords[i] as [number, number]);
    const [p1x, p1y] = svgCoords[i] as [number, number];
    const [p2x, p2y] = svgCoords[i + 1] as [number, number];
    const [p3x, p3y] =
      svgCoords[i + 2] || (svgCoords[i + 1] as [number, number]);

    const cp1x = p1x + (p2x - p0x) / 6;
    const cp1y = p1y + (p2y - p0y) / 6;
    const cp2x = p2x - (p3x - p1x) / 6;
    const cp2y = p2y - (p3y - p1y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2x} ${p2y}`;
  }

  return d;
}
