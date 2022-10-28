import * as dayjs from 'dayjs'

import { firestore } from '../fire'

export function addNewEventLog(
  byId,
  forId,
  targetId,
  targetType,
  eventDesc,
  moreInfo,
  createdAt = dayjs().unix()
) {
  return firestore
    .collection('events')
    .add({
      byId,
      forId,
      targetId,
      targetType,
      eventDesc,
      moreInfo,
      createdAt,
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

export async function getEventsByForId(forId) {
  try {
    const snapshot = await firestore
      .collection('events')
      .where('forId', '==', forId)
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
    console.error(`getEventsByForId. Error:\n${err}`)
    throw new Error(err)
  }
}

export function setListenerOnEvents(setEvents, limit = 200) {
  const unsubscribeListenerOnEvents = firestore
    .collection('events')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .onSnapshot(
      (snapshot) => {
        if (snapshot) {
          let events = []
          snapshot.forEach((doc) => {
            let data = doc.data()
            data.id = doc.id
            events.push(data)
          })
          setEvents(events)
        }
      },
      (err) => {
        console.error(`setListenerOnEvents. Error:\n${err}`)
      }
    )

  return unsubscribeListenerOnEvents
}
