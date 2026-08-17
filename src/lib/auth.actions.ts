'use server'

import { prisma } from './db'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

export async function registerUser(formData: FormData) {
  const nickname = formData.get('nickname') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!nickname || !email || !password) {
    throw new Error('Todos los campos son obligatorios')
  }

  const cookieStore = await cookies()
  const existingUserId = cookieStore.get('trip_user_id')?.value

  // Verificar si el correo ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error('Este correo ya está registrado')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  let finalUserId = ''

  // Si tiene un ID anónimo, lo convertimos a cuenta registrada
  if (existingUserId) {
    const anonUser = await prisma.user.findUnique({
      where: { id: existingUserId }
    })

    if (anonUser && !anonUser.email) {
      const updatedUser = await prisma.user.update({
        where: { id: existingUserId },
        data: {
          nickname: nickname.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword
        }
      })
      finalUserId = updatedUser.id
    }
  }

  // Si no se actualizó un usuario anónimo, creamos uno nuevo
  if (!finalUserId) {
    const newUser = await prisma.user.create({
      data: {
        nickname: nickname.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword
      }
    })
    finalUserId = newUser.id
  }

  cookieStore.set('trip_user_id', finalUserId, { path: '/', httpOnly: true })
  redirect('/mis-parches')
}

export async function loginUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    throw new Error('Correo y contraseña son obligatorios')
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() }
  })

  if (!user || !user.password) {
    throw new Error('Credenciales inválidas')
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    throw new Error('Credenciales inválidas')
  }

  const cookieStore = await cookies()
  cookieStore.set('trip_user_id', user.id, { path: '/', httpOnly: true })
  redirect('/mis-parches')
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete('trip_user_id')
  redirect('/')
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('trip_user_id')?.value

  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  return user
}
