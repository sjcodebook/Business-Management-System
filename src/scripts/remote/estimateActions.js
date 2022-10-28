import * as dayjs from 'dayjs'

import { firestore } from './../fire'

import userStore from '../../store/UserStore'

export async function searchEstimate(byEmail, forEmail, startDate, endDate, resLimit) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    if (byEmail) {
      promise = promise.where('assignedToEmail', '==', byEmail)
    }
    if (forEmail) {
      promise = promise.where('generatedForEmail', '==', forEmail)
    }
    promise = promise.where('createdAt', '>=', startDate).where('createdAt', '<=', endDate)
    const snapshot = await promise
      .orderBy('createdAt', 'desc')
      .limit(resLimit ? resLimit : 20)
      .get()
    if (!snapshot.empty) {
      return snapshot.docs.map((doc) => {
        let data = doc.data()
        data['id'] = doc.id
        return data
      })
    }
    return []
  } catch (err) {
    console.error(`searchEstimate. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesByClientId(clientId, limit = 100) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('clientId', '==', clientId)
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
    console.error(`getEstimatesByClientId. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimates(limit = 50) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise.orderBy('createdAt', 'desc').limit(limit).get()
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
    console.error(`getEstimates. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesSent(limit = 100) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', true)
      .where('saleStatus', '==', 'NONE')
      .orderBy('emailSentAt', 'desc')
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
    console.error(`getEstimatesSent. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesSentByDays(days = 7) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', true)
      .where('saleStatus', '==', 'NONE')
      .where('emailSentAt', '>=', dayjs().subtract(days, 'days').unix())
      .orderBy('emailSentAt', 'desc')
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
    console.error(`getEstimatesSentByDays. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesSentByThreshold(startUnix, endUnix) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', true)
      .where('saleStatus', '==', 'NONE')
      .where('emailSentAt', '>=', startUnix)
      .where('emailSentAt', '<=', endUnix)
      .orderBy('emailSentAt', 'desc')
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
    console.error(`getEstimatesSentByThreshold. Error:\n${err}`)
    throw new Error(err)
  }
}

export function setListenerOnEstimatesSentByThreshold(
  startUnix,
  endUnix,
  setEstimatesSent,
  applyCondition = true
) {
  let promise = firestore.collection('estimates')
  if (!userStore.hasOthersContentAccess && applyCondition) {
    promise = promise.where('assignedToId', '==', userStore.currentUser.id)
  }
  const unsubscribeListenerOnEstimatesSentByThreshold = promise
    .where('emailSent', '==', true)
    .where('saleStatus', '==', 'NONE')
    .where('emailSentAt', '>=', startUnix)
    .where('emailSentAt', '<=', endUnix)
    .orderBy('emailSentAt', 'desc')
    .onSnapshot(
      (snapshot) => {
        if (snapshot) {
          let estimates = []
          snapshot.forEach((doc) => {
            let data = doc.data()
            data.id = doc.id
            estimates.push(data)
          })
          setEstimatesSent(estimates)
        }
      },
      (err) => {
        console.error(`setListenerOnEstimatesSentByThreshold. Error:\n${err}`)
      }
    )

  return unsubscribeListenerOnEstimatesSentByThreshold
}

export async function getEstimatesSentByClientId(clientId, limit = 100) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('clientId', '==', clientId)
      .where('emailSent', '==', true)
      .where('saleStatus', '==', 'NONE')
      .orderBy('emailSentAt', 'desc')
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
    console.error(`getEstimatesSentByClientId. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesDraft(limit = 100) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', false)
      .where('saleStatus', '==', 'NONE')
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
    console.error(`getEstimatesDraft. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesDraftByClientId(clientId, limit = 100) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('clientId', '==', clientId)
      .where('emailSent', '==', false)
      .where('saleStatus', '==', 'NONE')
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
    console.error(`getEstimatesDraftByClientId. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesDraftByThreshold(startUnix, endUnix) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', false)
      .where('saleStatus', '==', 'NONE')
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
    console.error(`getEstimatesDraftByThreshold. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimateById(estimateId) {
  return firestore.collection('estimates').doc(estimateId).get()
}

export async function changeEstimateSaleStatus(estimateId, saleStatus) {
  const doc = await firestore.collection('estimates').doc(estimateId).get()
  if (doc.exists) {
    let obj = {
      saleStatus,
      saleStatusUpdateAt: dayjs().unix(),
    }
    if (saleStatus === 'NONE') {
      obj['createdAt'] = dayjs().unix()
    }
    if (saleStatus === 'SCHEDULED') {
      obj['scheduledFor'] = dayjs().add(1, 'year').year()
    }
    return firestore
      .collection('estimates')
      .doc(estimateId)
      .set(obj, { merge: true })
      .then((res) => {
        return obj
      })
      .catch((err) => {
        console.error(`changeEstimateSaleStatus. Error:\n${err}`)
        throw new Error(err)
      })
  }
}

export async function getEstimatesSold(limit = 100) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', true)
      .where('saleStatus', '==', 'SOLD')
      .orderBy('saleStatusUpdateAt', 'desc')
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
    console.error(`getEstimatesSold. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesSoldByDays(days = 7) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', true)
      .where('saleStatus', '==', 'SOLD')
      .where('saleStatusUpdateAt', '>=', dayjs().subtract(days, 'days').unix())
      .orderBy('saleStatusUpdateAt', 'desc')
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
    console.error(`getEstimatesSoldByDays. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesSoldByThreshold(startUnix, endUnix) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', true)
      .where('saleStatus', '==', 'SOLD')
      .where('saleStatusUpdateAt', '>=', startUnix)
      .where('saleStatusUpdateAt', '<=', endUnix)
      .orderBy('saleStatusUpdateAt', 'desc')
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
    console.error(`getEstimatesSoldByThreshold. Error:\n${err}`)
    throw new Error(err)
  }
}

export function setListenerOnEstimatesSoldByThreshold(
  startUnix,
  endUnix,
  setEstimatesSold,
  applyCondition = true
) {
  let promise = firestore.collection('estimates')
  if (!userStore.hasOthersContentAccess && applyCondition) {
    promise = promise.where('assignedToId', '==', userStore.currentUser.id)
  }
  const unsubscribeListenerOnEstimatesSoldByThreshold = promise
    .where('emailSent', '==', true)
    .where('saleStatus', '==', 'SOLD')
    .where('saleStatusUpdateAt', '>=', startUnix)
    .where('saleStatusUpdateAt', '<=', endUnix)
    .orderBy('saleStatusUpdateAt', 'desc')
    .onSnapshot(
      (snapshot) => {
        if (snapshot) {
          let estimates = []
          snapshot.forEach((doc) => {
            let data = doc.data()
            data.id = doc.id
            estimates.push(data)
          })
          setEstimatesSold(estimates)
        }
      },
      (err) => {
        console.error(`setListenerOnEstimatesSoldByThreshold. Error:\n${err}`)
      }
    )

  return unsubscribeListenerOnEstimatesSoldByThreshold
}

export async function getEstimatesSoldByClientId(clientId, limit = 100) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('clientId', '==', clientId)
      .where('emailSent', '==', true)
      .where('saleStatus', '==', 'SOLD')
      .orderBy('saleStatusUpdateAt', 'desc')
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
    console.error(`getEstimatesSoldByClientId. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesLost(limit = 100) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', true)
      .where('saleStatus', '==', 'SALE_LOST')
      .orderBy('saleStatusUpdateAt', 'desc')
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
    console.error(`getEstimatesLost. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesLostByDays(days = 7) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', true)
      .where('saleStatus', '==', 'SALE_LOST')
      .where('saleStatusUpdateAt', '>=', dayjs().subtract(days, 'days').unix())
      .orderBy('saleStatusUpdateAt', 'desc')
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
    console.error(`getEstimatesLostByDays. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesLostByThreshold(startUnix, endUnix) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', true)
      .where('saleStatus', '==', 'SALE_LOST')
      .where('saleStatusUpdateAt', '>=', startUnix)
      .where('saleStatusUpdateAt', '<=', endUnix)
      .orderBy('saleStatusUpdateAt', 'desc')
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
    console.error(`getEstimatesLostByThreshold. Error:\n${err}`)
    throw new Error(err)
  }
}

export function setListenerOnEstimatesLostByThreshold(
  startUnix,
  endUnix,
  setEstimatesLost,
  applyCondition = true
) {
  let promise = firestore.collection('estimates')
  if (!userStore.hasOthersContentAccess && applyCondition) {
    promise = promise.where('assignedToId', '==', userStore.currentUser.id)
  }
  const unsubscribeListenerOnEstimatesLostByThreshold = promise
    .where('emailSent', '==', true)
    .where('saleStatus', '==', 'SALE_LOST')
    .where('saleStatusUpdateAt', '>=', startUnix)
    .where('saleStatusUpdateAt', '<=', endUnix)
    .orderBy('saleStatusUpdateAt', 'desc')
    .onSnapshot(
      (snapshot) => {
        if (snapshot) {
          let estimates = []
          snapshot.forEach((doc) => {
            let data = doc.data()
            data.id = doc.id
            estimates.push(data)
          })
          setEstimatesLost(estimates)
        }
      },
      (err) => {
        console.error(`setListenerOnEstimatesLostByThreshold. Error:\n${err}`)
      }
    )

  return unsubscribeListenerOnEstimatesLostByThreshold
}

export async function getEstimatesLostByClientId(clientId, limit = 100) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('clientId', '==', clientId)
      .where('emailSent', '==', true)
      .where('saleStatus', '==', 'SALE_LOST')
      .orderBy('saleStatusUpdateAt', 'desc')
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
    console.error(`getEstimatesLostByClientId. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesScheduled(limit = 100) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', true)
      .where('saleStatus', '==', 'SCHEDULED')
      .orderBy('scheduledFor', 'asc')
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
    console.error(`getEstimatesScheduled. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesScheduledByClientId(clientId, limit = 100) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('clientId', '==', clientId)
      .where('emailSent', '==', true)
      .where('saleStatus', '==', 'SCHEDULED')
      .orderBy('scheduledFor', 'asc')
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
    console.error(`getEstimatesScheduledByClientId. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesScheduledByThreshold(startYear, endYear) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', true)
      .where('saleStatus', '==', 'SCHEDULED')
      .where('scheduledFor', '>=', startYear)
      .where('scheduledFor', '<=', endYear)
      .orderBy('scheduledFor', 'asc')
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
    console.error(`getEstimatesScheduledByThreshold. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function changeEstimateEmailStatus(estimateId, emailSent) {
  const doc = await firestore.collection('estimates').doc(estimateId).get()
  if (doc.exists) {
    return firestore
      .collection('estimates')
      .doc(estimateId)
      .set(
        { emailSent, emailSentAt: emailSent ? dayjs().unix() : null, updatedAt: dayjs().unix() },
        { merge: true }
      )
      .catch((err) => {
        console.error(`changeEstimateEmailStatus. Error:\n${err}`)
        throw new Error(err)
      })
  }
}

export async function changeEstimateScheduledDate(estimateId, scheduledFor) {
  const doc = await firestore.collection('estimates').doc(estimateId).get()
  if (doc.exists) {
    let obj = {
      scheduledFor,
    }
    return firestore
      .collection('estimates')
      .doc(estimateId)
      .set(obj, { merge: true })
      .then((res) => {
        return obj
      })
      .catch((err) => {
        console.error(`changeEstimateScheduledDate. Error:\n${err}`)
        throw new Error(err)
      })
  }
}

export function setListenerOnEstimatesSoldByDays(startThreshold, endThreshold, setEstimates) {
  let promise = firestore.collection('estimates')
  if (!userStore.hasOthersContentAccess) {
    promise = promise.where('assignedToId', '==', userStore.currentUser.id)
  }
  const unsubscribeListenerOnEstimatesSoldByDays = promise
    .where('saleStatus', '==', 'SOLD')
    .where('saleStatusUpdateAt', '>=', startThreshold)
    .where('saleStatusUpdateAt', '<=', endThreshold)
    .orderBy('saleStatusUpdateAt', 'desc')
    .onSnapshot(
      (snapshot) => {
        if (snapshot) {
          let estimates = []
          snapshot.forEach((doc) => {
            let data = doc.data()
            data.id = doc.id
            estimates.push(data)
          })
          setEstimates(estimates)
        }
      },
      (err) => {
        console.error(`setListenerOnEstimatesSoldByDays. Error:\n${err}`)
      }
    )

  return unsubscribeListenerOnEstimatesSoldByDays
}

export async function changeEstimateAssignee(
  estimateId,
  assignedToId,
  assignedToName,
  assignedToEmail
) {
  return firestore.collection('estimates').doc(estimateId).set(
    {
      assignedToId,
      assignedToName,
      assignedToEmail,
      updatedAt: dayjs().unix(),
    },
    { merge: true }
  )
}

export async function getNewEstimateNumber() {
  try {
    let doc = await firestore.collection('counts').doc('estimates').get()
    if (doc.exists) {
      return doc.data().newEstimateNo || 0
    }
    return 0
  } catch (err) {
    console.error(`getNewEstimateNumber. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimateNumberByEstimateId(estimateId) {
  try {
    let doc = await firestore.collection('estimates').doc(estimateId).get()
    if (!doc.exists) {
      throw new Error("estimate doesn't exists")
    }
    let docData = doc.data()
    return docData.estimateNo
  } catch (err) {
    console.error(`getEstimateNumberByEstimateId. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getEstimatesByEstimateNo(estimateNo) {
  try {
    let promise = firestore.collection('estimates')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise.where('estimateNo', '==', estimateNo).get()
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
    console.error(`getEstimatesByEstimateNo. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function changeEstimateHasCalendarEvent(
  estimateId,
  hasCalendarEvent,
  calendarEventId = null
) {
  return firestore.collection('estimates').doc(estimateId).set(
    {
      calendarEventId,
      hasCalendarEvent,
      updatedAt: dayjs().unix(),
    },
    { merge: true }
  )
}
