'use client'

import { useTransition } from 'react'
import { Button } from "@/components/ui/button"
import { voteProposal } from "@/lib/votaciones.actions"
import { ThumbsUp } from "lucide-react"

export function VoteButton({ 
  eventId, 
  proposalId, 
  hasVoted, 
  voteCount 
}: { 
  eventId: string, 
  proposalId: string, 
  hasVoted: boolean,
  voteCount: number
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button 
      variant={hasVoted ? "default" : "outline"}
      className={hasVoted ? "bg-emerald-600 hover:bg-emerald-700" : ""}
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          voteProposal(eventId, proposalId)
        })
      }}
    >
      <ThumbsUp className="w-4 h-4 mr-2" />
      {hasVoted ? 'Tu Voto' : 'Votar'} ({voteCount})
    </Button>
  )
}
