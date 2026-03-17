"use client";

import Link from "next/link";
import { Suspense, type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";
import {
  bookingLocations,
  scanBookingOptions,
  type BookingOption,
  type BookingService,
} from "@/content/scanBooking";

type PregnancyMode = "due" | "cycle" | "weeks";

type CustomerDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  townOrCity: string;
  postcode: string;
  dateOfBirth: string;
  notes: string;
};

type StepNumber = 1 | 2 | 3 | 4 | 5;

const { brand } = clinicUltrasoundScansContent;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const initialDetails: CustomerDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine1: "",
  townOrCity: "",
  postcode: "",
  dateOfBirth: "",
  notes: "",
};

function toDateStart(value: string) {
  return new Date(`${value}T00:00:00`);
}

function formatDate(value: string) {
  if (!value) return "";
  return dateFormatter.format(toDateStart(value));
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return null;
  const birth = toDateStart(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function getGestationFromDates(zeroDate: Date) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = todayStart.getTime() - zeroDate.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (Number.isNaN(totalDays) || totalDays < 0) {
    return null;
  }

  return {
    weeks: Math.floor(totalDays / 7),
    days: totalDays % 7,
  };
}

function getGestationDetails(
  mode: PregnancyMode,
  dueDate: string,
  cycleDate: string,
  weeksDue: string,
  daysDue: string,
) {
  if (mode === "due") {
    if (!dueDate) return null;
    const gestation = getGestationFromDates(addDays(toDateStart(dueDate), -280));
    if (!gestation) return null;
    return {
      ...gestation,
      label: `Estimated due date: ${formatDate(dueDate)}`,
    };
  }

  if (mode === "cycle") {
    if (!cycleDate) return null;
    const gestation = getGestationFromDates(toDateStart(cycleDate));
    if (!gestation) return null;
    return {
      ...gestation,
      label: `Last menstrual period: ${formatDate(cycleDate)}`,
    };
  }

  const parsedWeeks = Number.parseInt(weeksDue, 10);
  const parsedDays = Number.parseInt(daysDue || "0", 10);

  if (
    Number.isNaN(parsedWeeks) ||
    parsedWeeks < 0 ||
    Number.isNaN(parsedDays) ||
    parsedDays < 0 ||
    parsedDays > 6
  ) {
    return null;
  }

  return {
    weeks: parsedWeeks,
    days: parsedDays,
    label: `Entered manually: ${parsedWeeks} weeks and ${parsedDays} days`,
  };
}

function parseWeeksRange(weeksText: string) {
  const match = weeksText.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return null;
  return {
    min: Number.parseInt(match[1], 10),
    max: Number.parseInt(match[2], 10),
  };
}

function getTomorrowValue() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

function StepPanel({
  step,
  title,
  summary,
  isOpen,
  isEnabled,
  onOpen,
  children,
}: {
  step: StepNumber;
  title: string;
  summary: string;
  isOpen: boolean;
  isEnabled: boolean;
  onOpen: () => void;
  children: ReactNode;
}) {
  const headerClass = isOpen
    ? "bg-[var(--accent-strong)] text-white"
    : isEnabled
      ? "bg-[var(--baby-blue)] text-slate-900"
      : "bg-slate-200 text-slate-500";

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onOpen}
        disabled={!isEnabled}
        className={`flex w-full items-center gap-4 px-5 py-4 text-left transition ${headerClass}`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-sm font-semibold text-slate-900">
          {step}
        </span>
        <div className="min-w-0">
          <p className="font-display text-xl">{title}</p>
          <p className={`text-sm ${isOpen ? "text-white/90" : "text-inherit"}`}>{summary}</p>
        </div>
      </button>
      {isOpen ? <div className="border-t border-slate-100 p-6">{children}</div> : null}
    </div>
  );
}

