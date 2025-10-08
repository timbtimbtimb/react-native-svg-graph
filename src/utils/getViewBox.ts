export type ViewBox = [number, number, number, number];

export default function getViewBox(width: number, height: number): ViewBox {
  const viewBox: [number, number, number, number] = [0, -300, width, height];
  return viewBox;
}
