const functions = require('firebase-functions')
const html_to_pdf = require('html-pdf-node')
// const cors = require('cors')({ origin: true })
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const path = require('path')
const ejs = require('ejs')
const fs = require('fs')

dayjs.extend(utc)
dayjs.extend(timezone)

const {
  mailToSheets,
  createEstimateEntryInSheet,
  getLeadsFromMail,
  createGoogleCalendarEvent,
} = require('./scripts/googleService')
const {
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
} = require('./scripts/remoteActions')
const { getMonthInFrench } = require('./scripts/localActions')
const { createTransporter } = require('./scripts/emailService')
const Constants = require('./scripts/constants')

const Brochure = require('./pdfBase64/Brochure-Business-Manager')
const BrochureCorporative = require('./pdfBase64/Brochure-Corporative-Business-Manager')

const renderEmailSig = require('./emailSignature')

exports.generatePdfContent = functions
  .runWith({ timeoutSeconds: 300, memory: '1GB' })
  .https.onRequest(async (request, response) => {
    try {
      // cors(request, response, async () => {
      // response.header('Access-Control-Allow-Origin', '*')
      let allInfo = request.body.allInfo
      let user = request.body.user
      let context = request.body.context
      let draftMode = request.body.draftMode || null
      let estimateRequestId = request.body.estimateRequestId || null
      let currEstimateId = request.body.currEstimateId || null
      let currInvoiceId = request.body.currInvoiceId || null
      let editMode = request.body.editMode || null
      let duplicate = request.body.duplicate || null
      let clientId = request.body.clientId || null
      let allData = request.body.allData
      let timeZone = request.body.timeZone || 'America/Toronto'
      let entry = null
      if (context === 'INVOICE') {
        entry = await createInvoiceEntry(
          user,
          allInfo,
          clientId,
          currInvoiceId,
          editMode,
          duplicate,
          allData
        ).catch((err) => {
          throw err
        })
      } else if (context === 'ESTIMATE') {
        entry = await createEstimateEntry(
          user,
          allInfo,
          estimateRequestId,
          currEstimateId,
          editMode,
          duplicate,
          clientId,
          allData
        ).catch((err) => {
          throw err
        })
      }
      if (draftMode) {
        return response
          .status(200)
          .send({ html: '', buffer: '', entryId: entry ? entry.id : null, entry })
      }
      let file = fs.readFileSync(
        path.join(
          __dirname,
          `./pdfTemplates/${allInfo.context === 'INVOICE' ? 'Invoice' : 'Quote'}/html.ejs`
        ),
        { encoding: 'utf8', flag: 'r' }
      )
      if (allInfo.context === 'INVOICE') {
        const invoice = await getInvoiceByInvoiceId(entry?.id || currInvoiceId)
        if (invoice.exists) {
          let invoiceData = invoice.data()
          allInfo.createdAt =
            dayjs.unix(invoiceData.createdAt).tz(timeZone).format('DD ') +
            getMonthInFrench(dayjs.unix(invoiceData.createdAt).tz(timeZone).month()) +
            dayjs.unix(invoiceData.createdAt).tz(timeZone).format(' YYYY')
        }
      } else if (allInfo.context === 'ESTIMATE') {
        const estimate = await getEstimateByEstimateId(entry?.id || currEstimateId)
        if (estimate.exists) {
          let estimateData = estimate.data()
          allInfo.createdAt =
            dayjs.unix(estimateData.createdAt).tz(timeZone).format('DD ') +
            getMonthInFrench(dayjs.unix(estimateData.createdAt).tz(timeZone).month()) +
            dayjs.unix(estimateData.createdAt).tz(timeZone).format(' YYYY')
        }
      }
      let rendered = ejs.render(file, {
        allInfo,
        user,
      })
      let options = {
        format: 'A4',
        preferCSSPageSize: true,
        margin: {
          top: 50,
          bottom: 50,
        },
      }
      return html_to_pdf.generatePdf({ content: rendered }, options).then((pdfBuffer) => {
        const buffer = Buffer.from(pdfBuffer).toString('base64')
        response
          .status(200)
          .send({ html: rendered, buffer, entryId: entry ? entry.id : null, entry })
      })
      // })
    } catch (err) {
      response.status(500).send({ html: '', message: err.message || err })
    }
  })

