export default function svgCoords2SvgLineCoords(svgCoords: [number, number][]) {
  if (svgCoords.length < 2) return '';

  let d = `M ${(svgCoords[0] as [number, number])[0]} ${(svgCoords[0] as [number, number])[1]}`;

  for (let i = 1; i < svgCoords.length - 1; i++) {
    const [x0, y0] = svgCoords[i] as [number, number];
    const [x1, y1] = svgCoords[i + 1] as [number, number];
    const xc = (x0 + x1) / 2;
    const yc = (y0 + y1) / 2;

    d += ` Q ${x0} ${y0}, ${xc} ${yc}`;
  }

  const [xEnd, yEnd] = svgCoords[svgCoords.length - 1] as [number, number];
  d += ` T ${xEnd} ${yEnd}`;

  return d;
}
