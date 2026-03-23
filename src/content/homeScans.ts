import {
  clinicUltrasoundScansContent,
  type PackageGroup,
} from "@/content/clinicUltrasoundScans";

export type HomeScansCompareItem = {
  label: string;
  detail: string;
  href: string;
};

const compareItems: HomeScansCompareItem[] = [
  {
    label: "Early reassurance",
    detail: "7-16 weeks",
    href: "/services/home-scans?package=early-reassurance-home#packages",
  },
  {
    label: "Wellbeing & growth",
    detail: "14-40 weeks",
    href: "/services/home-scans?package=wellbeing-growth-home#packages",
  },
  {
    label: "Gender & 3D/4D",
    detail: "16-32 weeks",
    href: "/services/home-scans?package=gender-4d-home#packages",
  },
  {
    label: "Second opinion",
    detail: "7-40 weeks",
    href: "/services/home-scans?package=second-opinion-home#packages",
  },
  {
    label: "Anatomy review",
    detail: "18-24 weeks",
    href: "/services/home-scans?package=anatomy-home#packages",
  },
];

const HOME_SCAN_MULTIPLIER = 5 / 3;

function parsePriceLabel(priceLabel: string) {
  const parsed = Number.parseFloat(priceLabel.replace(/[^0-9.]/g, ""));

  if (!Number.isFinite(parsed)) {
    throw new Error(`Unable to parse clinic price label: ${priceLabel}`);
  }

  return parsed;
}

function formatPrice(value: number) {
  const rounded = Math.ceil(value);

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
}

function getClinicPackagePrice(groupId: string, packageId: string) {
  const clinicGroup = clinicUltrasoundScansContent.groups.find((group) => group.id === groupId);
  const clinicPackage = clinicGroup?.packages.find((packageItem) => packageItem.id === packageId);

  if (!clinicPackage || !("price" in clinicPackage) || !clinicPackage.price) {
    throw new Error(`Missing clinic price for ${groupId}/${packageId}`);
  }

  return clinicPackage.price;
}

function getClinicPricingOptionPrice(groupId: string, packageId: string, optionLabel: string) {
  const clinicGroup = clinicUltrasoundScansContent.groups.find((group) => group.id === groupId);
  const clinicPackage = clinicGroup?.packages.find((packageItem) => packageItem.id === packageId);

  if (!clinicPackage || !("pricingOptions" in clinicPackage) || !clinicPackage.pricingOptions?.length) {
    throw new Error(`Missing clinic pricing options for ${groupId}/${packageId}`);
  }

  const pricingOption = clinicPackage.pricingOptions.find((option) => option.label === optionLabel);
  if (!pricingOption) {
    throw new Error(`Missing clinic pricing option ${optionLabel} for ${groupId}/${packageId}`);
  }

  return pricingOption.price;
}

function getHomePriceFromClinicPackage(groupId: string, packageId: string) {
  return formatPrice(parsePriceLabel(getClinicPackagePrice(groupId, packageId)) * HOME_SCAN_MULTIPLIER);
}

function getHomePriceFromClinicOption(groupId: string, packageId: string, optionLabel: string) {
  return formatPrice(
    parsePriceLabel(getClinicPricingOptionPrice(groupId, packageId, optionLabel)) * HOME_SCAN_MULTIPLIER,
  );
}

const clinicAnatomyGenderPrice = parsePriceLabel(
  getClinicPricingOptionPrice("anatomy", "package-j", "Anatomy plus Gender"),
);
const clinicAnatomyGender4dPrice = parsePriceLabel(
  getClinicPricingOptionPrice("anatomy", "package-j", "Anatomy plus Gender plus 4D"),
);
// The clinic data does not expose a separate anatomy+gender+3D tier, so infer it halfway between
// the clinic gender tier and the clinic gender+4D tier to keep the home pricing ladder consistent.
const inferredClinicAnatomyGender3dPrice =
  clinicAnatomyGenderPrice + (clinicAnatomyGender4dPrice - clinicAnatomyGenderPrice) / 2;

