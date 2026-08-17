'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/ui/submit-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CalendarPlus } from "lucide-react"
import { addItineraryItem } from "@/lib/itinerario.actions"

export function NewActivityDialog({ eventId, defaultDate }: { eventId: string, defaultDate?: Date }) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    formData.append('eventId', eventId)
    await addItineraryItem(formData)
    setOpen(false)
  }

  // Set default datetime local format: YYYY-MM-DDTHH:mm
  const defaultDateTime = defaultDate ? new Date(defaultDate.getTime() - (defaultDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700" />}>
        <CalendarPlus className="w-4 h-4 mr-2" />
        Agregar Actividad
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Actividad al Cronograma</DialogTitle>
          <DialogDescription>
            Agrega qué se va a hacer y a qué hora para que nadie llegue tarde.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">¿Qué vamos a hacer?</Label>
            <Input id="title" name="title" placeholder="Almuerzo, Piscina, Fogata..." required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timeStart">Fecha y Hora</Label>
            <Input id="timeStart" name="timeStart" type="datetime-local" defaultValue={defaultDateTime} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detalles (Opcional)</Label>
            <Input id="description" name="description" placeholder="Llevar vestido de baño..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="costEst">Costo Estimado ($ COP) - Opcional</Label>
            <Input id="costEst" name="costEst" type="number" min="0" step="1000" placeholder="15000" />
          </div>

          <SubmitButton loadingText="Guardando..." className="w-full bg-indigo-600 hover:bg-indigo-700">
            Guardar Actividad
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  )
}
