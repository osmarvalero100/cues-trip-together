'use client'

import { useTransition } from 'react'
import { Button } from "@/components/ui/button"
import { settleDebt } from "@/lib/gastos.actions"
import { CheckCircle } from "lucide-react"

export function SettleDebtButton({ splitId, eventId }: { splitId: string, eventId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button 
      variant="outline" 
      size="sm"
      className="text-xs h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          settleDebt(splitId, eventId)
        })
      }}
    >
      <CheckCircle className="w-3 h-3 mr-1" />
      Marcar pagado
    </Button>
  )
}