const groups: PackageGroup[] = [
  {
    id: "early-reassurance-home",
    title: "Meet & Bond with Baby (7-16 Weeks)",
    description:
      "Early reassurance scanning focused on viability, dating, and confirming how the pregnancy is progressing.",
    weeks: "7-16 weeks",
    packages: [
      {
        id: "home-early-reassurance",
        name: "Meet & Bond Early Reassurance Scan (7-16 weeks)",
        weeks: "7-16 weeks",
        scanFor:
          "A home-based reassurance scan to check viability, confirm the pregnancy is in the womb, and support early pregnancy dating.",
        includes: [
          "Check that the pregnancy is in the womb",
          "Check for the baby's heartbeat",
          "Confirm whether you are expecting one or more babies",
          "Measure crown-to-rump length (CRL)",
          "Estimate gestational age and expected date of delivery (EDD)",
          "Use head circumference for dating if the CRL is above 84mm",
        ],
        price: getHomePriceFromClinicPackage("2d-wellbeing", "package-a"),
        notes: [
          "The earlier the dating scan, the more accurate the dating tends to be.",
          "Designed to reassure that the pregnancy is progressing as expected.",
        ],
      },
    ],
  },
  {
    id: "wellbeing-growth-home",
    title: "Wellbeing & Growth Scans",
    description:
      "Home-based wellbeing observation and growth tracking for parents who want ongoing reassurance later in pregnancy.",
    weeks: "14-40 weeks",
    packages: [
      {
        id: "home-wellbeing",
        name: "Wellbeing Scan (16-40 weeks)",
        weeks: "16-40 weeks",
        scanFor:
          "A standard home wellbeing scan focused on core pregnancy observations.",
        includes: [
          "Observe baby's movement",
          "Confirm baby's position in the womb",
          "Check baby's heartbeat",
          "Check the position of the placenta",
          "Check the amniotic fluid volume",
        ],
        price: getHomePriceFromClinicPackage("observation-growth", "package-c"),
        notes: [
          "Wellbeing observations are carried out as standard across the scan range.",
        ],
      },
      {
        id: "home-growth",
        name: "Growth Scan (14-40 weeks)",
        weeks: "14-40 weeks",
        scanFor:
          "Growth scans can be requested from early in pregnancy depending on your circumstances and preference.",
        includes: [
          "Measure the baby's head, abdomen, and thigh bone to estimate weight",
          "Check the amount of amniotic fluid around the baby",
          "Assess blood flow in the umbilical cord",
          "Compare measurements against expected growth for gestational age",
        ],
        provides: [
          "Estimated foetal weight",
          "Growth and development overview",
          "Head, abdomen, and femur measurements",
        ],
        price: getHomePriceFromClinicPackage("observation-growth", "package-d"),
        notes: [
          "Some parents request early growth scans because of medical history, BMI, diabetes, blood pressure, kidney conditions, medication, or personal reassurance needs.",
          "Growth scans can be requested from as early as 14 weeks depending on preference.",
        ],
      },
    ],
  },
  {
    id: "gender-4d-home",
    title: "Gender & 3D/4D Scans",
    description:
      "Popular home-scan options for gender discovery and later bonding imagery.",
    weeks: "16-32 weeks",
    packages: [
      {
        id: "home-gender",
        name: "Gender Scan (16-40 weeks)",
        weeks: "16-40 weeks",
        scanFor:
          "A home visit gender scan for parents who want to find out baby's sex for personal planning or a reveal moment.",
        includes: [
          "Gender assessment from 16 weeks onwards",
          "Usual wellbeing observations during the scan",
          "Repeat baby measurements where appropriate",
          "Secret gender option via scratch card if you do not want to know on the day",
        ],
        price: getHomePriceFromClinicPackage("gender", "package-e"),
        notes: [
          "Gender confirmation depends on baby's position at the time of the scan.",
          "If you want to know baby's sex earlier, a Baby Gender DNA Test is available from 6 weeks with a positive pregnancy test.",
        ],
      },
      {
        id: "home-4d",
        name: "3D / 4D Bonding Scan (24-32 weeks)",
        weeks: "24-32 weeks",
        scanFor:
          "A home-based bonding scan intended to capture clearer facial features and movement later in pregnancy.",
        includes: [
          "3D and 4D imaging between 24 and 32 weeks",
          "Best timing usually falls between 26 and 29 weeks",
          "Opportunity to see facial features more clearly",
          "May capture blinking and movement in real time",
        ],
        price: getHomePriceFromClinicPackage("4d", "package-g"),
        notes: [
          "After 32 weeks, baby may move lower into the pelvis and become harder to visualise clearly.",
        ],
      },
    ],
  },
  {
    id: "second-opinion-home",
    title: "Second Opinion Scan",
    description:
      "Clearer explanation and reassurance when a previous scan or update has left you feeling unsure.",
    weeks: "7-40 weeks",
    packages: [
      {
        id: "home-second-opinion",
        name: "Second Opinion Scan (7-40 weeks)",
        weeks: "7-40 weeks",
        scanFor:
          "A second opinion carried out at home or in clinic, with time to explain findings carefully and answer questions.",
        includes: [
          "Step-by-step explanation during the scan",
          "Support for concerns around viability, miscarriage, or difficult findings",
          "Second opinion support for matters such as no heartbeat, Trisomy 13, Trisomy 18, Trisomy 21, and Spina Bifida",
          "Keepsake imagery can also be captured during the scan",
        ],
        price: getHomePriceFromClinicPackage("second-opinion", "package-i"),
        notes: [
          "Please bring the original ultrasound report with you.",
          "Available in clinic or in the comfort of your own home.",
        ],
      },
    ],
  },
  {
    id: "anatomy-home",
    title: "Wellbeing plus Anatomy Scan",
    description:
      "A relaxed anatomy review intended for bonding, explanation, and clarifying what you want to understand after an anomaly scan.",
    weeks: "18-24 weeks",
    packages: [
      {
        id: "home-anatomy",
        name: "Wellbeing plus Anatomy Scan (18-24 weeks)",
        weeks: "18-24 weeks",
        scanFor:
          "A home-based anatomy review intended to walk you through what can be seen, not to replace a medical anomaly scan.",
        includes: [
          "Go through baby's anatomy in a calmer bonding-focused setting",
          "Ask questions and review images and videos during the appointment",
          "Useful after an NHS anomaly scan if you want clarification on what was discussed",
          "What can be shown depends on baby's position, BMI, technical limitations, and other constraints",
        ],
        pricingOptions: [
          {
            label: "Anatomy scan",
            price: getHomePriceFromClinicOption("anatomy", "package-j", "Anatomy scan"),
          },
          {
            label: "Anatomy plus Gender",
            price: getHomePriceFromClinicOption("anatomy", "package-j", "Anatomy plus Gender"),
          },
          {
            label: "Anatomy plus Gender plus 3D",
            price: formatPrice(inferredClinicAnatomyGender3dPrice * HOME_SCAN_MULTIPLIER),
          },
          {
            label: "Anatomy plus Gender plus 3D plus 4D",
            price: getHomePriceFromClinicOption("anatomy", "package-j", "Anatomy plus Gender plus 4D"),
          },
        ],
        notes: [
          "This is an anatomy scan, not an anomaly scan.",
          "If you wish, sonographer narration can be recorded or shared live with family and friends.",
        ],
      },
    ],
  },
];

