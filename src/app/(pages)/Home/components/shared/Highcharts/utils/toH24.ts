export const toH24 = (label: string | number) => {
  if (typeof label === "number") return label;
  const s = label.toUpperCase();
  let h = parseInt(s, 10);
  if (h === 12) h = 0;
  return h + (s.includes("PM") ? 12 : 0);
};
