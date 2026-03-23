import {
  clinicUltrasoundScansContent,
  type Package,
  type PackageGroup,
  type PricingOption,
} from "@/content/clinicUltrasoundScans";
import {
  bloodScreeningContent,
  type BloodScreeningCard,
  type BloodScreeningGroup,
} from "@/content/bloodScreening";
import { homeScansContent } from "@/content/homeScans";
import { getDatabase, hasDatabaseConfig } from "@/lib/database";

export type ManagedPackageService = "clinic" | "home" | "blood";

export type ManagedPackageGroupDefinition = {
  service: ManagedPackageService;
  groupId: string;
  title: string;
  description: string;
  weeks: string;
};

export type ManagedPackageRecord = {
  packageId: string;
  service: ManagedPackageService;
  groupId: string;
  title: string;
  weeks: string;
  summary: string | null;
  description: string[];
  includes: string[];
  provides: string[];
  notes: string[];
  descriptionSecondary: string | null;
  priceLabel: string | null;
  pricingOptions: PricingOption[];
  sortOrder: number;
};

type ManagedPackageRow = {
  package_id: string;
  service: ManagedPackageService;
  group_id: string;
  title: string;
  weeks: string;
  summary: string | null;
  description_json: string;
  includes_json: string;
  provides_json: string;
  notes_json: string;
  description_secondary: string | null;
  price_label: string | null;
  pricing_options_json: string;
  sort_order: number;
};

type ManagedPackageMutationInput = {
  packageId: string;
  service: ManagedPackageService;
  groupId: string;
  title: string;
  weeks: string;
  summary?: string | null;
  description?: readonly string[];
  includes?: readonly string[];
  provides?: readonly string[];
  notes?: readonly string[];
  descriptionSecondary?: string | null;
  priceLabel?: string | null;
  pricingOptions?: readonly PricingOption[];
};

type BaseClinicPackage = Package;
type BaseClinicGroup = (typeof clinicUltrasoundScansContent.groups)[number];
type BaseHomeGroup = (typeof homeScansContent.groups)[number];
const typedBloodGroups = bloodScreeningContent.groups as readonly BloodScreeningGroup[];

function nowIso() {
  return new Date().toISOString();
}

function cleanString(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function cleanStringArray(values: readonly string[] | undefined) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function parseJsonArray(rawValue: string, fallback: string[] = []) {
  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      return fallback;
    }

    return parsed
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  } catch {
    return fallback;
  }
}

function parsePricingOptions(rawValue: string) {
  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      return [] as PricingOption[];
    }

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const label = typeof item.label === "string" ? item.label.trim() : "";
        const price = typeof item.price === "string" ? item.price.trim() : "";
        if (!label || !price) {
          return null;
        }

        return { label, price } satisfies PricingOption;
      })
      .filter((item): item is PricingOption => Boolean(item));
  } catch {
    return [] as PricingOption[];
  }
}

function serializeJsonArray(values: readonly string[] | undefined) {
  return JSON.stringify(cleanStringArray(values));
}

function serializePricingOptions(values: readonly PricingOption[] | undefined) {
  return JSON.stringify(
    (values ?? [])
      .map((option) => ({
        label: option.label.trim(),
        price: option.price.trim(),
      }))
      .filter((option) => option.label && option.price),
  );
}

