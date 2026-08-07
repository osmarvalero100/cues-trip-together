import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, ExternalLink } from "lucide-react"
import { NewProposalDialog } from "@/components/votaciones/NewProposalDialog"
import { VoteButton } from "@/components/votaciones/VoteButton"

export default async function VotacionesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const userId = cookieStore.get('trip_user_id')?.value

  const event = await prisma.event.findUnique({
    where: { id: id },
    include: {
      proposals: {
        include: {
          votes: true
        }
      }
    }
  })

  if (!event || event.status !== 'VOTING') {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold text-slate-700">Las votaciones están cerradas</h3>
        <p className="text-slate-500 mt-2">El destino ya fue decidido o el evento ha finalizado.</p>
      </div>
    )
  }

  // Ordenar por número de votos desc
  const sortedProposals = event.proposals.sort((a, b) => b.votes.length - a.votes.length)
  const totalVotes = event.proposals.reduce((acc, curr) => acc + curr.votes.length, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">¿Para dónde vamos?</h2>
          <p className="text-muted-foreground">Voten por el lugar que más les guste. Gana la mayoría.</p>
        </div>
        <NewProposalDialog eventId={event.id} />
      </div>

      {sortedProposals.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Nadie ha propuesto nada</h3>
            <p className="text-slate-500 mb-4 max-w-sm">Sé el primero en tirar una idea para el parche.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedProposals.map((prop, index) => {
            const hasVoted = prop.votes.some(v => v.userId === userId)
            const percentage = totalVotes > 0 ? Math.round((prop.votes.length / totalVotes) * 100) : 0
            
            return (
              <Card key={prop.id} className={hasVoted ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {index === 0 && prop.votes.length > 0 && <span className="text-xl">🏆</span>}
                        {prop.title}
                      </CardTitle>
                      {prop.description && (
                        <CardDescription className="mt-1">{prop.description}</CardDescription>
                      )}
                    </div>
                    {hasVoted && <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">Tu Voto</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-500 min-w-[3ch] text-right">
                      {percentage}%
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  {prop.linkUrl ? (
                    <a href={prop.linkUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 font-medium flex items-center hover:underline">
                      Ver enlace <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  ) : <div></div>}
                  
                  <VoteButton 
                    eventId={event.id}
                    proposalId={prop.id}
                    hasVoted={hasVoted}
                    voteCount={prop.votes.length}
                  />
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