function BookingOptionCard({
  option,
  isSelected,
  onSelect,
}: {
  option: BookingOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-3xl border p-5 text-left transition ${
        isSelected
          ? "border-[var(--accent-strong)] bg-[color:rgba(230,90,134,0.08)] shadow-sm"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[var(--baby-blue)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            {option.serviceLabel}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{option.title}</h3>
        </div>
        {option.priceLabel ? (
          <span className="rounded-full bg-[var(--ink-strong)] px-3 py-1 text-xs font-semibold text-white">
            {option.priceLabel}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-700">{option.weeks}</p>
      <p className="mt-2 text-sm text-muted">{option.summary}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">{option.groupTitle}</p>
    </button>
  );
}

function BookingWizardBody() {
  const searchParams = useSearchParams();
  const requestedPackage = searchParams.get("package");
  const requestedService = searchParams.get("service");

  const [service, setService] = useState<BookingService>("clinic");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [pregnancyMode, setPregnancyMode] = useState<PregnancyMode>("due");
  const [dueDate, setDueDate] = useState("");
  const [cycleDate, setCycleDate] = useState("");
  const [weeksDue, setWeeksDue] = useState("");
  const [daysDue, setDaysDue] = useState("0");
  const [multiple, setMultiple] = useState<"single" | "multiple">("single");
  const [locationId, setLocationId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [details, setDetails] = useState<CustomerDetails>(initialDetails);
  const [detailErrors, setDetailErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [stepErrors, setStepErrors] = useState<Partial<Record<StepNumber, string>>>({});
  const [confirmationAccepted, setConfirmationAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (requestedPackage) {
      const matchedOption = scanBookingOptions.find((option) => option.id === requestedPackage);
      if (matchedOption) {
        setService(matchedOption.service);
        setSelectedPackageId(matchedOption.id);
        setCurrentStep(2);
        return;
      }
    }

    if (
      requestedService === "home" ||
      requestedService === "clinic" ||
      requestedService === "blood"
    ) {
      setService(requestedService);
    }
  }, [requestedPackage, requestedService]);

  const filteredOptions = useMemo(
    () => scanBookingOptions.filter((option) => option.service === service),
    [service],
  );

  const selectedOption = useMemo(
    () => scanBookingOptions.find((option) => option.id === selectedPackageId),
    [selectedPackageId],
  );
  const isBloodService = selectedOption?.service === "blood";

  const availableLocations = useMemo(
    () => bookingLocations.filter((location) => location.service === service),
    [service],
  );

  const selectedLocation = useMemo(
    () => availableLocations.find((location) => location.id === locationId),
    [availableLocations, locationId],
  );

  const gestation = useMemo(
    () => getGestationDetails(pregnancyMode, dueDate, cycleDate, weeksDue, daysDue),
    [pregnancyMode, dueDate, cycleDate, weeksDue, daysDue],
  );

  const age = useMemo(() => calculateAge(details.dateOfBirth), [details.dateOfBirth]);

  const packageRange = useMemo(
    () => (selectedOption ? parseWeeksRange(selectedOption.weeks) : null),
    [selectedOption],
  );

  const packageWindowValid = useMemo(() => {
    if (!selectedOption) return false;
    if (selectedOption.service === "blood") return true;
    if (!gestation) return false;
    if (!packageRange) return true;
    return gestation.weeks >= packageRange.min && gestation.weeks <= packageRange.max;
  }, [gestation, packageRange, selectedOption]);

  const step1Valid = Boolean(selectedOption);
  const step2Valid = Boolean(
    selectedOption && (isBloodService || (gestation && packageWindowValid)),
  );
  const step3Valid = Boolean(step2Valid && locationId && appointmentDate && appointmentTime);
  const step4Valid = Boolean(
    step3Valid &&
      details.firstName.trim() &&
      details.lastName.trim() &&
      details.email.trim() &&
      details.phone.trim() &&
      details.addressLine1.trim() &&
      details.townOrCity.trim() &&
      details.postcode.trim() &&
      details.dateOfBirth &&
      age !== null &&
      age >= 16,
  );

  useEffect(() => {
    if (!selectedLocation) {
      setAppointmentTime("");
    }
  }, [selectedLocation]);

  useEffect(() => {
    setStepErrors((prev) => ({ ...prev, 3: undefined }));
  }, [locationId, appointmentDate, appointmentTime]);

  function updateDetails(field: keyof CustomerDetails, value: string) {
    setDetails((prev) => ({ ...prev, [field]: value }));
    setDetailErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function clearLaterSteps(fromStep: StepNumber) {
    if (fromStep <= 2) {
      setLocationId("");
      setAppointmentDate("");
      setAppointmentTime("");
    }
    if (fromStep <= 4) {
      setConfirmationAccepted(false);
      setSubmitError("");
    }
  }

  function validateStep1() {
    if (!selectedOption) {
      return "Choose a scan package to continue.";
    }
    return "";
  }

  function validateStep2() {
    if (!selectedOption) {
      return "Choose a scan package first.";
    }
    if (selectedOption.service === "blood") {
      return "";
    }
    if (!gestation) {
      return "Add your due date, last cycle date, or current weeks and days.";
    }
    if (!packageWindowValid) {
      return `This package is usually booked between ${selectedOption.weeks}.`;
    }
    return "";
  }

  function validateStep3() {
    if (!locationId || !appointmentDate || !appointmentTime) {
      return "Choose a location, preferred date, and preferred time to continue.";
    }
    return "";
  }

  function validateDetails() {
    const nextErrors: Partial<Record<keyof CustomerDetails, string>> = {};

    if (!details.firstName.trim()) nextErrors.firstName = "Enter a first name.";
    if (!details.lastName.trim()) nextErrors.lastName = "Enter a last name.";
    if (!details.email.trim()) {
      nextErrors.email = "Enter an email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!details.phone.trim()) nextErrors.phone = "Enter a phone number.";
    if (!details.addressLine1.trim()) nextErrors.addressLine1 = "Enter an address line.";
    if (!details.townOrCity.trim()) nextErrors.townOrCity = "Enter a town or city.";
    if (!details.postcode.trim()) nextErrors.postcode = "Enter a postcode.";
    if (!details.dateOfBirth) {
      nextErrors.dateOfBirth = "Enter a date of birth.";
    } else if (age !== null && age < 16) {
      nextErrors.dateOfBirth = "Bookings require a patient aged 16 or over.";
    }

    return nextErrors;
  }

  function openStep(step: StepNumber) {
    const enabled =
      step === 1 ||
      (step === 2 && step1Valid) ||
      (step === 3 && step2Valid) ||
      (step === 4 && step3Valid) ||
      (step === 5 && step4Valid);

    if (enabled) {
      setCurrentStep(step);
    }
  }

  function continueTo(step: StepNumber) {
    const nextErrors = { ...stepErrors };

    if (step === 1) {
      const error = validateStep1();
      nextErrors[1] = error || undefined;
      setStepErrors(nextErrors);
      if (error) return;
      setCurrentStep(2);
      return;
    }

    if (step === 2) {
      const error = validateStep2();
      nextErrors[2] = error || undefined;
      setStepErrors(nextErrors);
      if (error) return;
      setCurrentStep(3);
      return;
    }

    if (step === 3) {
      const error = validateStep3();
      nextErrors[3] = error || undefined;
      setStepErrors(nextErrors);
      if (error) return;
      setCurrentStep(4);
      return;
    }

    const nextDetailErrors = validateDetails();
    setDetailErrors(nextDetailErrors);
    if (Object.keys(nextDetailErrors).length > 0) {
      setCurrentStep(4);
      return;
    }
    setCurrentStep(5);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    const nextDetailErrors = validateDetails();
    setDetailErrors(nextDetailErrors);
    if (Object.keys(nextDetailErrors).length > 0) {
      setCurrentStep(4);
      return;
    }

    const step2Error = validateStep2();
    if (step2Error) {
      setStepErrors((prev) => ({ ...prev, 2: step2Error }));
      setCurrentStep(2);
      return;
    }

    const step3Error = validateStep3();
    if (step3Error) {
      setStepErrors((prev) => ({ ...prev, 3: step3Error }));
      setCurrentStep(3);
      return;
    }

    if (!confirmationAccepted) {
      setStepErrors((prev) => ({
        ...prev,
        5: "Confirm that you understand the booking request is subject to confirmation.",
      }));
      return;
    }

    if (!selectedOption || !selectedLocation || (!isBloodService && !gestation)) {
      setSubmitError("Something is missing from the booking request. Please review the steps.");
      return;
    }

    setIsSubmitting(true);

    const pregnancyPayload = isBloodService
      ? {
          mode: "not_applicable",
          multiple: "not_applicable",
          gestationWeeks: 0,
          gestationDays: 0,
        }
      : {
          mode: pregnancyMode,
          multiple,
          dueDate,
          cycleDate,
          weeksDue,
          daysDue,
          gestationWeeks: gestation?.weeks ?? 0,
          gestationDays: gestation?.days ?? 0,
        };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestedService: selectedOption.service,
          requestedPackageGroupId: selectedOption.groupId,
          package: {
            id: selectedOption.id,
            title: selectedOption.title,
            group: selectedOption.groupTitle,
            service: selectedOption.serviceLabel,
            weeks: selectedOption.weeks,
            price: selectedOption.priceLabel,
          },
          pregnancy: pregnancyPayload,
          appointment: {
            locationId: selectedLocation.id,
            location: selectedLocation.label,
            preferredDate: appointmentDate,
            preferredTime: appointmentTime,
          },
          customer: details,
        }),
      });

      const result = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
      };

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.error ?? "Booking checkout setup failed.");
      }

      setStepErrors((prev) => ({ ...prev, 5: undefined }));
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not start the secure deposit checkout. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepSummaries: Record<StepNumber, string> = {
    1: selectedOption
      ? `${selectedOption.serviceLabel} · ${selectedOption.title}`
      : "Choose your clinic, home, or blood screening package",
    2: isBloodService
      ? "No pregnancy timing required for this package"
      : gestation
        ? `${gestation.weeks}w ${gestation.days}d today · ${multiple === "multiple" ? "Multiple pregnancy" : "Single pregnancy"}`
        : "Add pregnancy timing details",
    3:
      selectedLocation && appointmentDate && appointmentTime
        ? `${selectedLocation.label} · ${formatDate(appointmentDate)} · ${appointmentTime}`
        : "Choose location, date, and time",
    4:
      details.firstName && details.lastName && details.email
        ? `${details.firstName} ${details.lastName} · ${details.email}`
        : "Add your personal details",
    5: "Review your booking and continue to deposit",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <StepPanel
        step={1}
        title="Choose your scan"
        summary={stepSummaries[1]}
        isOpen={currentStep === 1}
        isEnabled
        onOpen={() => openStep(1)}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {([
              ["clinic", "Clinic scans"],
              ["home", "Home scans"],
              ["blood", "Blood screening"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setService(value);
                  setSelectedPackageId("");
                  clearLaterSteps(2);
                  setStepErrors((prev) => ({ ...prev, 1: undefined }));
                  setCurrentStep(1);
                }}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  service === value
                    ? "bg-[var(--accent-strong)] text-white"
                    : "bg-[var(--baby-blue)] text-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {filteredOptions.map((option) => (
              <BookingOptionCard
                key={option.id}
                option={option}
                isSelected={selectedPackageId === option.id}
                onSelect={() => {
                  setSelectedPackageId(option.id);
                  setService(option.service);
                  clearLaterSteps(2);
                  setStepErrors((prev) => ({ ...prev, 1: undefined, 2: undefined }));
                  setCurrentStep(2);
                }}
              />
            ))}
          </div>

          {stepErrors[1] ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {stepErrors[1]}
            </p>
          ) : null}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => continueTo(1)}
              className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ink-strong)]"
            >
              Continue to {selectedOption?.service === "blood" ? "package details" : "pregnancy details"}
            </button>
          </div>
        </div>
      </StepPanel>

      <StepPanel
        step={2}
        title={isBloodService ? "Package details" : "Pregnancy details"}
        summary={stepSummaries[2]}
        isOpen={currentStep === 2}
        isEnabled={step1Valid}
        onOpen={() => openStep(2)}
      >
        <div className="space-y-6">
          {isBloodService ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-sm font-semibold text-slate-900">Selected package</p>
                {selectedOption ? (
                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold text-slate-900">Package:</span> {selectedOption.title}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Category:</span> {selectedOption.groupTitle}
                    </p>
                    {selectedOption.priceLabel ? (
                      <p>
                        <span className="font-semibold text-slate-900">Price:</span> {selectedOption.priceLabel}
                      </p>
                    ) : null}
                    <p>{selectedOption.summary}</p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-700">Choose a package first.</p>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-[var(--accent-soft)] p-6">
                <p className="text-sm font-semibold text-slate-900">Before you continue</p>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <p>Blood screening packages do not require pregnancy timing details in this step.</p>
                  <p>
                    Choose your preferred clinic date and time next. The team will confirm any preparation requirements directly with you.
                  </p>
                  <p className="rounded-2xl bg-white px-4 py-3 font-semibold text-[var(--accent-strong)]">
                    Your selected blood screening package is ready to book.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-slate-900">How would you like to date the pregnancy?</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {([
                      ["due", "Due date"],
                      ["cycle", "Last cycle date"],
                      ["weeks", "Weeks + days"],
                    ] as const).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setPregnancyMode(value);
                          setStepErrors((prev) => ({ ...prev, 2: undefined }));
                        }}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          pregnancyMode === value
                            ? "bg-[var(--accent-strong)] text-white"
                            : "bg-[var(--baby-blue)] text-slate-800"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {pregnancyMode === "due" ? (
                  <label className="block space-y-2 text-sm font-semibold text-slate-700">
                    Estimated due date
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(event) => setDueDate(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                    />
                  </label>
                ) : null}

                {pregnancyMode === "cycle" ? (
                  <label className="block space-y-2 text-sm font-semibold text-slate-700">
                    First day of your last menstrual period
                    <input
                      type="date"
                      value={cycleDate}
                      onChange={(event) => setCycleDate(event.target.value)}
                      max={new Date().toISOString().slice(0, 10)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                    />
                  </label>
                ) : null}

                {pregnancyMode === "weeks" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm font-semibold text-slate-700">
                      Weeks pregnant
                      <input
                        type="number"
                        min="0"
                        max="45"
                        value={weeksDue}
                        onChange={(event) => setWeeksDue(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-semibold text-slate-700">
                      Additional days
                      <input
                        type="number"
                        min="0"
                        max="6"
                        value={daysDue}
                        onChange={(event) => setDaysDue(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                      />
                    </label>
                  </div>
                ) : null}

                <div>
                  <p className="text-sm font-semibold text-slate-900">Pregnancy type</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {([
                      ["single", "Single pregnancy"],
                      ["multiple", "Multiple pregnancy"],
                    ] as const).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMultiple(value)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          multiple === value
                            ? "bg-[var(--accent-strong)] text-white"
                            : "bg-white text-slate-700 ring-1 ring-slate-200"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-[var(--accent-soft)] p-6">
                <p className="text-sm font-semibold text-slate-900">Scan timing check</p>
                {selectedOption ? (
                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold text-slate-900">Selected package:</span> {selectedOption.title}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Recommended window:</span> {selectedOption.weeks}
                    </p>
                    {gestation ? (
                      <p>
                        <span className="font-semibold text-slate-900">Current gestation:</span> {gestation.weeks} weeks and {gestation.days} days
                      </p>
                    ) : (
                      <p>Add pregnancy details to calculate today&apos;s gestation.</p>
                    )}
                    {gestation ? <p>{gestation.label}</p> : null}
                    {gestation && packageWindowValid ? (
                      <p className="rounded-2xl bg-white px-4 py-3 font-semibold text-[var(--accent-strong)]">
                        This package fits the timing you entered.
                      </p>
                    ) : null}
                    {gestation && !packageWindowValid ? (
                      <p className="rounded-2xl bg-white px-4 py-3 font-semibold text-red-600">
                        This package is normally booked between {selectedOption.weeks}. Choose a different package or update the timing details.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-700">Choose a package first.</p>
                )}
              </div>
            </div>
          )}

          {stepErrors[2] ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {stepErrors[2]}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => continueTo(2)}
              className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ink-strong)]"
            >
              Continue to location, date and time
            </button>
          </div>
        </div>
      </StepPanel>

      <StepPanel
        step={3}
        title="Select location, date and time"
        summary={stepSummaries[3]}
        isOpen={currentStep === 3}
        isEnabled={step2Valid}
        onOpen={() => openStep(3)}
      >
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {availableLocations.map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => {
                  setLocationId(location.id);
                  setAppointmentTime("");
                }}
                className={`rounded-3xl border p-5 text-left transition ${
                  locationId === location.id
                    ? "border-[var(--accent-strong)] bg-[color:rgba(230,90,134,0.08)]"
                    : "border-slate-200 bg-white hover:border-[var(--baby-blue)]"
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">{location.label}</p>
                <p className="mt-2 text-sm text-muted">{location.description}</p>
              </button>
            ))}
          </div>

          <label className="block space-y-2 text-sm font-semibold text-slate-700">
            Preferred appointment date
            <input
              type="date"
              value={appointmentDate}
              min={getTomorrowValue()}
              onChange={(event) => {
                setAppointmentDate(event.target.value);
                setAppointmentTime("");
              }}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>

          <div>
            <p className="text-sm font-semibold text-slate-900">Preferred appointment time</p>
            <p className="mt-1 text-sm text-muted">
              These are preferred request slots. We confirm the final appointment by phone or email.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {(selectedLocation?.timeSlots ?? []).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setAppointmentTime(slot)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    appointmentTime === slot
                      ? "bg-[var(--accent-strong)] text-white"
                      : "bg-[var(--baby-blue)] text-slate-800"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {stepErrors[3] ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {stepErrors[3]}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => continueTo(3)}
              className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ink-strong)]"
            >
              Continue to your details
            </button>
          </div>
        </div>
      </StepPanel>

      <StepPanel
        step={4}
        title="Your details"
        summary={stepSummaries[4]}
        isOpen={currentStep === 4}
        isEnabled={step3Valid}
        onOpen={() => openStep(4)}
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {([
              ["firstName", "First name", "text"],
              ["lastName", "Last name", "text"],
              ["email", "Email", "email"],
              ["phone", "Phone", "tel"],
              ["addressLine1", "Address line 1", "text"],
              ["townOrCity", "Town or city", "text"],
              ["postcode", "Postcode", "text"],
              ["dateOfBirth", "Date of birth", "date"],
            ] as const).map(([field, label, type]) => (
              <label key={field} className="space-y-2 text-sm font-semibold text-slate-700">
                {label}
                <input
                  type={type}
                  value={details[field]}
                  onChange={(event) => updateDetails(field, event.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm ${
                    detailErrors[field] ? "border-red-400" : "border-slate-200"
                  }`}
                />
                {detailErrors[field] ? (
                  <p className="text-xs text-red-500">{detailErrors[field]}</p>
                ) : null}
              </label>
            ))}
          </div>

          <label className="block space-y-2 text-sm font-semibold text-slate-700">
            Notes for the team
            <textarea
              value={details.notes}
              onChange={(event) => updateDetails("notes", event.target.value)}
              className="min-h-[120px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="Anything we should know before confirming the appointment?"
            />
          </label>

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => continueTo(4)}
              className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ink-strong)]"
            >
              Review booking request
            </button>
          </div>
        </div>
      </StepPanel>

      <StepPanel
        step={5}
        title="Review and submit"
        summary={stepSummaries[5]}
        isOpen={currentStep === 5}
        isEnabled={step4Valid}
        onOpen={() => openStep(5)}
      >
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Selected scan</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p>{selectedOption?.title}</p>
                <p>{selectedOption?.serviceLabel}</p>
                <p>{selectedOption?.weeks}</p>
                {selectedOption?.priceLabel ? <p>{selectedOption.priceLabel}</p> : null}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">
                {isBloodService ? "Package details" : "Pregnancy details"}
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                {isBloodService ? (
                  <>
                    <p>No pregnancy timing is required for this blood screening package.</p>
                    <p>The clinic team will confirm any preparation requirements directly with you.</p>
                  </>
                ) : (
                  <>
                    {gestation ? <p>{gestation.weeks} weeks and {gestation.days} days today</p> : null}
                    {gestation ? <p>{gestation.label}</p> : null}
                    <p>{multiple === "multiple" ? "Multiple pregnancy" : "Single pregnancy"}</p>
                  </>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Preferred appointment</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p>{selectedLocation?.label}</p>
                <p>{formatDate(appointmentDate)}</p>
                <p>{appointmentTime}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Your details</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p>
                  {details.firstName} {details.lastName}
                </p>
                <p>{details.email}</p>
                <p>{details.phone}</p>
                <p>{details.addressLine1}</p>
                <p>
                  {details.townOrCity} {details.postcode}
                </p>
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-[var(--accent-soft)] p-5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={confirmationAccepted}
              onChange={(event) => {
                setConfirmationAccepted(event.target.checked);
                setStepErrors((prev) => ({ ...prev, 5: undefined }));
              }}
              className="mt-1 h-4 w-4 rounded border-slate-300"
            />
            <span>
              I understand that the next step takes me to Stripe to pay the booking deposit, and that{" "}
              {brand.name} will still confirm the final appointment slot by phone or email.
            </span>
          </label>

          {stepErrors[5] ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {stepErrors[5]}
            </p>
          ) : null}

          {submitError ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ink-strong)] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Redirecting to Stripe..." : "Continue to secure deposit"}
            </button>
          </div>

          <p className="text-sm text-muted">
            Need help before booking? Call <a href={`tel:${brand.phone}`} className="font-semibold text-slate-700">{brand.phone}</a> or <Link href="/contact" className="font-semibold text-slate-700 underline">contact the team</Link>.
          </p>
        </div>
      </StepPanel>
    </form>
  );
}

function BookingWizardFallback() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
        Loading
      </p>
      <h2 className="mt-3 font-display text-2xl text-slate-900">Preparing booking options</h2>
      <p className="mt-3 text-sm text-muted">
        The booking form is loading your selected package and appointment options.
      </p>
    </div>
  );
}

export default function BookingWizard() {
  return (
    <Suspense fallback={<BookingWizardFallback />}>
      <BookingWizardBody />
    </Suspense>
  );
}
