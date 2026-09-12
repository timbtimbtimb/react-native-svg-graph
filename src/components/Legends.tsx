import type { ReactElement } from 'react';
import { G, Text, TSpan } from 'react-native-svg';
import { useGraphContext, type Legend } from '../contexts/GraphContext';

// The gap the bullet sits in is made of non-breaking spaces: SVG collapses a
// run of ordinary whitespace down to one space, so `  •  ` would read as ` • `.
const SEPARATOR = '  •  ';

function LegendText({
  legend,
  x,
  y,
  fontSize,
  alignmentBaseline,
}: {
  legend: Legend;
  x: number;
  y: number;
  fontSize: number;
  alignmentBaseline?: 'before-edge';
}): ReactElement {
  return (
    <Text
      x={x}
      y={y}
      fontWeight={'bold'}
      fontSize={fontSize}
      fontFamily="sans"
      fill={legend.color ?? 'gray'}
      textAnchor="middle"
      alignmentBaseline={alignmentBaseline}
    >
      {legend.label}
      {legend.unit == null ? null : (
        <TSpan fillOpacity={0.5}>{`${SEPARATOR}${legend.unit}`}</TSpan>
      )}
    </Text>
  );
}

/**
 * The names of what the axes plot, drawn in the margin the graph sets aside for
 * them — see `marginViewBox` in the graph context, which grows by
 * `LEGEND_MARGIN` on whichever side carries a legend.
 *
 * Being inside the SVG is the point: the legend cannot be covered by the plot,
 * and it cannot crowd the tick labels, since the space it occupies was added
 * beyond theirs rather than shared with them.
 */
export default function Legends(): ReactElement | null {
  const { viewBox, fontSize, xLegend, yLegend } = useGraphContext();

  if (xLegend == null && yLegend == null) return null;

  const [left, top, width, height] = viewBox;

  return (
    <G>
      {xLegend == null ? null : (
        // Below the x tick labels, which hang `fontSize * 1.5` under the plot.
        // `before-edge` puts the legend's top edge there, as the ticks do with
        // the plot's bottom edge, so the two cannot overlap whatever the font.
        <LegendText
          legend={xLegend}
          x={left + width / 2}
          y={top + height + fontSize * 1.5}
          fontSize={fontSize}
          alignmentBaseline="before-edge"
        />
      )}
      {yLegend == null ? null : (
        // Turned to read bottom-to-top, just outside the `fontSize * 3` the y
        // tick labels are right-anchored into. The rotation is on a `G` rather
        // than the text: `Text` has a `rotate` of its own, which turns each
        // glyph in place instead of the line as a whole.
        <G
          transform={`rotate(-90 ${left - fontSize * 3.4} ${top + height / 2})`}
        >
          <LegendText
            legend={yLegend}
            x={left - fontSize * 3.4}
            y={top + height / 2}
            fontSize={fontSize}
          />
        </G>
      )}
    </G>
  );
}
