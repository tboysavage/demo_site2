export const CLINIC_TIME_ZONE = "Europe/London";

function getParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: CLINIC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Could not resolve clinic-local date parts.");
  }

  return { year, month, day };
}

export function getClinicTodayDate() {
  const { year, month, day } = getParts(new Date());
  return `${year}-${month}-${day}`;
}

export function getClinicDateKey(date: Date) {
  const { year, month, day } = getParts(date);
  return `${year}-${month}-${day}`;
}
