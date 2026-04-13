export type PricingOption = {
  label: string;
  price: string;
};

export type Package = {
  id: string;
  name: string;
  weeks: string;
  scanFor?: string;
  includes: readonly string[];
  provides?: readonly string[];
  notes?: readonly string[];
  price?: string;
  pricingOptions?: readonly PricingOption[];
};

export type PackageGroup = {
  id: string;
  title: string;
  description: string;
  weeks: string;
  packages: readonly Package[];
};

export const clinicUltrasoundScansContent = {
  brand: {
    name: "Baby Sonovue LTD",
    address: "24 St Edmunds Church Street, SP1 1EF",
    postalCode: "SP1 1EF",
    countryCode: "GB",
    phone: "07737493979",
    email: "info@babysonovue.com",
    socials: [
      { label: "Facebook", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "WhatsApp", href: "#" },
      { label: "Twitter/X", href: "#" },
    ],
  },
  site: {
    canonicalBaseUrl: "https://www.babysonovue.co.uk",
  },
  seo: {
    defaultDescription:
      "Private, comfort-first clinic ultrasound scans with clear reports, keepsake imagery, and expert reassurance.",
    clinicDescription:
      "Clinic Ultrasound Scans at Baby Sonovue LTD. Explore wellbeing, growth, gender, 4D, second opinion, and anatomy scans with clear pricing.",
    clinicOgDescription:
      "Meet & Bond With Baby@ with clear reports, keepsake imagery, and expert reassurance.",
    serviceType: "Pregnancy ultrasound scans",
    areaServed: "Salisbury",
    priceRange: "£99-£169",
    addressLocality: "Salisbury",
  },
  images: {
    heroAlt: "Clinic ultrasound scan",
    clinicRoomAlt: "Ultrasound scan room",
    comfortAlt: "Comfort-first ultrasound care",
    ogAlt: "Clinic Ultrasound Scans",
    groupDefaults: [
      { src: "/clinical.jpg", alt: "Clinical ultrasound scan room" },
      { src: "/clinic-2.jpg", alt: "Comfort-first ultrasound care" },
      { src: "/clinic-3.jpg", alt: "Ultrasound scan in progress" },
    ],
  },
    navigation: {
      menu: [
        { label: "Home", href: "/" },
        { label: "Book a Scan", href: "/services/clinic-ultrasound-scans" },
        { label: "Home Scans", href: "/services/home-scans" },
        { label: "Blood Screening", href: "/blood-screening" },
        { label: "Gallery", href: "#" },
        { label: "Contact Us", href: "/contact" },
      ],
    bookButtonLabel: "Book a Meet&Bond Scan",
    },
  ui: {
    labels: {
      address: "Address",
      contact: "Contact",
      services: "Services",
      packages: "Packages",
      booking: "Booking",
      experience: "Experience",
      trust: "Trust",
      faqs: "FAQs",
      service: "Service",
      step: "Step",
    },
    cardLabels: {
      included: "What’s included",
      growthMeasurements: "Growth measurements",
      additionalNotes: "Additional notes",
      pricingOptions: "Pricing options",
    },
    buttons: {
      viewClinicScans: "View clinic scans",
      viewPackages: "View packages",
      bookScan: "Book a scan",
      viewSecondOpinion: "View second opinion packages",
    },
    footer: {
      title: "Ready to book?",
      message: "Meet & bond with baby in a calm, expert-led environment.",
      cta: "Book a scan",
      rights: "All rights reserved.",
    },
    home: {
      eyebrow: "Private Clinic Ultrasound Scans",
      servicesTitle: "What we do",
      servicesDescription: "Explore scan options by gestational range and focus area.",
      welcomeTitle: "Welcome to Baby Sonovue Salisbury",
      welcomeBody:
        "At Baby Sonovue, our purpose is to give families peace of mind and confidence throughout pregnancy by providing safe, accurate, and compassionate ultrasound services. We are dedicated to making high-quality scans ,including 2D, 3D, and 4D imaging, as well as health and welbeing checks both accessible and comfortable, whether in our welcoming clinic or in the privacy of your own home, or other place of your choice within Hampshire & The Isle of Wight. With a focus on dignity, respect, and clear communication, we aim to support every family at every stage of pregnancy, offering reassurance, trusted care, and flexibility when it matters most.",
    },
    bookingNotes: {
      responseTime: "We typically respond within 24 hours to confirm your appointment.",
      confirmation:
        "We will confirm your appointment details and any preparation guidance.",
    },
    packagesSection: {
      title: "Scan groups and packages",
      description:
        "Select your gestation range to reveal the full list of scans and inclusions.",
    },
    experienceSection: {
      description: "A seamless visit designed around reassurance, clarity, and comfort.",
    },
    trustSection: {
      description: "Supportive care designed around you and your baby.",
    },
    faqSection: {
      title: "Frequently asked questions",
      description: "Quick answers to help you feel prepared ahead of your visit.",
    },
    contactCardTitle: "Contact details",
    stub: {
      description:
        "This page is a quick stub. Visit the full clinic scan page for full details.",
    },
    pageTitles: {
      secondOpinion: "Second Opinion Scans",
    },
    form: {
      labels: {
        name: "Full name",
        email: "Email",
        phone: "Phone",
        preferredDate: "Preferred date/time",
        message: "Message",
      },
      placeholders: {
        name: "Jane Doe",
        email: "you@email.com",
        phone: "07700 000000",
        preferredDate: "e.g. Tuesdays after 4pm",
        message: "Share any details or questions.",
      },
      errors: {
        name: "Please enter your name.",
        emailRequired: "Please enter your email.",
        emailInvalid: "Please enter a valid email.",
        phone: "Please enter your phone number.",
        preferredDate: "Please share a preferred date/time.",
        submit: "Something went wrong. Please try again.",
      },
      success: "Thanks! We have received your request.",
      submitting: "Submitting...",
    },
  },
  hero: {
    title: "Clinic Ultrasound Scans",
    headline:
      "Comprehensive Pregnancy Ultrasound Scans & Health Screening You Can Trust",
    intro:
      "Take a look at our latest baby scan offers or choose from the following options…",
    primaryCta: "Book Now",
    secondaryCta: "Explore Packages",
  },
  compare: {
    eyebrow: "Quick summary",
    title: "Compare packages quickly",
    subtitle: "Choose the best fit for your stage, reassurance needs, and keepsake preferences.",
    items: [
      {
        label: "2D wellbeing scans",
        detail: "7–16 weeks · £109",
        href: "/services/clinic-ultrasound-scans?package=2d-wellbeing#packages",
      },
      {
        label: "Observation & growth",
        detail: "16–40 weeks · £109–£119",
        href: "/services/clinic-ultrasound-scans?package=observation-growth#packages",
      },
      {
        label: "Gender & 4D options",
        detail: "16–32 weeks · £109–£140",
        href: "/services/clinic-ultrasound-scans?package=gender#packages",
      },
      {
        label: "Second opinion support",
        detail: "7–40 weeks · £99",
        href: "/services/clinic-ultrasound-scans?package=second-opinion#packages",
      },
      {
        label: "Wellbeing + anatomy",
        detail: "18–24 weeks · £139–£169",
        href: "/services/clinic-ultrasound-scans?package=anatomy#packages",
      },
    ],
  },
  whatToExpect: {
    title: "What to expect",
    steps: [
      {
        title: "Arrive and get settled",
        description:
          "We welcome you into a calm, private space and confirm your scan choice and gestation range.",
      },
      {
        title: "Gentle scan & explanation",
        description:
          "Our sonographer explains what you are seeing in real time, answering questions along the way.",
      },
      {
        title: "Imagery & report",
        description:
          "You receive digital imagery and your foetal assessment report as listed in your package.",
      },
      {
        title: "Next steps",
        description:
          "We guide you on what happens next and help you book any follow-up if needed.",
      },
    ],
  },
  trust: {
    title: "Care you can trust",
    items: [
      {
        title: "Qualified",
        description: "Experienced professionals focused on clinical accuracy and reassurance.",
      },
      {
        title: "Comfort-first",
        description: "A calming environment designed to put you at ease from start to finish.",
      },
      {
        title: "Clear reports",
        description: "Every scan includes documentation so you can keep and review your results.",
      },
    ],
  },
  groups: [
    {
      id: "2d-wellbeing",
      title: "2D scans for viability, dating, wellbeing & reassurance and general observations",
      description: "Focused reassurance scans in early pregnancy.",
      weeks: "7–16 Weeks",
      packages: [
        {
          id: "package-a",
          name: "Meet & Bond Wellbeing Scan (7-14 weeks)",
          weeks: "7–14 weeks",
          scanFor:
            "2D Scan for: Pregnancy location; Foetal Viability Check; Dating; Meet & bond with Baby; Wellbeing Scan",
          includes: [
            "We will visualise baby’s heartbeat",
            "We will check to confirm the baby is in the uterus",
            "Will Check ovaries",
            "We will check how many babies are in the womb",
            "We will measure baby’s length from head to bottom (Crown to Rump Length)",
            "We will determine the baby’s age & estimated date of delivery (EDD)",
            "We will provide a digital foetal assessment report",
            "Digital imagery provided via USB or email",
          ],
          price: "£109.00",
        },
        {
          id: "package-b",
          name: "Meet & Bond Wellbeing plus Growth Scan (14-16 weeks)",
          weeks: "14–16 weeks",
          scanFor: "2D Scan for: Dating; Reassurance; Wellbeing; Observation Scan",
          includes: [
            "We Will Visualise Baby’s Heartbeat",
            "We Will Perform Head and Femur Growth Measurements",
            "We Will Determine Baby’s Age if Not Already Done",
            "We Will Observe Movement of The Foetus",
            "We Will Check the Position of The Placenta.",
            "We Will Check the Volume of The Amniotic Fluid Around Baby",
            "We Will Prepare and Provide You with a Digital Foetal Assessment Report",
            "Provide Imagery on Your Dedicated Email",
            "3x Digital Photo",
          ],
          price: "£119.00",
        },
      ],
    },
    {
      id: "observation-growth",
      title: "Observation and Growth Scans",
      description: "Reassurance, observation, and growth tracking from mid to late pregnancy.",
      weeks: "16–40 Weeks",
      packages: [
        {
          id: "package-c",
          name: "Meet & Bond Wellbeing and Observation Scan (16-40 weeks)",
          weeks: "16–40 weeks",
          includes: [
            "We Will Watch the Baby’s Heart Beating",
            "We Will Watch & Witness the Baby Moving",
            "We Will Check the Position of the Placenta",
            "Perform a Routine Survey of the Womb",
            "We Will Check on the Fluid Around Baby for reassurance.",
            "We Will Check Blood Flow Through the Umbilical Cord",
            "We Will Give You an Electronic Report of the Scan",
            "Will Provide Digital Imagery Electronically",
            "3x Digital Photos",
          ],
          price: "£109",
        },
        {
          id: "package-d",
          name: "Meet & Bond Wellbeing, Observation plus Growth Scan (16-40 weeks)",
          weeks: "16–40 weeks",
          includes: [
            "We Will Watch the Baby’s Heart Beating",
            "We Will Watch & Witness the Baby Moving",
            "We Will Check the Position of the Placenta",
            "Perform a Routine Survey of the Womb",
            "We Will Check on the Fluid Around Baby for reassurance.",
            "We Will Check Blood Flow Through the Umbilical Cord",
            "We Will Give You an Electronic Report of the Scan",
            "Will Provide Digital Imagery Electronically",
            "3x Digital Photo",
          ],
          provides: [
            "Head Circumference (HC)",
            "Abdominal/Belly Circumference (AC)",
            "Femur length (FL)",
          ],
          price: "£119",
        },
      ],
    },
    {
      id: "gender",
      title: "PlusGender Scans",
      description: "Wellbeing scans with optional gender evaluation.",
      weeks: "16–40 Weeks",
      packages: [
        {
          id: "package-e",
          name: "Meet & Bond Wellbeing and Gender Scan (16-40 weeks)",
          weeks: "16–40 weeks",
          includes: [
            "We Will Visualise and Listen to Baby’s Heartbeat",
            "Will Visualise Baby’s Movements",
            "Will Check the Position of the Placenta.",
            "We Check the Volume of the Amniotic Fluid Around Baby",
            "We Will Map the Position of Baby in the Womb",
            "You Will Be Provided a Digital Foetal Assessment Report",
            "Will perform Gender Evaluation (subject to baby’s gestation age and position)",
            "1x Complimentary Gender Reveal Scratch Card (supplied subject to achievement of gender evaluation)",
            "3x Printed Photos",
          ],
          price: "£109.00",
        },
        {
          id: "package-f",
          name: "Meet & Bond Wellbeing, Gender and Growth Scan (16-40 weeks)",
          weeks: "16–40 weeks",
          includes: [
            "We Will Visualise and Listen to Baby’s Heartbeat",
            "Will Visualise Baby’s Movements",
            "Will Check the Position of the Placenta.",
            "We Check the Volume of the Amniotic Fluid Around Baby",
            "We Will Map the Position of Baby in the Womb",
            "You Will Be Provided a Digital Foetal Assessment Report",
            "Will perform Gender Evaluation (subject to baby’s gestation age and position)",
          ],
          provides: [
            "Head Circumference (HC)",
            "Belly Circumference (AC)",
            "Femur length (FL)",
          ],
          notes: [
            "An Electronic Report of The Scan",
            "Digital Imagery Electronically",
          ],
          price: "£119.00",
        },
      ],
    },
    {
      id: "4d",
      title: "Plus 4D Scans",
      description: "4D bonding experiences with keepsake imagery.",
      weeks: "24–32 weeks",
      packages: [
        {
          id: "package-g",
          name: "Meet & Bond Wellbeing plus 4D Scan (24-32 weeks)",
          weeks: "24–32 weeks",
          includes: [
            "We Watch and Listen to The Baby’s Heartbeat",
            "We Watch the Baby Moving",
            "We Check the Position of The Placenta",
            "We Check the Amniotic Fluid Volume Around Baby",
            "We Check Baby’s Position in the Womb",
            "We Capture a 3D Image of the Baby",
            "We Watch Baby Move in Real Time, Using the Renowned Samsung 4D Sonoview Imaging System",
            "Optional Complimentary Gender Evaluation (subject to baby’s position)",
            "Digital Imagery & Video Clip Sent To Email",
            "Digital Foetal Assessment Report",
            "3x Printed Photos",
          ],
          price: "£130.00",
        },
        {
          id: "package-h",
          name: "Meet & Bond Wellbeing, Growth plus 4D Scan (24-32 weeks)",
          weeks: "24–32 weeks",
          includes: [
            "We Watch and Listen to The Baby’s Heartbeat",
            "We Watch the Baby Moving",
            "We Check the Position of The Placenta",
            "We Check the Amniotic Fluid Volume Around Baby",
            "We Check Baby’s Position in the Womb",
            "We Capture a 3D Image of the Baby",
            "We Watch Baby Move in Real Time, Using the Renowned Samsung 4D Sonoview Imaging System",
            "Optional Complimentary Gender Evaluation (subject to baby’s position)",
            "Digital Imagery & Video Clip Sent To Email",
            "Digital Foetal Assessment Report",
            "3x Printed Photos",
          ],
          provides: [
            "Head Circumference (HC)",
            "Abdominal/Belly Circumference (AC)",
            "The length of the Femur (FL)",
          ],
          notes: [
            "An Electronic Report of The Scan",
            "Will Provide Digital Imagery Electronically",
            "3x Digital Photo",
          ],
          price: "£140.00",
        },
      ],
    },
    {
      id: "second-opinion",
      title: "Meet & Bond SOS Second Opinion Scan",
      description:
        "If you’re experiencing concerns, need clarity, or have received unexpected news, Baby Sonovue is here to give you the information and reassurance you need.",
      weeks: "7–40 Wks",
      packages: [
        {
          id: "package-i",
          name: "Second Opinion Scan (7-40 weeks)",
          weeks: "7–40 weeks",
          includes: [
            "Please bring with you the original report of the scan",
            "A Second Opinion Pregnancy Ultrasound scan",
            "Second opinion for:",
            "No Heartbeat",
            "Viability",
            "Miscarriage",
            "Scan findings like: Trisomy 13, Trisomy 18, Trisomy 21, Spina Bifida",
            "We Will Give You an Electronic Report of The Scan",
            "Will Provide Keepsake Digital Imagery Electronically",
            "3x Digital Photos",
          ],
          price: "£99.00",
        },
      ],
    },
    {
      id: "anatomy",
      title: "Wellbeing + Anatomy Scan",
      description: "Detailed body-structure scan after your NHS Anomaly scan.",
      weeks: "18–24 Weeks",
      packages: [
        {
          id: "package-j",
          name: "Meet & Bond Wellbeing plus Anatomy Scan (18-24 weeks)",
          weeks: "18–24 weeks",
          includes: [
            "NB: This scan is done after the NHS Anomaly scan. Please bring the anomaly scan report with you",
            "Head: We check the cranial shape, midline, and key brain structures to give reassurance about development.",
            "Chest: We visualise the heart position and chest structures to observe rhythm and symmetry.",
            "Abdomen: We review the stomach, kidneys, and abdominal wall to see the body structures clearly.",
            "Body: We observe spine alignment and limb development for a clear wellbeing overview.",
            "Note: This is an anatomy scan to show you baby’s body structures. It is not an Anomaly scan...",
          ],
          pricingOptions: [
            { label: "Anatomy scan", price: "£139" },
            { label: "Anatomy plus Gender", price: "£149" },
            { label: "Anatomy plus Gender plus 4D", price: "£169" },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "When can I book a Clinic Ultrasound Scan?",
      answer: "Scans are available from 7–40 weeks depending on the package you choose.",
    },
    {
      question: "Will I receive a report after my scan?",
      answer: "Yes. Each package includes a digital foetal assessment report as listed in the package details.",
    },
    {
      question: "How do I get my scan images?",
      answer: "Your imagery is provided digitally via USB or email, depending on the package.",
    },
    {
      question: "What if my baby’s position affects the scan?",
      answer:
        "Gender evaluation and some 4D captures are subject to baby’s gestation age and position.",
    },
    {
      question: "Do you offer growth measurements?",
      answer:
        "Yes. Growth measurements are included in specific packages and listed as HC, AC, and FL.",
    },
    {
      question: "Can I bring someone with me?",
      answer: "We welcome you to bring a partner or support person to share the experience.",
    },
    {
      question: "Is the anatomy scan the same as the NHS Anomaly scan?",
      answer:
        "No. The wellbeing + anatomy scan is to show baby’s body structures and is not an Anomaly scan.",
    },
    {
      question: "What should I bring to a second opinion scan?",
      answer: "Please bring the original report of the scan with you.",
    },
    {
      question: "How do I book?",
      answer: "Use the booking form on this page or contact us directly by phone or email.",
    },
    {
      question: "What payments are accepted?",
      answer: "Pricing is shown per package and can be confirmed during booking.",
    },
  ],
  booking: {
    title: "Book a Scan",
    subtitle:
      "Complete the form and our team will confirm your preferred date and time.",
    ctaLabel: "Submit booking request",
  },
  contactPage: {
    title: "Contact Us",
    subtitle: "Share your details and we will get back to you as soon as possible.",
    ctaLabel: "Send message",
  },
} as const;

export type ClinicUltrasoundScansContent = typeof clinicUltrasoundScansContent;
