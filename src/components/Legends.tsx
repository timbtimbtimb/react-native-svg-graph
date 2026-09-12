import type { ReactElement } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  useGraphContext,
  LEGEND_MARGIN,
  type Legend,
} from '../contexts/GraphContext';

// The gap either side of the bullet, as a fraction of the label's font size.
// It is a flex `gap` rather than spaces in the string: how wide a space is
// belongs to the typeface, and one non-breaking space read as too tight while
// two read as a hole, with nothing available in between.
const GAP = 0.35;

// The unit is the quiet half of the legend — dimmer, smaller and in caps, so it
// reads as the scale the axis counts in rather than as part of its name. The
// bullet introducing it belongs to that half rather than standing between two
// equals, so it is drawn at the same size and opacity.
const UNIT_SCALE = 0.8;
const UNIT_OPACITY = 0.5;

// How far the x legend is pulled back toward the plot, as a fraction of its own
// font size. Its strip runs to the very bottom edge of the SVG, and centring in
// the whole of it leaves the label reading as adrift from the graph rather than
// attached to it — so it gives a little of that last sliver back. Kept small:
// the tick labels are directly above, and the gap to them is the budget.
const X_LEGEND_HUG = 0.35;

function LegendRow({
  legend,
  fontSize,
  style,
}: {
  legend: Legend;
  fontSize: number;
  style?: StyleProp<ViewStyle>;
}): ReactElement {
  const color = legend.color ?? 'gray';
  const unitStyle = {
    color,
    fontSize: fontSize * UNIT_SCALE,
    opacity: UNIT_OPACITY,
  };

  return (
    <View style={[styles.row, { gap: fontSize * GAP }, style]}>
      <Text numberOfLines={1} style={[styles.text, { color, fontSize }]}>
        {legend.label}
      </Text>
      {legend.unit == null ? null : (
        <Text numberOfLines={1} style={[styles.text, unitStyle]}>
          {'•'}
        </Text>
      )}
      {legend.unit == null ? null : (
        <Text numberOfLines={1} style={[styles.text, unitStyle]}>
          {legend.unit.toUpperCase()}
        </Text>
      )}
    </View>
  );
}

/**
 * The names of what the axes plot, laid out over the margin the graph sets
 * aside for them — see `marginViewBox` in the graph context, which grows by
 * `LEGEND_MARGIN` on whichever side carries a legend.
 *
 * These are React Native views rather than SVG text, and that is the point: a
 * legend is a label plus a unit, and anchoring that pair at the middle of an
 * axis centres the *label*, leaving the unit to hang off the end and run out of
 * the graph. Here each legend is a box the full length of the axis it names,
 * centred both ways, so a long unit spends the whole axis rather than the half
 * of it that happens to lie to the right.
 */
export default function Legends(): ReactElement | null {
  const { viewBox, marginViewBox, fontSize, xLegend, yLegend } =
    useGraphContext();

  if (xLegend == null && yLegend == null) return null;

  // The SVG is drawn `preserveAspectRatio="none"`, so its margin view box is
  // squeezed into the plot's own pixel box and one user unit is worth less than
  // one pixel — by a different amount on each axis. Everything below is in
  // pixels, so each measurement taken from the view box is scaled on the way.
  const [, , svgWidth, svgHeight] = viewBox;
  const [, , marginWidth, marginHeight] = marginViewBox;
  const scaleX = svgWidth / marginWidth;
  const scaleY = svgHeight / marginHeight;

  // The strip each legend was given, and the plot it runs alongside.
  const stripX = fontSize * LEGEND_MARGIN * scaleY;
  const stripY = fontSize * LEGEND_MARGIN * scaleX;
  const plotLeft = (viewBox[0] - marginViewBox[0]) * scaleX;
  const plotTop = (viewBox[1] - marginViewBox[1]) * scaleY;
  const plotWidth = svgWidth * scaleX;
  const plotHeight = svgHeight * scaleY;

  // Matched to the tick labels, which are SVG text and so are squeezed with
  // everything else inside the view box. These views are not, so the scale has
  // to be applied by hand or the legend comes out larger than the numbers.
  const size = fontSize * scaleY;

  return (
    <>
      {xLegend == null ? null : (
        <View
          pointerEvents="none"
          style={[
            styles.strip,
            {
              left: plotLeft,
              top: svgHeight - stripX - size * X_LEGEND_HUG,
              width: plotWidth,
              height: stripX,
            },
          ]}
        >
          <LegendRow legend={xLegend} fontSize={size} />
        </View>
      )}
      {yLegend == null ? null : (
        <View
          pointerEvents="none"
          style={[
            styles.strip,
            styles.yStrip,
            { top: plotTop, width: stripY, height: plotHeight },
          ]}
        >
          {/* Turned to read bottom-to-top. A rotated view keeps its unrotated
              layout box, so the row is given the plot's *height* as its width
              and centred in the strip: the surplus falls away either side, and
              turning it about its own centre lands it spanning the strip. */}
          <LegendRow
            legend={yLegend}
            fontSize={size}
            style={{ width: plotHeight, transform: [{ rotate: '-90deg' }] }}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  strip: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Down the outer edge of the left margin, beyond the tick labels.
  yStrip: {
    left: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    // The unit is set smaller than the label, so the two share a baseline
    // rather than a top edge.
    alignItems: 'baseline',
  },
  text: {
    fontWeight: 'bold',
  },
});
