import React, { useState, useEffect } from 'react'
import { Observer } from 'mobx-react-lite'
import { withRouter } from 'react-router-dom'
import { Scrollbars } from 'react-custom-scrollbars'
import * as dayjs from 'dayjs'
import axios from 'axios'
import { makeStyles } from '@material-ui/core/styles'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { DateTimePicker } from '@material-ui/pickers'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Modal from '@material-ui/core/Modal'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import LinearProgress from '@material-ui/core/LinearProgress'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'

import Configs from './../scripts/configs'
import { Constants } from './../scripts/constants'
import {
  showToast,
  round,
  calculatePriceWithoutTax,
  calculateTaxes,
} from './../scripts/localActions'
import {
  getNewInvoiceNumber,
  getInvoiceNumberByInvoiceId,
  changeEstimateEmailStatus,
  changeInvoiceEmailStatus,
  changeEstimateRequestStatus,
  addNewEventLog,
  getInvoiceById,
  getEstimateById,
  getNewEstimateNumber,
  getEstimateNumberByEstimateId,
} from './../scripts/remoteActions'

import estimatorStore from './../store/EstimatorStore'
import userStore from './../store/UserStore'
import appStore from './../store/AppStore'

const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

dayjs.extend(utc)
dayjs.extend(timezone)

const useStyles = makeStyles((theme) => ({
  paperModal: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}))

const getModalStyle = () => {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
    borderRadius: 20,
  }
}

