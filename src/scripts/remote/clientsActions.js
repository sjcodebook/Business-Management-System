import * as dayjs from 'dayjs'

import { firestore } from './../fire'

export function getCleintById(clientId) {
  return firestore
    .collection('clients')
    .doc(clientId)
    .get()
    .catch((err) => {
      console.error(`getCleintById. Error:\n${err}`)
      throw new Error(err)
    })
}

export function searchClients(chunk) {
  let promise = firestore
    .collection('clients')
    .where('searchableKeywords', 'array-contains-any', chunk)
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        let res = snapshot.docs.map((doc) => {
          let docData = doc.data()
          docData.id = doc.id
          return docData
        })
        let joinedChunk = chunk.filter((c) => c).join(' ')
        let newRes = res.filter(
          (r) => r.searchableKeywords && r.searchableKeywords.includes(joinedChunk)
        )
        if (newRes.length !== 0) {
          return newRes
        }
        return res
      } else {
        return []
      }
    })
    .catch((err) => {
      console.log(`searchClients. Error:\n${err}`)
    })
  return promise
}

export function searchClientByEmail(email) {
  let promise = firestore
    .collection('clients')
    .where('email', '==', email)
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => {
          let docData = doc.data()
          docData.id = doc.id
          return docData
        })
      } else {
        return []
      }
    })
    .catch((err) => {
      console.log(`searchClientByEmail. Error:\n${err}`)
    })
  return promise
}

export function searchClientByPhone(phone) {
  let promise = firestore
    .collection('clients')
    .where('phone', '==', phone)
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => {
          let docData = doc.data()
          docData.id = doc.id
          return docData
        })
      } else {
        return []
      }
    })
    .catch((err) => {
      console.log(`searchClientByPhone. Error:\n${err}`)
    })
  return promise
}

export async function getClients(limit = 100, isActive = true) {
  try {
    const snapshot = await firestore
      .collection('clients')
      .where('isActive', '==', isActive)
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
    console.error(`getClients. Error:\n${err}`)
    throw new Error(err)
  }
}

export function createNewClient(clientInfo) {
  if (clientInfo) {
    let finalObj = {
      ...clientInfo,
      updatedAt: dayjs().unix(),
      createdAt: dayjs().unix(),
    }
    return firestore
      .collection('clients')
      .add(finalObj)
      .then((res) => {
        return {
          ...finalObj,
          id: res.id,
        }
      })
      .catch((err) => {
        console.error(`createNewClient. Error:\n${err}`)
        throw new Error(err)
      })
  }
}

export function editClient(clientId, clientInfo) {
  if (clientId && clientInfo) {
    let finalObj = {
      ...clientInfo,
      updatedAt: dayjs().unix(),
    }
    return firestore
      .collection('clients')
      .doc(clientId)
      .set(finalObj, { merge: true })
      .then((res) => {
        return {
          ...finalObj,
          id: clientId,
        }
      })
      .catch((err) => {
        console.error(`editClient. Error:\n${err}`)
        throw new Error(err)
      })
  }
}

export function updateClientActiveStatus(clientId, isActive = true) {
  if (clientId) {
    return firestore
      .collection('clients')
      .doc(clientId)
      .set(
        {
          isActive,
          updatedAt: dayjs().unix(),
        },
        { merge: true }
      )
      .catch((err) => {
        console.error(`updateClientActiveStatus. Error:\n${err}`)
        throw new Error(err)
      })
  }
}

export async function getClientsByThreshold(startUnix, endUnix) {
  try {
    const snapshot = await firestore
      .collection('clients')
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
    console.error(`getClientsByThreshold. Error:\n${err}`)
    throw new Error(err)
  }
}
