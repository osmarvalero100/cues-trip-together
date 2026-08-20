import Link from 'next/link'
import { Tent, User } from 'lucide-react'
import { getCurrentUser, logoutUser } from '@/lib/auth.actions'
import { Button } from '@/components/ui/button'

export async function Header() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 hover:text-indigo-600 transition-colors">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Tent className="w-5 h-5 text-white" />
          </div>
          <span className="hidden sm:inline-block">TripTogether</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user && user.email ? (
            <>
              <Link href="/mis-parches" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Mis Parches
              </Link>
              <form action={logoutUser}>
                <Button type="submit" variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                  Salir
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Iniciar Sesión
              </Link>
              <Link href="/auth/registro">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  Registrarse
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
