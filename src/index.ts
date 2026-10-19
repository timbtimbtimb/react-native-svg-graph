import Graph from './components/Graph';
import XAxis from './components/XAxis';
import YAxis from './components/YAxis';
import Grid from './components/Grid';
import Lines from './components/Lines';
import Bars from './components/Bars';
import Pointer from './components/Pointer';
import decimate, { type DecimationMethod } from './utils/decimate';

export { Graph, XAxis, YAxis, Grid, Lines, Bars, Pointer, decimate };
export type { DecimationMethod };
export type { Legend } from './contexts/GraphContext';
