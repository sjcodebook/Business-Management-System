import * as dayjs from 'dayjs'

import { firestore } from './../fire'

export async function fetchUserWeekEntries(userId, weekStart, weekEnd) {
  try {
    const snapshot = await firestore
      .collection('timeEntries')
      .where('userId', '==', userId)
      .where('createdAt', '>=', weekStart)
      .where('createdAt', '<=', weekEnd)
      .orderBy('createdAt', 'desc')
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
    console.error(`fetchUserWeekEntries. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function fetchWeekEntries(weekStart, weekEnd) {
  try {
    const snapshot = await firestore
      .collection('timeEntries')
      .where('createdAt', '>=', weekStart)
      .where('createdAt', '<=', weekEnd)
      .orderBy('createdAt', 'desc')
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
    console.error(`fetchWeekEntries. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function fetchActiveEntry(userId) {
  try {
    const snapshot = await firestore
      .collection('timeEntries')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
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
    console.error(`fetchActiveEntry. Error:\n${err}`)
    throw new Error(err)
  }
}

export function createLoginEntry(userId, entry) {
  return firestore
    .collection('timeEntries')
    .add({
      userId,
      entry,
      isActive: true,
      createdAt: dayjs().unix(),
    })
    .catch((err) => {
      console.error(`createLoginEntry. Error:\n${err}`)
      throw new Error(err)
    })
}

export async function createLogoutEntry(
  userId,
  entryId,
  exit,
  actualExit,
  salary,
  lunchBreak,
  lunchBreakDur
) {
  const doc = await firestore.collection('timeEntries').doc(entryId).get()
  if (doc.exists) {
    let docData = doc.data()
    return firestore
      .collection('timeEntries')
      .doc(entryId)
      .set(
        {
          userId,
          exit,
          actualExit,
          isActive: false,
          salary: parseFloat(salary),
          totalSalary: Math.round((exit - docData.entry) * (salary / 3600) * 10) / 10,
          lunchBreak,
          lunchBreakDur,
        },
        { merge: true }
      )
      .catch((err) => {
        console.error(`createLogoutEntry. Error:\n${err}`)
        throw new Error(err)
      })
  }
}

export async function editEntry(
  entryId,
  createdAt,
  entry,
  exit,
  actualExit,
  salary,
  lunchBreak,
  lunchBreakDur
) {
  let finalObj = {
    actualExit,
    createdAt,
    entry,
    exit,
    lunchBreak,
    lunchBreakDur,
    salary: parseFloat(salary),
    totalSalary: Math.round((exit - entry) * (salary / 3600) * 10) / 10,
  }
  return firestore
    .collection('timeEntries')
    .doc(entryId)
    .set(finalObj, { merge: true })
    .then((res) => {
      return {
        ...finalObj,
        id: entryId,
      }
    })
    .catch((err) => {
      console.error(`editEntry. Error:\n${err}`)
      throw new Error(err)
    })
}

export async function searchTrackRecord(email, startDate, endDate, resLimit) {
  try {
    let promise = firestore.collection('timeEntries')
    if (email) {
      let snapshot = await firestore.collection('users').where('email', '==', email).get()
      if (snapshot.empty) {
        return []
      }
      promise = promise.where('userId', '==', snapshot.docs[0].id)
    }
    promise = promise.where('createdAt', '>=', startDate).where('createdAt', '<=', endDate)
    const snapshot = await promise
      .orderBy('createdAt', 'desc')
      .limit(resLimit ? resLimit : 20)
      .get()
    if (!snapshot.empty) {
      let fetchedUsers = {}
      const result = []
      await Promise.all(
        snapshot.docs.map(async (doc) => {
          let data = doc.data()
          data['id'] = doc.id
          if (fetchedUsers[data.userId]) {
            data['userData'] = fetchedUsers[data.userId]
          } else {
            let userDoc = await firestore.collection('users').doc(data['userId']).get()
            if (!userDoc.exists) {
              data['userData'] = {
                name: '',
                email: '',
              }
            }
            data['userData'] = userDoc.data()
          }
          result.push(data)
        })
      )
      return result
    }
    return []
  } catch (err) {
    console.error(`searchTrackRecord. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function fetchEntriesByDays(days = 7) {
  try {
    const snapshot = await firestore
      .collection('timeEntries')
      .where('isActive', '==', false)
      .where('createdAt', '>=', dayjs().subtract(days, 'days').unix())
      .orderBy('createdAt', 'desc')
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
    console.error(`fetchEntriesByDays. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function setListenerOnEntriesByThreshold(startUnix, endUnix, setEntries) {
  const unsubscribeListenerOnEntriesByThreshold = firestore
    .collection('timeEntries')
    .where('isActive', '==', false)
    .where('createdAt', '>=', startUnix)
    .where('createdAt', '<=', endUnix)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snapshot) => {
        if (!snapshot.empty) {
          const result = snapshot.docs.map((doc) => {
            let id = doc.id
            let data = doc.data()
            data['id'] = id
            return data
          })
          setEntries(result)
        }
      },
      (err) => {
        console.error(`setListenerOnEntriesByThreshold. Error:\n${err}`)
      }
    )

  return unsubscribeListenerOnEntriesByThreshold
}

export function removeTimeTrackRecord(recordId) {
  return firestore.collection('timeEntries').doc(recordId).delete()
}
