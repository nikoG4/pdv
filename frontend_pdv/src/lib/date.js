export const getTodayLocalDate = () => {
  const now = new Date();
  const timezoneOffsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
};

export const normalizeDateInputValue = (value, fallback = getTodayLocalDate()) => {
  if (!value) {
    return fallback;
  }

  return String(value).slice(0, 10);
};
