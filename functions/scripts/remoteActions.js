const dayjs = require('dayjs')

const fire = require('./fire')
const admin = fire.admin
const firestore = admin.firestore()

const { getSearchableKeywords } = require('./localActions')

const createEstimateEntry = (
  user,
  allInfo,
  estimateRequestId,
  currEstimateId,
  editMode,
  duplicate,
  clientId,
  allData
) => {
  let assignedToId = user.id
  let assignedToName = user.name
  let assignedToEmail = user.email
  let generatedById = user.id
  let generatedByName = user.name
  let generatedByEmail = user.email
  let generatedForName = allInfo.custInfo.name.join(' ')
  let generatedForEmail = allInfo.custInfo.email
  let estimateNo = allInfo.newEstimateNumber || null
  let finalObj = {
    assignedToId,
    assignedToName,
    assignedToEmail,
    generatedById,
    generatedByName,
    generatedByEmail,
    generatedForName,
    generatedForEmail,
    clientId,
    saleStatus: 'NONE',
    allInfo: JSON.stringify(allInfo),
    allData,
    emailSent: false,
    estimateNo,
    createdAt: allInfo.createdAt || dayjs().unix(),
  }
  let promise = firestore.collection('estimates')
  if (editMode && !duplicate) {
    delete finalObj.saleStatus
    delete finalObj.emailSent
    delete finalObj.createdAt
    finalObj.updatedAt = dayjs().unix()
    promise = promise.doc(currEstimateId).set(finalObj, { merge: true })
  } else if (estimateRequestId) {
    promise = promise.doc(estimateRequestId).set(finalObj)
  } else {
    promise = promise.add(finalObj)
  }
  return promise
    .then((res) => {
      console.log('Estimate Entry created for: ' + generatedById)
      if (res.id) {
        return {
          ...finalObj,
          id: res.id,
        }
      }
      if (editMode && !duplicate) {
        return {
          ...finalObj,
          id: currEstimateId,
        }
      }
      return {
        ...finalObj,
        id: estimateRequestId,
      }
    })
    .catch((err) => {
      console.log('Error Creating Estimate Entry:')
      console.error(err)
      throw err
    })
}

const createInvoiceEntry = (
  user,
  allInfo,
  clientId,
  currInvoiceId,
  editMode,
  duplicate,
  allData
) => {
  let assignedToId = user.id
  let assignedToName = user.name
  let assignedToEmail = user.email
  let generatedById = user.id
  let generatedByName = user.name
  let generatedByEmail = user.email
  let generatedForName = allInfo.custInfo.name.join(' ')
  let generatedForEmail = allInfo.custInfo.email
  let balance = allInfo.totalAfterDeposit
  let paid = allInfo.custInfo.paid
  let invoiceNo = allInfo.newInvoiceNumber || null
  let finalObj = {
    assignedToId,
    assignedToName,
    assignedToEmail,
    generatedById,
    generatedByName,
    generatedByEmail,
    generatedForName,
    generatedForEmail,
    balance,
    paid,
    invoiceNo,
    allData,
    clientId,
    allInfo: JSON.stringify(allInfo),
    emailSent: false,
    createdAt: allInfo.createdAt || dayjs().unix(),
  }
  if (paid) {
    finalObj['paidOn'] = dayjs().unix()
  }
  let promise = firestore.collection('invoices')
  if (editMode && !duplicate) {
    delete finalObj.emailSent
    delete finalObj.createdAt
    finalObj.updatedAt = dayjs().unix()
    promise = promise.doc(currInvoiceId).set(finalObj, { merge: true })
  } else {
    promise = promise.add(finalObj)
  }
  return promise
    .then((res) => {
      console.log('Quotes Entry created for: ' + generatedById)
      if (editMode && !duplicate) {
        return {
          ...finalObj,
          id: currInvoiceId,
        }
      }
      return {
        ...finalObj,
        id: res.id,
      }
    })
    .catch((err) => {
      console.log('Error Creating Invoice Entry:')
      console.error(err)
      throw err
    })
}

const updateEstimateEmailEntry = (entryId, status) => {
  return firestore
    .collection('estimates')
    .doc(entryId)
    .set(
      {
        emailSent: status,
        emailSentAt: status ? dayjs().unix() : null,
        updatedAt: dayjs().unix(),
      },
      { merge: true }
    )
    .then((res) => {
      console.log('Estimate Email Entry updated for: ' + entryId)
      return res.id
    })
    .catch((err) => {
      console.log('Error Updating Estimate Email Entry:')
      console.error(err)
      throw err
    })
}

const updateEstimateRequestStatus = (entryId, status) => {
  return firestore
    .collection('estimatesRequest')
    .doc(entryId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        firestore
          .collection('estimatesRequest')
          .doc(entryId)
          .set(
            {
              isActive: status,
              updatedAt: dayjs().unix(),
            },
            { merge: true }
          )
          .then((res) => {
            console.log('Estimate Request updated for: ' + entryId)
            return res.id
          })
          .catch((err) => {
            console.log('Error Updating Estimate Request:')
            console.error(err)
            throw err
          })
      }
    })
    .catch((err) => {
      console.log('Error Updating Estimate Request:')
      console.error(err)
      throw err
    })
}

