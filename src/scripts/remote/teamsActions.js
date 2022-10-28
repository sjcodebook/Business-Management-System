import * as dayjs from 'dayjs'

import { firestore } from '../fire'

export function getAllTeams() {
  return firestore
    .collection('teams')
    .orderBy('createdAt', 'desc')
    .get()
    .catch((err) => {
      console.error(`getAllTeams. Error:\n${err}`)
      throw new Error(err)
    })
}

export function getTeamById(teamId) {
  return firestore
    .collection('teams')
    .doc(teamId)
    .get()
    .catch((err) => {
      console.error(`getTeamById. Error:\n${err}`)
      throw new Error(err)
    })
}

export function createNewTeam(label, color) {
  let finalObj = {
    label,
    color,
    members: [],
    createdAt: dayjs().unix(),
  }
  return firestore
    .collection('teams')
    .add(finalObj)
    .then((res) => {
      return {
        ...finalObj,
        id: res.id,
      }
    })
    .catch((err) => {
      console.error(`createNewTeam. Error:\n${err}`)
      throw new Error(err)
    })
}

export function updateTeamConfig(teamId, label, color, members) {
  return firestore
    .collection('teams')
    .doc(teamId)
    .set(
      {
        label,
        members,
        color,
        updatedAt: dayjs().unix(),
      },
      { merge: true }
    )
    .catch((err) => {
      console.error(`updateTeamConfig. Error:\n${err}`)
      throw new Error(err)
    })
}

export function removeTeam(teamId) {
  return firestore.collection('teams').doc(teamId).delete()
}
