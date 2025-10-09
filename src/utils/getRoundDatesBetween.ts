const durations = {
  seconds: 1000,
  minutes: 1000 * 60,
  hours: 1000 * 60 * 60,
  days: 1000 * 60 * 60 * 24,
};

export default function getRoundDatesBetween(
  startDate: Date,
  endDate: Date,
  snapTo: 'seconds' | 'minutes' | 'hours' | 'days'
): Date[] {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(
    ['days'].includes(snapTo) ? 0 : start.getHours(),
    ['days', 'hours'].includes(snapTo) ? 0 : undefined,
    ['days', 'hours', 'minutes'].includes(snapTo) ? 0 : undefined,
    ['days', 'hours', 'minutes', 'seconds'].includes(snapTo) ? 0 : undefined
  );

  end.setHours(
    ['days'].includes(snapTo) ? 0 : end.getHours(),
    ['days', 'hours'].includes(snapTo) ? 0 : undefined,
    ['days', 'hours', 'minutes'].includes(snapTo) ? 0 : undefined,
    ['days', 'hours', 'minutes', 'seconds'].includes(snapTo) ? 0 : undefined
  );

  const timeSpan = end.valueOf() - start.valueOf();
  const length = Math.floor(timeSpan / durations[snapTo]);

  return Array.from({ length }, (_, i) => {
    const d = new Date(start);
    switch (snapTo) {
      case 'days':
        d.setDate(d.getDate() + i + 1);
        break;
      case 'hours':
        d.setHours(d.getHours() + i + 1);
        break;
      case 'minutes':
        d.setMinutes(d.getMinutes() + i + 1);
        break;
      case 'seconds':
        d.setSeconds(d.getSeconds() + i + 1);
        break;
    }
    return d;
  });
}
