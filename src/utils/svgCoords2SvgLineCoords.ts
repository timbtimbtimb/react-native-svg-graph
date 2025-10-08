export default function svgCoords2SvgLineCoords(svgCoords: [number, number][]) {
  return svgCoords
    .map(([x, y], index) => {
      if (index === 0) return ['M', x, y].join(' ');
      else return ['L', x, y].join(' ');
    })
    .join(' ');
}
