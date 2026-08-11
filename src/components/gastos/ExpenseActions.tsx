'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Pencil, Trash2, CheckSquare, Wallet } from "lucide-react"
import { updateExpense, deleteExpense } from "@/lib/gastos.actions"

type Participant = { id: string, nickname: string }
type Split = { id: string, userId: string, isSettled: boolean }

type ExpenseProps = {
  expense: {
    id: string
    title: string
    amount: number
    category: string | null
    payerId: string
    splits: Split[]
  }
  eventId: string
  currentUserId: string
  participants: Participant[]
}

export function ExpenseActions({ expense, eventId, currentUserId, participants }: ExpenseProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(expense.splits.map(s => s.userId))
  )
  const [payerId, setPayerId] = useState(expense.payerId)

  const handleSubmit = async (formData: FormData) => {
    formData.append('expenseId', expense.id)
    formData.append('eventId', eventId)
    formData.append('payerId', payerId)

    Array.from(selectedIds).forEach(id => {
      formData.append('splitWith', id)
    })

    await updateExpense(formData)
    setEditOpen(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    await deleteExpense(expense.id, eventId)
    setDeleteOpen(false)
    setIsDeleting(false)
  }

  const toggleParticipant = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const changePayer = (id: string) => {
    setPayerId(id)
    setSelectedIds(prev => new Set(prev).add(id))
  }

  const selectAll = () => setSelectedIds(new Set(participants.map(p => p.id)))
  const deselectAll = () => setSelectedIds(new Set())

  return (
    <div className="flex items-center gap-2">
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger render={<Button variant="ghost" size="sm" className="h-8 text-slate-500 hover:text-slate-900" />}>
          <Pencil className="w-4 h-4" />
          <span className="sr-only">Editar</span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Gasto</DialogTitle>
            <DialogDescription>
              Actualiza los datos de la compra.
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">¿Qué compraste / pagaste?</Label>
              <Input id="title" name="title" defaultValue={expense.title} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">¿Cuánto te costó? ($ COP)</Label>
              <Input id="amount" name="amount" type="number" min="1000" step="500" defaultValue={expense.amount} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <select id="category" name="category" defaultValue={expense.category ?? ''} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Sin categoría</option>
                <option value="FOOD">Comida y Bebida 🍔</option>
                <option value="TRANSPORT">Transporte 🚗</option>
                <option value="LODGING">Hospedaje 🏠</option>
                <option value="OTHER">Otro 🛒</option>
              </select>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <Label className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                ¿Quién pagó?
              </Label>
              <select
                value={payerId}
                onChange={(e) => changePayer(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {participants.map(p => (
                  <option key={p.id} value={p.id}>{p.nickname} {p.id === currentUserId && '(Tú)'}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label>¿Entre quiénes se divide?</Label>
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

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={selectedIds.size === 0}>
              Guardar Cambios
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger render={<Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-700" />}>
          <Trash2 className="w-4 h-4" />
          <span className="sr-only">Eliminar</span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar gasto?</DialogTitle>
            <DialogDescription>
              Se borrará "{expense.title}" y las deudas asociadas. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
