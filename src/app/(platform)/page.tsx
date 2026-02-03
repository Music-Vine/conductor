/**
 * Dashboard home page.
 * Placeholder content for Phase 1 - will be expanded in later phases.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Dashboard
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Welcome to Conductor Admin
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder cards for future dashboard content */}
        <DashboardCard
          title="Users"
          description="Manage user accounts"
          href="/users"
          count="—"
        />
        <DashboardCard
          title="Assets"
          description="Manage catalog assets"
          href="/assets"
          count="—"
        />
        <DashboardCard
          title="Contributors"
          description="Manage contributors"
          href="/contributors"
          count="—"
        />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Phase 1 Complete
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Foundation infrastructure is in place. Authentication, platform switching,
          audit logging, and form validation are all functional.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li>• Session-based authentication with magic links</li>
          <li>• Platform context switching (Music Vine / Uppbeat)</li>
          <li>• Audit event logging</li>
          <li>• Form validation with visual feedback</li>
          <li>• Loading skeletons and error boundaries</li>
        </ul>
      </div>
    </div>
  )
}

interface DashboardCardProps {
  title: string
  description: string
  href: string
  count: string
}

function DashboardCard({ title, description, href, count }: DashboardCardProps) {
  return (
    <a
      href={href}
      className="group block rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-zinc-300">
          {title}
        </h3>
        <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {count}
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
    </a>
  )
}