const updateInvoiceEmailEntry = (entryId, status) => {
  return firestore
    .collection('invoices')
    .doc(entryId)
    .set(
      {
        emailSent: status,
        emailSentAt: status ? dayjs().unix() : null,
      },
      { merge: true }
    )
    .then((res) => {
      console.log('Invoice Email Entry updated for: ' + entryId)
      return res.id
    })
    .catch((err) => {
      console.log('Error Updating Invoice Email Entry:')
      console.error(err)
      throw err
    })
}

const getClientByEmail = (email) => {
  return firestore.collection('clients').where('email', '==', email).get()
}

const getClientByPhone = (phone) => {
  return firestore.collection('clients').where('phone', '==', phone).get()
}

const addNewClient = (name, email, phone, address) => {
  let searchableKeywords = getSearchableKeywords(name)
  let finalObj = {
    name,
    email,
    phone,
    address,
    isActive: true,
    isContactable: true,
    searchableKeywords,
    createdAt: dayjs().unix(),
  }
  return firestore
    .collection('clients')
    .add(finalObj)
    .then((res) => {
      console.log('New client added with id: ' + res.id)
      return {
        ...finalObj,
        id: res.id,
      }
    })
    .catch((err) => {
      console.log('Error Adding new client:')
      console.error(err)
      throw err
    })
}

const addNewEstimateRequest = (clientId, message, unixStamp = dayjs().unix()) => {
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
      console.log('New estimate request added with id: ' + res.id)
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

const getEstimateRequestsByClientId = (clientId, message = null) => {
  let promise = firestore.collection('estimatesRequest').where('clientId', '==', clientId)
  if (typeof message === 'string') {
    promise = promise.where('message', '==', message)
  }
  return promise
    .get()
    .then((snapshot) => {
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
    })
    .catch((err) => {
      console.log('Error Getting estimate requests:')
      console.log('Err: getEstimateRequestsByClientId')
      console.error(err)
      throw err
    })
}

const getEstimatesByClientIdAndEmailStatus = (clientId, emailSent = true) => {
  return firestore
    .collection('estimates')
    .where('clientId', '==', clientId)
    .where('emailSent', '==', emailSent)
    .get()
    .then((snapshot) => {
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
    })
    .catch((err) => {
      console.log('Error Getting estimates:')
      console.log('Err: getEstimatesByClientIdAndEmailStatus')
      console.error(err)
      throw err
    })
}

const addNewEventLog = (byId, forId, targetId, targetType, eventDesc, moreInfo) => {
  return firestore
    .collection('events')
    .add({
      byId,
      forId,
      targetId,
      targetType,
      eventDesc,
      moreInfo,
      createdAt: dayjs().unix(),
    })
    .then((res) => {
      console.log('New event log created: ' + res.id)
      return res.id
    })
    .catch((err) => {
      console.log('Error Adding new event log:')
      console.error(err)
      throw err
    })
}

const fetchCurrNewEstimateNo = async () => {
  try {
    let doc = await firestore.collection('counts').doc('estimates').get()
    if (doc.exists) {
      return doc.data().newEstimateNo
    }
    throw new Error('estimates count not exists')
  } catch (err) {
    console.log('Error fetchCurrNewEstimateNo')
    console.error(err)
  }
}

const fetchCurrNewInvoiceNo = async () => {
  try {
    let doc = await firestore.collection('counts').doc('invoices').get()
    if (doc.exists) {
      return doc.data().newInvoiceNo
    }
    throw new Error('invoices count not exists')
  } catch (err) {
    console.log('Error fetchCurrNewInvoiceNo')
    console.error(err)
  }
}

const updateNewEstimateNo = async (newEstimateNo) => {
  try {
    await firestore.collection('counts').doc('estimates').set(
      {
        newEstimateNo,
      },
      { merge: true }
    )
  } catch (err) {
    console.log('Error updateNewEstimateNo')
    console.error(err)
  }
}

const updateNewInvoiceNo = async (newInvoiceNo) => {
  try {
    await firestore.collection('counts').doc('invoices').set(
      {
        newInvoiceNo,
      },
      { merge: true }
    )
  } catch (err) {
    console.log('Error updateNewInvoiceNo')
    console.error(err)
  }
}

const getEstimateByEstimateId = (estimateId) => {
  return firestore
    .collection('estimates')
    .doc(estimateId)
    .get()
    .catch((err) => {
      console.log('Error Getting Estimate with Id: ' + estimateId)
      console.error(err)
      throw err
    })
}

const getInvoiceByInvoiceId = (invoiceId) => {
  return firestore
    .collection('invoices')
    .doc(invoiceId)
    .get()
    .catch((err) => {
      console.log('Error Getting Invoice with Id: ' + invoiceId)
      console.error(err)
      throw err
    })
}

module.exports = {
  createEstimateEntry,
  createInvoiceEntry,
  updateEstimateEmailEntry,
  updateInvoiceEmailEntry,
  getClientByEmail,
  getClientByPhone,
  addNewClient,
  addNewEstimateRequest,
  updateEstimateRequestStatus,
  getEstimateRequestsByClientId,
  getEstimatesByClientIdAndEmailStatus,
  addNewEventLog,
  fetchCurrNewEstimateNo,
  fetchCurrNewInvoiceNo,
  updateNewEstimateNo,
  updateNewInvoiceNo,
  getEstimateByEstimateId,
  getInvoiceByInvoiceId,
}
