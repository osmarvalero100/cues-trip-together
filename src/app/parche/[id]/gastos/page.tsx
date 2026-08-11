import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Receipt, Wallet, Banknote, ArrowRight } from "lucide-react"
import { NewExpenseDialog } from "@/components/gastos/NewExpenseDialog"
import { SettleDebtButton } from "@/components/gastos/SettleDebtButton"
import { ExpenseActions } from "@/components/gastos/ExpenseActions"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function GastosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const currentUserId = cookieStore.get('trip_user_id')?.value

  if (!currentUserId) return null

  const event = await prisma.event.findUnique({
    where: { id: id },
    include: {
      participants: {
        include: { user: true }
      },
      expenses: {
        include: {
          payer: true,
          splits: {
            include: { user: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!event) return null

  // Calcular balances netos para minimización
  const balances: Record<string, { id: string, name: string, net: number }> = {}
  
  event.participants.forEach(p => {
    balances[p.user.id] = { id: p.user.id, name: p.user.nickname, net: 0 }
  })

  // Lista de deudas crudas sin saldar (para ver el detalle)
  const pendingSplits: any[] = []

  let totalGastado = 0

  event.expenses.forEach((exp: any) => {
    totalGastado += exp.amount
    
    // El que pagó suma a su favor todo lo que no era su parte (si no se ha saldado)
    // Para hacer la minimización correctamente sobre deudas pendientes, 
    // sumamos los splits NO saldados.
    exp.splits.forEach((split: any) => {
      if (!split.isSettled && split.userId !== exp.payerId) {
        if (balances[split.userId]) balances[split.userId].net -= split.amountOwed
        if (balances[exp.payerId]) balances[exp.payerId].net += split.amountOwed
        
        pendingSplits.push({
          id: split.id,
          expenseTitle: exp.title,
          payer: exp.payer,
          debtor: split.user,
          amount: split.amountOwed,
          date: exp.createdAt
        })
      }
    })
  })

  // Minimización de deudas (Algoritmo Greedy)
  const debtors = Object.values(balances).filter(b => b.net < -0.01).sort((a, b) => a.net - b.net) // los más deudores primero
  const creditors = Object.values(balances).filter(b => b.net > 0.01).sort((a, b) => b.net - a.net) // los más acreedores primero

  const simplifiedDebts: { from: string, to: string, amount: number }[] = []
  
  let i = 0, j = 0
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    
    const amount = Math.min(-debtor.net, creditor.net)
    
    simplifiedDebts.push({
      from: debtor.name,
      to: creditor.name,
      amount
    })
    
    debtor.net += amount
    creditor.net -= amount
    
    if (Math.abs(debtor.net) < 0.01) i++
    if (Math.abs(creditor.net) < 0.01) j++
  }

  // Verificar si hay gastos donde no participe el currentUser pero el evento tiene participantes.
  // En Next 14, un form select es mejor, pero ya hicimos un dialog que maneja client state.
  
  // Convert participant format
  const participantList = event.participants.map(p => ({ id: p.user.id, nickname: p.user.nickname }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cuentas Claras</h2>
          <p className="text-muted-foreground">Porque el que paga descansa, y el que cobra también.</p>
        </div>
        <NewExpenseDialog eventId={event.id} participants={participantList} currentUserId={currentUserId} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-slate-900 text-white shadow-lg border-0 overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Gastado del Parche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              ${totalGastado.toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-slate-400 mt-1">En {event.expenses.length} compra(s)</p>
          </CardContent>
        </Card>

        {balances[currentUserId] && (
          <Card className={balances[currentUserId].net >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Mi Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balances[currentUserId].net >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {balances[currentUserId].net >= 0 ? '+' : ''}
                ${balances[currentUserId].net.toLocaleString('es-CO')}
              </div>
              <p className="text-xs mt-1 opacity-80 font-medium">
                {balances[currentUserId].net > 0 
                  ? 'Te deben platica 🎉' 
                  : balances[currentUserId].net < 0 
                    ? 'Ponte al día con las deudas 😬' 
                    : 'Estás a paz y salvo 🕊️'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="resumen" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="resumen">Resumen de Deudas</TabsTrigger>
          <TabsTrigger value="historial">Historial de Gastos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumen" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Deudas Simplificadas</CardTitle>
              <CardDescription>La forma más fácil de quedar a paz y salvo entre todos.</CardDescription>
            </CardHeader>
            <CardContent>
              {simplifiedDebts.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  Nadie le debe a nadie. ¡Todos felices! 🥳
                </div>
              ) : (
                <div className="space-y-4">
                  {simplifiedDebts.map((debt, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-800">{debt.from}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-800">{debt.to}</span>
                      </div>
                      <div className="font-bold text-lg text-red-600">
                        ${debt.amount.toLocaleString('es-CO')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalle por Cobrar / Pagar</CardTitle>
              <CardDescription>Deudas exactas por cada compra. Marca como pagado cuando te transfieran por Nequi.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingSplits.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-sm">
                  No hay cuentas pendientes al detalle.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingSplits.map((split) => {
                    const isMyDebt = split.debtor.id === currentUserId
                    const amIOwed = split.payer.id === currentUserId
                    
                    return (
                      <div key={split.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMyDebt ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                            <Banknote className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              <span className="font-bold">{split.debtor.nickname}</span> le debe a <span className="font-bold">{split.payer.nickname}</span>
                            </p>
                            <p className="text-sm text-slate-500">Por: {split.expenseTitle}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                          <div className="text-lg font-bold text-slate-900">
                            ${split.amount.toLocaleString('es-CO')}
                          </div>
                          {(amIOwed || isMyDebt) && (
                            <SettleDebtButton splitId={split.id} eventId={event.id} />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          <div className="space-y-4">
            {event.expenses.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-xl">
                Aún no han registrado ningún gasto.
              </div>
            ) : (
              event.expenses.map((exp: any) => (
                <Card key={exp.id} className="shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                          <Receipt className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{exp.title}</h4>
                          <p className="text-sm text-slate-500">Pagado por <span className="font-medium text-slate-800">{exp.payer.nickname}</span> el {format(new Date(exp.createdAt), "d MMM", { locale: es })}</p>
                          
                          <div className="mt-3 flex gap-2 flex-wrap">
                            {exp.splits.map((s: any) => (
                              <Badge key={s.id} variant={s.isSettled ? "secondary" : "outline"} className={s.isSettled ? "bg-slate-100 text-slate-500" : "border-amber-200 bg-amber-50 text-amber-700"}>
                                {s.user.nickname}: ${s.amountOwed.toLocaleString('es-CO')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-xl font-black">
                        ${exp.amount.toLocaleString('es-CO')}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <ExpenseActions
                        expense={{
                          id: exp.id,
                          title: exp.title,
                          amount: exp.amount,
                          category: exp.category,
                          payerId: exp.payerId,
                          splits: exp.splits.map((s: any) => ({ id: s.id, userId: s.userId, isSettled: s.isSettled }))
                        }}
                        eventId={event.id}
                        currentUserId={currentUserId}
                        participants={participantList}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
