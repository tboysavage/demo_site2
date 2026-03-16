import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";
import { bloodScreeningContent } from "@/content/bloodScreening";
import { homeScansContent } from "@/content/homeScans";

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

type BookingPackageSource = {
  id: string;
  name: string;
  weeks: string;
  scanFor?: string;
  includes: readonly string[];
  price?: string;
  pricingOptions?: readonly {
    label: string;
    price: string;
  }[];
};

type BookingGroupSource = {
  id: string;
  title: string;
  description: string;
  packages: readonly BookingPackageSource[];
};

type BloodBookingCardSource = {
  id: string;
  kind?: "package" | "info";
  title: string;
  subtitle?: string;
  description?: readonly string[];
  bullets?: readonly string[];
  price?: string;
};

type BloodBookingGroupSource = {
  id: string;
  title: string;
  description?: string;
  cards: readonly BloodBookingCardSource[];
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

function getPriceLabel(packageItem: BookingPackageSource) {
  if (packageItem.price) return packageItem.price;
  if (packageItem.pricingOptions?.length) {
    return `From ${packageItem.pricingOptions[0].price}`;
  }
  return undefined;
}

function mapGroup(service: BookingService, serviceLabel: string, group: BookingGroupSource) {
  return group.packages.map<BookingOption>((packageItem) => ({
    id: packageItem.id,
    service,
    serviceLabel,
    groupId: group.id,
    groupTitle: group.title,
    title: packageItem.name,
    weeks: packageItem.weeks,
    priceLabel: getPriceLabel(packageItem),
    summary: packageItem.scanFor ?? group.description,
    includes: packageItem.includes,
  }));
}

function mapBloodGroup(group: BloodBookingGroupSource) {
  return group.cards
    .filter((card) => (card.kind ?? "info") === "package")
    .map<BookingOption>((card) => ({
    id: card.id,
    service: "blood",
    serviceLabel: "Blood screening",
    groupId: group.id,
    groupTitle: group.title,
    title: card.title,
    weeks: group.title,
    priceLabel: card.price,
    summary: card.subtitle ?? card.description?.[0] ?? group.description ?? "Blood screening package",
    includes: card.bullets ?? card.description ?? [],
  }));
}

export const scanBookingOptions = [
  ...clinicUltrasoundScansContent.groups.flatMap((group) =>
    mapGroup("clinic", "Clinic scans", group),
  ),
  ...homeScansContent.groups.flatMap((group) => mapGroup("home", "Home scans", group)),
  ...bloodScreeningContent.groups.flatMap((group) => mapBloodGroup(group)),
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