const Quote = (props) => {
  const [html, setHtml] = useState('')
  const [pdf, setPdf] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [entryId, setEntryId] = useState(null)
  const [showCalendarEventModal, setShowCalendarEventModal] = useState(false)
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    _setData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props])

  const _setData = async () => {
    try {
      setLoading(true)
      let prevEstimate = {}
      let prevInvoice = {}
      let estimateRequestId = null
      let editMode = null
      let duplicate = null
      let currEstimateId = null
      let currInvoiceId = null
      let clientId = estimatorStore.customerInfo.id
      if (props.location.state && props.location.state.clientId) {
        estimateRequestId = props.location.state.requestId || null
        editMode = props.location.state.editMode || null
        duplicate = props.location.state.duplicate || null
        currEstimateId = props.location.state.recordId || null
        currInvoiceId = props.location.state.recordId || null
        clientId = props.location.state.clientId || null
      }
      if (editMode && !duplicate) {
        if (props.context === 'INVOICE') {
          await getInvoiceById(currInvoiceId)
            .then((doc) => {
              if (doc.exists) {
                prevInvoice = doc.data()
              }
            })
            .catch((err) => {
              console.error(`getInvoiceById. Error:\n${err}`)
              return showToast('Something went wrong fetching invoice', 'error')
            })
        } else if (props.context === 'ESTIMATE') {
          await getEstimateById(currEstimateId)
            .then((doc) => {
              if (doc.exists) {
                prevEstimate = doc.data()
              }
            })
            .catch((err) => {
              console.error(`getEstimateById. Error:\n${err}`)
              return showToast('Something went wrong fetching estimate', 'error')
            })
        }
      }
      let allInfo
      if (props.context === 'INVOICE') {
        allInfo = await _getAllInvoiceInfo(editMode, duplicate)
      } else {
        allInfo = await _getAllEstimateInfo(editMode, duplicate)
      }
      allInfo.totalWithoutTaxes = calculatePriceWithoutTax(allInfo, props.context).replaceAll(
        '$',
        ''
      )
      allInfo.totalTaxes = calculateTaxes(allInfo, props.context).replaceAll('$', '')
      let res = await axios.post(`${Configs.FirebaseFunctionUrl}/generatePdfContent`, {
        context: props.context,
        draftMode: props.drafting,
        allInfo,
        user: userStore.currentUser,
        estimateRequestId,
        currEstimateId,
        currInvoiceId,
        editMode,
        duplicate,
        clientId,
        timeZone: dayjs.tz.guess(),
        allData: JSON.stringify({
          customerInfo: estimatorStore.customerInfo,
          finalEstimates: estimatorStore.finalEstimates,
          customNote: estimatorStore.customNote,
        }),
      })
      if (props.context === 'ESTIMATE') {
        createEstimateEntryInSheet(allInfo)

        // Creating Event Log-------------------------------------------------------------------
        let event, moreInfo
        if (editMode && !duplicate) {
          event = Constants.Events.ESTIMATE_EDITED
          moreInfo = {
            prevObj: prevEstimate,
            newObj: res.data.entry,
          }
        } else {
          event = Constants.Events.NEW_ESTIMATE_GENERATED
          moreInfo = {
            prevObj: null,
            newObj: res.data.entry,
          }
        }
        let targetType = event.Type
        let eventDesc = event.Desc
        let byId = userStore.currentUser.id
        let forId = clientId
        await addNewEventLog(byId, forId, res.data.entryId, targetType, eventDesc, moreInfo)
        //--------------------------------------------------------------------------------------
      } else if (props.context === 'INVOICE') {
        // Creating Event Log-------------------------------------------------------------------
        let event, moreInfo
        if (editMode && !duplicate) {
          event = Constants.Events.INVOICE_EDITED
          moreInfo = {
            prevObj: prevInvoice,
            newObj: res.data.entry,
          }
        } else {
          event = Constants.Events.NEW_INVOICE_GENERATED
          moreInfo = {
            prevObj: null,
            newObj: res.data.entry,
          }
        }
        let targetType = event.Type
        let eventDesc = event.Desc
        let byId = userStore.currentUser.id
        let forId = clientId
        await addNewEventLog(byId, forId, res.data.entryId, targetType, eventDesc, moreInfo)
        //--------------------------------------------------------------------------------------
      }
      setLoading(false)
      setHtml(res.data.html)
      setPdf(res.data.buffer)
      setEntryId(res.data.entryId)
    } catch (err) {
      console.error(err)
      setErr(err)
      setLoading(false)
    }
  }

  const createEstimateEntryInSheet = async (allInfo) => {
    try {
      let price = calculatePriceWithoutTax(allInfo)
      await axios.post(`${Configs.FirebaseFunctionUrl}/createEstimateEntryInSheet`, {
        name: allInfo.custInfo.name.join(' '),
        phone: allInfo.custInfo.phone,
        price,
        address: allInfo.custInfo.address.join(' '),
        date: dayjs().format('DD/MM/YYYY'),
      })
      console.log('Entry successfull!')
    } catch (err) {
      console.error(err)
    }
  }

  const _getAllEstimateInfo = async (editMode = false, duplicate = true) => {
    try {
      let newEstimateNumber
      if (editMode && !duplicate) {
        newEstimateNumber = await getEstimateNumberByEstimateId(
          props.location.state.recordId
        ).catch((err) => {
          showToast('Something went wrong fetching estimate number.', 'error')
          throw err
        })
      } else {
        newEstimateNumber = await getNewEstimateNumber().catch((err) => {
          showToast('Something went wrong generating estimate number.', 'error')
          throw err
        })
      }
      let allInfo = {
        context: props.context,
        custInfo: {
          ...estimatorStore.customerInfo,
          name: estimatorStore.customerInfo.name.split(','),
          address: estimatorStore.customerInfo.address.split(','),
        },
        customNote: estimatorStore.customNote.split(','),
        createdAt: estimatorStore.createdAt,
        tableData: [],
        totalDue: null,
        depositAmt: estimatorStore.customerInfo.depositAmt,
        totalAfterDeposit: null,
        tax: Constants.multipliers.tax,
        newEstimateNumber,
      }
      let allEstimatesData = {
        ...estimatorStore.interiorWorks,
        ...estimatorStore.exteriorWorks,
      }
      let totalDuePriceArray = []
      let showTotal = true
      Object.keys(allEstimatesData).forEach((key) => {
        let worksMap = allEstimatesData[key]['worksMap']
        allEstimatesData[key]['data'].forEach((obj) => {
          let result = {
            description: [],
            priceWithoutTax: [],
            priceWithoutTaxRaw: [],
            tax: Constants.multipliers.tax,
            priceTotal: [],
            taxPrice: [],
            priceTotalRaw: [],
          }
          result['description'].push(`${obj.name}`)
          result['description'].push(obj.notes.split(','))
          result['description'].push(obj.prepWork.split(','))
          result['description'].push(obj.color || '')

          Object.keys(obj).forEach((objKey) => {
            let excludeKeys = [
              'id',
              'name',
              'notes',
              'prepWork',
              'color',
              'cabinets',
              'floor',
              'wall',
              'ceiling',
              'steps',
              'railings',
              'smallHoleSize',
              'bigHoleSize',
              'roomCondition',
              'images',
            ]
            if (!excludeKeys.includes(objKey)) {
              let priceTotal =
                Math.round((parseFloat(obj[objKey]) * result.tax + Number.EPSILON) * 100) / 100
              let pwt, pt
              let keys = ['price', 'easy', 'medium', 'hard']
              if (keys.includes(objKey)) {
                pwt = `${obj[objKey]}$`
                pt = `${String(priceTotal)}$`
              } else {
                pwt = `${obj[objKey]}$ (${worksMap[objKey]})`
                pt = `${String(priceTotal)}$ (${worksMap[objKey]})`
              }
              result['priceWithoutTax'].push(pwt)
              result['priceWithoutTaxRaw'].push(parseFloat(obj[objKey]))
              result['priceTotal'].push(pt)
              result['taxPrice'].push(
                Math.round((priceTotal - priceTotal / result.tax + Number.EPSILON) * 100) / 100
              )
              result['priceTotalRaw'].push(priceTotal)
            }
          })
          if (result['priceTotalRaw'].length > 1) {
            showTotal = false
          } else {
            totalDuePriceArray.push(result['priceTotalRaw'][0] ? result['priceTotalRaw'][0] : 0)
          }
          allInfo.tableData.push(result)
        })
      })
      if (showTotal) {
        let res = totalDuePriceArray.reduce((total, curr) => {
          return total + round(curr, 2)
        }, 0)
        allInfo.totalDue = round(res, 2)
      }
      if (allInfo.totalDue) {
        allInfo.totalAfterDeposit = round(
          parseFloat(allInfo.totalDue) - parseFloat(estimatorStore.customerInfo.depositAmt),
          2
        )
      }
      return allInfo
    } catch (err) {
      console.error(err)
    }
  }

  const _getAllInvoiceInfo = async (editMode = false, duplicate = true) => {
    try {
      let newInvoiceNumber
      if (editMode && !duplicate) {
        newInvoiceNumber = await getInvoiceNumberByInvoiceId(props.location.state.recordId).catch(
          (err) => {
            showToast('Something went wrong fetching invoice number.', 'error')
            throw err
          }
        )
      } else {
        newInvoiceNumber = await getNewInvoiceNumber().catch((err) => {
          showToast('Something went wrong generating invoice number.', 'error')
          throw err
        })
      }
      let allInfo = {
        context: props.context,
        custInfo: {
          ...estimatorStore.customerInfo,
          name: estimatorStore.customerInfo.name.split(','),
          address: estimatorStore.customerInfo.address.split(','),
        },
        customNote: estimatorStore.customNote.split(','),
        createdAt: estimatorStore.createdAt,
        tableData: [],
        totalDue: null,
        depositAmt: estimatorStore.customerInfo.depositAmt,
        totalAfterDeposit: null,
        gst: Constants.multipliers.gst,
        qst: Constants.multipliers.qst,
        newInvoiceNumber,
      }
      let allEstimatesData = {
        ...estimatorStore.customWorks,
      }
      let totalDuePriceArray = []
      let showTotal = true
      Object.keys(allEstimatesData).forEach((key) => {
        allEstimatesData[key]['data'].forEach((obj) => {
          let result = {
            description: [],
            priceWithoutTax: [],
            priceTotal: [],
            gstTaxPrice: [],
            qstTaxPrice: [],
            priceTotalRaw: [],
          }
          result['description'].push(obj.name)
          result['description'].push(obj.notes.split(','))
          result['description'].push(obj.prepWork.split(','))

          Object.keys(obj).forEach((objKey) => {
            let excludeKeys = ['id', 'name', 'notes', 'prepWork', 'images']
            if (!excludeKeys.includes(objKey)) {
              let objKeyVal = parseFloat(obj[objKey])
              let calc = objKeyVal * allInfo.gst - objKeyVal + (objKeyVal * allInfo.qst - objKeyVal)
              let priceTotal = Math.round((objKeyVal + calc + Number.EPSILON) * 100) / 100
              let pwt = `${obj[objKey]}$`
              let pt = `${String(priceTotal)}$`
              result['priceWithoutTax'].push(pwt)
              result['priceTotal'].push(pt)
              result['gstTaxPrice'].push(
                Math.round((objKeyVal * allInfo.gst - objKeyVal + Number.EPSILON) * 100) / 100
              )
              result['qstTaxPrice'].push(
                Math.round((objKeyVal * allInfo.qst - objKeyVal + Number.EPSILON) * 100) / 100
              )
              result['priceTotalRaw'].push(priceTotal)
            }
          })
          if (result['priceTotalRaw'].length > 1) {
            showTotal = false
          } else {
            totalDuePriceArray.push(result['priceTotalRaw'][0] ? result['priceTotalRaw'][0] : 0)
          }
          allInfo.tableData.push(result)
        })
      })
      if (showTotal) {
        let res = totalDuePriceArray.reduce((total, curr) => {
          return total + round(curr, 2)
        }, 0)
        allInfo.totalDue = round(res, 2)
      }
      if (allInfo.totalDue) {
        let allPaymentAmount = estimatorStore.customerInfo.paymentsInfo.reduce((total, curr) => {
          return total + round(curr.paymentAmount, 2)
        }, 0)
        allInfo.totalAfterDeposit = round(
          parseFloat(allInfo.totalDue) -
            parseFloat(estimatorStore.customerInfo.depositAmt) -
            parseFloat(allPaymentAmount),
          2
        )
      }
      return allInfo
    } catch (err) {
      console.error(err)
    }
  }

  const addEmailSentLog = async (clientId, entryId) => {
    let targetDetail = null
    // Creating Event Log-------------------------------------------------------------------
    if (props.context === 'INVOICE') {
      await getInvoiceById(entryId)
        .then((doc) => {
          if (doc.exists) {
            targetDetail = doc.data()
          }
        })
        .catch((err) => {
          console.error(`getInvoiceById. Error:\n${err}`)
          return showToast('Something went wrong fetching invoice', 'error')
        })
    } else if (props.context === 'ESTIMATE') {
      await getEstimateById(entryId)
        .then((doc) => {
          if (doc.exists) {
            targetDetail = doc.data()
          }
        })
        .catch((err) => {
          console.error(`getEstimateById. Error:\n${err}`)
          return showToast('Something went wrong fetching estimate', 'error')
        })
    }
    let event =
      props.context === 'ESTIMATE'
        ? Constants.Events.ESTIMATE_EMAIL_SENT
        : Constants.Events.INVOICE_EMAIL_SENT
    let targetType = event.Type
    let eventDesc = event.Desc
    let byId = userStore.currentUser.id
    let forId = clientId
    let moreInfo = {
      prevObj: {
        ...targetDetail,
        emailSent: false,
      },
      newObj: {
        ...targetDetail,
        emailSent: true,
      },
    }
    return addNewEventLog(byId, forId, entryId, targetType, eventDesc, moreInfo)
    //--------------------------------------------------------------------------------------
  }

  const sendEmail = async () => {
    try {
      showToast(`Sending Email...`, 'info')
      let url = `${Configs.FirebaseFunctionUrl}/sendQuoteMail`
      if (props.context === 'INVOICE') {
        url = `${Configs.FirebaseFunctionUrl}/sendInvoiceMail`
      }
      let res = await axios.post(url, {
        entryId,
        base64: pdf,
        email: estimatorStore.customerInfo.email,
        senderEmail: userStore.currentUser.email,
      })
      if (res.data.status !== 'success') {
        return showToast(res.data.message, 'error')
      }
      await addEmailSentLog(estimatorStore.customerInfo.id, entryId)
      showToast(`Email sent to ${estimatorStore.customerInfo.email}`)
      setIsDone(true)
    } catch (err) {
      console.error(err)
      showToast(`Something Went Wrong While Sending Email`, 'error')
    }
  }

  const markSent = async () => {
    try {
      showToast('Marking Started', 'info')
      if (props.context === 'INVOICE') {
        await changeInvoiceEmailStatus(entryId, true)
      } else if (props.context === 'ESTIMATE') {
        if (props.location.state && props.location.state.requestId) {
          await changeEstimateRequestStatus(props.location.state.requestId, false)
        }
        await changeEstimateEmailStatus(entryId, true)
      }
      await addEmailSentLog(estimatorStore.customerInfo.id, entryId)
      showToast('Marked as sent successfully')
      setIsDone(true)
    } catch (err) {
      console.error(err)
      showToast(`Something Went Wrong While Marking.`, 'error')
    }
  }

  const openCalendarEventModal = () => {
    if (props.context === 'ESTIMATE') {
      setShowCalendarEventModal(true)
    }
  }

  if (props.drafting) {
    return (
      <Observer>
        {() => (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <LinearProgress />
                <h3>
                  {props.location?.state?.editMode && !props.location?.state?.duplicate
                    ? 'Saving Edits in progress...'
                    : 'Moving to draft in progress...'}
                </h3>
              </div>
            ) : (
              <>
                {!err ? (
                  <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <h3>
                      {props.location?.state?.editMode && !props.location?.state?.duplicate
                        ? 'Edits saved successfully.'
                        : 'Moved to draft successfully'}
                    </h3>
                    {props.location?.state?.editMode && !props.location?.state?.duplicate ? (
                      <Button
                        variant='contained'
                        color='secondary'
                        onClick={() => {
                          props.history.push(
                            props.context === 'INVOICE'
                              ? Constants.jobsConfigs.allPaths.Invoices.routes.InvoicesSent.route
                              : Constants.jobsConfigs.allPaths.Estimates.routes.EstimatesSent.route
                          )
                        }}>
                        Go To {props.context === 'INVOICE' ? 'Invoices' : 'Estimates'} Sent
                      </Button>
                    ) : (
                      <Button
                        variant='contained'
                        color='secondary'
                        onClick={() => {
                          props.history.push(
                            props.context === 'INVOICE'
                              ? Constants.jobsConfigs.allPaths.Invoices.routes.InvoicesDraft.route
                              : Constants.jobsConfigs.allPaths.Estimates.routes.EstimatesDraft.route
                          )
                        }}>
                        Go To Draft {props.context === 'INVOICE' ? 'Invoices' : 'Estimates'}
                      </Button>
                    )}
                  </div>
                ) : (
                  <p>Something Went Wrong.</p>
                )}
              </>
            )}
          </div>
        )}
      </Observer>
    )
  }

  return (
    <Observer>
      {() => (
        <div>
          {loading ? (
            <LinearProgress />
          ) : (
            <div>
              {!err ? (
                <>
                  {isDone ? (
                    <Button
                      variant='contained'
                      color='secondary'
                      onClick={() => {
                        props.history.push(
                          props.context === 'INVOICE'
                            ? Constants.jobsConfigs.allPaths.Invoices.routes.InvoicesSent.route
                            : Constants.jobsConfigs.allPaths.Estimates.routes.EstimatesSent.route
                        )
                      }}>
                      Go To {props.context === 'INVOICE' ? 'Invoices' : 'Estimates'} Sent
                    </Button>
                  ) : (
                    <div>
                      <div style={{ textAlign: 'right' }}>
                        <ButtonGroup
                          variant='text'
                          color='primary'
                          aria-label='text primary button group'>
                          {Constants.UsersWithSendEmailAccess.includes(
                            userStore.currentUser.email
                          ) ? (
                            <Button
                              color='secondary'
                              disabled={estimatorStore.customerInfo.email === ''}
                              onClick={() => {
                                markSent()
                                openCalendarEventModal()
                              }}>
                              Move To Sent
                            </Button>
                          ) : (
                            <Button style={{ color: 'grey' }} disabled={true}>
                              Move To Sent
                            </Button>
                          )}
                          <Button
                            onClick={() => {
                              openCalendarEventModal()
                            }}>
                            <a
                              download={
                                props.context === 'INVOICE' ? 'Facture' : 'estimation de peinture'
                              }
                              href={'data:application/pdf;base64,' + pdf}>
                              Download PDF
                            </a>
                          </Button>
                          {Constants.UsersWithSendEmailAccess.includes(
                            userStore.currentUser.email
                          ) ? (
                            <Button
                              disabled={estimatorStore.customerInfo.email === ''}
                              onClick={() => {
                                sendEmail()
                                openCalendarEventModal()
                              }}>
                              Send Email
                            </Button>
                          ) : (
                            <Button style={{ color: 'grey' }} disabled={true}>
                              Send Email
                            </Button>
                          )}
                        </ButtonGroup>
                        {props.location.state &&
                          props.location.state.editMode &&
                          !props.location.state.duplicate && (
                            <span style={{ marginLeft: 10, color: '#737373' }}>
                              <CloudUploadIcon fontSize='small' /> changes saved
                            </span>
                          )}
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: html }} />
                    </div>
                  )}
                </>
              ) : (
                <p>Something Went Wrong.</p>
              )}
              {showCalendarEventModal && (
                <EstimateCalendarEventModal
                  onClose={() => setShowCalendarEventModal(false)}
                  getAllEstimateInfo={_getAllEstimateInfo}
                />
              )}
            </div>
          )}
        </div>
      )}
    </Observer>
  )
}

