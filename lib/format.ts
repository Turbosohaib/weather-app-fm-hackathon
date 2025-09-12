export const fmtTime = (iso: string) =>
  new Date(iso + (iso.endsWith('Z') ? '' : '')).toLocaleTimeString([], {
    hour: 'numeric',
    minute: undefined,
  });

export const fmtDay = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: 'short' });

export const fmtLongDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
