// import * as dayjs from 'dayjs'

import { firestore } from './../fire'

export async function searchUser(email, accessSearch) {
  try {
    let promise = firestore.collection('users').where('isActive', '==', true)
    if (email) {
      promise = promise.where('email', '==', email)
    } else {
      if (accessSearch) {
        promise = promise.where('job', '==', accessSearch).orderBy('createdAt', 'desc')
      } else {
        promise = promise.orderBy('createdAt', 'desc')
      }
    }
    const snapshot = await promise.get()
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
    console.error(`searchUser. Error:\n${err}`)
    throw new Error(err)
  }
}

export function setAdminStatus(userId, isAdmin) {
  let finalObj = {
    isAdmin,
  }
  if (isAdmin) {
    finalObj = {
      ...finalObj,
      job: '',
      jobApproved: false,
    }
  }
  return firestore
    .collection('users')
    .doc(userId)
    .set(finalObj, { merge: true })
    .catch((err) => {
      console.error(`setAdminStatus. Error:\n${err}`)
      throw new Error(err)
    })
}

export function setJobApproveStatus(userId, jobApproved) {
  return firestore
    .collection('users')
    .doc(userId)
    .set({ jobApproved }, { merge: true })
    .catch((err) => {
      console.error(`setJobApproveStatus. Error:\n${err}`)
      throw new Error(err)
    })
}

export function getUserById(userId) {
  return firestore
    .collection('users')
    .doc(userId)
    .get()
    .catch((err) => {
      console.error(`getUserById. Error:\n${err}`)
      throw new Error(err)
    })
}

export function getUsers() {
  return firestore
    .collection('users')
    .where('isActive', '==', true)
    .get()
    .catch((err) => {
      console.error(`getUsers. Error:\n${err}`)
      throw new Error(err)
    })
}

export async function getUsersByJobId(jobId) {
  try {
    const snapshot = await firestore
      .collection('users')
      .where('isActive', '==', true)
      .where('job', '==', jobId)
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
    console.error(`getUsersByJobId. Error:\n${err}`)
    throw new Error(err)
  }
}

export function editUserDetails(userId, name, address, phone, dob, job, jobApproved, eName, ePhone) {
  return firestore
    .collection('users')
    .doc(userId)
    .set(
      {
        name,
        address,
        phone,
        dob,
        job,
        jobApproved,
        emergencyContactName: eName,
        emergencyContactNumber: ePhone,
        isFirstLogin: false,
      },
      { merge: true }
    )
    .catch((err) => {
      console.error(`editUserDetails. Error:\n${err}`)
      throw new Error(err)
    })
}

export function updateUserSalaryAndNickname(userId, salary, nickname) {
  return firestore
    .collection('users')
    .doc(userId)
    .set({ salary, nickname }, { merge: true })
    .catch((err) => {
      console.error(`updateUserSalaryAndNickname. Error:\n${err}`)
      throw new Error(err)
    })
}

export function deactivateUser(userId) {
  return firestore
    .collection('users')
    .doc(userId)
    .set(
      {
        job: '',
        jobApproved: false,
        isAdmin: false,
        isActive: false,
      },
      { merge: true }
    )
    .catch((err) => {
      console.error(`deactivateUser. Error:\n${err}`)
      throw new Error(err)
    })
}
