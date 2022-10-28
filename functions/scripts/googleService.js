const { google } = require('googleapis')
const path = require('path')
const moment = require('moment')
const { htmlToText } = require('html-to-text')
const randomstring = require('randomstring')

const mailToSheets = async () => {
  try {
    const client = new google.auth.JWT({
      keyFile: path.resolve(__dirname, './../keys.json'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://mail.google.com/',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
      subject: 'abc@xyz.com',
    })

    await new Promise((resolve, reject) => {
      client.authorize((err, tokens) => {
        if (err) {
          console.log(err)
          reject()
        }
        console.log('connected')
        resolve(tokens)
      })
    })

    const unixStamp = moment().subtract(1, 'h').unix()
    console.log('================')
    console.log(unixStamp)
    console.log('================')
    const gmail = google.gmail({ version: 'v1', auth: client })
    const res = await gmail.users.messages.list({
      includeSpamTrash: false,
      q: `in:leads after:${unixStamp} from:(abc@xyz.com)`,
      userId: 'me',
    })
    if (res.data.resultSizeEstimate === 0) {
      console.log(res.data)
      throw Error('No new emails')
    }
    let allMailData = []
    await Promise.all(
      res.data.messages.map(async (message) => {
        const res = await gmail.users.messages.get({
          id: message.id,
          userId: 'me',
        })
        let html = Buffer.from(res.data.payload.body.data, 'base64').toString('utf-8')
        let finalObj = {
          body: htmlToText(html, {
            preserveNewlines: true,
          }),
        }
        res.data.payload.headers.forEach((header) => {
          if (header.name === 'Subject') {
            finalObj['subject'] = header.value
          } else if (header.name === 'Date') {
            finalObj['date'] = header.value
          } else if (header.name === 'From') {
            finalObj['from'] = header.value
          }
        })
        allMailData.push(finalObj)
      })
    )

    console.log('======Updating Sheet======')

    const gsapi = google.sheets({ version: 'v4', auth: client })
    const opt = {
      spreadsheetId: 'xxxxxxxxx',
      range: 'Leads!A1:D',
    }
    let sheetRes = await gsapi.spreadsheets.values.get(opt)
    // console.log(sheetRes.data.values)
    let newDataArray = allMailData.map((mailData) => {
      let arr = []
      arr.push(mailData.date)
      arr.push(mailData.from)
      arr.push(mailData.subject)
      arr.push(mailData.body)
      return arr
    })
    const updatedOpts = {
      spreadsheetId: 'xxxxxxxxx',
      range: `Leads!A${sheetRes.data.values.length + 1}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: newDataArray },
    }
    await gsapi.spreadsheets.values.update(updatedOpts)
    console.log('=====Done Updating=====')
    return Promise.resolve('=====Done Updating=====')
  } catch (err) {
    console.error(err)
    Promise.reject(err)
  }
}

const createEstimateEntryInSheet = async (name, phone, price, address, date) => {
  try {
    const client = new google.auth.JWT({
      keyFile: path.resolve(__dirname, './../keys.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      subject: 'abc@xyz.com',
    })

    await new Promise((resolve, reject) => {
      client.authorize((err, tokens) => {
        if (err) {
          console.log(err)
          reject()
        }
        console.log('connected')
        resolve(tokens)
      })
    })
    console.log('======Updating Sheet======')
    let spreadsheetId = 'xxxxxxxxxxx'
    const gsapi = google.sheets({ version: 'v4', auth: client })
    const opt = {
      spreadsheetId,
      range: `Callbacks!A1:F`,
    }
    let sheetRes = await gsapi.spreadsheets.values.get(opt)
    // console.log(sheetRes.data.values)
    let newDataArray = [[]]
    newDataArray[0].push(name)
    newDataArray[0].push(phone)
    newDataArray[0].push(price)
    newDataArray[0].push(address)
    newDataArray[0].push('')
    newDataArray[0].push(date)
    const updatedOpts = {
      spreadsheetId,
      range: `Callbacks!A${sheetRes.data.values.length + 1}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: newDataArray },
    }
    await gsapi.spreadsheets.values.update(updatedOpts)
    console.log('=====Done Updating=====')
    return Promise.resolve('=====Done Updating=====')
  } catch (err) {
    console.error(err)
    Promise.reject(err)
  }
}

