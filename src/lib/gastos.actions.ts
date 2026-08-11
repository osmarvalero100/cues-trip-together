'use server'

import { prisma } from './db'
import { revalidatePath } from 'next/cache'

export async function addExpense(formData: FormData) {
  const eventId = formData.get('eventId') as string
  const payerId = formData.get('payerId') as string
  const title = formData.get('title') as string
  const amountStr = formData.get('amount') as string
  const category = formData.get('category') as string

  // Obtenemos todos los participantes seleccionados
  // FormData.getAll() devuelve un array con todos los values del mismo name
  const splitWithIds = formData.getAll('splitWith') as string[]

  if (!eventId || !payerId || !title || !amountStr || splitWithIds.length === 0) {
    throw new Error('Faltan campos obligatorios o no se seleccionaron participantes')
  }

  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Monto inválido')
  }

  // Crear el gasto
  const expense = await prisma.expense.create({
    data: {
      eventId,
      payerId,
      title,
      amount,
      category: category || null
    }
  })

  // Dividir equitativamente entre los seleccionados
  const splitAmount = amount / splitWithIds.length

  const splitsData = splitWithIds.map(userId => ({
    expenseId: expense.id,
    userId,
    amountOwed: splitAmount,
    isSettled: userId === payerId // Si yo pagué mi parte, ya está saldada
  }))

  await prisma.expenseSplit.createMany({
    data: splitsData
  })

  revalidatePath(`/parche/${eventId}/gastos`)
}

export async function settleDebt(splitId: string, eventId: string) {
  await prisma.expenseSplit.update({
    where: { id: splitId },
    data: { isSettled: true }
  })
  
  revalidatePath(`/parche/${eventId}/gastos`)
}

export async function updateExpense(formData: FormData) {
  const expenseId = formData.get('expenseId') as string
  const eventId = formData.get('eventId') as string
  const payerId = formData.get('payerId') as string
  const title = formData.get('title') as string
  const amountStr = formData.get('amount') as string
  const category = formData.get('category') as string
  const splitWithIds = formData.getAll('splitWith') as string[]

  if (!expenseId || !eventId || !title || !amountStr || splitWithIds.length === 0) {
    throw new Error('Faltan campos obligatorios o no se seleccionaron participantes')
  }

  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Monto inválido')
  }

  await prisma.$transaction(async (tx) => {
    await tx.expense.update({
      where: { id: expenseId },
      data: { title, amount, category: category || null }
    })

    // Recalcular los splits repartiendo equitativamente
    await tx.expenseSplit.deleteMany({ where: { expenseId } })

    const splitAmount = amount / splitWithIds.length
    await tx.expenseSplit.createMany({
      data: splitWithIds.map(userId => ({
        expenseId,
        userId,
        amountOwed: splitAmount,
        isSettled: userId === payerId
      }))
    })
  })

  revalidatePath(`/parche/${eventId}/gastos`)
}

export async function deleteExpense(expenseId: string, eventId: string) {
  await prisma.expense.delete({
    where: { id: expenseId }
  })

  revalidatePath(`/parche/${eventId}/gastos`)
}
