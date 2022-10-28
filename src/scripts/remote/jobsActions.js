import * as dayjs from 'dayjs'

import { toCamelCase } from '../localActions'
import { firestore } from './../fire'

export function getAllJobs() {
  return firestore
    .collection('jobs')
    .orderBy('createdAt', 'desc')
    .get()
    .catch((err) => {
      console.error(`getAllJobs. Error:\n${err}`)
      throw new Error(err)
    })
}

export function getJobById(jobId) {
  return firestore
    .collection('jobs')
    .doc(jobId)
    .get()
    .catch((err) => {
      console.error(`getJobById. Error:\n${err}`)
      throw new Error(err)
    })
}

export function createNewJob(label) {
  let id = toCamelCase(label.toLowerCase())
  let finalObj = {
    paths: [],
    cards: [],
    actions: [],
    defaultPath: 'Home',
    label,
    createdAt: dayjs().unix(),
  }
  return firestore
    .collection('jobs')
    .doc(id)
    .set(finalObj)
    .then((res) => {
      return {
        ...finalObj,
        id: id,
      }
    })
    .catch((err) => {
      console.error(`createNewJob. Error:\n${err}`)
      throw new Error(err)
    })
}

export function updateJobConfig(jobId, paths, cards, actions, defaultPath) {
  return firestore
    .collection('jobs')
    .doc(jobId)
    .set(
      {
        paths,
        cards,
        actions,
        defaultPath,
        updatedAt: dayjs().unix(),
      },
      { merge: true }
    )
    .catch((err) => {
      console.error(`updateJobConfig. Error:\n${err}`)
      throw new Error(err)
    })
}

export function removeJob(jobId) {
  return firestore.collection('jobs').doc(jobId).delete()
}