function mapManagedPackageRow(row: ManagedPackageRow): ManagedPackageRecord {
  return {
    packageId: row.package_id,
    service: row.service,
    groupId: row.group_id,
    title: row.title,
    weeks: row.weeks,
    summary: row.summary,
    description: parseJsonArray(row.description_json),
    includes: parseJsonArray(row.includes_json),
    provides: parseJsonArray(row.provides_json),
    notes: parseJsonArray(row.notes_json),
    descriptionSecondary: row.description_secondary,
    priceLabel: row.price_label,
    pricingOptions: parsePricingOptions(row.pricing_options_json),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

const clinicGroupDefinitions: ManagedPackageGroupDefinition[] = clinicUltrasoundScansContent.groups.map(
  (group) => ({
    service: "clinic",
    groupId: group.id,
    title: group.title,
    description: group.description,
    weeks: group.weeks,
  }),
);

const homeGroupDefinitions: ManagedPackageGroupDefinition[] = homeScansContent.groups.map((group) => ({
  service: "home",
  groupId: group.id,
  title: group.title,
  description: group.description,
  weeks: group.weeks,
}));

function isPackageBloodCard(card: BloodScreeningCard) {
  return (card.kind ?? "info") === "package";
}

const bloodGroupDefinitions: ManagedPackageGroupDefinition[] = typedBloodGroups
  .filter((group) => group.cards.some((card) => (card.kind ?? "info") === "package"))
  .map((group) => ({
    service: "blood",
    groupId: group.id,
    title: group.title,
    description: group.description ?? "",
    weeks: "No pregnancy timing required",
  }));

const managedGroupDefinitions = [
  ...clinicGroupDefinitions,
  ...homeGroupDefinitions,
  ...bloodGroupDefinitions,
] as const;

const managedGroupDefinitionMap = new Map(
  managedGroupDefinitions.map((group) => [`${group.service}:${group.groupId}`, group]),
);

function getBaseClinicPackages() {
  return clinicUltrasoundScansContent.groups.flatMap((group, groupIndex) =>
    group.packages.map((packageItem, packageIndex) =>
      createManagedSeedFromScanPackage("clinic", group, packageItem, groupIndex, packageIndex),
    ),
  );
}

function createManagedSeedFromScanPackage(
  service: "clinic" | "home",
  group: BaseClinicGroup | BaseHomeGroup,
  packageItem: BaseClinicPackage,
  groupIndex: number,
  packageIndex: number,
): ManagedPackageRecord & { createdAt: string; updatedAt: string } {
  const timestamp = nowIso();

  return {
    packageId: packageItem.id,
    service,
    groupId: group.id,
    title: packageItem.name,
    weeks: packageItem.weeks,
    summary: cleanString(packageItem.scanFor),
    description: [],
    includes: cleanStringArray(packageItem.includes),
    provides: cleanStringArray(packageItem.provides),
    notes: cleanStringArray(packageItem.notes),
    descriptionSecondary: null,
    priceLabel: cleanString(packageItem.price),
    pricingOptions: (packageItem.pricingOptions ?? []).map((option) => ({
      label: option.label,
      price: option.price,
    })),
    sortOrder: groupIndex * 100 + packageIndex,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function getBaseHomePackages() {
  return homeScansContent.groups.flatMap((group, groupIndex) =>
    group.packages.map((packageItem, packageIndex) =>
      createManagedSeedFromScanPackage("home", group, packageItem, groupIndex, packageIndex),
    ),
  );
}

function getBaseBloodPackages() {
  const timestamp = nowIso();

  return typedBloodGroups.flatMap((group, groupIndex) =>
    group.cards
      .filter(isPackageBloodCard)
      .map((card, packageIndex) => ({
        packageId: card.id,
        service: "blood" as const,
        groupId: group.id,
        title: card.title,
        weeks: "No pregnancy timing required",
        summary: cleanString(card.subtitle),
        description: cleanStringArray(card.description),
        includes: cleanStringArray(card.bullets),
        provides: [],
        notes: [],
        descriptionSecondary: cleanString(card.description2),
        priceLabel: cleanString(card.price),
        pricingOptions: [],
        sortOrder: groupIndex * 100 + packageIndex,
        createdAt: timestamp,
        updatedAt: timestamp,
      })),
  );
}

function getBaseManagedPackages() {
  return [...getBaseClinicPackages(), ...getBaseHomePackages(), ...getBaseBloodPackages()];
}

async function ensureManagedPackageSeed() {
  if (!hasDatabaseConfig()) {
    return;
  }

  const sql = await getDatabase();
  const rows = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count
    FROM managed_packages
  `;

  if (Number(rows[0]?.count ?? "0") > 0) {
    return;
  }

  const seedPackages = getBaseManagedPackages();
  for (const packageItem of seedPackages) {
    await sql`
      INSERT INTO managed_packages (
        package_id,
        service,
        group_id,
        title,
        weeks,
        summary,
        description_json,
        includes_json,
        provides_json,
        notes_json,
        description_secondary,
        price_label,
        pricing_options_json,
        sort_order,
        created_at,
        updated_at
      ) VALUES (
        ${packageItem.packageId},
        ${packageItem.service},
        ${packageItem.groupId},
        ${packageItem.title},
        ${packageItem.weeks},
        ${packageItem.summary},
        ${serializeJsonArray(packageItem.description)},
        ${serializeJsonArray(packageItem.includes)},
        ${serializeJsonArray(packageItem.provides)},
        ${serializeJsonArray(packageItem.notes)},
        ${packageItem.descriptionSecondary},
        ${packageItem.priceLabel},
        ${serializePricingOptions(packageItem.pricingOptions)},
        ${packageItem.sortOrder},
        ${packageItem.createdAt},
        ${packageItem.updatedAt}
      )
    `;
  }
}

export function listManagedPackageGroups() {
  return [...managedGroupDefinitions];
}

export function getManagedPackageGroupDefinition(
  service: ManagedPackageService,
  groupId: string,
) {
  return managedGroupDefinitionMap.get(`${service}:${groupId}`) ?? null;
}

export async function listManagedPackages() {
  if (!hasDatabaseConfig()) {
    return getBaseManagedPackages();
  }

  await ensureManagedPackageSeed();
  const sql = await getDatabase();
  const rows = await sql<ManagedPackageRow[]>`
    SELECT
      package_id,
      service,
      group_id,
      title,
      weeks,
      summary,
      description_json,
      includes_json,
      provides_json,
      notes_json,
      description_secondary,
      price_label,
      pricing_options_json,
      sort_order
    FROM managed_packages
    ORDER BY service ASC, group_id ASC, sort_order ASC, title ASC
  `;

  return rows.map(mapManagedPackageRow);
}

function toClinicPackage(packageItem: ManagedPackageRecord): Package {
  return {
    id: packageItem.packageId,
    name: packageItem.title,
    weeks: packageItem.weeks,
    scanFor: packageItem.summary ?? undefined,
    includes: packageItem.includes,
    provides: packageItem.provides.length ? packageItem.provides : undefined,
    notes: packageItem.notes.length ? packageItem.notes : undefined,
    price: packageItem.priceLabel ?? undefined,
    pricingOptions: packageItem.pricingOptions.length ? packageItem.pricingOptions : undefined,
  };
}

function toBloodPackageCard(packageItem: ManagedPackageRecord): BloodScreeningCard {
  const baseCard = typedBloodGroups
    .flatMap((group) => group.cards)
    .find((card) => card.id === packageItem.packageId);

  return {
    id: packageItem.packageId,
    kind: "package",
    title: packageItem.title,
    subtitle: packageItem.summary ?? undefined,
    description: packageItem.description.length ? packageItem.description : undefined,
    description2: packageItem.descriptionSecondary ?? undefined,
    bullets: packageItem.includes.length ? packageItem.includes : undefined,
    price: packageItem.priceLabel ?? undefined,
    relatedInfoIds: baseCard?.relatedInfoIds,
    ctaLabel: baseCard?.ctaLabel,
    ctaHref: baseCard?.ctaHref,
  };
}

function getPackagesForService(
  packages: readonly ManagedPackageRecord[],
  service: ManagedPackageService,
) {
  return packages.filter((packageItem) => packageItem.service === service);
}

function mapResolvedGroups(
  packages: readonly ManagedPackageRecord[],
  definitions: readonly ManagedPackageGroupDefinition[],
) {
  return definitions
    .map<PackageGroup>((definition) => ({
      id: definition.groupId,
      title: definition.title,
      description: definition.description,
      weeks: definition.weeks,
      packages: packages
        .filter((packageItem) => packageItem.groupId === definition.groupId)
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map(toClinicPackage),
    }))
    .filter((group) => group.packages.length > 0);
}

export async function getResolvedClinicPackageGroups() {
  const packages = await listManagedPackages();
  return mapResolvedGroups(getPackagesForService(packages, "clinic"), clinicGroupDefinitions);
}

export async function getResolvedHomePackageGroups() {
  const packages = await listManagedPackages();
  return mapResolvedGroups(getPackagesForService(packages, "home"), homeGroupDefinitions);
}

export async function getResolvedBloodScreeningGroups() {
  const packages = await listManagedPackages();
  const bloodPackages = getPackagesForService(packages, "blood");

  return typedBloodGroups.map<BloodScreeningGroup>((group) => {
    const hasPackageCards = group.cards.some((card) => (card.kind ?? "info") === "package");
    if (!hasPackageCards) {
      return group;
    }

    const infoCards = group.cards.filter((card) => !isPackageBloodCard(card));
    const packageCards = bloodPackages
      .filter((packageItem) => packageItem.groupId === group.id)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(toBloodPackageCard);

    return {
      ...group,
      cards: [...packageCards, ...infoCards],
    };
  });
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export async function createManagedPackage(input: ManagedPackageMutationInput) {
  await ensureManagedPackageSeed();
  const sql = await getDatabase();
  if (!getManagedPackageGroupDefinition(input.service, input.groupId)) {
    throw new Error("The selected package group is not recognised.");
  }

  const existingRows = await sql<{ package_id: string }[]>`
    SELECT package_id
    FROM managed_packages
    WHERE package_id = ${input.packageId}
    LIMIT 1
  `;

  if (existingRows[0]) {
    throw new Error("A package with that ID already exists.");
  }

  const now = nowIso();
  const nextSortRows = await sql<{ next_sort: number | null }[]>`
    SELECT MAX(sort_order) + 1 AS next_sort
    FROM managed_packages
    WHERE service = ${input.service} AND group_id = ${input.groupId}
  `;
  const nextSortOrder = Number(nextSortRows[0]?.next_sort ?? 0);

  await sql`
    INSERT INTO managed_packages (
      package_id,
      service,
      group_id,
      title,
      weeks,
      summary,
      description_json,
      includes_json,
      provides_json,
      notes_json,
      description_secondary,
      price_label,
      pricing_options_json,
      sort_order,
      created_at,
      updated_at
    ) VALUES (
      ${input.packageId},
      ${input.service},
      ${input.groupId},
      ${input.title.trim()},
      ${input.weeks.trim()},
      ${cleanString(input.summary)},
      ${serializeJsonArray(input.description)},
      ${serializeJsonArray(input.includes)},
      ${serializeJsonArray(input.provides)},
      ${serializeJsonArray(input.notes)},
      ${cleanString(input.descriptionSecondary)},
      ${cleanString(input.priceLabel)},
      ${serializePricingOptions(input.pricingOptions)},
      ${nextSortOrder},
      ${now},
      ${now}
    )
  `;
}

export async function updateManagedPackage(input: ManagedPackageMutationInput) {
  await ensureManagedPackageSeed();
  const sql = await getDatabase();
  if (!getManagedPackageGroupDefinition(input.service, input.groupId)) {
    throw new Error("The selected package group is not recognised.");
  }

  const now = nowIso();
  const rows = await sql<{ package_id: string }[]>`
    UPDATE managed_packages
    SET
      service = ${input.service},
      group_id = ${input.groupId},
      title = ${input.title.trim()},
      weeks = ${input.weeks.trim()},
      summary = ${cleanString(input.summary)},
      description_json = ${serializeJsonArray(input.description)},
      includes_json = ${serializeJsonArray(input.includes)},
      provides_json = ${serializeJsonArray(input.provides)},
      notes_json = ${serializeJsonArray(input.notes)},
      description_secondary = ${cleanString(input.descriptionSecondary)},
      price_label = ${cleanString(input.priceLabel)},
      pricing_options_json = ${serializePricingOptions(input.pricingOptions)},
      updated_at = ${now}
    WHERE package_id = ${input.packageId}
    RETURNING package_id
  `;

  if (!rows[0]) {
    throw new Error("The package could not be updated.");
  }
}

export async function deleteManagedPackage(packageId: string) {
  await ensureManagedPackageSeed();
  const sql = await getDatabase();
  const rows = await sql<{ package_id: string }[]>`
    DELETE FROM managed_packages
    WHERE package_id = ${packageId}
    RETURNING package_id
  `;

  if (!rows[0]) {
    throw new Error("The package could not be removed.");
  }
}

export function generateManagedPackageId(
  title: string,
  service: ManagedPackageService,
  existingPackageIds: readonly string[],
) {
  const baseSlug = slugify(title) || `${service}-package`;
  let candidate = `${service}-${baseSlug}`;
  let suffix = 2;

  while (existingPackageIds.includes(candidate)) {
    candidate = `${service}-${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
