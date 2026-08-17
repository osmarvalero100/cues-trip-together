import { getCurrentUser } from '@/lib/auth.actions'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, CalendarDays, Tent, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function MisParchesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Obtener todos los parches donde el usuario es creador o participante
  const parches = await prisma.event.findMany({
    where: {
      OR: [
        { creatorId: user.id },
        { participants: { some: { userId: user.id } } }
      ]
    },
    include: {
      participants: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="flex-1 bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl">
            {user.nickname.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Mis Parches</h1>
            <p className="text-slate-600">Hola {user.nickname}, aquí está tu historial de viajes y planes.</p>
          </div>
        </div>

        {parches.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <Tent className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aún no tienes parches</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Crea tu primer parche o únete a uno usando el código de invitación que te compartan tus amigos.
            </p>
            <Link href="/">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Armar un Parche Nuevo
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parches.map((parche) => (
              <Card key={parche.id} className="overflow-hidden hover:shadow-lg transition-shadow border-slate-200">
                {parche.coverUrl ? (
                  <div className="h-32 w-full bg-slate-200">
                    <img src={parche.coverUrl} alt={parche.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-32 w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Tent className="w-12 h-12 text-white/50" />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      parche.status === 'VOTING' ? 'bg-amber-100 text-amber-800' :
                      parche.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {parche.status === 'VOTING' ? 'Votando...' : parche.status === 'CONFIRMED' ? 'Confirmado' : 'Archivado'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
                      {parche.type === 'EXPRESS' ? 'Express' : 'Multinoche'}
                    </span>
                  </div>
                  <CardTitle className="text-xl leading-tight">{parche.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-6">
                    {parche.location && (
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="w-4 h-4 mr-2 shrink-0 opacity-70" />
                        <span className="truncate">{parche.location}</span>
                      </div>
                    )}
                    {parche.dateStart && (
                      <div className="flex items-center text-sm text-slate-600">
                        <CalendarDays className="w-4 h-4 mr-2 shrink-0 opacity-70" />
                        <span>{parche.dateStart.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <Link href={`/parche/${parche.id}`}>
                    <Button variant="outline" className="w-full group">
                      Ver Parche
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
