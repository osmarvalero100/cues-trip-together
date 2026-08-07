import { prisma } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Trash2, CalendarDays } from "lucide-react"
import { NewActivityDialog } from "@/components/itinerario/NewActivityDialog"
import { deleteItineraryItem } from "@/lib/itinerario.actions"
import { format, isSameDay } from "date-fns"
import { es } from "date-fns/locale"

export default async function CronogramaPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      itineraryItems: {
        orderBy: { timeStart: 'asc' }
      }
    }
  })

  if (!event) return null

  const items = event.itineraryItems

  // Group items by day
  const groupedItems = items.reduce((acc, item) => {
    const dayStr = format(item.timeStart, 'yyyy-MM-dd')
    if (!acc[dayStr]) {
      acc[dayStr] = []
    }
    acc[dayStr].push(item)
    return acc
  }, {} as Record<string, typeof items>)

  const sortedDays = Object.keys(groupedItems).sort()
  const defaultDate = event.dateStart ? event.dateStart : new Date()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cronograma</h2>
          <p className="text-muted-foreground">Para que nadie pregunte "¿a qué hora es que nos vamos?".</p>
        </div>
        <NewActivityDialog eventId={event.id} defaultDate={defaultDate} />
      </div>

      {sortedDays.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarDays className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">El cronograma está vacío</h3>
            <p className="text-slate-500 mb-4 max-w-sm">Agrega la hora de salida, las comidas y las actividades clave.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedDays.map((dayStr) => {
            const date = new Date(dayStr + 'T12:00:00Z') // Fix timezone offset for display
            return (
              <div key={dayStr} className="relative">
                <div className="sticky top-16 z-10 bg-slate-50/95 backdrop-blur py-2">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-indigo-600" />
                    {format(date, "EEEE, d 'de' MMMM", { locale: es })}
                  </h3>
                </div>
                
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-indigo-100 ml-2">
                  {groupedItems[dayStr].map((item) => (
                    <Card key={item.id} className="relative overflow-hidden group">
                      <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[1.35rem] top-6 ring-4 ring-slate-50" />
                      <CardContent className="p-4 sm:p-5 flex gap-4">
                        <div className="min-w-[4.5rem] pt-1">
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            {format(new Date(item.timeStart), "h:mm a")}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-slate-800 text-lg">{item.title}</h4>
                            
                            <form action={async () => {
                              'use server'
                              await deleteItineraryItem(item.id, event.id)
                            }}>
                              <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </form>
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                          
                          {item.costEst && (
                            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                              <span className="opacity-70">$</span>
                              {item.costEst.toLocaleString('es-CO')}
                              <span className="font-normal opacity-80 ml-1">aprox</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
