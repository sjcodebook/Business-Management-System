/* eslint-disable no-restricted-globals */
import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'
import CircularProgress from '@material-ui/core/CircularProgress'

import { Constants } from '../../scripts/constants'
import { showToast } from '../../scripts/localActions'
import {
  getUsers,
  getAllJobs,
  changeEstimateAssignee,
  changeInvoiceAssignee,
  addNewEventLog,
  getEstimateById,
  getInvoiceById,
  getEstimateRequestById,
  changeEstimateRequestAssignee,
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

const AssignToModal = ({
  onClose,
  selectedRecords,
  setSelectedRecords,
  setRefresh,
  recordType,
}) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [modalStyle] = useState(getModalStyle())
  const [users, setUsers] = useState([])
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        setIsLoading(true)
        let allJobs = await getAllJobs().then((snap) => {
          if (!snap.empty) {
            return snap.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }))
          }
          return []
        })
        let eligibleJobs = allJobs
          .filter((job) =>
            job.actions.includes(Constants.jobsConfigs.allActions.AssignableToLeads.id)
          )
          .map((job) => job.id)
        getUsers().then((snapshot) => {
          if (!snapshot.empty) {
            setUsers(
              snapshot.docs
                .map((doc) => doc.data())
                .filter((user) => user.isActive && eligibleJobs.includes(user.job))
            )
          }
          setIsLoading(false)
        })
      } catch (err) {
        setIsLoading(false)
        console.error(err)
        showToast('Something went wrong fetching users', 'error')
      }
    })()
  }, [])

  const getNameFromRecordType = () => {
    if (recordType === 'ESTIMATE') {
      return 'estimate(s)'
    } else if (recordType === 'INVOICE') {
      return 'invoice(s)'
    } else if (recordType === 'ESTIMATE_REQUEST') {
      return 'request(s)'
    }
    return ''
  }

  const handleSubmit = async () => {
    try {
      showToast('Assignment started...', 'info')
      setIsLoading(true)
      let assignedToUser = users.find((user) => user.email === email)
      await Promise.all(
        selectedRecords.map(async (recId) => {
          if (recordType === 'ESTIMATE') {
            let prevEstimateData = await getEstimateById(recId)
            if (prevEstimateData.exists) {
              await changeEstimateAssignee(
                recId,
                assignedToUser.uid,
                assignedToUser.name,
                assignedToUser.email
              )

              // Creating Event Log-------------------------------------------------------------------
              prevEstimateData = prevEstimateData.data()
              let targetType = Constants.Events.UPDATE_ASSIGNED_TO_FOR_ESTIMATE.Type
              let eventDesc = Constants.Events.UPDATE_ASSIGNED_TO_FOR_ESTIMATE.Desc
              let byId = userStore.currentUser.id
              let forId = prevEstimateData.clientId || 'notAvailable'
              let moreInfo = {
                prevObj: prevEstimateData,
                newObj: {
                  ...prevEstimateData,
                  assignedToId: assignedToUser.uid,
                  assignedToName: assignedToUser.name,
                  assignedToEmail: assignedToUser.email,
                },
              }
              await addNewEventLog(byId, forId, recId, targetType, eventDesc, moreInfo)
              //--------------------------------------------------------------------------------------
            }
          } else if (recordType === 'INVOICE') {
            let prevInvoiceData = await getInvoiceById(recId)
            if (prevInvoiceData.exists) {
              await changeInvoiceAssignee(
                recId,
                assignedToUser.uid,
                assignedToUser.name,
                assignedToUser.email
              )

              // Creating Event Log-------------------------------------------------------------------
              prevInvoiceData = prevInvoiceData.data()
              let targetType = Constants.Events.UPDATE_ASSIGNED_TO_FOR_INVOICE.Type
              let eventDesc = Constants.Events.UPDATE_ASSIGNED_TO_FOR_INVOICE.Desc
              let byId = userStore.currentUser.id
              let forId = prevInvoiceData.clientId || 'notAvailable'
              let moreInfo = {
                prevObj: prevInvoiceData,
                newObj: {
                  ...prevInvoiceData,
                  assignedToId: assignedToUser.uid,
                  assignedToName: assignedToUser.name,
                  assignedToEmail: assignedToUser.email,
                },
              }
              await addNewEventLog(byId, forId, recId, targetType, eventDesc, moreInfo)
              //--------------------------------------------------------------------------------------
            }
          } else if (recordType === 'ESTIMATE_REQUEST') {
            let prevEstimateRequestData = await getEstimateRequestById(recId)
            if (prevEstimateRequestData.exists) {
              await changeEstimateRequestAssignee(
                recId,
                assignedToUser.uid,
                assignedToUser.name,
                assignedToUser.email
              )

              // Creating Event Log-------------------------------------------------------------------
              prevEstimateRequestData = prevEstimateRequestData.data()
              let targetType = Constants.Events.UPDATE_ASSIGNED_TO_FOR_ESTIMATE_REQUEST.Type
              let eventDesc = Constants.Events.UPDATE_ASSIGNED_TO_FOR_ESTIMATE_REQUEST.Desc
              let byId = userStore.currentUser.id
              let forId = prevEstimateRequestData.clientId || 'notAvailable'
              let moreInfo = {
                prevObj: prevEstimateRequestData,
                newObj: {
                  ...prevEstimateRequestData,
                  assignedToId: assignedToUser.uid,
                  assignedToName: assignedToUser.name,
                  assignedToEmail: assignedToUser.email,
                },
              }
              await addNewEventLog(byId, forId, recId, targetType, eventDesc, moreInfo)
              //--------------------------------------------------------------------------------------
            }
          }
        })
      )
      setIsLoading(false)
      setRefresh((prevVal) => !prevVal)
      setSelectedRecords([])
      onClose()
      showToast('Assignment completed successfully')
    } catch (err) {
      showToast('Something went wrong while assigning', 'error')
      console.error(`changeAssignee. Error:\n${err}`)
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
              Assigning Panel
              <CancelOutlinedIcon
                style={{ float: 'right', cursor: 'pointer' }}
                fontSize='large'
                onClick={() => onClose()}
              />
            </Typography>
          </Grid>
          <div style={{ width: '100%' }}>
            <Grid item xs={12}>
              Select user to assign selected {getNameFromRecordType()} ({selectedRecords.length}{' '}
              selected)
              {isLoading && (
                <CircularProgress
                  style={{ float: 'right', marginRight: 15 }}
                  size={25}
                  color='secondary'
                />
              )}
            </Grid>
            <br />
            <Grid item xs={12}>
              <div style={{ textAlign: 'center' }}>
                <Autocomplete
                  options={users}
                  onInputChange={(e, val, res) => {
                    if (res === 'reset') {
                      setEmail((val.split(' (')[1] || '').split(')')[0])
                    }
                  }}
                  loading={!users}
                  getOptionLabel={(option) => `${option.name} (${option.email})`}
                  renderInput={(params) => (
                    <TextField {...params} label='Search By Name' variant='outlined' />
                  )}
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
                  disabled={isLoading || !email}
                  style={{ marginRight: 10 }}
                  onClick={() => handleSubmit()}>
                  Assign
                </Button>
              </div>
            </Grid>
          </div>
        </Grid>
      </div>
    </Modal>
  )
}

export default AssignToModal
