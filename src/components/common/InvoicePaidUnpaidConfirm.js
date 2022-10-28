import React, { useState, Fragment } from 'react'
import * as dayjs from 'dayjs'
import axios from 'axios'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'

import Configs from '../../scripts/configs'
import { Constants } from '../../scripts/constants'
import { showToast } from '../../scripts/localActions'
import {
  addNewEventLog,
  changeInvoicePaidStatus,
  getUserById,
  getInvoiceById,
} from '../../scripts/remoteActions'

import userStore from '../../store/UserStore'

const InvoicePaidUnpaidConfirm = ({ invoice, onClose, isLoading, setIsLoading, setRefresh }) => {
  const drawerPosition = 'bottom'
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [paidOn, setPaidOn] = useState(dayjs().unix())

  const sendInvoiceEmail = async (updatedInvoice) => {
    try {
      showToast('Sending email in progress...', 'info')
      let userDoc = await getUserById(updatedInvoice.assignedToId)
      if (userDoc.exists) {
        let res = await axios.post(`${Configs.FirebaseFunctionUrl}/generatePdfContent`, {
          allInfo: JSON.parse(updatedInvoice.allInfo || '{}'),
          currInvoiceId: updatedInvoice.id,
          user: userDoc.data(),
          timeZone: dayjs.tz.guess(),
        })
        if (res.status !== 200) {
          throw new Error('Something went wrong.')
        }
        res = await axios.post(`${Configs.FirebaseFunctionUrl}/sendInvoiceMail`, {
          entryId: updatedInvoice.id,
          base64: res.data.buffer,
          email: updatedInvoice.generatedForEmail,
          senderEmail: userStore.currentUser.email,
        })
        if (res.data.status !== 'success') {
          return showToast(res.data.message, 'error')
        }
        let allData = JSON.parse(updatedInvoice?.allData || '{}')
        await addEmailSentLog(allData?.customerInfo?.id || 'notAvailiable', updatedInvoice?.id)
        showToast(`Email sent to ${allData?.customerInfo?.email}`)
      }
    } catch (err) {
      console.error(err)
      showToast('Something Went wrong while sennding Invoice email', 'error')
      throw new Error(err)
    }
  }

  const addEmailSentLog = async (clientId, entryId) => {
    let targetDetail = null
    // Creating Event Log-------------------------------------------------------------------
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
    let event = Constants.Events.INVOICE_EMAIL_SENT
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

  const handleInvoicePaidStatusChange = async (sendEmail) => {
    try {
      setIsLoading(true)
      const newPaidStatus = invoice?.paid ? false : true
      let changedInvoiceKeys = await changeInvoicePaidStatus(invoice.id, newPaidStatus, paidOn)

      // Creating Event Log-------------------------------------------------------------------
      let statusEvent = !invoice?.paid
        ? Constants.Events.INVOICE_STATUS_CHANGE_TO_PAID
        : Constants.Events.INVOICE_STATUS_CHANGE_TO_UNPAID
      let targetType = statusEvent.Type
      let eventDesc = statusEvent.Desc
      let byId = userStore.currentUser.id
      invoice.allInfo = JSON.stringify(invoice.allInfo)
      delete invoice.clientInfo
      let forId = invoice.clientId || 'notAvaialble'
      let moreInfo = {
        prevObj: invoice,
        newObj: {
          ...invoice,
          ...changedInvoiceKeys,
        },
      }
      await addNewEventLog(byId, forId, invoice.id, targetType, eventDesc, moreInfo)
      //--------------------------------------------------------------------------------------

      if (sendEmail) {
        await sendInvoiceEmail({
          ...invoice,
          ...changedInvoiceKeys,
        })
      }
      showToast('Paid status changed successfully.')
      onClose && onClose()
      setIsLoading && setIsLoading(false)
      setRefresh &&
        setRefresh((prevVal) => {
          return !prevVal
        })
    } catch (err) {
      setIsLoading && setIsLoading(false)
      console.error(err)
      showToast('Something went wrong', 'error')
    }
  }

  return (
    <Fragment>
      <Drawer anchor={drawerPosition} open={true} onClose={onClose}>
        <Paper
          className='center-flex-column'
          style={{ height: isMobile ? 400 : 300, overflow: 'hidden' }}>
          <Typography style={{ marginBottom: 40 }} variant='h4' align='center' gutterBottom>
            Mark Invoice ({invoice?.invoiceNo}) {invoice?.paid ? 'UnPaid' : 'Paid'}
          </Typography>
          {!invoice?.paid && (
            <>
              <div
                style={{
                  textAlign: isMobile ? 'center' : 'right',
                  marginRight: isMobile ? 0 : 20,
                  marginBottom: isMobile ? 20 : 0,
                }}>
                <TextField
                  label='Paid On'
                  value={dayjs.unix(paidOn).format('YYYY-MM-DD')}
                  type='date'
                  onChange={(e) => {
                    setPaidOn(dayjs(e.target.value, 'YYYY-MM-DD').startOf('day').unix())
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </div>
              <br />
              <br />
            </>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <div style={{ textAlign: 'center' }}>
                {Constants.UsersWithSendEmailAccess.includes(userStore.currentUser.email) ? (
                  <Button
                    variant='contained'
                    color='secondary'
                    disabled={isLoading}
                    onClick={() => {
                      handleInvoicePaidStatusChange(true)
                    }}>
                    Mark Invoice {invoice?.paid ? 'UnPaid' : 'Paid'} and Send{' '}
                    {invoice?.paid ? 'Invoice' : 'Receipt'}
                  </Button>
                ) : (
                  <Button variant='contained' color='secondary' disabled={true}>
                    Mark Invoice {invoice?.paid ? 'UnPaid' : 'Paid'} and Send{' '}
                    {invoice?.paid ? 'Invoice' : 'Receipt'}
                  </Button>
                )}
              </div>
            </Grid>
            <Grid item xs={12}>
              <div style={{ textAlign: 'center' }}>
                <Button
                  variant='contained'
                  disabled={isLoading}
                  onClick={() => {
                    handleInvoicePaidStatusChange(false)
                  }}>
                  Mark Invoice {invoice?.paid ? 'UnPaid' : 'Paid'} Only
                </Button>
              </div>
            </Grid>
          </Grid>
        </Paper>
      </Drawer>
    </Fragment>
  )
}

export default InvoicePaidUnpaidConfirm
