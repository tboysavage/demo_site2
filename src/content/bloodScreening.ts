export type BloodScreeningCard = {
  id: string;
  title: string;
  kind?: "package" | "info";
  subtitle?: string;
  description?: readonly string[];
  description2?: string;
  bullets?: readonly string[];
  price?: string;
  relatedInfoIds?: readonly string[];
  ctaLabel?: string;
  ctaHref?: string;
};

export type BloodScreeningGroup = {
  id: string;
  title: string;
  description?: string;
  callout?: {
    title: string;
    highlight?: string;
    description: readonly string[];
    ctaLabel?: string;
    ctaHref?: string;
  };
  cards: readonly BloodScreeningCard[];
};

export type BloodScreeningPreparation = {
  title: string;
  description: string;
  steps: readonly string[];
};

export type BloodScreeningFaq = {
  question: string;
  answer: string;
};

export const bloodScreeningContent = {
  hero: {
    title: "Blood Screening",
    headline: "Blood Screening",
    intro:
      "Explore blood screening options, fertility packages, and wellbeing checks with clear pricing and guidance.",
    primaryCta: "Book a Test",
    secondaryCta: "Contact Us",
  },
  groups: [
    {
      id: "pregnancy-screening",
      title: "Pregnancy Blood Screening",
      description: "Early, accurate screening options in pregnancy.",
      cards: [
        {
          id: "gender-dna",
          kind: "package",
          title: "Gender DNA Test (6-40 Wks.)",
          subtitle:
            "Sneak Peek DNA-based blood test to determine whether you’re having a boy or a girl",
          description: ["Can’t wait to know the sex? Sneak Peek is available from just 6 weeks!"],
          bullets: [
            "It can be performed as early as 6 weeks into the pregnancy.",
            "The test requires a small blood sample from the mother.",
            "If a Y chromosome is detected, the baby is likely a boy.",
            "If no Y chromosome is found, the baby is likely a girl.",
            "99.9% accurate",
            "Results emailed to you in 7 to 10 days",
          ],
          price: "£129.00",
        },
        {
          id: "chromosomal-test",
          kind: "package",
          title: "Chromosomal Test (10-40 Wks.)",
          subtitle: "Blood test to check for chromosomal abnormalities",
          bullets: [
            "Can be performed from 10 weeks onwards",
            "Requires a blood sample from the mother’s arm",
            "Screens for:",
            "Down’s syndrome",
            "Edwards’ syndrome and",
            "Patau’s syndrome",
            "Extremely accurate",
            "Safe for mother and baby",
            "Results available within 10 working days",
            "Includes a complimentary Early Meet&Bond scan (worth £99)",
          ],
          price: "£399.00",
        },
      ],
    },
    {
      id: "fertility-wellbeing",
      title: "Fertility Blood Tests: Wellbeing Package",
      description:
        "Designed to help you get all the fertility related information you need.",
      callout: {
        title: "Additional Fertility Blood Tests",
        highlight: "Choose your package from the following list:",
        description: [
          "If you would like additional fertility blood tests from the list below, each test will cost £25. You need to call the clinic to add extra blood tests to your appointment.",
          "Scroll down to find out more information about the blood tests you can choose from.",
          "When you book your appointment, you will be sent a form with your booking confirmation email. You need to complete this form with the specific blood tests you would like as part of your package before attending your appointment. All bloods need to be taken at the same appointment.",
        ],
        ctaLabel: "Contact Us",
        ctaHref: "/contact",
      },
      cards: [
        {
          id: "fertility-wellbeing-package",
          kind: "package",
          title: "Fertility Blood Tests: Wellbeing Package",
          bullets: [
            "The blood tests you need for your individual fertility Wellbeing",
            "This blood test package is designed to help you get all the fertility related information you need.",
          ],
          description: [
            "5 blood tests at one appointment from the list below: £125",
            "10 blood tests at one appointment from the list below: £200",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
      ],
    },
    {
      id: "female-fertility",
      title: "Female Fertility Blood Tests",
      description: "Targeted blood tests for female fertility insight and wellbeing.",
      cards: [
        {
          id: "amh-package",
          kind: "package",
          title: "AMH Package",
          subtitle: "For day 2 – 5 of your cycle",
          relatedInfoIds: [
            "amh-test",
            "fbc-female",
            "prolactin-female",
            "t3-female",
            "t4-female",
            "tsh-female",
            "vitamin-d-female",
            "results-timing",
          ],
          bullets: [
            "This AMH-led fertility blood test package is designed to help you get all the information you need during your fertility journey.",
            "This package is ideal for people undergoing fertility treatment privately, either in the UK or abroad.",
            "Includes Anti-Mullerian Hormone (AMH) testing to assess ovarian reserve.",
            "AMH is not routinely used by NHS fertility services.",
          ],
          price: "£200",
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "amh-test",
          title: "AMH (Anti-Müllerian Hormone)",
          description: [
            "Anti-Müllerian hormone (AMH) is a hormone primarily known for its role as a marker of ovarian reserve in females. It is secreted by the granulosa cells of small follicles in the ovaries, which contain immature eggs. An AMH blood test provides an estimate of the number of remaining follicles, a valuable tool for assessing fertility potential and guiding treatments like IVF.",
            "The AMH test gives your fertility provider vital information about your ovarian function and egg reserve. AMH can be tested at any point in your menstrual cycle and can be done even if you’re taking oral contraception. Your AMH blood test results will play a vital role in the treatment decisions made by your fertility clinic.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "fbc-female",
          title: "Full Blood Count (FBC)",
          description: [
            "A full blood count (FBC), also known as a complete blood count (CBC), is a common and routine blood test that provides a comprehensive overview of a person’s general health. It measures the number, size, and health of red blood cells, white blood cells, and platelets.",
            "By analysing this data, doctors can screen for, diagnose, and monitor a wide range of conditions, such as anaemia, infection, inflammation, and blood cancers.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "prolactin-female",
          title: "Prolactin",
          description: [
            "A prolactin blood test is performed to determine if a patient has abnormally high or low prolactin levels. The test is often performed to assess hormonal imbalance, which can interfere with reproductive and other bodily functions.",
            "Prolactin testing is particularly recommended for symptoms such as:",
          ],
          bullets: [
            "Galactorrhoea (breast milk production when not pregnant or breastfeeding)",
            "Irregular or absent periods",
            "Infertility caused by disrupted ovulation",
            "PCOS indicators",
            "Symptoms suggesting pituitary gland disorders",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "t3-female",
          title: "T3 (Thyroid)",
          description: [
            "Triiodothyronine (T3) is a crucial thyroid hormone that regulates the body’s metabolism and affects the function of almost every cell. T3 plays a vital role in:",
          ],
          bullets: [
            "Metabolic rate and energy levels",
            "Heart rate, contractility, and blood pressure",
            "Brain development and cognitive function",
            "Muscle function and maintenance",
            "Digestive system regulation",
            "Bone density maintenance",
          ],
          description2:
            "The Thyroid T3 Blood Test measures the amount of T3 in your blood to assess whether your thyroid is functioning normally. Healthy thyroid function is important for reproductive health in both women and men.",
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "t4-female",
          title: "T4 (Thyroxine)",
          description: [
            "A T4 (thyroxine) test measures the level of thyroxine, a hormone produced by the thyroid gland. T4 plays a key role in regulating metabolism, energy, heart function, and digestion.",
            "This test helps diagnose and monitor thyroid conditions. The Thyroid T4 Blood Test indicates whether your thyroid is functioning properly, which is essential for reproductive health in both women and men.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "tsh-female",
          title: "Thyroid Stimulating Hormone (TSH)",
          description: [
            "The TSH test evaluates how well your thyroid gland is working. TSH is released by the pituitary gland and instructs the thyroid on how much T3 and T4 to produce.",
            "Measuring TSH levels helps determine whether the thyroid is overactive or underactive. Often, T4 and T3 tests are also required for a full thyroid assessment.",
            "Testing TSH is crucial in fertility treatment since abnormalities can affect treatment response and pregnancy. Healthy thyroid function is essential for reproductive health in both women and men.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "vitamin-d-female",
          title: "Vitamin D",
          description: [
            "Fertility specialists commonly test vitamin D levels in both men and women trying to conceive. A vitamin D blood test measures the amount of 25-hydroxyvitamin D in your blood.",
            "Why vitamin D is tested for fertility:",
          ],
          bullets: [
            "Helps manage reproductive conditions such as PCOS and endometriosis",
            "Supports regular ovulation",
            "Linked to improved IVF success rates",
            "Reduces risks of pregnancy complications such as pre-eclampsia and gestational diabetes",
          ],
          description2:
            "Testing vitamin D before fertility treatment offers a baseline to manage deficiencies early. Adequate levels positively affect fertility, pregnancy, and conditions such as PCOS and endometriosis.",
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "results-timing",
          title: "When Will I Receive My Results?",
          description: [
            "Result times vary based on your clinic and test type. Some clinics offer courier services with results in 1-2 working days, while other tests may take up to 7 working days.",
            "If multiple tests are booked, results may arrive at different times.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
      ],
    },
    {
      id: "male-fertility",
      title: "Male Fertility Blood Tests",
      description: "Hormone and wellbeing testing for male fertility.",
      cards: [
        {
          id: "testosterone-package",
          kind: "package",
          title: "Male Fertility Blood Tests: Testosterone Package",
          relatedInfoIds: [
            "fbc-male",
            "prolactin-male",
            "t3-male",
            "t4-male",
            "tsh-male",
            "vitamin-d-male",
            "fsh",
            "lh",
            "testosterone",
            "shbg",
          ],
          description: [
            "Suitable For: Men aged 18+",
            "The Testosterone fertility blood test package is designed to help you get all the information you need for your fertility journey.",
            "This package is ideal for people undergoing fertility treatment privately, either in the UK or abroad, as it includes testing Testosterone and related hormones important in male reproductive health.",
          ],
          price: "£250",
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "fbc-male",
          title: "Full Blood Count (FBC)",
          description: [
            "A full blood count (FBC), also known as a complete blood count (CBC), is a routine blood test that provides a comprehensive overview of general health. It measures the number, size, and health of red blood cells, white blood cells, and platelets.",
            "By analysing this information, clinicians can diagnose and monitor conditions such as anaemia, infection, inflammation, and blood cancers.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "prolactin-male",
          title: "Prolactin",
          description: [
            "Produced in the pituitary gland, high prolactin levels can suppress reproductive hormones, disrupt testosterone production, and reduce sperm count. A prolactin test identifies abnormally high or low levels and helps assess hormonal imbalance.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "t3-male",
          title: "T3 (Thyroid)",
          description: [
            "T3 is a crucial thyroid hormone responsible for regulating metabolism and influencing nearly every cell in the body.",
          ],
          bullets: [
            "Controls metabolic rate",
            "Affects heart rate and blood pressure",
            "Supports brain function and development",
            "Maintains muscle control",
            "Regulates digestive processes",
            "Supports bone density",
          ],
          description2:
            "This test measures T3 levels to determine whether thyroid function is normal. Healthy thyroid function is essential for reproductive health in both men and women.",
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "t4-male",
          title: "T4 (Thyroxine)",
          description: [
            "T4 is a hormone produced by the thyroid gland that regulates metabolism, energy levels, heart function, and digestion. A T4 blood test helps diagnose and monitor thyroid disorders.",
            "This test evaluates whether your thyroid is functioning normally—an important factor for reproductive health in men and women.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "tsh-male",
          title: "Thyroid Stimulating Hormone (TSH)",
          description: [
            "TSH is produced by the pituitary gland and regulates the amount of thyroid hormone (T3 and T4) the thyroid should produce.",
            "Testing TSH helps identify underactive or overactive thyroid function. Healthy thyroid levels are vital during fertility treatment, as both low and high TSH can impact fertility and pregnancy outcomes.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "vitamin-d-male",
          title: "Vitamin D",
          description: [
            "Vitamin D is essential for male fertility and is commonly tested before or during fertility treatment. It is measured through a 25-hydroxyvitamin D blood test.",
            "Vitamin D supports male fertility by improving:",
          ],
          bullets: [
            "Sperm motility",
            "Total sperm count and concentration",
            "Normal sperm morphology",
            "Protection from oxidative stress",
            "Potential support for testosterone levels",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "fsh",
          title: "Follicle-Stimulating Hormone (FSH)",
          description: [
            "FSH is produced by the pituitary gland and stimulates sperm production. High FSH may indicate testicular dysfunction, while low FSH may indicate pituitary or hypothalamic issues.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "lh",
          title: "Luteinizing Hormone (LH)",
          description: [
            "LH signals the testicles to produce testosterone. Abnormal LH levels can indicate problems with the pituitary gland or testicles.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "testosterone",
          title: "Testosterone",
          description: [
            "The primary male sex hormone, testosterone is essential for sperm production, libido, and healthy sexual function. Low levels can significantly impact fertility.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "shbg",
          title: "Sex Hormone Binding Globulin (SHBG)",
          description: [
            "SHBG binds to testosterone and other hormones. Measuring SHBG helps determine how much free, active testosterone is available in the bloodstream.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
      ],
    },
    {
      id: "general-tests",
      title: "Additional Fertility Blood Tests",
      description: "Wider screening options and clinical checks.",
      cards: [
        {
          id: "amh-general",
          title: "AMH (Anti-Müllerian Hormone)",
          description: [
            "AMH is a vital test to give your fertility provider information about your ovarian function and egg reserve. AMH can be tested at any point in your menstrual cycle and can also be done if you’re taking oral contraception. Your AMH blood test results will play a vital role in the treatment decisions made by your fertility clinic",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "fbc-general",
          title: "Full Blood Count",
          description: [
            "A Full Blood Count is a way to look at the health of your blood cells, by looking at the size, shape and volume of the platelets in your blood. Platelets are what causes blood to clot.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "prolactin-general",
          title: "Prolactin",
          description: [
            "Prolactin is a hormone produced by the pituitary gland. Testing prolactin levels can help evaluate infertility and determine why a woman is not ovulating.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "t3-general",
          title: "T3 (Thyroid)",
          description: [
            "The Thyroid T3 Blood Test measures the amount of T3 in your blood, which can indicate whether your thyroid is functioning normally or not. Healthy thyroid function is important for reproductive health in women and men.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "t4-general",
          title: "T4 (Thyroid)",
          description: [
            "The Thyroid T4 Blood Test measures the amount of T4 in your blood, which can indicate whether your thyroid is functioning normally or not. Healthy thyroid function is important for reproductive health in women and mean",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "tsh-general",
          title: "Thyroid Stimulating Hormone (TSH)",
          description: [
            "Testing TSH is a vital part of fertility treatment, as TSH can affect how you respond to treatment. The functioning of the thyroid needs to be managed during and following fertility treatment as both low and high TSH levels can impact pregnancy. Healthy thyroid function is important for reproductive health in women and men.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "vitamin-d-general",
          title: "Vitamin D",
          description: [
            "Testing Vitamin D before fertility treatment can provide your fertility provider with a baseline level to ensure that your levels are within a normal range. It will enable your clinician the opportunity to advise you of treatment for a deficiency if required at an early stage in your fertility journey.",
            "Having a good level of vitamin D can have a positive impact on female fertility and pregnancy. Having higher levels of vitamin D can also improve symptoms of polycystic ovary syndrome (PCOS) and endometriosis, which are both common conditions that affect female fertility.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "fsh-general",
          title: "Follicle Stimulating Hormone (FSH)",
          description: [
            "FSH helps control the menstrual cycle and the growth of follicles, which contain eggs, in the ovaries. The blood test is done on the second or third day of your menstrual cycle and is used to evaluate egg supply and ovarian function.",
            "In men, FSH regulates the production and transportation of sperm. The test is used to determine sperm count.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "lh-general",
          title: "Luteinising Hormone (LH)",
          description: [
            "LH is linked to ovarian hormone production and egg maturation. A luteinising hormone test performed at the beginning of your cycle may help diagnose hormonal imbalances, like polycystic ovary syndrome. When LH testing is performed midway through your menstrual cycle (day 14 of a 28-day cycle), the level may assist in determining when you’re ovulating.",
            "In men, LH stimulates the hormone testosterone which affects sperm production. An LH test may be useful in evaluating male-factor infertility.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        { id: "hiv", title: "HIV 1&2", description: ["This test checks for the presence of the HIV virus."], ctaLabel: "Read More", ctaHref: "/contact" },
        {
          id: "syphilis",
          title: "Syphilis (VDRL)",
          description: [
            "This blood test is used to screen for a current syphilis infection. It detects antibodies that your body produces when fighting a syphilis infection.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "hepatitis-b-surface",
          title: "Hepatitis B (surface antigen)",
          description: [
            "This blood test checks for the presence of the hepatitis B antigen, a protein of the virus. A positive result for the antigens means you are currently infected with hepatitis B and are infectious.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "hepatitis-b",
          title: "Hepatitis B",
          description: [
            "This test checks for the presence of antibodies in your blood, which indicate a past hepatitis B infection. Hepatitis B can cause serious liver damage, and is transmitted through unprotected sex, sharing needles or from any situation where you come into contact with bodily fluids from an infected person. Mothers can also pass it to their babies. The presence of this antibody does not guarantee immunity from hepatitis B.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "hepatitis-c",
          title: "Hepatitis C (antibodies)",
          description: [
            "Testing for hepatitis C antibodies in your blood can tell you whether you’ve previously been infected with hepatitis C, but can’t tell you if the infection is still active in your system. If you receive a positive result for antibodies, you should then have a blood test to determine if the infection is current. Hepatitis C can seriously damage the liver, and is transmitted through unprotected sex, sharing needles or from a mother to a baby.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "rubella",
          title: "Rubella (antibodies)",
          description: [
            "Rubella testing is a simple blood test performed to identify whether you have developed antibodies after and infection or vaccination in order to protect you and a baby against rubella.  A positive rubella test indicates that you have the antibodies and therefore do not require a vaccination.  If the antibodies are not detected, then you will need to have the MMR vaccination prior to fertility treatment.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "chlamydia",
          title: "Chlamydia (urine test)",
          description: [
            "This test checks for the presence of chlamydia, which will need to be treated before starting fertility treatment. Please note that this is a urine test and you will be required to provide a urine sample at your appointment.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        { id: "blood-group", title: "Blood Group", description: ["To check your blood group"], ctaLabel: "Read More", ctaHref: "/contact" },
        {
          id: "htlv",
          title: "HTLV 1 & 2",
          description: [
            "HTLV-1 antibody testing is a virus in the same category as HIV. This test must be performed for donors of eggs or sperm and for patients living in high-prevalence areas or with sexual partners originating from those areas. Your individual history will be assessed by your clinician and advised whether testing is required.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "oestradiol",
          title: "Oestradiol",
          description: [
            "Oestradiol is made by the egg follicles as they grow in the ovaries. It is one of the hormones responsible for preparing the lining of the uterus to receive a fertilised egg. This test may also be used to determine your ovaries’ ability to produce eggs and during an IVF treatment cycle. Your fertility provider may test this level to determine how your ovaries are responding to stimulation.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "progesterone",
          title: "Progesterone",
          description: [
            "Progesterone is a hormone made in the ovaries after ovulation and is responsible for maintaining the lining of the uterus, where the fertilised egg must attach to grow. Progesterone is measured during the second part of the menstrual cycle, usually a week after ovulation. If ovulation has occurred, progesterone levels should rise.",
            "If you are undergoing fertility treatment, your fertility provider may recommend testing before and after embryo transfer to ensure progesterone levels are adequate to support implantation and an ongoing pregnancy.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "testosterone-general",
          title: "Testosterone",
          description: [
            "Testosterone is the primary male hormone, produced in the testes. Low levels may lead to erectile dysfunction or reduced sex drive, which can affect fertility.",
            "Testosterone is also important for females. Most testosterone in women is produced in the ovaries and can be converted to oestradiol. It influences libido, bone and muscle health, mood, energy, menstrual cycles, and fertility. High or low testosterone levels in the blood may cause infertility.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "results-timing-general",
          title: "When will I receive my blood test results?",
          description: [
            "The time in which you receive blood test results will vary based on your location and the type of blood test. Some clinics have courier services which can provide results in 1-2 working days. Some lab tests take longer, with results available in up to 7 working days. You can call your clinic to find out the most likely timeline.",
            "If you book multiple blood tests or a package, you may receive the results at different times.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "your-blood-test",
          title: "Your Blood Test",
          description: [
            "Our phlebotomy-trained professionals will take a blood sample from you. This sample will be analysed in the UK by our authorised partners, Nationwide Laboratories. By booking this test, you agree for us to share your personal information with them to process your test. You will be asked to confirm this consent at your appointment.",
            "Baby Sonovue will not review or interpret your private blood test results — we recommend you discuss them with your preferred healthcare provider.",
          ],
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
      ],
    },
    {
      id: "blood-pressure-diabetes",
      title: "Blood Pressure and Diabetics Checks",
      description: "For Men and Women",
      cards: [
        {
          id: "pregnancy-pegd",
          kind: "package",
          title: "Meet&bond@ (20-40 weeks) Pre-eclampsia & Gestational Diabetes (PeGD)",
          subtitle: "Non-Invasive Pre-eclampsia And Gestational Diabetes Health Check",
          bullets: [
            "We will measure mum’s weight",
            "We will perform blood pressure measurements",
            "We will perform a lancet blood glucose test",
            "We will perform a urine dip test",
            "We will give you an electronic report of the measurements",
            "We do not interpret results — you can show them to your health carer.",
          ],
          price: "£39.00 per visit",
          ctaLabel: "Read More",
          ctaHref: "/contact",
        },
        {
          id: "men-bp-diabetes",
          kind: "package",
          title: "Blood Pressure and Diabetic Test For Men",
          subtitle: "The following will be done:",
          bullets: [
            "We will measure your weight",
            "We will measure your height",
            "We will calculate your BMI",
            "We will perform blood pressure measurements",
            "We will perform a lancet blood glucose test",
            "We will perform a urine dip test",
            "We will give you an electronic report of the measurements",
            "We do not interpret results — you can show them to your health carer.",
          ],
          price: "£39.00 per visit",
        },
      ],
    },
  ],
  preparation: {
    title: "Preparing for your fertility blood test appointment",
    description: "Practical steps to get ready for your visit.",
    steps: [
      "Hydrate - Drink plenty of water in the 24 hours before your blood test. This will make the blood draw easier.",
      "Make sure the blood draw area is easily accessible.",
      "Wear loose clothing that allows easy access to both arms and hands.",
      "If you are on anticoagulant medication, take it after the appointment. If this is not possible, you can take it before your appointment if it is absolutely essential.",
      "Let our clinic team know if you are nervous about needles. They will make sure you're calm and comfortable and do everything they can to make your blood draw quick and simple.",
    ],
  } satisfies BloodScreeningPreparation,
  faqs: [
    {
      question: "Will you analyse my blood results?",
      answer:
        "No, we will send you the results and recommend that you share these with your GP or fertility provider.",
    },
    {
      question: "Should I have a bruise after my blood test?",
      answer:
        "It is not unusual for some bleeding to occur under the skin following your blood test and sometimes this can extend a little further around the puncture site. If this causes you concern, check with your practice nurse.",
    },
    {
      question: "What if you can't get a blood sample?",
      answer:
        "Sometimes we cannot get a blood sample from you. This can be for many reasons, such as not being hydrated enough, feeling cold or having another blood test recently. We will always offer you another appointment so we can try again.",
    },
  ] satisfies BloodScreeningFaq[],
} as const;

export type BloodScreeningContent = typeof bloodScreeningContent;
