const durations = {
  seconds: 1000,
  minutes: 1000 * 60,
  hours: 1000 * 60 * 60,
  days: 1000 * 60 * 60 * 24,
  weeks: 1000 * 60 * 60 * 24 * 7,
};

export default function getRoundDatesBetween(
  startDate: Date,
  endDate: Date,
  snapTo: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks'
): Date[] {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (snapTo === 'weeks') {
    const day = start.getDay();
    const diff = (day + 6) % 7;
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - diff);

    const endDay = end.getDay();
    const endDiff = (endDay + 6) % 7;
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() - endDiff);
  } else {
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
  }

  const timeSpan = end.valueOf() - start.valueOf();
  const length = Math.floor(timeSpan / durations[snapTo]);

  return Array.from({ length }, (_, i) => {
    const d = new Date(start);
    switch (snapTo) {
      case 'weeks':
        d.setDate(d.getDate() + (i + 1) * 7);
        break;
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