const EstimateCalendarEventModal = ({ onClose, getAllEstimateInfo }) => {
  const allInfo = getAllEstimateInfo()
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [modalStyle] = useState(getModalStyle())
  const [eventName, setEventName] = useState(`Call Back ${allInfo?.custInfo?.name}`)
  const [eventGuests, setEventGuests] = useState([allInfo?.custInfo?.email])
  const [eventStartDate, setEventStartDate] = useState(dayjs().toDate())
  const [eventEndDate, setEventEndDate] = useState(dayjs().add(1, 'hour').toDate())
  const [eventDesc, setEventDesc] = useState(
    `> Phone: ${allInfo?.custInfo?.phone}\n\n> Address: ${
      allInfo?.custInfo?.address
    }\n\n> Estimate Amount Before Tax: ${calculatePriceWithoutTax(allInfo)}`
  )
  const [eLink, setELink] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleEventCreation = async () => {
    try {
      setIsLoading(true)
      let res = await axios.post(`${Configs.FirebaseFunctionUrl}/createCalenderEvent`, {
        summary: eventName,
        description: eventDesc,
        start: {
          dateTime: dayjs(eventStartDate).format('YYYY-MM-DDTHH:mm:ss'),
          timeZone: 'America/Toronto',
        },
        end: {
          dateTime: dayjs(eventEndDate).format('YYYY-MM-DDTHH:mm:ss'),
          timeZone: 'America/Toronto',
        },
        attendees: eventGuests.map((e) => {
          return { email: e }
        }),
      })
      if (res.status !== 200) {
        throw new Error(res.data.err)
      }
      showToast('Event Created Successfully')
      setIsLoading(false)
      setELink(res.data.eventLink)
      setIsSuccess(true)
    } catch (err) {
      setIsLoading(false)
      showToast('Something went wrong creating event.', 'error')
      console.error(err)
    }
  }

  return (
    <Modal open={true}>
      <div
        style={{
          ...modalStyle,
          width: isMobile ? '100%' : '40%',
          height: isMobile ? '100%' : '80%',
        }}
        className={classes.paperModal}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography
              variant='h4'
              align='center'
              gutterBottom
              style={{ color: appStore.darkMode ? '#fcfcfc' : '#000000' }}>
              Create Calendar Event
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {isSuccess ? (
              <div style={{ textAlign: 'center', marginTop: 40, marginBottom: 50 }}>
                <CheckCircleIcon style={{ color: '#60e315', fontSize: 200 }} />
              </div>
            ) : (
              <Scrollbars style={{ height: isMobile ? '62vh' : '55vh' }}>
                <div style={{ textAlign: 'center' }}>
                  <br />
                  <TextField
                    label='Event Name'
                    type='text'
                    variant='outlined'
                    value={eventName}
                    style={{ width: 250 }}
                    onChange={(e) => {
                      setEventName(e.target.value)
                    }}
                  />
                  <br />
                  <br />
                  <TextField
                    label='Event Guests (Use comma(,) to add more emails)'
                    type='text'
                    variant='outlined'
                    value={eventGuests.join(', ')}
                    style={{ width: 250 }}
                    multiline
                    rows={2}
                    onChange={(e) => {
                      setEventGuests(e.target.value.split(',').map((e) => e.trim()))
                    }}
                  />
                  <br />
                  <br />
                  <DateTimePicker
                    label='Event Start Date'
                    inputVariant='outlined'
                    style={{ width: 250 }}
                    value={eventStartDate}
                    onChange={setEventStartDate}
                  />
                  <br />
                  <br />
                  <DateTimePicker
                    label='Event End Date'
                    inputVariant='outlined'
                    style={{ width: 250 }}
                    value={eventEndDate}
                    onChange={setEventEndDate}
                  />
                  <br />
                  <br />
                  <TextField
                    label='Event Description'
                    type='text'
                    variant='outlined'
                    style={{ width: 250 }}
                    multiline
                    rows={8}
                    value={eventDesc}
                    onChange={(e) => {
                      setEventDesc(e.target.value)
                    }}
                  />
                  <br />
                  <br />
                </div>
              </Scrollbars>
            )}
          </Grid>
          <Grid item xs={12}>
            {isSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <Button variant='contained' onClick={onClose}>
                  Close
                </Button>
                <Button
                  variant='contained'
                  color='secondary'
                  style={{ marginLeft: 10 }}
                  target='_blank'
                  href={eLink}>
                  Visit Event
                </Button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Button variant='contained' size='small' disabled={isLoading} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  color='secondary'
                  size='small'
                  disabled={isLoading}
                  style={{ marginLeft: 10 }}
                  onClick={() => {
                    handleEventCreation()
                  }}>
                  Create Event
                </Button>
              </div>
            )}
          </Grid>
        </Grid>
      </div>
    </Modal>
  )
}

export default withRouter(Quote)
