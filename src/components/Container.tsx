import Svg from 'react-native-svg';
import { useGraphContext } from '../contexts/GraphContext';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useMemo, type ReactNode } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { usePointerContext } from '../contexts/PointerContext';
import Legends from './Legends';

// How far a finger has to travel before the drag is read as a graph scrub
// rather than a scroll. The same number is used for both axes on purpose:
// gesture-handler tests `failOffsetY` before `activeOffsetX`, so a diagonal
// that crosses both in one event lets the scroll win, which is the right way
// to be wrong — a missed scrub costs another swipe, a stolen scroll traps the
// page.
const ACTIVATION_DISTANCE = 10;

export default function Container({
  children,
  ...props
}: {
  children: ReactNode;
} & ViewProps) {
  const { viewBox, marginViewBox, setWidth } = useGraphContext();
  const { pointerX } = usePointerContext();

  const gesture = useMemo(() => {
    // Native: track finger drags. `e.x` is view-relative (relative to the SVG),
    // which is the same coordinate space the pointer overlay expects.
    //
    // A graph is almost always inside a vertically scrolling article, and its
    // own axis is horizontal — so the pan only claims sideways movement and
    // fails on vertical, handing the touch back to the scroll view. The
    // position is published from `onStart` rather than `onBegin` for the same
    // reason: `onBegin` fires on touch-down, before the direction is known, so
    // writing there flashed the crosshair on at the top of every scroll and
    // left it frozen there until the finger lifted.
    const pan = Gesture.Pan()
      .activeOffsetX([-ACTIVATION_DISTANCE, ACTIVATION_DISTANCE])
      .failOffsetY([-ACTIVATION_DISTANCE, ACTIVATION_DISTANCE])
      .onStart((e) => {
        'worklet';
        pointerX.value = e.x;
      })
      .onUpdate((e) => {
        'worklet';
        pointerX.value = e.x;
      })
      .onFinalize(() => {
        'worklet';
        pointerX.value = -1;
      });

    // Web: hover happens without a pressed button, which Pan does not track.
    // Hover maps to mouse enter/move/leave. It is inert on touch devices.
    const hover = Gesture.Hover()
      .onBegin((e) => {
        'worklet';
        pointerX.value = e.x;
      })
      .onUpdate((e) => {
        'worklet';
        pointerX.value = e.x;
      })
      .onEnd(() => {
        'worklet';
        pointerX.value = -1;
      });

    return Gesture.Race(hover, pan);
  }, [pointerX]);

  return (
    <View
      {...props}
      style={{
        ...styles.container,
        ...(props.style ?? {}),
      }}
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
      }}
    >
      {/* `touchAction` is web-only, and gesture-handler defaults it to `none` —
          which stops the browser scrolling the page from anywhere over the
          graph, whatever the pan's offsets say, since the browser decides that
          before any handler runs. `pan-y` leaves vertical scrolling to the
          browser and keeps horizontal for the pan. */}
      <GestureDetector gesture={gesture} touchAction="pan-y">
        <Svg
          preserveAspectRatio="none slice"
          viewBox={marginViewBox.join(' ')}
          width={viewBox[2]}
          height={viewBox[3]}
          style={styles.svg}
        >
          {children}
        </Svg>
      </GestureDetector>
      {/* Outside the SVG, and absolutely positioned over it: the legends are
          laid out with flexbox, which the SVG coordinate system has no notion
          of. They sit in the margin the view box already set aside for them,
          and take no touches, so the scrub gesture still has the whole graph. */}
      <Legends />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'black',
  },
  svg: {
    overflow: 'visible',
    width: 'auto',
    height: 'auto',
  },
});
