'use client'

import { useTransition } from 'react'
import { Check, Hand, Trash2, Loader2 } from "lucide-react"
import { toggleChecklistItem, assignChecklistItem, deleteChecklistItem } from "@/lib/checklist.actions"
import { Button } from "@/components/ui/button"

export function ChecklistItemRow({ 
  item, 
  eventId, 
  currentUserId 
}: { 
  item: any, 
  eventId: string,
  currentUserId: string
}) {
  const [isPending, startTransition] = useTransition()

  const isAssignedToMe = item.assigneeId === currentUserId

  return (
    <div className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all ${item.isCompleted ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="flex items-center gap-3">
        <button 
          disabled={isPending}
          onClick={() => {
            startTransition(() => {
              toggleChecklistItem(item.id, eventId, item.isCompleted)
            })
          }}
          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${item.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent hover:border-indigo-400'}`}
        >
          {isPending ? <Loader2 className={`w-4 h-4 animate-spin ${item.isCompleted ? 'text-white' : 'text-slate-400'}`} /> : <Check className="w-4 h-4" />}
        </button>
        <div>
          <p className={`font-semibold ${item.isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>
            {item.title}
          </p>
          {item.assignee ? (
            <p className="text-xs text-indigo-600 font-medium">
              Lleva: {item.assignee.nickname} {isAssignedToMe && '(Tú)'}
            </p>
          ) : (
            <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
              <Hand className="w-3 h-3" /> Sin asignar
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {!item.assignee && (
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-xs bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
            disabled={isPending}
            onClick={() => {
              startTransition(() => {
                assignChecklistItem(item.id, eventId, currentUserId)
              })
            }}
          >
            {isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null} Yo lo llevo
          </Button>
        )}
        
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
          disabled={isPending}
          onClick={() => {
            startTransition(() => {
              deleteChecklistItem(item.id, eventId)
            })
          }}
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}
