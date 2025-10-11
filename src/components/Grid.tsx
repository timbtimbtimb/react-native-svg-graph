import type { ReactElement } from 'react';
import { G, Path, Text, type FontWeight } from 'react-native-svg';
import svgCoords2SvgLineCoords from '../utils/svgCoords2SvgLineCoords';
import type { Transformer } from '../utils/getTransformer';
import type { Bounds } from '../utils/getBounds';
import type { ColorValue } from 'react-native';
import type { ViewBox } from '../utils/getViewBox';
import getReducedSteps from '../utils/getReducedSteps';

export interface GridStyle {
  stroke: ColorValue;
  strokeWidth: number;
  fontSize: number;
  fontWeight: FontWeight;
}

export interface Line {
  d: string;
  textX: number;
  textY: number;
  text: string;
  x: number;
  y: number;
}

interface Props {
  values: [number, number][];
  strokeWidth?: number;
  bounds: Bounds;
  zeroVisible?: boolean;
  position: 'top' | 'bottom';
  axis: 'x' | 'y';
  viewBox: ViewBox;
  style: GridStyle;
  transformer: Transformer;
  formatter: (v: number) => string;
}

export default function Grid({
  values,
  axis,
  bounds,
  zeroVisible,
  position,
  viewBox,
  style,
  transformer,
  formatter,
}: Props): ReactElement {
  const alignmentBaseline =
    axis === 'x' && position === 'bottom' ? 'before-edge' : undefined;
  const textAnchor = axis === 'y' ? 'end' : undefined;
  const dx = axis === 'y' ? style.fontSize * -0.25 : 0;

  const rawLinesList = getRawLinesList(
    values,
    viewBox,
    zeroVisible ?? false,
    bounds,
    axis,
    transformer,
    formatter,
    position
  );

  const averageLinesDistance = getAverageLinesDistance(rawLinesList, axis);

  const targetDistance =
    axis === 'y' ? style.fontSize * 1.25 : style.fontSize * 2;

  const reduceBy = averageLinesDistance / targetDistance;

  const reducedSteps =
    reduceBy >= 1
      ? rawLinesList
      : getReducedSteps(rawLinesList, reduceBy, axis);

  if (reducedSteps == null) return <></>;

  const elements = reducedSteps.map(({ d, textX, textY, text }) => (
    <G key={d}>
      <Path
        d={d}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        fill="none"
      />
      <Text
        x={textX}
        y={textY}
        dx={dx}
        fontWeight={style.fontWeight}
        fontSize={style.fontSize}
        fontFamily="sans"
        fill={'gray'}
        alignmentBaseline={alignmentBaseline}
        textAnchor={textAnchor}
      >
        {text}
      </Text>
    </G>
  ));

  return <G>{elements}</G>;
}

function getRawLinesList(
  values: [number, number][],
  viewBox: ViewBox,
  zeroVisible: boolean,
  bounds: Bounds,
  axis: 'x' | 'y',
  transformer: Transformer,
  formatter: (v: number) => string,
  position: 'top' | 'bottom'
): Line[] {
  const lines = values
    .map(([x, y]) => {
      const xCoords: [number, number][] = [
        [x, zeroVisible ? bounds.zeroVisibleMaxValueY : bounds.maxValueY],
        [x, zeroVisible ? bounds.zeroVisibleMinValueY : bounds.minValueY],
      ];

      const yCoords: [number, number][] = [
        [bounds.minValueX, y],
        [bounds.maxValueX, y],
      ];

      const coords = axis === 'x' ? xCoords : yCoords;

      const transformed = coords.map(transformer);

      const slice = transformed.slice(0, 2) as [
        [number, number],
        [number, number],
      ];

      const d = svgCoords2SvgLineCoords(
        axis === 'x'
          ? [
              [slice[0][0], viewBox[1]],
              [slice[1][0], viewBox[3] + viewBox[1]],
            ]
          : [
              [viewBox[0], slice[0][1]],
              [viewBox[2] + viewBox[0], slice[1][1]],
            ]
      );

      const transformedX = transformed[0]?.[0];
      const transformedY = transformed[0]?.[1];

      const text = formatter(axis === 'x' ? x : y);
      const textX = axis === 'x' ? transformedX : viewBox[0];
      const textY =
        axis === 'x'
          ? position === 'bottom'
            ? viewBox[1] + viewBox[3]
            : viewBox[1]
          : transformedY;

      if (textX == null || textY == null) {
        return null;
      }

      return {
        d,
        textX,
        textY,
        text,
        x,
        y,
      };
    })
    .filter((i) => i != null);

  return lines;
}

function getAverageLinesDistance(lines: Line[], axis: 'x' | 'y') {
  const dist = Math.abs(
    lines.reduce<number>((acc, _, i, arr) => {
      if (i === 0) return 0;
      const v =
        axis === 'x'
          ? (arr[i]?.textX ?? 0) - (arr[i - 1]?.textX ?? 0)
          : (arr[i]?.textY ?? 0) - (arr[i - 1]?.textY ?? 0);
      return acc + v;
    }, 0) / lines.length
  );

  return dist;
}
