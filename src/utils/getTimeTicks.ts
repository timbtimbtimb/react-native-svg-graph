import getRoundDatesBetween from './getRoundDatesBetween';

export default function getTimeTicks(
  from: Date,
  to: Date,
  step: 'days' | 'hours'
): [number, number][] {
  return getRoundDatesBetween(new Date(from), new Date(to), step).map(
    (date) => {
      return [date.valueOf(), 0];
    }
  );
}
