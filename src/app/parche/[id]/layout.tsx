import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Map, CalendarDays, Wallet, CheckSquare, Settings, ArrowLeft } from "lucide-react"

export default async function ParcheLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const userId = cookieStore.get('trip_user_id')?.value

  if (!userId) {
    redirect('/')
  }

  const event = await prisma.event.findUnique({
    where: { id: id },
    include: {
      creator: true
    }
  })

  if (!event) {
    redirect('/')
  }

  const navItems = [
    { name: 'Resumen', href: `/parche/${event.id}`, icon: Map },
    { name: 'Votaciones', href: `/parche/${event.id}/votaciones`, icon: Map, hide: event.status !== 'VOTING' },
    { name: 'Cronograma', href: `/parche/${event.id}/cronograma`, icon: CalendarDays },
    { name: 'Gastos', href: `/parche/${event.id}/gastos`, icon: Wallet },
    { name: 'Checklist', href: `/parche/${event.id}/checklist`, icon: CheckSquare },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-lg text-slate-900 truncate max-w-[200px] md:max-w-md">
                {event.title}
              </h1>
              <div className="text-xs text-slate-500 font-medium">
                Código: <span className="uppercase tracking-widest text-indigo-600 font-mono bg-indigo-50 px-1 py-0.5 rounded">{event.inviteCode}</span>
              </div>
            </div>
          </div>
          
          <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="container mx-auto px-4">
          <nav className="flex overflow-x-auto hide-scrollbar gap-1 py-2">
            {navItems.filter(item => !item.hide).map(item => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors focus:bg-indigo-50 focus:text-indigo-700"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        {children}
      </main>
    </div>
  )
}
