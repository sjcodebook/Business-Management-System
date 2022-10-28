import * as dayjs from 'dayjs'

import { firestore } from '../fire'

import userStore from '../../store/UserStore'

export async function searchInvoice(byEmail, forEmail, startDate, endDate, resLimit) {
  try {
    let promise = firestore.collection('invoices')
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
    console.error(`searchInvoice. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getInvoices(limit = 50) {
  try {
    let promise = firestore.collection('invoices')
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
    console.error(`getInvoices. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getNewInvoiceNumber() {
  try {
    let doc = await firestore.collection('counts').doc('invoices').get()
    if (doc.exists) {
      return doc.data().newInvoiceNo || 0
    }
    return 0
  } catch (err) {
    console.error(`getNewInvoiceNumber. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getInvoiceNumberByInvoiceId(invoiceId) {
  try {
    let doc = await firestore.collection('invoices').doc(invoiceId).get()
    if (!doc.exists) {
      throw new Error("invoice doesn't exists")
    }
    let docData = doc.data()
    return docData.invoiceNo
  } catch (err) {
    console.error(`getInvoiceNumberByInvoiceId. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getInvoiceById(invoiceId) {
  return firestore.collection('invoices').doc(invoiceId).get()
}

export async function getInvoicesSent(limit = 100) {
  try {
    let promise = firestore.collection('invoices')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', true)
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
    console.error(`getInvoicesSent. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getUnpaidInvoicesSent(limit = 100) {
  try {
    let promise = firestore.collection('invoices')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', true)
      .where('paid', '==', false)
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
    console.error(`getUnpaidInvoicesSent. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getInvoicesPaid(limit = 100) {
  try {
    let promise = firestore.collection('invoices')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('paid', '==', true)
      .orderBy('paidOn', 'desc')
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
    console.error(`getInvoicesPaid. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getInvoicesSentByClientId(clientId, limit = 100) {
  try {
    let promise = firestore.collection('invoices')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('clientId', '==', clientId)
      .where('emailSent', '==', true)
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
    console.error(`getInvoicesSentByClientId. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getUnpaidInvoicesSentByClientId(clientId, limit = 100) {
  try {
    let promise = firestore.collection('invoices')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('clientId', '==', clientId)
      .where('emailSent', '==', true)
      .where('paid', '==', false)
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
    console.error(`getUnpaidInvoicesSentByClientId. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getInvoicesPaidByClientId(clientId, limit = 100) {
  try {
    let promise = firestore.collection('invoices')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('clientId', '==', clientId)
      .where('paid', '==', true)
      .orderBy('paidOn', 'desc')
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
    console.error(`getInvoicesPaidByClientId. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getInvoicesByClientId(clientId, limit = 100) {
  try {
    let promise = firestore.collection('invoices')
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
    console.error(`getInvoicesByClientId. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getInvoicesByInvoiceNo(invoiceNo) {
  try {
    let promise = firestore.collection('invoices')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise.where('invoiceNo', '==', invoiceNo).get()
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
    console.error(`getInvoicesByInvoiceNo. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getUnpaidInvoicesByDays(days = 7) {
  try {
    let promise = firestore.collection('invoices')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('paid', '==', false)
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
    console.error(`getUnpaidInvoicesByDays. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getPaidInvoicesByDays(days = 7) {
  try {
    let promise = firestore.collection('invoices')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('paid', '==', true)
      .where('paidOn', '>=', dayjs().subtract(days, 'days').unix())
      .orderBy('paidOn', 'desc')
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
    console.error(`getPaidInvoicesByDays. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function changeInvoiceEmailStatus(invoiceId, emailSent) {
  const doc = await firestore.collection('invoices').doc(invoiceId).get()
  if (doc.exists) {
    return firestore
      .collection('invoices')
      .doc(invoiceId)
      .set(
        { emailSent, emailSentAt: emailSent ? dayjs().unix() : null, updatedAt: dayjs().unix() },
        { merge: true }
      )
      .catch((err) => {
        console.error(`changeInvoiceEmailStatus. Error:\n${err}`)
        throw new Error(err)
      })
  }
}

export async function changeInvoicePaidStatus(invoiceId, paid, paidOn = dayjs().unix()) {
  const doc = await firestore.collection('invoices').doc(invoiceId).get()
  if (doc.exists) {
    let docData = doc.data()
    let finalObj = { paid, updatedAt: dayjs().unix() }
    if (paid) {
      finalObj['paidOn'] = paidOn
    }
    if (docData.allData) {
      let allData = JSON.parse(docData.allData)
      allData.customerInfo.paid = paid
      allData = JSON.stringify(allData)
      finalObj = {
        ...finalObj,
        allData,
      }
    }
    if (docData.allInfo) {
      let allInfo = JSON.parse(docData.allInfo)
      allInfo.custInfo.paid = paid
      allInfo = JSON.stringify(allInfo)

      finalObj = {
        ...finalObj,
        allInfo,
      }
    }
    return firestore
      .collection('invoices')
      .doc(invoiceId)
      .set(finalObj, { merge: true })
      .then((res) => {
        return finalObj
      })
      .catch((err) => {
        console.error(`changeInvoicePaidStatus. Error:\n${err}`)
        throw new Error(err)
      })
  }
}

export async function setListenerOnPaidInvoicesByThreshold(
  startThreshold,
  endThreshold,
  setInvoices
) {
  let promise = firestore.collection('invoices')
  if (!userStore.hasOthersContentAccess) {
    promise = promise.where('assignedToId', '==', userStore.currentUser.id)
  }
  const unsubscribeListenerOnPaidInvoicesByDays = promise
    .where('paid', '==', true)
    .where('paidOn', '>=', startThreshold)
    .where('paidOn', '<=', endThreshold)
    .orderBy('paidOn', 'desc')
    .onSnapshot(
      (snapshot) => {
        if (snapshot) {
          let invoices = []
          snapshot.forEach((doc) => {
            let data = doc.data()
            data.id = doc.id
            invoices.push(data)
          })
          setInvoices(invoices)
        }
      },
      (err) => {
        console.error(`setListenerOnPaidInvoicesByThreshold. Error:\n${err}`)
      }
    )

  return unsubscribeListenerOnPaidInvoicesByDays
}

export async function getPaidInvoicesByThreshold(startUnix, endUnix) {
  try {
    let promise = firestore.collection('invoices')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('paid', '==', true)
      .where('paidOn', '>=', startUnix)
      .where('paidOn', '<=', endUnix)
      .orderBy('paidOn', 'desc')
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
    console.error(`getPaidInvoicesByThreshold. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function setListenerOnUnpaidInvoicesByThreshold(
  startUnix,
  endUnix,
  setInvoices,
  applyCondition = true
) {
  let promise = firestore.collection('invoices')
  if (!userStore.hasOthersContentAccess && applyCondition) {
    promise = promise.where('assignedToId', '==', userStore.currentUser.id)
  }
  const unsubscribeListenerOnUnPaidInvoicesByDays = promise
    .where('paid', '==', false)
    .where('createdAt', '>=', startUnix)
    .where('createdAt', '<=', endUnix)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snapshot) => {
        if (snapshot) {
          let invoices = []
          snapshot.forEach((doc) => {
            let data = doc.data()
            data.id = doc.id
            invoices.push(data)
          })
          setInvoices(invoices)
        }
      },
      (err) => {
        console.error(`setListenerOnUnpaidInvoicesByThreshold. Error:\n${err}`)
      }
    )

  return unsubscribeListenerOnUnPaidInvoicesByDays
}

export async function getUnpaidInvoicesSentByThreshold(startUnix, endUnix) {
  try {
    let promise = firestore.collection('invoices')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', true)
      .where('paid', '==', false)
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
    console.error(`getUnpaidInvoicesSentByThreshold. Error:\n${err}`)
    throw new Error(err)
  }
}

export function removeInvoice(invoiceId) {
  return firestore.collection('invoices').doc(invoiceId).delete()
}

export async function changeInvoiceAssignee(
  invoiceId,
  assignedToId,
  assignedToName,
  assignedToEmail
) {
  return firestore.collection('invoices').doc(invoiceId).set(
    {
      assignedToId,
      assignedToName,
      assignedToEmail,
    },
    { merge: true }
  )
}

export async function getInvoicesDraftByClientId(clientId, limit = 100) {
  try {
    let promise = firestore.collection('invoices')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('clientId', '==', clientId)
      .where('emailSent', '==', false)
      .where('paid', '==', false)
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
    console.error(`getInvoicesDraftByClientId. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getInvoicesDraft(limit = 100) {
  try {
    let promise = firestore.collection('invoices')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', false)
      .where('paid', '==', false)
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
    console.error(`getInvoicesDraft. Error:\n${err}`)
    throw new Error(err)
  }
}

export async function getInvoicesDraftByThreshold(startUnix, endUnix) {
  try {
    let promise = firestore.collection('invoices')
    if (!userStore.hasOthersContentAccess) {
      promise = promise.where('assignedToId', '==', userStore.currentUser.id)
    }
    const snapshot = await promise
      .where('emailSent', '==', false)
      .where('paid', '==', false)
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
    console.error(`getInvoicesDraftByThreshold. Error:\n${err}`)
    throw new Error(err)
  }
}
