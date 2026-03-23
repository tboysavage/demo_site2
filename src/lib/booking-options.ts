import type { BookingOption, BookingService } from "@/content/scanBooking";
import {
  getResolvedBloodScreeningGroups,
  getResolvedClinicPackageGroups,
  getResolvedHomePackageGroups,
} from "@/lib/package-catalog";

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
      weeks: "No pregnancy timing required",
      priceLabel: card.price,
      summary: card.subtitle ?? card.description?.[0] ?? group.description ?? "Blood screening package",
      includes: card.bullets ?? card.description ?? [],
    }));
}

export async function getScanBookingOptions() {
  const [clinicGroups, homeGroups, bloodGroups] = await Promise.all([
    getResolvedClinicPackageGroups(),
    getResolvedHomePackageGroups(),
    getResolvedBloodScreeningGroups(),
  ]);

  return [
    ...clinicGroups.flatMap((group) => mapGroup("clinic", "Clinic scans", group)),
    ...homeGroups.flatMap((group) => mapGroup("home", "Home scans", group)),
    ...bloodGroups.flatMap((group) => mapBloodGroup(group)),
  ] as BookingOption[];
}