export const homeScansContent = {
  hero: {
    title: "Home-Based Scans",
    headline: "Home-Based Pregnancy Scans with Reassurance, Flexibility, and Clear Guidance",
    intro:
      "Choose a home-based scan route for reassurance, wellbeing, growth, gender discovery, 3D/4D bonding, second opinion support, and anatomy review.",
  },
  intro: {
    title: "Not Sure Which Scan To Book",
    bullets: [
      "Pregnancy is special and deserves space to be experienced, not rushed through.",
      "We offer a comprehensive selection of ultrasound scans for every stage of pregnancy.",
      "This gives you the chance to meet and bond with baby throughout the pregnancy journey and collect lasting memories.",
      "Choose a scan type below and book a meeting with baby, or call our reservations team on 07737493979.",
      "Souvenirs can be prepared for you to take home on the day of your scan.",
    ],
    whyChooseTitle: "Why choose Baby Sonovue?",
    whyChooseBullets: [
      "All scans are carried out by highly experienced, fully qualified sonographers.",
      "We use renowned Samsung ultrasound equipment that is certified safe.",
      "We create memories you won't forget.",
      "Our team has over three decades of combined experience.",
    ],
    closing:
      "If you are unsure which scan fits best, contact the Baby Sonovue team for advice before booking.",
  },
  compare: {
    eyebrow: "Quick summary",
    title: "Choose your home-scan route",
    subtitle:
      "Go straight to the scan group that matches your stage, reassurance needs, or the type of experience you want at home.",
    items: compareItems,
  },
  packagesSection: {
    title: "Pregnancy Scan Types Explained",
    description:
      "Each home-based scan route is outlined below so you can compare what is included and choose the right option for you. Home-scan pricing is calculated as the clinic price plus two-thirds of the clinic price, then rounded up to the nearest whole pound.",
  },
  groups,
  whatToExpect: {
    title: "What to expect from a home-based scan",
    steps: [
      {
        title: "Tell us your stage and location",
        description:
          "Start with your gestation, your location, and the type of scan you are considering so the team can confirm suitability.",
      },
      {
        title: "Choose the right scan route",
        description:
          "If you are unsure which scan to book, we can help you decide between reassurance, wellbeing, growth, gender, 3D/4D, second opinion, or anatomy review.",
      },
      {
        title: "Home appointment with clear explanation",
        description:
          "During the scan, the sonographer explains what is happening step by step and answers questions with the same care you would expect in clinic.",
      },
      {
        title: "Keep your images and next steps",
        description:
          "You leave with clearer information, keepsake imagery where appropriate, and guidance on what to do next if any follow-up is needed.",
      },
    ],
  },
  trust: {
    title: "Why families choose home-based scans",
    items: [
      {
        title: "Comfort-first",
        description:
          "Scans can take place in the comfort and privacy of your own home, reducing the pressure that sometimes comes with appointments.",
      },
      {
        title: "Qualified sonographers",
        description:
          "All scans are carried out by highly experienced, fully qualified sonographers using safe, recognised ultrasound equipment.",
      },
      {
        title: "Flexible support",
        description:
          "Home-based appointments are available for reassurance, growth, gender, 3D/4D bonding, anatomy review, and second opinion support.",
      },
    ],
  },
  faqSection: {
    title: "Home-scan FAQs",
    description:
      "A few of the most common questions based on the previous home-based scan page.",
  },
  faqs: [
    {
      question: "Can scans take place in my home?",
      answer:
        "Yes. Home-based scans are designed for families who want the comfort and flexibility of being seen at home, subject to suitability and availability.",
    },
    {
      question: "What if I am not sure which scan to choose?",
      answer:
        "Contact the Baby Sonovue team and share your gestation, your questions, and what reassurance you are looking for. We can help you choose the right route.",
    },
    {
      question: "When can I have an early reassurance scan?",
      answer:
        "The early Meet & Bond with Baby route is generally used from 7 to 16 weeks, with the earliest dating scans tending to be the most accurate.",
    },
    {
      question: "How are home scan prices calculated?",
      answer:
        "Home scan pricing is calculated from the clinic price. The home price is the clinic price plus two-thirds of the clinic price, then rounded up to the nearest whole pound. For example, a clinic scan priced at £90 becomes £150 for a home visit.",
    },
    {
      question: "When can I have a gender scan or 3D/4D scan?",
      answer:
        "Gender scans can be performed from 16 weeks onwards, while 3D/4D scans are typically performed between 24 and 32 weeks, with 26 to 29 weeks often giving the clearest images.",
    },
    {
      question: "What should I bring to a second opinion scan?",
      answer:
        "Please bring the original ultrasound report with you so the sonographer can understand the findings that prompted the follow-up scan.",
    },
    {
      question: "Is the anatomy scan the same as an anomaly scan?",
      answer:
        "No. The wellbeing plus anatomy scan is not an anomaly scan. It is intended to help you review anatomy in a calmer setting and ask questions after an anomaly scan if you want clarification.",
    },
  ],
} as const;
