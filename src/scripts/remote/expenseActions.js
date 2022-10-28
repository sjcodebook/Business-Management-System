import * as dayjs from 'dayjs'

import { firestore } from './../fire'

export function addExpenseRecord(userId, totalAmount, images, name, forDate) {
  return firestore
    .collection('expenses')
    .add({
      userId,
      totalAmount,
      images,
      name,
      forDate,
      isApproved: false,
      isActive: true,
      createdAt: dayjs().unix(),
    })
    .catch((err) => {
      console.error(`addExpenseRecord. Error:\n${err}`)
      throw new Error(err)
    })
}

export function setListenerOnExpenses(startThreshold, endThreshold, setExpenses, userId = null) {
  let promise = firestore
    .collection('expenses')
    .where('isActive', '==', true)
    .where('forDate', '>=', startThreshold)
    .where('forDate', '<=', endThreshold)

  if (userId) {
    promise = promise.where('userId', '==', userId)
  }

  const unsubscribeListenerOnExpenses = promise.orderBy('forDate', 'desc').onSnapshot(
    (snapshot) => {
      if (snapshot) {
        let expenses = []
        snapshot.forEach((doc) => {
          let data = doc.data()
          data.id = doc.id
          expenses.push(data)
        })
        setExpenses(expenses)
      }
    },
    (err) => {
      console.error(`setListenerOnExpenses. Error:\n${err}`)
    }
  )

  return unsubscribeListenerOnExpenses
}

export function changeExpenseStatus(expenseId, status) {
  return firestore.collection('expenses').doc(expenseId).set({ isActive: status }, { merge: true })
}

export function changeExpenseApproveStatus(expenseId, status) {
  return firestore
    .collection('expenses')
    .doc(expenseId)
    .set({ isApproved: status }, { merge: true })
}

export async function getApprovedExpensesByDays(days = 7) {
  try {
    const snapshot = await firestore
      .collection('expenses')
      .where('isActive', '==', true)
      .where('isApproved', '==', true)
      .where('forDate', '>=', dayjs().subtract(days, 'days').unix())
      .orderBy('forDate', 'desc')
      .get()
    if (!snapshot.empty) {
      const result = snapshot.docs.map((doc) => {
        let id = doc.id
        let data = doc.data()
        data['id'] = id
        return data
      })
      return result
    }
    return []
  } catch (err) {
    console.error(`getApprovedExpensesByDays. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function setListenerOnApprovedExpensesByThreshold(
  startUnix,
  endUnix,
  setApprovedExpenses
) {
  const unsubscribeListenerOnApprovedExpensesByThreshold = firestore
    .collection('expenses')
    .where('isActive', '==', true)
    .where('isApproved', '==', true)
    .where('forDate', '>=', startUnix)
    .where('forDate', '<=', endUnix)
    .orderBy('forDate', 'desc')
    .onSnapshot(
      (snapshot) => {
        if (!snapshot.empty) {
          const result = snapshot.docs.map((doc) => {
            let id = doc.id
            let data = doc.data()
            data['id'] = id
            return data
          })
          setApprovedExpenses(result)
        }
      },
      (err) => {
        console.error(`setListenerOnApprovedExpensesByThreshold. Error:\n${err}`)
      }
    )

  return unsubscribeListenerOnApprovedExpensesByThreshold
}

export async function fetchWeekExpenses(weekStart, weekEnd) {
  try {
    const snapshot = await firestore
      .collection('expenses')
      .where('isActive', '==', true)
      .where('forDate', '>=', weekStart)
      .where('forDate', '<=', weekEnd)
      .orderBy('forDate', 'desc')
      .get()
    if (!snapshot.empty) {
      const result = snapshot.docs.map((doc) => {
        let id = doc.id
        let data = doc.data()
        data['id'] = id
        return data
      })
      return result
    }
    return []
  } catch (err) {
    console.error(`fetchWeekExpenses. Error:\n${err}`)
    throw new Error(err)
  }
}
