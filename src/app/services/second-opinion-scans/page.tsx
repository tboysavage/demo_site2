import { redirect } from "next/navigation";

export default function SecondOpinionScansPage() {
  redirect("/services/clinic-ultrasound-scans?package=second-opinion#packages");
}
