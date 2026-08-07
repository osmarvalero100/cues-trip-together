'use server'

import { prisma } from './db'
import { revalidatePath } from 'next/cache'

export async function addChecklistItem(formData: FormData) {
  const eventId = formData.get('eventId') as string
  const title = formData.get('title') as string
  const category = formData.get('category') as string

  if (!eventId || !title) throw new Error('Faltan campos obligatorios')

  await prisma.checklistItem.create({
    data: {
      eventId,
      title,
      category: category || null
    }
  })

  revalidatePath(`/parche/${eventId}/checklist`)
}

export async function toggleChecklistItem(itemId: string, eventId: string, currentStatus: boolean) {
  await prisma.checklistItem.update({
    where: { id: itemId },
    data: { isCompleted: !currentStatus }
  })
  
  revalidatePath(`/parche/${eventId}/checklist`)
}

export async function assignChecklistItem(itemId: string, eventId: string, userId: string) {
  await prisma.checklistItem.update({
    where: { id: itemId },
    data: { assigneeId: userId }
  })
  
  revalidatePath(`/parche/${eventId}/checklist`)
}

export async function deleteChecklistItem(itemId: string, eventId: string) {
  await prisma.checklistItem.delete({
    where: { id: itemId }
  })
  
  revalidatePath(`/parche/${eventId}/checklist`)
}
