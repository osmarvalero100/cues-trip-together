'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { addChecklistItem } from "@/lib/checklist.actions"

export function NewChecklistItemDialog({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    formData.append('eventId', eventId)
    await addChecklistItem(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Anotar algo más
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Qué falta por llevar?</DialogTitle>
          <DialogDescription>
            Anota las cosas para que a nadie se le olvide.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Elemento</Label>
            <Input id="title" name="title" placeholder="Ej: Carbón, Bafle, Bloqueador..." required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <select id="category" name="category" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <option value="FOOD">Comida / Carne 🥩</option>
              <option value="DRINKS">Bebidas / Pola 🍻</option>
              <option value="UTENSILS">Utensilios 🍽️</option>
              <option value="GAMES">Juegos / Bafle 🎲</option>
              <option value="OTHER">Otro 🎒</option>
            </select>
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
            Agregar a la lista
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
