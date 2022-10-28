import * as dayjs from 'dayjs'

import { firestore } from '../fire'

export function setListenerOnCalendarEvents(setCalendarEvents, days = 365) {
  const unsubscribeListenerOnEvents = firestore
    .collection('calendarEvents')
    .where('startUnix', '>=', dayjs().subtract(days, 'days').startOf('day').unix())
    .onSnapshot(
      (snapshot) => {
        if (snapshot) {
          let events = []
          snapshot.forEach((doc) => {
            let data = doc.data()
            data.id = doc.id
            events.push(data)
          })
          setCalendarEvents(events)
        }
      },
      (err) => {
        console.error(`setListenerOnCalendarEvents. Error:\n${err}`)
      }
    )

  return unsubscribeListenerOnEvents
}

export function addNewCalendarEvent(
  startUnix,
  endUnix,
  targetId,
  targetType,
  teamId,
  createdAt = dayjs().unix()
) {
  let finalObj = {
    startUnix,
    endUnix,
    targetId,
    targetType,
    teamId,
    eventStatusColor: '#f50157',
    createdAt,
  }
  return firestore
    .collection('calendarEvents')
    .add(finalObj)
    .then((res) => {
      console.log('New calendar event created: ' + res.id)
      return {
        ...finalObj,
        id: res.id,
      }
    })
    .catch((err) => {
      console.log('Error Adding new calendar event:')
      console.error(err)
      throw err
    })
}

export function changeCalendarEventDates(eventId, startUnix, endUnix) {
  return firestore
    .collection('calendarEvents')
    .doc(eventId)
    .set(
      {
        startUnix,
        endUnix,
        updatedAt: dayjs().unix(),
      },
      { merge: true }
    )
    .catch((err) => {
      console.log('Error updating calendar event:')
      console.error(err)
      throw err
    })
}

export function changeCalendarEventTeam(eventId, teamId) {
  return firestore
    .collection('calendarEvents')
    .doc(eventId)
    .set(
      {
        teamId,
        updatedAt: dayjs().unix(),
      },
      { merge: true }
    )
    .catch((err) => {
      console.log('Error updating calendar event:')
      console.error(err)
      throw err
    })
}

export function changeCalendarEventStatusColor(eventId, eventStatusColor) {
  return firestore
    .collection('calendarEvents')
    .doc(eventId)
    .set(
      {
        eventStatusColor,
        updatedAt: dayjs().unix(),
      },
      { merge: true }
    )
    .catch((err) => {
      console.log('Error updating calendar event:')
      console.error(err)
      throw err
    })
}

export function removeCalendarEvent(eventId) {
  return firestore.collection('calendarEvents').doc(eventId).delete()
}
