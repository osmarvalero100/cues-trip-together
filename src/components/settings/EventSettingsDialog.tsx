'use client'

import { useState, useTransition } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Users, AlertTriangle, Image as ImageIcon } from "lucide-react"
import { updateEventSettings, closeVoting, deleteEvent } from "@/lib/settings.actions"

type Participant = { id: string, nickname: string, createdAt: Date }
type EventData = {
  id: string
  title: string
  location: string | null
  description: string | null
  coverUrl: string | null
  dateStart: Date | null
  dateEnd: Date | null
  status: string
  participants: Participant[]
}

export function EventSettingsDialog({ event }: { event: EventData }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleUpdate = async (formData: FormData) => {
    formData.append('eventId', event.id)
    await updateEventSettings(formData)
    setOpen(false)
  }

  // Formatting dates for inputs
  const formatDateForInput = (date: Date | null) => {
    if (!date) return ''
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200" />}>
        <Settings className="w-4 h-4" />
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración del Parche</DialogTitle>
          <DialogDescription>
            Administra los detalles, los invitados y el ciclo de vida del parche.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="invitados">Invitados</TabsTrigger>
            <TabsTrigger value="avanzado">Avanzado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 pt-4">
            <form action={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nombre del Parche</Label>
                <Input id="title" name="title" defaultValue={event.title} required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateStart">Inicio</Label>
                  <Input id="dateStart" name="dateStart" type="datetime-local" defaultValue={formatDateForInput(event.dateStart)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateEnd">Fin</Label>
                  <Input id="dateEnd" name="dateEnd" type="datetime-local" defaultValue={formatDateForInput(event.dateEnd)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación / Destino</Label>
                <Input id="location" name="location" defaultValue={event.location || ''} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverUrl">URL de Portada (Imagen)</Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center w-10 h-10 bg-slate-100 rounded-md shrink-0 border border-slate-200">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <Input id="coverUrl" name="coverUrl" type="url" placeholder="https://..." defaultValue={event.coverUrl || ''} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Detalles sobre el viaje, reglas, notas importantes..."
                  defaultValue={event.description || ''}
                  className="resize-none h-24"
                />
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                Guardar Cambios
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="invitados" className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-500 font-medium pb-2 border-b">
                <span>{event.participants.length} personas en el parche</span>
                <Users className="w-4 h-4" />
              </div>
              
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {event.participants.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                        {p.nickname.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800">{p.nickname}</span>
                    </div>
                    {i === 0 && (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                        Creador
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="avanzado" className="space-y-6 pt-4">
            {event.status === 'VOTING' && (
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-3">
                <h4 className="font-bold text-indigo-900">Cerrar Votaciones</h4>
                <p className="text-sm text-indigo-700 leading-relaxed">
                  Si el destino ya fue decidido, puedes cerrar la fase de votaciones. Esto ocultará la pestaña de propuestas para todos.
                </p>
                <Button 
                  variant="outline" 
                  className="bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(() => {
                      closeVoting(event.id)
                      setOpen(false)
                    })
                  }}
                >
                  Confirmar Destino
                </Button>
              </div>
            )}

            <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-3">
              <h4 className="font-bold text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Zona de Peligro
              </h4>
              <p className="text-sm text-red-700 leading-relaxed">
                Esta acción es irreversible. Se eliminará el parche completo incluyendo gastos, itinerarios, deudas y votaciones.
              </p>
              <Button 
                variant="destructive"
                disabled={isPending}
                onClick={() => {
                  if (confirm("¿Estás 100% seguro de que quieres eliminar todo este parche?")) {
                    startTransition(() => {
                      deleteEvent(event.id)
                    })
                  }
                }}
              >
                Eliminar Parche
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
