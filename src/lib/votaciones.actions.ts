'use server'

import { prisma } from './db'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function addProposal(formData: FormData) {
  const eventId = formData.get('eventId') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const linkUrl = formData.get('linkUrl') as string

  if (!eventId || !title) throw new Error("Faltan campos obligatorios")

  await prisma.proposal.create({
    data: { eventId, title, description, linkUrl }
  })

  revalidatePath(`/parche/${eventId}/votaciones`)
}

export async function voteProposal(eventId: string, proposalId: string) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('trip_user_id')?.value

  if (!userId) throw new Error("Usuario no autenticado")

  // Eliminar voto anterior en este evento si existe para garantizar 1 voto
  // Primero buscamos todas las propuestas del evento
  const eventProposals = await prisma.proposal.findMany({
    where: { eventId },
    select: { id: true }
  })
  
  const proposalIds = eventProposals.map(p => p.id)

  await prisma.vote.deleteMany({
    where: {
      userId,
      proposalId: { in: proposalIds }
    }
  })

  // Crear nuevo voto
  await prisma.vote.create({
    data: { proposalId, userId }
  })

  revalidatePath(`/parche/${eventId}/votaciones`)
}