const getLeadsFromMail = async (timeDigit = 1, timeNotation = 'h') => {
  try {
    const client = new google.auth.JWT({
      keyFile: path.resolve(__dirname, './../keys.json'),
      scopes: [
        'https://mail.google.com/',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
      subject: 'abc@xyz.com',
    })

    await new Promise((resolve, reject) => {
      client.authorize((err, tokens) => {
        if (err) {
          console.log(err)
          reject()
        }
        console.log('connected')
        resolve(tokens)
      })
    })

    const unixStamp = moment().subtract(timeDigit, timeNotation).unix()
    console.log('================')
    console.log(unixStamp)
    console.log('================')
    const gmail = google.gmail({ version: 'v1', auth: client })
    const res = await gmail.users.messages.list({
      includeSpamTrash: false,
      q: `in:leads after:${unixStamp} from:(abc@xyz.com)`,
      userId: 'me',
    })
    if (res.data.resultSizeEstimate === 0) {
      console.log(res.data)
      throw Error('No new emails')
    }
    let allMailData = []
    await Promise.all(
      res.data.messages.map(async (message) => {
        const res = await gmail.users.messages.get({
          id: message.id,
          userId: 'me',
        })
        if (res.data.payload.body.data) {
          let html = Buffer.from(res.data.payload.body.data, 'base64').toString('utf-8')
          let finalObj = {
            name: '',
            tel: '',
            email: '',
            address: '',
            msg: '',
          }
          let text = htmlToText(html, {
            preserveNewlines: false,
          })
          text = text.split('$$@@')[1] || ''
          text = text.split('@@$$')[0] || ''
          let infoObj
          try {
            infoObj = JSON.parse(text.replace(/\n/g, ' '))
          } catch (err) {
            let errMsg = `Error parsing. Please fix it manually (id: ${randomstring.generate(10)})`
            infoObj = {
              name: errMsg,
              tel: errMsg,
              email: errMsg,
              address: errMsg,
              msg: text,
            }
          }
          if (infoObj) {
            Object.keys(finalObj).forEach((key, l) => {
              finalObj[key] = infoObj[key] || ''
            })
            res.data.payload.headers.forEach((header) => {
              if (header.name === 'Date') {
                finalObj['date'] = header.value
              }
            })
            allMailData.push(finalObj)
          }
        }
      })
    )
    console.log('=====Done =====')
    return Promise.resolve(allMailData)
  } catch (err) {
    console.error(err)
  }
}

const createGoogleCalendarEvent = async (summary, description, start, end, attendees) => {
  try {
    const client = new google.auth.JWT({
      keyFile: path.resolve(__dirname, './../keys.json'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
      subject: 'abc@xyz.com',
    })

    await new Promise((resolve, reject) => {
      client.authorize((err, tokens) => {
        if (err) {
          console.log(err)
          reject()
        }
        console.log('connected')
        resolve(tokens)
      })
    })

    const calendar = google.calendar({ version: 'v3', auth: client })
    var event = {
      summary,
      description,
      start,
      end,
      attendees,
      reminders: {
        useDefault: true,
      },
    }
    let eventLink = await new Promise((resolve, reject) => {
      calendar.events.insert(
        {
          auth: client,
          calendarId: 'primary',
          resource: event,
        },
        function (err, event) {
          if (err) {
            console.log('There was an error contacting the Calendar service: ')
            reject(err)
          } else {
            console.log('=====Done =====')
            console.log('Event created: %s', event.data.htmlLink)
            resolve(event.data.htmlLink)
          }
        }
      )
    })
    return eventLink
  } catch (err) {
    console.error(err)
    return Promise.reject(err)
  }
}

module.exports = {
  mailToSheets,
  createEstimateEntryInSheet,
  getLeadsFromMail,
  createGoogleCalendarEvent,
}
