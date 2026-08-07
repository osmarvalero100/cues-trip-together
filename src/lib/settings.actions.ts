'use server'

import { prisma } from './db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateEventSettings(formData: FormData) {
  const eventId = formData.get('eventId') as string
  const title = formData.get('title') as string
  const location = formData.get('location') as string
  const description = formData.get('description') as string
  const coverUrl = formData.get('coverUrl') as string
  const dateStartStr = formData.get('dateStart') as string
  const dateEndStr = formData.get('dateEnd') as string

  if (!eventId || !title) throw new Error("Faltan campos obligatorios")

  await prisma.event.update({
    where: { id: eventId },
    data: {
      title,
      location: location || null,
      description: description || null,
      coverUrl: coverUrl || null,
      dateStart: dateStartStr ? new Date(dateStartStr) : null,
      dateEnd: dateEndStr ? new Date(dateEndStr) : null,
    }
  })

  revalidatePath(`/parche/${eventId}`)
}

export async function closeVoting(eventId: string) {
  await prisma.event.update({
    where: { id: eventId },
    data: { status: 'CONFIRMED' }
  })
  
  revalidatePath(`/parche/${eventId}`)
  redirect(`/parche/${eventId}`)
}

export async function deleteEvent(eventId: string) {
  await prisma.event.delete({
    where: { id: eventId }
  })
  
  redirect('/')
}

export async function removeParticipant(eventId: string, targetUserId: string) {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const currentUserId = cookieStore.get('trip_user_id')?.value

  if (!currentUserId) throw new Error("No autenticado")

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { creatorId: true }
  })

  if (!event) throw new Error("Parche no encontrado")

  // Solo el creador puede eliminar a otros, o el usuario puede eliminarse a sí mismo
  if (currentUserId !== event.creatorId && currentUserId !== targetUserId) {
    throw new Error("No tienes permisos para realizar esta acción")
  }

  // 1. Eliminar votos
  await prisma.vote.deleteMany({
    where: { userId: targetUserId, proposal: { eventId: eventId } }
  })

  // 2. Eliminar deudas en este parche (si el usuario le debía a alguien)
  await prisma.expenseSplit.deleteMany({
    where: { userId: targetUserId, expense: { eventId: eventId } }
  })

  // 3. Desasignar tareas del checklist
  await prisma.checklistItem.updateMany({
    where: { assigneeId: targetUserId, eventId: eventId },
    data: { assigneeId: null }
  })

  // 4. Desconectar del evento
  await prisma.event.update({
    where: { id: eventId },
    data: { participants: { disconnect: { id: targetUserId } } }
  })

  if (currentUserId === targetUserId) {
    redirect('/')
  } else {
    revalidatePath(`/parche/${eventId}`)
  }
}
