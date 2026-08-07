'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { addProposal } from "@/lib/votaciones.actions"

export function NewProposalDialog({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    formData.append('eventId', eventId)
    await addProposal(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error DialogTrigger types missing asChild */}
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
          <PlusCircle className="w-4 h-4 mr-2" />
          Proponer Destino
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Propuesta</DialogTitle>
          <DialogDescription>
            Agrega un lugar al que te gustaría que fueran. ¡Véndeles la idea!
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Lugar / Plan</Label>
            <Input id="title" name="title" placeholder="Ej: Santa Marta, Finca en Melgar" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">¿Por qué deberíamos ir aquí?</Label>
            <Input id="description" name="description" placeholder="Es barato, tiene piscina..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkUrl">Enlace (Airbnb, Maps, etc.) - Opcional</Label>
            <Input id="linkUrl" name="linkUrl" type="url" placeholder="https://..." />
          </div>
          <Button type="submit" className="w-full">Agregar Propuesta</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