exports.sendQuoteMail = functions.https.onRequest(async (request, response) => {
  // cors(request, response, async () => {
  // response.header('Access-Control-Allow-Origin', '*');
  try {
    let base64Str = request.body.base64
    let email = request.body.email
    let entryId = request.body.entryId
    let senderEmail = request.body.senderEmail

    if (!senderEmail || !Object.keys(Constants.gmailOauthCreds).includes(senderEmail)) {
      response.status(500).send({
        status: 'error',
        message: 'You are not authorised to send email. please contact admin.',
      })
    }

    if (base64Str && email) {
      const mailOptions = {
        from: senderEmail,
        to: email,
        subject: 'Soumission de Peinture',
        html: `
        <p>Bonjour,</p>
        <p>Voici votre soumission.</p>
        merci,
        <br />
        <br />
        <br />
        ${renderEmailSig(senderEmail)}
        `,
        attachments: [
          {
            filename: 'estimation de peinture.pdf',
            content: base64Str,
            encoding: 'base64',
          },
          {
            filename: 'Brochure Business Manager.pdf',
            content: Brochure,
            encoding: 'base64',
          },
          {
            filename: 'Brochure Corporative Business Manager.pdf',
            content: BrochureCorporative,
            encoding: 'base64',
          },
        ],
      }
      const mailTransport = await createTransporter(Constants.gmailOauthCreds[senderEmail])
      mailTransport.sendMail(mailOptions, function (error) {
        if (error) {
          console.log(error)
          response.status(500).send({ status: 'error', message: error })
        } else {
          updateEstimateEmailEntry(entryId, true)
          updateEstimateRequestStatus(entryId, false)
          response.status(200).send({ status: 'success', message: 'Email successfully sent.' })
        }
        mailTransport.close()
      })
    } else {
      response.status(500).send({ status: 'error', message: 'Invalid Args' })
    }
  } catch (err) {
    response.status(500).send({ status: 'error', message: err })
  }
  // })
})

exports.sendInvoiceMail = functions.https.onRequest(async (request, response) => {
  // cors(request, response, async () => {
  // response.header('Access-Control-Allow-Origin', '*');
  try {
    let base64Str = request.body.base64
    let email = request.body.email
    let entryId = request.body.entryId
    let senderEmail = request.body.senderEmail

    if (!senderEmail || !Object.keys(Constants.gmailOauthCreds).includes(senderEmail)) {
      response.status(500).send({
        status: 'error',
        message: 'You are not authorised to send email. please contact admin.',
      })
    }

    if (base64Str && email) {
      const mailOptions = {
        from: senderEmail,
        to: email,
        subject: 'Facture de peinture',
        html: `
        <p>Bonjour,</p>
        <p>voici votre facture.</p>
        merci,
        <br />
        <br />
        <br />
        ${renderEmailSig(senderEmail)}
        `,
        attachments: [
          {
            filename: 'facture.pdf',
            content: base64Str,
            encoding: 'base64',
          },
        ],
      }
      const mailTransport = await createTransporter(Constants.gmailOauthCreds[senderEmail])
      mailTransport.sendMail(mailOptions, function (error) {
        if (error) {
          console.log(error)
          response.status(500).send({ status: 'error', message: error })
        } else {
          updateInvoiceEmailEntry(entryId, true).catch((err) => {
            throw err
          })
          response.status(200).send({ status: 'success', message: 'Email successfully sent.' })
        }
        mailTransport.close()
      })
    } else {
      response.status(500).send({ status: 'error', message: 'Invalid Args' })
    }
  } catch (err) {
    response.status(500).send({ status: 'error', message: err })
  }
  // })
})

