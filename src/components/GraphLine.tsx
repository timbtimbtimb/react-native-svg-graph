import {
  G,
  Path,
  Polygon,
  Mask,
  type LineProps,
  type PolygonProps,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { type Transformer } from '../utils/getTransformer';
import svgCoords2SvgLineCoords from '../utils/svgCoords2SvgLineCoords';
import { useId, type ReactElement } from 'react';
import type { Bounds } from '../utils/getBounds';
import type { ColorValue } from 'react-native';

export default function GraphLine({
  transformer,
  values,
  strokeWidth,
  bounds,
  positiveColor,
  negativeColor,
}: {
  transformer: Transformer;
  values: [number, number][];
  bounds: Bounds;
  positiveColor: ColorValue;
  negativeColor: ColorValue;
  fill?: PolygonProps['fill'];
  strokeWidth?: LineProps['strokeWidth'];
}): ReactElement {
  const uniqueId = useId();
  const line = svgCoords2SvgLineCoords(values.map(transformer));
  const loopedLine = svgCoords2SvgLineCoords(
    (
      [
        ...values,
        values.at(-1) ?? [0, 0],
        [bounds.maxValueX, values.at(-1)?.[1] ?? 0],
        [bounds.maxValueX, bounds.zeroVisibleMinValueY],
        [bounds.maxValueX, bounds.zeroVisibleMinValueY],
        [bounds.minValueX, bounds.zeroVisibleMinValueY],
        [bounds.minValueX, bounds.zeroVisibleMinValueY],
        values.at(0) ?? [0, 0],
      ] as [number, number][]
    ).map(transformer)
  );

  const negativeMaskValuePoints: [number, number][] = [
    [bounds.minValueX, 0],
    [bounds.maxValueX, 0],
    [bounds.maxValueX, bounds.zeroVisibleMinValueY * 2],
    [bounds.minValueX, bounds.zeroVisibleMinValueY * 2],
  ];

  const negativeMaskSvgCoords = negativeMaskValuePoints
    .map(transformer)
    .map((point) => point.join(','))
    .join(' ');

  const positiveMaskValuePoints: [number, number][] = [
    [bounds.minValueX, 0],
    [bounds.maxValueX, 0],
    [bounds.maxValueX, bounds.zeroVisibleMaxValueY * 2],
    [bounds.minValueX, bounds.zeroVisibleMaxValueY * 2],
  ];

  const positiveMaskSvgCoords = positiveMaskValuePoints
    .map(transformer)
    .map((point) => point.join(','))
    .join(' ');

  return (
    <G>
      <Defs>
        <LinearGradient
          id={`positive-gradient-${uniqueId}`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <Stop offset="0" stopColor={positiveColor} stopOpacity={0.2} />
          <Stop offset="1" stopColor={positiveColor} stopOpacity={0.05} />
        </LinearGradient>
        <LinearGradient
          id={`negative-gradient-${uniqueId}`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <Stop offset="0" stopColor={negativeColor} stopOpacity={0.2} />
          <Stop offset="1" stopColor={negativeColor} stopOpacity={0.05} />
        </LinearGradient>
      </Defs>
      <Mask id={`negative-mask-${uniqueId}`}>
        <Polygon points={negativeMaskSvgCoords} fill={'white'} />
      </Mask>
      <Mask id={`positive-mask-${uniqueId}`}>
        <Polygon points={positiveMaskSvgCoords} fill={'white'} />
      </Mask>
      <Path
        d={line}
        stroke={positiveColor}
        strokeWidth={strokeWidth ?? 2}
        fill="none"
      />
      <G mask={`url(#positive-mask-${uniqueId})`}>
        <Path d={loopedLine} fill={`url(#positive-gradient-${uniqueId})`} />
      </G>
      <G mask={`url(#negative-mask-${uniqueId})`}>
        <Path
          d={line}
          stroke={negativeColor}
          strokeWidth={strokeWidth ?? 2}
          fill="none"
        />
        <Path d={loopedLine} fill={`url(#negative-gradient-${uniqueId})`} />
      </G>
    </G>
  );
}
