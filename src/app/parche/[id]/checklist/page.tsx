import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { NewChecklistItemDialog } from "@/components/checklist/NewChecklistItemDialog"
import { ChecklistItemRow } from "@/components/checklist/ChecklistItemRow"

export default async function ChecklistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const currentUserId = cookieStore.get('trip_user_id')?.value

  if (!currentUserId) return null

  const event = await prisma.event.findUnique({
    where: { id: id },
    include: {
      checklistItems: {
        include: { assignee: true },
        orderBy: { id: 'desc' }
      }
    }
  })

  if (!event) return null

  const items = event.checklistItems
  const totalItems = items.length
  const completedItems = items.filter(i => i.isCompleted).length
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const categories = [
    { id: 'FOOD', name: 'Comida / Carne 🥩' },
    { id: 'DRINKS', name: 'Bebidas / Pola 🍻' },
    { id: 'UTENSILS', name: 'Utensilios 🍽️' },
    { id: 'GAMES', name: 'Juegos / Bafle 🎲' },
    { id: 'OTHER', name: 'Otro 🎒' },
    { id: null, name: 'Sin clasificar' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">¿Quién lleva qué?</h2>
          <p className="text-muted-foreground">Que no se quede el carbón ni el abridor.</p>
        </div>
        <NewChecklistItemDialog eventId={event.id} />
      </div>

      <Card className="bg-white shadow-sm border-0 ring-1 ring-slate-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-end mb-2">
            <span className="font-semibold text-slate-700">Progreso del Parche</span>
            <span className="text-2xl font-black text-indigo-600">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3 bg-slate-100" />
          <p className="text-xs text-slate-500 mt-3 font-medium">
            {completedItems} de {totalItems} cosas listas
          </p>
        </CardContent>
      </Card>

      {totalItems === 0 ? (
        <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-xl">
          La lista está vacía. Empieza a anotar lo que falta.
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map(cat => {
            const catItems = items.filter(i => i.category === cat.id)
            if (catItems.length === 0) return null

            return (
              <div key={cat.name} className="space-y-3">
                <h3 className="font-bold text-lg text-slate-800">{cat.name}</h3>
                <div className="grid gap-2">
                  {catItems.map(item => (
                    <ChecklistItemRow 
                      key={item.id} 
                      item={item} 
                      eventId={event.id} 
                      currentUserId={currentUserId} 
                    />
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
