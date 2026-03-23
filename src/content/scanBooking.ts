export type BookingService = "clinic" | "home" | "blood";

export type BookingOption = {
  id: string;
  service: BookingService;
  serviceLabel: string;
  groupId: string;
  groupTitle: string;
  title: string;
  weeks: string;
  priceLabel?: string;
  summary: string;
  includes: readonly string[];
};

export type BookingLocation = {
  id: string;
  service: BookingService;
  label: string;
  description: string;
  timeSlots: readonly string[];
};

const defaultClinicSlots = [
  "09:00",
  "10:30",
  "12:00",
  "13:30",
  "15:00",
  "16:30",
] as const;

const defaultHomeSlots = [
  "09:30",
  "11:30",
  "13:30",
  "15:30",
  "17:30",
] as const;

export const bookingLocations: readonly BookingLocation[] = [
  {
    id: "salisbury-clinic",
    service: "clinic",
    label: "Salisbury Clinic",
    description: "In-clinic appointment with full scan setup and reporting.",
    timeSlots: defaultClinicSlots,
  },
  {
    id: "hampshire-home",
    service: "home",
    label: "Home Visit - Hampshire",
    description: "Home appointment across Hampshire, subject to confirmation.",
    timeSlots: defaultHomeSlots,
  },
  {
    id: "isle-of-wight-home",
    service: "home",
    label: "Home Visit - Isle of Wight",
    description: "Home appointment on the Isle of Wight, subject to confirmation.",
    timeSlots: defaultHomeSlots,
  },
  {
    id: "salisbury-blood-screening",
    service: "blood",
    label: "Salisbury Clinic - Blood Screening",
    description: "In-clinic blood screening appointment subject to confirmation.",
    timeSlots: defaultClinicSlots,
  },
] as const;
