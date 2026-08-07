'use server'

import { prisma } from './db'
import { revalidatePath } from 'next/cache'

export async function addItineraryItem(formData: FormData) {
  const eventId = formData.get('eventId') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const timeStartStr = formData.get('timeStart') as string
  const costEstStr = formData.get('costEst') as string

  if (!eventId || !title || !timeStartStr) {
    throw new Error('Faltan campos obligatorios')
  }

  const costEst = costEstStr ? parseFloat(costEstStr) : null

  await prisma.itineraryItem.create({
    data: {
      eventId,
      title,
      description: description || null,
      timeStart: new Date(timeStartStr),
      costEst
    }
  })

  revalidatePath(`/parche/${eventId}/cronograma`)
}

export async function deleteItineraryItem(itemId: string, eventId: string) {
  await prisma.itineraryItem.delete({
    where: { id: itemId }
  })
  revalidatePath(`/parche/${eventId}/cronograma`)
}
