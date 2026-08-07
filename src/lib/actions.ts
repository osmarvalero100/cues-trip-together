'use server'

import { prisma } from './db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `PARCHE-${code}`
}

export async function createParche(formData: FormData) {
  const title = formData.get('title') as string
  const type = formData.get('type') as string // 'EXPRESS' | 'MULTINIGHT'
  const nickname = formData.get('nickname') as string

  if (!title || !type || !nickname) {
    throw new Error('Todos los campos son obligatorios')
  }

  // Crear usuario creador temporal
  const user = await prisma.user.create({
    data: { nickname }
  })

  // Crear parche
  const event = await prisma.event.create({
    data: {
      title,
      type,
      creatorId: user.id,
      inviteCode: generateInviteCode(),
      status: type === 'EXPRESS' ? 'CONFIRMED' : 'VOTING',
      participants: { connect: { id: user.id } }
    }
  })

  // Cookie/Session handling deberia hacerse aqui (guardando el user.id en cookie)
  // Para simplicidad, podemos pasarlo en la URL o manejar una cookie server-side
  // Importamos cookies de next/headers
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  cookieStore.set('trip_user_id', user.id, { path: '/', httpOnly: true })

  redirect(`/parche/${event.id}`)
}

export async function joinParche(formData: FormData) {
  const code = formData.get('code') as string
  const nickname = formData.get('nickname') as string

  if (!code || !nickname) {
    throw new Error('Código y apodo son obligatorios')
  }

  const event = await prisma.event.findUnique({
    where: { inviteCode: code.toUpperCase() }
  })

  if (!event) {
    throw new Error('Parche no encontrado con ese código')
  }

  const user = await prisma.user.create({
    data: { 
      nickname,
      participatingEvents: { connect: { id: event.id } }
    }
  })

  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  cookieStore.set('trip_user_id', user.id, { path: '/', httpOnly: true })

  redirect(`/parche/${event.id}`)
}
