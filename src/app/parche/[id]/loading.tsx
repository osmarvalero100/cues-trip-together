export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-72 bg-slate-200 rounded" />
        </div>
        <div className="h-10 w-40 bg-slate-200 rounded-lg" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-32 bg-slate-200 rounded-xl" />
        <div className="h-32 bg-slate-200 rounded-xl" />
        <div className="h-32 bg-slate-200 rounded-xl" />
      </div>

      <div className="space-y-3">
        <div className="h-10 bg-slate-200 rounded-lg" />
        <div className="h-24 bg-slate-200 rounded-xl" />
        <div className="h-24 bg-slate-200 rounded-xl" />
        <div className="h-24 bg-slate-200 rounded-xl" />
      </div>
    </div>
  )
}
