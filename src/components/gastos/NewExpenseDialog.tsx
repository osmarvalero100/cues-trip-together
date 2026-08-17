'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/ui/submit-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Receipt, Users, CheckSquare } from "lucide-react"
import { addExpense } from "@/lib/gastos.actions"

type Participant = { id: string, nickname: string }

export function NewExpenseDialog({ eventId, participants, currentUserId }: { eventId: string, participants: Participant[], currentUserId: string }) {
  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(participants.map(p => p.id)))

  const handleSubmit = async (formData: FormData) => {
    formData.append('eventId', eventId)
    formData.append('payerId', currentUserId)
    
    // Añadimos cada persona seleccionada
    Array.from(selectedIds).forEach(id => {
      formData.append('splitWith', id)
    })

    await addExpense(formData)
    setOpen(false)
  }

  const toggleParticipant = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAll = () => setSelectedIds(new Set(participants.map(p => p.id)))
  const deselectAll = () => setSelectedIds(new Set())

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto" />}>
        <Receipt className="w-4 h-4 mr-2" />
        Registrar Gasto
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Anotar Cuentas</DialogTitle>
          <DialogDescription>
            Registra lo que pagaste. Dividiremos el costo entre los que selecciones.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">¿Qué compraste / pagaste?</Label>
            <Input id="title" name="title" placeholder="Carnes, Cerveza, Peajes..." required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">¿Cuánto te costó? ($ COP)</Label>
            <Input id="amount" name="amount" type="number" min="1000" step="500" placeholder="50000" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <select id="category" name="category" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option value="FOOD">Comida y Bebida 🍔</option>
              <option value="TRANSPORT">Transporte 🚗</option>
              <option value="LODGING">Hospedaje 🏠</option>
              <option value="OTHER">Otro 🛒</option>
            </select>
          </div>

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> 
                  ¿Entre quiénes se divide?
                </Label>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAll} className="text-xs font-medium text-indigo-600 hover:underline">Todos</button>
                  <span className="text-xs text-slate-300">|</span>
                  <button type="button" onClick={deselectAll} className="text-xs font-medium text-indigo-600 hover:underline">Ninguno</button>
                </div>
              </div>
            <div className="space-y-2 max-h-40 overflow-y-auto bg-slate-50 p-2 rounded-lg">
              {participants.map(p => (
                <Label key={p.id} onClick={() => toggleParticipant(p.id)} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${selectedIds.has(p.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                    {selectedIds.has(p.id) && <CheckSquare className="w-3.5 h-3.5" />}
                  </div>
                  <span className="font-medium">{p.nickname} {p.id === currentUserId && '(Tú)'}</span>
                </Label>
              ))}
            </div>
            {selectedIds.size === 0 && (
              <p className="text-sm text-red-500">Debes seleccionar al menos una persona</p>
            )}
          </div>

          <SubmitButton loadingText="Guardando..." className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={selectedIds.size === 0}>
            Guardar Gasto
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  )
}