exports.createCalenderEvent = functions.https.onRequest(async (request, response) => {
  // cors(request, response, async () => {
  // response.header('Access-Control-Allow-Origin', '*');
  try {
    let summary = request.body.summary
    let description = request.body.description
    let start = request.body.start // { 'dateTime': '2015-05-28T17:00:00-07:00', 'timeZone': 'America/Los_Angeles' }
    let end = request.body.end // { 'dateTime': '2015-05-28T17:00:00-07:00', 'timeZone': 'America/Los_Angeles' }
    let attendees = request.body.attendees // [{'email': 'lpage@example.com'}]
    let eventLink = await createGoogleCalendarEvent(summary, description, start, end, attendees)
    response
      .status(200)
      .send({ status: 'success', message: 'Event created successfully.', eventLink })
  } catch (err) {
    response.status(500).send({ status: 'error', err })
  }
  // })
})

exports.createEstimateEntryInSheet = functions.https.onRequest((request, response) => {
  // cors(request, response, async () => {
  // response.header('Access-Control-Allow-Origin', '*');
  let { name, phone, price, address, date } = request.body
  console.log(request.body)
  createEstimateEntryInSheet(name, phone, price, address, date)
  response.status(200).send({ message: 'ok' })
  // })
})

exports.gmailToGsheet = functions.pubsub.schedule('0 */1 * * *').onRun(async (context) => {
  console.log('===============================================================')
  console.log('Running Automated CRON Job')
  console.log('===============================================================')
  return mailToSheets()
})

// exports.gmailToGsheet = functions.https.onRequest((request, response) => {
//   console.log('===============================================================')
//   console.log('Running Automated CRON Job')
//   console.log('===============================================================')
//   mailToSheets()
//   response.status(200).send({ message: 'ok' });
// });

exports.addEstimateRequest = functions.https.onRequest(async (request, response) => {
  try {
    // cors(request, response, async () => {
    // response.header('Access-Control-Allow-Origin', '*');
    let { name, email, address, phone, message, byId } = request.body
    if (!byId) {
      byId = Constants.SystemUserId
    }
    console.log(request.body)
    let clientId = null
    if (!email.trim() && !phone.trim()) {
      throw new Error('Client should atleast have a email or phone.')
    }
    let snapshot
    if (email) {
      snapshot = await getClientByEmail(email)
    } else if (phone) {
      snapshot = await getClientByPhone(phone)
    }
    if (!snapshot.empty) {
      clientId = snapshot.docs[0].id
    }
    if (!clientId) {
      let client = await addNewClient(name || '', email || '', phone || '', address || '')
      clientId = client.id

      // Creating Event Log-------------------------------------------------------------------
      let targetType = Constants.Events.NEW_CLIENT_ADDED.Type
      let eventDesc = Constants.Events.NEW_CLIENT_ADDED.Desc
      let moreInfo = {
        prevObj: null,
        newObj: client,
      }
      await addNewEventLog(byId, clientId, clientId, targetType, eventDesc, moreInfo)
      //--------------------------------------------------------------------------------------
    }
    let estimateRequest = await addNewEstimateRequest(clientId, message || '')

    // Creating Event Log-------------------------------------------------------------------
    let targetType = Constants.Events.NEW_ESTIMATE_REQUEST.Type
    let eventDesc = Constants.Events.NEW_ESTIMATE_REQUEST.Desc
    let moreInfo = {
      prevObj: null,
      newObj: estimateRequest,
    }
    await addNewEventLog(byId, clientId, estimateRequest.id, targetType, eventDesc, moreInfo)
    //--------------------------------------------------------------------------------------

    response.status(200).send({ estimateRequest, message: 'ok' })
    // })
  } catch (err) {
    response.status(500).send({ html: '', message: err.message || err })
  }
})

