"use client";

import { useState } from "react";
import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";

export type BookingFormValues = {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  message: string;
};

type BookingFormProps = {
  submitLabel: string;
};

const { ui } = clinicUltrasoundScansContent;

const initialState: BookingFormValues = {
  name: "",
  email: "",
  phone: "",
  preferredDate: "",
  message: "",
};

export default function BookingForm({ submitLabel }: BookingFormProps) {
  const [values, setValues] = useState<BookingFormValues>(initialState);
  const [errors, setErrors] = useState<Partial<BookingFormValues>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const validate = () => {
    const nextErrors: Partial<BookingFormValues> = {};
    if (!values.name.trim()) nextErrors.name = ui.form.errors.name;
    if (!values.email.trim()) {
      nextErrors.email = ui.form.errors.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = ui.form.errors.emailInvalid;
    }
    if (!values.phone.trim()) nextErrors.phone = ui.form.errors.phone;
    if (!values.preferredDate.trim())
      nextErrors.preferredDate = ui.form.errors.preferredDate;
    return nextErrors;
  };

  const handleChange = (field: keyof BookingFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Request failed");
      setIsSuccess(true);
      setValues(initialState);
    } catch {
      setFormError(ui.form.errors.submit);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold text-slate-700">
          {ui.form.labels.name}
          <input
            type="text"
            value={values.name}
            onChange={handleChange("name")}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            placeholder={ui.form.placeholders.name}
          />
          {errors.name ? <p className="text-xs text-red-500">{errors.name}</p> : null}
        </label>
        <label className="space-y-2 text-sm font-semibold text-slate-700">
          {ui.form.labels.email}
          <input
            type="email"
            value={values.email}
            onChange={handleChange("email")}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            placeholder={ui.form.placeholders.email}
          />
          {errors.email ? <p className="text-xs text-red-500">{errors.email}</p> : null}
        </label>
        <label className="space-y-2 text-sm font-semibold text-slate-700">
          {ui.form.labels.phone}
          <input
            type="tel"
            value={values.phone}
            onChange={handleChange("phone")}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            placeholder={ui.form.placeholders.phone}
          />
          {errors.phone ? <p className="text-xs text-red-500">{errors.phone}</p> : null}
        </label>
        <label className="space-y-2 text-sm font-semibold text-slate-700">
          {ui.form.labels.preferredDate}
          <input
            type="datetime-local"
            value={values.preferredDate}
            onChange={handleChange("preferredDate")}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
          {errors.preferredDate ? (
            <p className="text-xs text-red-500">{errors.preferredDate}</p>
          ) : null}
        </label>
      </div>
      <label className="space-y-2 text-sm font-semibold text-slate-700">
        {ui.form.labels.message}
        <textarea
          value={values.message}
          onChange={handleChange("message")}
          className="min-h-[120px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder={ui.form.placeholders.message}
        />
        {errors.message ? <p className="text-xs text-red-500">{errors.message}</p> : null}
      </label>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ink-strong)] disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? ui.form.submitting : submitLabel}
        </button>
        {isSuccess ? (
          <p className="text-sm font-semibold text-[var(--accent-strong)]">
            {ui.form.success}
          </p>
        ) : null}
        {formError ? (
          <p className="text-sm font-semibold text-red-500">{formError}</p>
        ) : null}
      </div>
    </form>
  );
}
