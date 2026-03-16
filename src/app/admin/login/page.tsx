import { redirect } from "next/navigation";
import { getAdminLoginErrorMessage, getAdminSession, hasAdminAuthConfig } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  const { error } = await searchParams;
  const errorMessage = getAdminLoginErrorMessage(error);
  const isConfigured = hasAdminAuthConfig();

  return (
    <div className="pb-24">
      <section className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Admin
          </p>
          <h1 className="mt-3 font-display text-4xl text-slate-900 sm:text-5xl">
            Portal login
          </h1>
          <p className="mt-4 text-base text-muted">
            This area is for internal staff only. Use the admin credentials configured for this
            environment to access bookings, messages, the appointment calendar, and database tools.
          </p>

          {!isConfigured ? (
            <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              Add `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` to `.env.local`
              before using the admin portal.
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form action="/api/admin/login" method="post" className="mt-8 space-y-4">
            <label className="block space-y-2 text-sm font-semibold text-slate-700">
              Username
              <input
                type="text"
                name="username"
                autoComplete="username"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>
            <label className="block space-y-2 text-sm font-semibold text-slate-700">
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={!isConfigured}
              className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ink-strong)] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Sign in
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
