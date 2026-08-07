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
