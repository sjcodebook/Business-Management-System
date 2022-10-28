import * as dayjs from 'dayjs'

import { firestore } from '../fire'

import userStore from '../../store/UserStore'

export function addNewEstimateRequest(clientId, message, unixStamp = dayjs().unix()) {
  let finalObj = {
    clientId,
    message,
    isActive: true,
    assignedToId: null,
    assignedToEmail: null,
    assignedToName: null,
    scheduledFor: null,
    createdAt: unixStamp,
  }
  return firestore
    .collection('estimatesRequest')
    .add(finalObj)
    .then((res) => {
      console.log('New estimate request added with Id: ' + res.id)
      return {
        ...finalObj,
        id: res.id,
      }
    })
    .catch((err) => {
      console.log('Error Adding new estimate request:')
      console.error(err)
      throw err
    })
}

export async function getEstimatesRequests(limit = 100) {
  try {
    const snapshot = await firestore
      .collection('estimatesRequest')
      .where('isActive', '==', true)
      .where('assignedToId', '==', null)
      .where('scheduledFor', '==', null)
      .orderBy('createdAt', 'desc')
      .limit(limit)
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
    console.error(`getEstimatesRequests. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getLeadsAssigned(limit = 100) {
  try {
    let promise = firestore.collection('estimatesRequest')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    } else {
      promise = promise.where('assignedToId', '!=', null)
    }
    const snapshot = await promise
      .where('isActive', '==', true)
      .where('scheduledFor', '==', null)
      // .orderBy('createdAt', 'desc') (Giving invalid query err)
      .limit(limit)
      .get()
    if (!snapshot.empty) {
      const result = snapshot.docs.map((doc) => {
        let id = doc.id
        let data = doc.data()
        data['id'] = id
        return data
      })
      result.sort((a, b) => b.createdAt - a.createdAt)
      return result
    }
    return []
  } catch (err) {
    console.error(`getLeadsAssigned. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getAppointmentScheduled(limit = 100) {
  try {
    let promise = firestore.collection('estimatesRequest')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('isActive', '==', true)
      .where('scheduledFor', '!=', null)
      // .orderBy('createdAt', 'desc') (Giving invalid query err)
      .limit(limit)
      .get()
    if (!snapshot.empty) {
      const result = snapshot.docs.map((doc) => {
        let id = doc.id
        let data = doc.data()
        data['id'] = id
        return data
      })
      result.sort((a, b) => a.scheduledFor - b.scheduledFor)
      return result
    }
    return []
  } catch (err) {
    console.error(`getAppointmentScheduled. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesRequestsByDays(days = 7) {
  try {
    const snapshot = await firestore
      .collection('estimatesRequest')
      .where('isActive', '==', true)
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
    console.error(`getEstimatesRequestsByDays. Error:\n${err}`)
    throw new Error(err)
  }
}

export function setListenerOnEstimatesRequestsByThreshold(
  startUnix,
  endUnix,
  setEstimatesRequests,
  applyCondition = true
) {
  let promise = firestore.collection('estimatesRequest')
  if (!userStore.hasOthersContentAccess && applyCondition) {
    promise = promise.where('assignedToId', '==', userStore.currentUser.id)
  }
  const unsubscribeListenerOnEstimatesRequestsByThreshold = promise
    .where('isActive', '==', true)
    .where('createdAt', '>=', startUnix)
    .where('createdAt', '<=', endUnix)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snapshot) => {
        if (snapshot) {
          let estimatesRequests = []
          snapshot.forEach((doc) => {
            let data = doc.data()
            data.id = doc.id
            estimatesRequests.push(data)
          })
          setEstimatesRequests(estimatesRequests)
        }
      },
      (err) => {
        console.error(`setListenerOnEstimatesRequestsByThreshold. Error:\n${err}`)
      }
    )

  return unsubscribeListenerOnEstimatesRequestsByThreshold
}

export async function getEstimatesRequestsByThreshold(startUnix, endUnix, applyCondition = true) {
  try {
    let promise = firestore.collection('estimatesRequest')
    if (!userStore.hasOthersContentAccess && applyCondition) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('isActive', '==', true)
      .where('createdAt', '>=', startUnix)
      .where('createdAt', '<=', endUnix)
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
    console.error(`getEstimatesRequestsByThreshold. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesRequestsByClientId(clientId) {
  try {
    const snapshot = await firestore
      .collection('estimatesRequest')
      .where('clientId', '==', clientId)
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
    console.error(`getEstimatesRequestsByClientId. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimateRequestById(requestId) {
  return firestore.collection('estimatesRequest').doc(requestId).get()
}

export function removeEstimateRequest(requestId) {
  return firestore.collection('estimatesRequest').doc(requestId).delete()
}

export function changeEstimateRequestStatus(requestId, status) {
  return firestore
    .collection('estimatesRequest')
    .doc(requestId)
    .set({ isActive: status }, { merge: true })
}

export async function changeEstimateRequestAssignee(
  requestId,
  assignedToId,
  assignedToName,
  assignedToEmail
) {
  return firestore.collection('estimatesRequest').doc(requestId).set(
    {
      assignedToId,
      assignedToName,
      assignedToEmail,
      updatedAt: dayjs().unix(),
    },
    { merge: true }
  )
}

export async function changeLeadScheduledFor(requestId, scheduledFor) {
  return firestore.collection('estimatesRequest').doc(requestId).set(
    {
      scheduledFor,
      updatedAt: dayjs().unix(),
    },
    { merge: true }
  )
}
