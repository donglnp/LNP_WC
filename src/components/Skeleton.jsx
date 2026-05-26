
// Generic Skeleton primitive
export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded bg-arena-card/65 border border-arena-border/30 ${className}`}
    />
  );
}

// Skeleton for Dashboard Page
function PanelSkeleton({ titleWidth = "w-24", action, children }) {
  return (
    <section className="rounded-lg border border-arena-border bg-arena-surface">
      <header className="px-5 py-3 border-b border-arena-border flex items-center">
        <Skeleton className={`h-3.5 ${titleWidth}`} />
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4 sm:gap-6 animate-pulse">
      {/* Main section */}
      <section className="space-y-6">
        {/* Up Next Panel skeleton */}
        <PanelSkeleton
          titleWidth="w-20"
          action={<Skeleton className="ml-auto h-2.5 w-32" />}
        >
          {/* Countdown / meta line */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 mb-5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-28" />
              <span className="hidden sm:block ml-auto h-px flex-1 bg-arena-border/50" />
            </div>
            <Skeleton className="h-3 w-48 sm:ml-auto" />
          </div>

          {/* Mobile layout */}
          <div className="sm:hidden space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-12 rounded-md" />
                <Skeleton className="h-5 w-10" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-8 w-12 rounded-md" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Skeleton className="h-12 w-12 rounded-md" />
              <span className="text-arena-muted text-sm opacity-40">vs</span>
              <Skeleton className="h-12 w-12 rounded-md" />
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden sm:grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
            <div className="flex items-center gap-3 justify-end">
              <Skeleton className="h-6 w-14" />
              <Skeleton className="h-8 w-12 rounded-md" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-16 w-16 rounded-md" />
              <span className="text-arena-muted text-sm opacity-40">vs</span>
              <Skeleton className="h-16 w-16 rounded-md" />
            </div>
            <div className="flex items-center gap-3 justify-start">
              <Skeleton className="h-8 w-12 rounded-md" />
              <Skeleton className="h-6 w-14" />
            </div>
          </div>

          <Skeleton className="mt-8 h-11 w-full rounded-md" />
        </PanelSkeleton>

        {/* Later Today Panel skeleton */}
        <PanelSkeleton titleWidth="w-28">
          <ul className="divide-y divide-arena-border">
            {[1, 2, 3].map((i) => (
              <li
                key={i}
                className="py-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex items-center justify-between sm:contents">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="sm:hidden h-5 w-16 rounded" />
                </div>
                <div className="flex items-center gap-2 sm:gap-4 sm:flex-1">
                  <Skeleton className="h-5 w-7 rounded-sm" />
                  <Skeleton className="h-4 w-10" />
                  <span className="text-arena-muted text-xs opacity-40">vs</span>
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-5 w-7 rounded-sm" />
                </div>
                <span className="hidden sm:flex items-center gap-2 ml-auto">
                  <Skeleton className="h-3.5 w-10" />
                  <Skeleton className="h-5 w-16 rounded" />
                </span>
              </li>
            ))}
          </ul>
        </PanelSkeleton>
      </section>

      {/* Sidebar section */}
      <aside className="space-y-6">
        {/* My Stats Panel skeleton */}
        <PanelSkeleton titleWidth="w-20">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Skeleton className="h-2.5 w-20 mb-1" />
              <Skeleton className="h-7 w-12 mt-1" />
            </div>
            <div>
              <Skeleton className="h-2.5 w-20 mb-1" />
              <Skeleton className="h-7 w-12 mt-1" />
            </div>
          </div>
          <div className="mt-4">
            <Skeleton className="h-2.5 w-16 mb-2" />
            <Skeleton className="h-9 w-16" />
          </div>
        </PanelSkeleton>

        {/* Top 5 Panel skeleton */}
        <PanelSkeleton titleWidth="w-16">
          <ul className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="flex items-center gap-3">
                <Skeleton className="h-3.5 w-4" />
                <Skeleton className="h-3.5 flex-1 max-w-[140px]" />
                <Skeleton className="ml-auto h-3 w-12" />
              </li>
            ))}
          </ul>
        </PanelSkeleton>
      </aside>
    </div>
  );
}

// Skeleton for Matches Page
export function MatchesSkeleton() {
  return (
    <div className="rounded-lg border border-arena-green/20 bg-arena-surface p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
        <Skeleton className="h-7 w-40" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-28 rounded-md" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-md" />
        ))}
      </div>

      {/* Match cards group */}
      <div className="space-y-8">
        <div>
          <Skeleton className="h-3 w-32 mb-4" />
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-lg border border-arena-border bg-arena-card/40 p-4">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center justify-between gap-3 my-3">
                  {/* Home */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-9 rounded-sm" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  {/* Score boxes */}
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-9 w-9 rounded" />
                    <Skeleton className="h-9 w-9 rounded" />
                  </div>
                  {/* Away */}
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <Skeleton className="h-6 w-9 rounded-sm" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
                <Skeleton className="mt-4 h-8 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for Leaderboard Page
export function LeaderboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header and KPIs */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-3">
          <div className="rounded-lg border border-arena-border bg-arena-surface px-5 py-3 min-w-[140px]">
            <Skeleton className="h-2 w-16 mb-2" />
            <Skeleton className="h-7 w-12" />
          </div>
          <div className="rounded-lg border border-arena-border bg-arena-surface px-5 py-3 min-w-[140px]">
            <Skeleton className="h-2 w-16 mb-2" />
            <Skeleton className="h-7 w-8" />
          </div>
        </div>
      </div>

      {/* Leaderboard Table Skeleton */}
      <div className="rounded-lg border border-arena-border bg-arena-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arena-border">
              <th className="px-5 py-3 text-left w-16"><Skeleton className="h-3.5 w-10" /></th>
              <th className="px-5 py-3 text-left"><Skeleton className="h-3.5 w-24" /></th>
              <th className="px-5 py-3 text-right"><Skeleton className="h-3.5 w-14 ml-auto" /></th>
              <th className="px-5 py-3 text-right"><Skeleton className="h-3.5 w-16 ml-auto" /></th>
              <th className="px-5 py-3 text-right"><Skeleton className="h-3.5 w-12 ml-auto" /></th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <tr key={i} className="border-b border-arena-border/60 last:border-0">
                <td className="px-5 py-4"><Skeleton className="h-4 w-5" /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </td>
                <td className="px-5 py-4"><Skeleton className="h-4 w-6 ml-auto" /></td>
                <td className="px-5 py-4"><Skeleton className="h-4 w-6 ml-auto" /></td>
                <td className="px-5 py-4"><Skeleton className="h-4 w-8 ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Skeleton for Team Sheet Component
export function TeamSheetSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2].map((groupIndex) => (
        <section key={groupIndex}>
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-8" />
            <span className="ml-auto h-px flex-1 bg-arena-border/50" />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-arena-muted/40">
                <th className="text-left pb-2 w-12"><Skeleton className="h-3 w-4" /></th>
                <th className="text-left pb-2"><Skeleton className="h-3 w-20" /></th>
                <th className="text-left pb-2"><Skeleton className="h-3 w-16" /></th>
                <th className="text-right pb-2 w-16"><Skeleton className="h-3 w-6 ml-auto" /></th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-t border-arena-border/60">
                  <td className="py-3"><Skeleton className="h-3.5 w-4" /></td>
                  <td className="py-3"><Skeleton className="h-3.5 w-40" /></td>
                  <td className="py-3"><Skeleton className="h-3.5 w-20" /></td>
                  <td className="py-3"><Skeleton className="h-3.5 w-5 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
