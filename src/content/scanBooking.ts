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
  pricingOptions?: readonly {
    label: string;
    price: string;
  }[];
  summary: string;
  includes: readonly string[];
};

export type BookingLocation = {
  id: string;
  service: BookingService;
  label: string;
  description: string;
  availableWeekdays?: readonly number[];
  timeSlots: readonly string[];
};

const clinicWeekdays = [1, 2, 3, 4, 5] as const;

const salisburyClinicSlots = [
  "09:00 - 09:30",
  "09:30 - 10:00",
  "10:00 - 10:30",
  "10:30 - 11:00",
  "11:00 - 11:30",
  "11:30 - 12:00",
  "12:00 - 12:30",
  "13:00 - 13:30",
  "13:30 - 14:00",
  "14:00 - 14:30",
  "14:30 - 15:00",
  "15:00 - 15:30",
  "15:30 - 16:00",
  "16:00 - 16:30",
  "16:30 - 17:00",
  "17:00 - 17:30",
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
    description: "In-clinic appointments are available Monday to Friday with 30-minute slots.",
    availableWeekdays: clinicWeekdays,
    timeSlots: salisburyClinicSlots,
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
    description: "In-clinic blood screening appointments are available Monday to Friday with 30-minute slots.",
    availableWeekdays: clinicWeekdays,
    timeSlots: salisburyClinicSlots,
  },
] as const;

export function isLocationDateAvailable(location: BookingLocation, dateValue: string) {
  if (!location.availableWeekdays?.length) {
    return true;
  }

  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return location.availableWeekdays.includes(date.getDay());
}

export function getLocationAvailabilitySummary(location: BookingLocation) {
  if (
    location.availableWeekdays &&
    location.availableWeekdays.length === 5 &&
    location.availableWeekdays.every((day, index) => day === index + 1)
  ) {
    return "Available Monday to Friday";
  }

  return null;
}
