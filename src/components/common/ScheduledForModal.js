/* eslint-disable no-restricted-globals */
import React, { useState } from 'react'
import * as dayjs from 'dayjs'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'

import { Constants } from '../../scripts/constants'
import { showToast } from '../../scripts/localActions'
import {
  addNewEventLog,
  getEstimateRequestById,
  changeLeadScheduledFor,
} from '../../scripts/remoteActions'

import userStore from '../../store/UserStore'

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

const ScheduledForModal = ({ onClose, selectedRecords, setSelectedRecords, setRefresh }) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [modalStyle] = useState(getModalStyle())
  const [timeStamp, setTimeStamp] = useState(dayjs().unix())
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      showToast('Scheduling started...', 'info')
      setIsLoading(true)
      await Promise.all(
        selectedRecords.map(async (recId) => {
          let prevEstimateRequestData = await getEstimateRequestById(recId)
          if (prevEstimateRequestData.exists) {
            await changeLeadScheduledFor(recId, timeStamp)
            // Creating Event Log-------------------------------------------------------------------
            prevEstimateRequestData = prevEstimateRequestData.data()
            let targetType = Constants.Events.UPDATE_SCHEDULED_DATE_FOR_ESTIMATE_REQUEST.Type
            let eventDesc = Constants.Events.UPDATE_SCHEDULED_DATE_FOR_ESTIMATE_REQUEST.Desc
            let byId = userStore.currentUser.id
            let forId = prevEstimateRequestData.clientId || 'notAvailable'
            let moreInfo = {
              prevObj: prevEstimateRequestData,
              newObj: {
                ...prevEstimateRequestData,
                scheduledFor: timeStamp,
              },
            }
            await addNewEventLog(byId, forId, recId, targetType, eventDesc, moreInfo)
            //--------------------------------------------------------------------------------------
          }
        })
      )
      setIsLoading(false)
      setSelectedRecords([])
      setRefresh((prevVal) => !prevVal)
      onClose()
      showToast('Scheduling completed successfully')
    } catch (err) {
      showToast('Something went wrong while scheduling', 'error')
      console.error(`changeScheduledFor. Error:\n${err}`)
    }
  }

  return (
    <Modal open={true} onClose={onClose}>
      <div
        style={{
          ...modalStyle,
          width: isMobile ? '90%' : '50%',
          height: isMobile ? '60%' : '50%',
        }}
        className={classes.paperModal}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              variant='h4'
              gutterBottom
              className='center-flex-row'
              style={{ justifyContent: 'space-between' }}>
              Scheduling Panel
              <CancelOutlinedIcon
                style={{ float: 'right', cursor: 'pointer' }}
                fontSize='large'
                onClick={() => onClose()}
              />
            </Typography>
          </Grid>
          <div style={{ width: '100%' }}>
            <Grid item xs={12}>
              Select scheduled date for selected lead(s) ({selectedRecords.length} selected)
            </Grid>
            <br />
            <Grid item xs={12}>
              <div style={{ textAlign: 'center' }}>
                <TextField
                  label='Scheduled For'
                  type='date'
                  value={dayjs.unix(timeStamp).format('YYYY-MM-DD')}
                  onChange={(e) => {
                    setTimeStamp(dayjs(e.target.value, 'YYYY-MM-DD').unix())
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </div>
            </Grid>
            <br />
            <Grid item xs={12}>
              <div className='center-flex-row' style={{ justifyContent: 'center' }}>
                <Button
                  variant='contained'
                  color='primary'
                  size='small'
                  disabled={isLoading}
                  style={{ marginRight: 10 }}
                  onClick={() => handleSubmit()}>
                  Schedule
                </Button>
              </div>
            </Grid>
          </div>
        </Grid>
      </div>
    </Modal>
  )
}

export default ScheduledForModal
