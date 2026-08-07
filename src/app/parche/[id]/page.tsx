import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, AlertCircle, Sparkles } from "lucide-react"

export default async function ParcheResumenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await prisma.event.findUnique({
    where: { id: id },
    include: {
      creator: true
    }
  })

  if (!event) return null

  // Usuarios del parche (aquellos que han votado, tienen gastos o checklist)
  // Como simplificación por ahora, listamos al creador.
  // En una consulta real, buscaríamos todos los usuarios asociados a este event.
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Resumen del Parche</h2>
          <p className="text-muted-foreground">Aquí está toda la info de lo que están armando.</p>
        </div>
        <Badge variant={event.status === 'VOTING' ? 'secondary' : 'default'} className="text-sm px-3 py-1">
          {event.status === 'VOTING' ? 'En Votación 🗳️' : 'Confirmado ✅'}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Tipo de Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {event.type === 'EXPRESS' ? 'Plan Express ⚡' : 'Viaje Multinoche 🏕️'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Organizado por {event.creator.nickname}
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm bg-indigo-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100 flex items-center gap-2">
              <Users className="w-4 h-4" /> 
              Invita a la gente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-widest bg-black/10 rounded-lg p-2 inline-block">
              {event.inviteCode}
            </div>
            <p className="text-xs text-indigo-100 mt-2">
              Comparte este código por WhatsApp
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Siguiente Paso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                {event.status === 'VOTING' ? <AlertCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {event.status === 'VOTING' 
                    ? 'Ve a la pestaña Votaciones para proponer destinos o votar por los existentes.'
                    : '¡Plan confirmado! Revisa el cronograma y empieza a repartir los gastos.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