exports.newEstimateRequestsCron = functions.pubsub
  .schedule('0 */1 * * *')
  .onRun(async (context) => {
    try {
      console.log('===============================================================')
      console.log('Running Automated CRON Job')
      console.log('===============================================================')
      let systemId = Constants.SystemUserId
      let allMailData = await getLeadsFromMail()
      if (allMailData) {
        await Promise.all(
          allMailData.map(async (data) => {
            let { name, tel, email, address, msg, date } = data
            let clientId = null
            if (email || tel) {
              let snapshot
              if (email) {
                snapshot = await getClientByEmail(email)
              } else {
                snapshot = await getClientByPhone(tel)
              }
              if (!snapshot.empty) {
                clientId = snapshot.docs[0].id
              }
            }
            if (!clientId) {
              let client = await addNewClient(name || '', email || '', tel || '', address || '')
              clientId = client.id

              // Creating Event Log-------------------------------------------------------------------
              let targetType = Constants.Events.NEW_CLIENT_ADDED.Type
              let eventDesc = Constants.Events.NEW_CLIENT_ADDED.Desc
              let moreInfo = {
                prevObj: null,
                newObj: client,
              }
              await addNewEventLog(systemId, clientId, clientId, targetType, eventDesc, moreInfo)
              //--------------------------------------------------------------------------------------
            }
            let request = await addNewEstimateRequest(clientId, msg || '', dayjs(date).unix())

            // Creating Event Log-------------------------------------------------------------------
            let targetType = Constants.Events.NEW_ESTIMATE_REQUEST.Type
            let eventDesc = Constants.Events.NEW_ESTIMATE_REQUEST.Desc
            let moreInfo = {
              prevObj: null,
              newObj: request,
            }
            await addNewEventLog(systemId, clientId, request.id, targetType, eventDesc, moreInfo)
            //--------------------------------------------------------------------------------------
          })
        )
      }
      console.log(allMailData)
      return Promise.resolve('ok')
    } catch (err) {
      console.error(err)
      return Promise.reject(err)
    }
  })

// exports.newEstimateRequest = functions.https.onRequest(async (request, response) => {
//   try {
//     let systemId = Constants.SystemUserId
//     let allMailData = await getLeadsFromMail()
//     if (allMailData) {
//       await Promise.all(
//         allMailData.map(async (data) => {
//           let { name, tel, email, address, msg, date } = data
//           let clientId = null
//           if (email || tel) {
//             let snapshot
//             if (email) {
//               snapshot = await getClientByEmail(email)
//             } else {
//               snapshot = await getClientByPhone(tel)
//             }
//             if (!snapshot.empty) {
//               clientId = snapshot.docs[0].id
//             }
//           }
//           if (!clientId) {
//             let client = await addNewClient(
//               name || '',
//               email || '',
//               tel || '',
//               address || ''
//             )
//             clientId = client.id

//             // Creating Event Log-------------------------------------------------------------------
//             let targetType = Constants.Events.NEW_CLIENT_ADDED.Type
//             let eventDesc = Constants.Events.NEW_CLIENT_ADDED.Desc
//             let moreInfo = {
//               prevObj: null,
//               newObj: client,
//             }
//             await addNewEventLog(systemId, clientId, clientId, targetType, eventDesc, moreInfo)
//             //--------------------------------------------------------------------------------------
//           }
//           let request = await addNewEstimateRequest(clientId, msg || '', dayjs(date).unix())

//           // Creating Event Log-------------------------------------------------------------------
//           let targetType = Constants.Events.NEW_ESTIMATE_REQUEST.Type
//           let eventDesc = Constants.Events.NEW_ESTIMATE_REQUEST.Desc
//           let moreInfo = {
//             prevObj: null,
//             newObj: request,
//           }
//           await addNewEventLog(systemId, clientId, request.id, targetType, eventDesc, moreInfo)
//           //--------------------------------------------------------------------------------------
//         })
//       )
//     }
//     console.log(allMailData)
//     response.status(200).send({ message: 'ok' })
//   } catch (err) {
//     response.status(500).send({ error: err.message || err })
//   }
// })

