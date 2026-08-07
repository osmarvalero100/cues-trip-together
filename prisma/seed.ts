import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed de datos...')

  // Limpiar base de datos
  await prisma.vote.deleteMany()
  await prisma.proposal.deleteMany()
  await prisma.itineraryItem.deleteMany()
  await prisma.expenseSplit.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.checklistItem.deleteMany()
  await prisma.event.deleteMany()
  await prisma.user.deleteMany()

  // --- Usuarios ---
  const user1 = await prisma.user.create({ data: { nickname: 'Juan' } })
  const user2 = await prisma.user.create({ data: { nickname: 'Carlos' } })
  const user3 = await prisma.user.create({ data: { nickname: 'Ana' } })
  const user4 = await prisma.user.create({ data: { nickname: 'Tío Roberto' } })
  const user5 = await prisma.user.create({ data: { nickname: 'Doña Marta' } })

  // --- DEMO 1 (MODO INDECISO - VOTACIÓN): "Paseo de Puente Festivo con la Familia" ---
  const event1 = await prisma.event.create({
    data: {
      title: 'Paseo de Puente Festivo con la Familia',
      type: 'MULTINIGHT',
      status: 'VOTING',
      inviteCode: 'PUENTE-2026',
      creatorId: user1.id,
    }
  })

  const prop1 = await prisma.proposal.create({
    data: { eventId: event1.id, title: 'Eje Cafetero', description: 'Visitar Salento y Filandia' }
  })
  const prop2 = await prisma.proposal.create({
    data: { eventId: event1.id, title: 'Santa Marta & Tayrona', description: 'Playa y brisa' }
  })
  const prop3 = await prisma.proposal.create({
    data: { eventId: event1.id, title: 'Villa de Leyva', description: 'Pueblito colonial' }
  })

  // Simular votos (5, 3, 2)
  for(let i=0; i<5; i++) {
    const u = await prisma.user.create({ data: { nickname: `Votante Eje ${i}` }})
    await prisma.vote.create({ data: { proposalId: prop1.id, userId: u.id }})
  }
  for(let i=0; i<3; i++) {
    const u = await prisma.user.create({ data: { nickname: `Votante Marta ${i}` }})
    await prisma.vote.create({ data: { proposalId: prop2.id, userId: u.id }})
  }
  for(let i=0; i<2; i++) {
    const u = await prisma.user.create({ data: { nickname: `Votante Villa ${i}` }})
    await prisma.vote.create({ data: { proposalId: prop3.id, userId: u.id }})
  }

  await prisma.expense.create({
    data: {
      eventId: event1.id,
      title: 'Abono de transporte',
      amount: 120000,
      payerId: user1.id,
      category: 'TRANSPORT',
    }
  })

  // --- DEMO 2 (MODO DECIDIDO - PLAN EXPRESS): "Asado y Paseo de Olla Dominical" ---
  const nextSunday = new Date()
  nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()))
  nextSunday.setHours(9, 0, 0, 0)

  const event2 = await prisma.event.create({
    data: {
      title: 'Asado y Paseo de Olla Dominical',
      type: 'EXPRESS',
      status: 'CONFIRMED',
      inviteCode: 'ASADO-OLLA',
      creatorId: user4.id,
      location: 'Finca en Anapoima',
      dateStart: nextSunday,
    }
  })

  await prisma.checklistItem.createMany({
    data: [
      { eventId: event2.id, title: 'Carne y carbón', category: 'FOOD', isCompleted: true, assigneeId: user4.id },
      { eventId: event2.id, title: 'Papa criolla y guacamole', category: 'FOOD', isCompleted: false, assigneeId: user5.id },
      { eventId: event2.id, title: 'Pola e hielo', category: 'DRINKS', isCompleted: false, assigneeId: user2.id },
      { eventId: event2.id, title: 'Bafle y Parqués', category: 'GAMES', isCompleted: false, assigneeId: null },
    ]
  })

  const time1 = new Date(nextSunday)
  time1.setHours(9, 0, 0, 0)
  const time2 = new Date(nextSunday)
  time2.setHours(11, 30, 0, 0)
  const time3 = new Date(nextSunday)
  time3.setHours(14, 0, 0, 0)
  const time4 = new Date(nextSunday)
  time4.setHours(16, 0, 0, 0)

  await prisma.itineraryItem.createMany({
    data: [
      { eventId: event2.id, title: 'Salida', timeStart: time1 },
      { eventId: event2.id, title: 'Fogón & Refajo', timeStart: time2 },
      { eventId: event2.id, title: 'Almuerzo', timeStart: time3 },
      { eventId: event2.id, title: 'Parqués y piscina', timeStart: time4 },
    ]
  })

  // --- DEMO 3 (MODO DECIDIDO - VIAJE CONFIRMADO): "Vacaciones de Fin de Año en San Andrés" ---
  const dec26 = new Date('2026-12-26T12:00:00Z')
  const jan2 = new Date('2027-01-02T12:00:00Z')

  const event3 = await prisma.event.create({
    data: {
      title: 'Vacaciones de Fin de Año en San Andrés',
      type: 'MULTINIGHT',
      status: 'CONFIRMED',
      inviteCode: 'SAN-ANDRES-26',
      creatorId: user1.id,
      dateStart: dec26,
      dateEnd: jan2,
      location: 'San Andrés',
    }
  })

  const exp1 = await prisma.expense.create({
    data: { eventId: event3.id, payerId: user1.id, title: 'Tiquetes', amount: 3200000, category: 'TRANSPORT' }
  })
  const exp2 = await prisma.expense.create({
    data: { eventId: event3.id, payerId: user3.id, title: 'Hospedaje', amount: 2800000, category: 'LODGING' }
  })

  // Carlos (user2) le debe a Juan (user1) $1.500.000 (lo representamos como un split del tiquete)
  await prisma.expenseSplit.create({
    data: { expenseId: exp1.id, userId: user2.id, amountOwed: 1500000, isSettled: false }
  })

  console.log('Seed de datos finalizado exitosamente.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
