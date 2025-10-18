import Svg from 'react-native-svg';
import { useGraphContext } from './GraphContext';
import { StyleSheet } from 'react-native';
import type { ReactNode } from 'react';

export default function Main({ children }: { children: ReactNode }) {
  const { viewBox, margins, svgRef, onPointerMove, onMouseLeave } =
    useGraphContext();

  return (
    <Svg
      viewBox={viewBox.join(' ')}
      ref={svgRef}
      width={viewBox[2]}
      height={viewBox[3]}
      style={{
        ...styles.svg,
        ...margins,
      }}
      onMouseLeave={onMouseLeave}
      onPointerMove={onPointerMove}
    >
      {children}
    </Svg>
  );
}

const styles = StyleSheet.create({
  svg: {
    overflow: 'visible',
    width: 'auto',
    height: 'auto',
  },
});