// exports.syncEstimateRequests = functions.https.onRequest(async (request, response) => {
//   try {
//     console.log('===============================================================')
//     console.log('Running Automated CRON Job')
//     console.log('===============================================================')
//     let systemId = Constants.SystemUserId
//     let allMailData = await getLeadsFromMail(200, 'days')
//     if (allMailData) {
//       await Promise.all(
//         allMailData.map(async (data) => {
//           let { name, tel, email, address, msg, date } = data
//           let clientId = null
//           if (email || tel) {
//             let snapshot
//             if (email) {
//               snapshot = await getClientByEmail(email)
//             } else {
//               snapshot = await getClientByPhone(tel)
//             }
//             if (!snapshot.empty) {
//               clientId = snapshot.docs[0].id
//             }
//           }
//           if (!clientId) {
//             let client = await addNewClient(name || '', email || '', tel || '', address || '')
//             clientId = client.id

//             // Creating Event Log-------------------------------------------------------------------
//             let targetType = Constants.Events.NEW_CLIENT_ADDED.Type
//             let eventDesc = Constants.Events.NEW_CLIENT_ADDED.Desc
//             let moreInfo = {
//               prevObj: null,
//               newObj: client,
//             }
//             await addNewEventLog(systemId, clientId, clientId, targetType, eventDesc, moreInfo)
//             //--------------------------------------------------------------------------------------
//           }
//           let request = await addNewEstimateRequest(clientId, msg || '', dayjs(date).unix())

//           // Creating Event Log-------------------------------------------------------------------
//           let targetType = Constants.Events.NEW_ESTIMATE_REQUEST.Type
//           let eventDesc = Constants.Events.NEW_ESTIMATE_REQUEST.Desc
//           let moreInfo = {
//             prevObj: null,
//             newObj: request,
//           }
//           await addNewEventLog(systemId, clientId, request.id, targetType, eventDesc, moreInfo)
//           //--------------------------------------------------------------------------------------
//         })
//       )
//     }
//     // console.log(allMailData)
//     response.status(200).send({ message: 'ok' })
//   } catch (err) {
//     console.error(err)
//     response.status(500).send({ error: err.message || err })
//   }
// })

exports.updateEstimatesCount = functions.firestore
  .document('estimates/{estimateId}')
  .onCreate(async (snapshot, context) => {
    const newData = snapshot.data()
    try {
      let newEstimateNo
      let currNewEstimateNo = await fetchCurrNewEstimateNo()
      if (!currNewEstimateNo) {
        throw new Error('currNewEstimateNo not valid')
      }
      if (!newData.estimateNo || newData.estimateNo <= currNewEstimateNo) {
        newEstimateNo = currNewEstimateNo + 1
      } else if (newData.estimateNo > currNewEstimateNo) {
        newEstimateNo = newData.estimateNo + 1
      }
      await updateNewEstimateNo(newEstimateNo)
    } catch (error) {
      console.error(`updateEstimatesCount not executed. Error:\n${error}`)
    }
  })

exports.updateInvoicesCount = functions.firestore
  .document('invoices/{invoiceId}')
  .onCreate(async (snapshot, context) => {
    const newData = snapshot.data()
    try {
      let newInvoiceNo
      let currNewInvoiceNo = await fetchCurrNewInvoiceNo()
      if (!currNewInvoiceNo) {
        throw new Error('currNewInvoiceNo not valid')
      }
      if (!newData.invoiceNo || newData.invoiceNo <= currNewInvoiceNo) {
        newInvoiceNo = currNewInvoiceNo + 1
      } else if (newData.invoiceNo > currNewInvoiceNo) {
        newInvoiceNo = newData.invoiceNo + 1
      }
      await updateNewInvoiceNo(newInvoiceNo)
    } catch (error) {
      console.error(`updateInvoicesCount not executed. Error:\n${error}`)
    }
  })
