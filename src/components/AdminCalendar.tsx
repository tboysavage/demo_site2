import Link from "next/link";
import type { AdminBookingRecord } from "@/lib/admin-data";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
});

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getCalendarStart(date: Date) {
  const start = getMonthStart(date);
  const weekday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - weekday);
  return start;
}

function getCalendarEnd(date: Date) {
  const end = getMonthEnd(date);
  const weekday = (end.getDay() + 6) % 7;
  end.setDate(end.getDate() + (6 - weekday));
  return end;
}

function makeMonthParam(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function AdminCalendar({
  monthDate,
  appointments,
}: {
  monthDate: Date;
  appointments: readonly AdminBookingRecord[];
}) {
  const calendarStart = getCalendarStart(monthDate);
  const calendarEnd = getCalendarEnd(monthDate);
  const cells: Date[] = [];
  const appointmentMap = new Map<string, AdminBookingRecord[]>();

  for (const appointment of appointments) {
    const bucket = appointmentMap.get(appointment.appointmentDate);
    if (bucket) {
      bucket.push(appointment);
    } else {
      appointmentMap.set(appointment.appointmentDate, [appointment]);
    }
  }

  for (
    const cursor = new Date(calendarStart);
    cursor <= calendarEnd;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    cells.push(new Date(cursor));
  }

  const previousMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
  const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);

  return (
    <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Calendar
          </p>
          <h2 className="mt-2 font-display text-3xl text-slate-900">
            {monthFormatter.format(monthDate)}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin?month=${makeMonthParam(previousMonth)}#calendar`}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Previous
          </Link>
          <Link
            href={`/admin?month=${makeMonthParam(nextMonth)}#calendar`}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Next
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {weekdayLabels.map((label) => (
          <div key={label} className="rounded-2xl bg-slate-50 px-2 py-3">
            {label}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7">
        {cells.map((cellDate) => {
          const dateKey = formatDateKey(cellDate);
          const dayAppointments = appointmentMap.get(dateKey) ?? [];
          const isCurrentMonth = cellDate.getMonth() === monthDate.getMonth();
          const isToday = dateKey === new Date().toISOString().slice(0, 10);

          return (
            <div
              key={dateKey}
              className={`min-h-40 rounded-3xl border p-3 ${
                isToday
                  ? "border-[var(--accent-strong)] bg-[color:rgba(230,90,134,0.06)]"
                  : "border-slate-200 bg-slate-50/70"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-sm font-semibold ${
                    isCurrentMonth ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {cellDate.getDate()}
                </span>
                {dayAppointments.length ? (
                  <span className="rounded-full bg-[var(--ink-strong)] px-2 py-1 text-[10px] font-semibold text-white">
                    {dayAppointments.length}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 space-y-2">
                {dayAppointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment.reference}
                    className="rounded-2xl bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm"
                  >
                    <p className="font-semibold text-slate-900">{appointment.appointmentTime}</p>
                    <p>
                      {appointment.customerFirstName} {appointment.customerLastName}
                    </p>
                    <p className="truncate">{appointment.packageTitle}</p>
                  </div>
                ))}
                {dayAppointments.length > 3 ? (
                  <p className="text-xs font-semibold text-slate-500">
                    +{dayAppointments.length - 3} more appointments
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
