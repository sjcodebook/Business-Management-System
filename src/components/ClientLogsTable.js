import React, { useState, useEffect } from 'react'
import * as dayjs from 'dayjs'
import { Scrollbars } from 'react-custom-scrollbars'
import { makeStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Fade from '@material-ui/core/Fade'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined'
import LinearProgress from '@material-ui/core/LinearProgress'
import TableChartIcon from '@material-ui/icons/TableChart'

import appStore from '../store/AppStore'
import userStore from '../store/UserStore'

import { Constants } from '../scripts/constants'
import {
  getCleintById,
  addNewEventLog,
  getEventsByForId,
  getUserById,
} from '../scripts/remoteActions'
import { showToast, constructEventDesc } from '../scripts/localActions'

import JSONToTableModal from './common/JSONToTableModal'

const useStyles = makeStyles((theme) => ({
  modalPaper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #211b30',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4, 6, 4),
    borderRadius: 5,
  },
}))

const ClientLogsTable = ({ client, refresh, setRefresh, isLoading }) => {
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [clientLogs, setClientLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState({})
  const [showRawEventModal, setShowRawEventModal] = useState(false)

  useEffect(() => {
    setLogsLoading(true)
    getEventsByForId(client.id)
      .then(async (events) => {
        let finalLogs = []
        await Promise.all(
          events.map(async (e) => {
            let eventObj = {
              ...e,
            }
            let userDoc = await getUserById(e.byId)
            if (userDoc.exists) {
              eventObj['byInfo'] = userDoc.data()
            }
            let eventInfo = Object.values(Constants.Events).find(
              (event) => event.Type === eventObj.targetType
            )
            if (eventInfo) {
              let userDoc
              if (eventInfo.ValidFor === 'CLIENT') {
                userDoc = await getCleintById(e.forId)
              } else if (eventInfo.ValidFor === 'EMPLOYEE') {
                userDoc = await getUserById(e.forId)
              }
              if (userDoc?.exists) {
                eventObj['forInfo'] = userDoc.data()
              }
            }
            eventObj['formattedDesc'] = constructEventDesc(eventObj)
            finalLogs.push(eventObj)
          })
        )
        finalLogs.sort((a, b) => b.createdAt - a.createdAt)
        setClientLogs(finalLogs)
        setLogsLoading(false)
      })
      .catch((err) => {
        setLogsLoading(false)
        console.log(err)
        showToast('Something went wrong fetching client notes', 'error')
      })
  }, [client.id, refresh])

  const onClose = () => {
    setShowNoteModal(false)
  }

  return (
    <Box
      margin={1}
      style={{
        backgroundColor: appStore.darkMode ? '#303030' : '#ececec',
        padding: 10,
        borderRadius: 10,
      }}>
      <Button
        variant='contained'
        size='small'
        color='secondary'
        style={{ float: 'right', top: 5 }}
        onClick={() => setShowNoteModal(true)}>
        <AddCircleOutlinedIcon style={{ marginRight: 10 }} />
        Add New Note
      </Button>
      <Typography variant='h6' gutterBottom component='div'>
        Logs for <b>{client.name}</b>
      </Typography>
      {logsLoading && (
        <>
          <br />
          <LinearProgress color='secondary' />
          <br />
        </>
      )}
      <br />
      <Scrollbars style={{ height: 250 }}>
        <Table size='small' align='center' stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align='left'>
                <b>Date</b>
              </TableCell>
              <TableCell align='left'>
                <b>Creator</b>
              </TableCell>
              <TableCell align='left'>
                <b>Description</b>
              </TableCell>
              <TableCell align='left'>
                <b>Raw Event</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientLogs.map((log) => (
              <TableRow>
                <TableCell align='left'>
                  {dayjs.unix(log?.createdAt).format("DD MMM 'YY")}
                </TableCell>
                <TableCell align='left'>{log?.byInfo?.nickname || log?.byInfo?.name}</TableCell>
                <TableCell align='left'>{log?.formattedDesc}</TableCell>
                <TableCell align='left'>
                  <Button
                    variant='contained'
                    size='small'
                    onClick={() => {
                      setSelectedEvent(log)
                      setShowRawEventModal(true)
                    }}>
                    <TableChartIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbars>
      {showNoteModal && (
        <ClientNoteModal
          client={client}
          setRefresh={setRefresh}
          isLoading={isLoading}
          onClose={() => onClose()}
        />
      )}
      {showRawEventModal && (
        <JSONToTableModal
          title='Raw Event'
          json={selectedEvent}
          onClose={() => setShowRawEventModal(false)}
        />
      )}
    </Box>
  )
}

const ClientNoteModal = ({ client, onClose, setRefresh }) => {
  const classes = useStyles()
  const [note, setNote] = useState('')
  const [timeStamp, setTimeStamp] = useState(dayjs().unix())
  const [isLoading, setIsLoading] = useState(false)

  const handleNoteSubmit = async () => {
    try {
      if (!note.trim()) {
        return showToast('Note cannot be empty', 'error')
      }
      setIsLoading(true)
      // Creating Event Log-------------------------------------------------------------------
      let targetType = Constants.Events.NEW_CUSTOM_CLIENT_NOTE.Type
      let eventDesc = Constants.Events.NEW_CUSTOM_CLIENT_NOTE.Desc
      let byId = userStore.currentUser.id
      let forId = client.id
      let moreInfo = {
        prevObj: {},
        newObj: {
          customNote: note.trim(),
          actualCreationDate: dayjs().unix(),
        },
      }
      await addNewEventLog(byId, forId, client.id, targetType, eventDesc, moreInfo, timeStamp)
      //--------------------------------------------------------------------------------------
      setIsLoading(false)
      setRefresh((prevVal) => !prevVal)
      onClose()
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong saving note', 'error')
    }
  }

  return (
    <Modal
      className='center-flex-column'
      open={true}
      onClose={() => onClose()}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}>
      <Fade in={true}>
        <div className={classes.modalPaper}>
          <h4>Note For {client.name}:</h4>
          <TextField
            multiline
            rows={5}
            value={note}
            variant='outlined'
            onChange={(e) => setNote(e.target.value)}
          />
          <br />
          <br />
          <TextField
            label='Note Date'
            type='date'
            value={dayjs.unix(timeStamp).format('YYYY-MM-DD')}
            onChange={(e) => {
              setTimeStamp(dayjs(e.target.value, 'YYYY-MM-DD').unix())
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <br />
          <br />
          <br />
          <div style={{ textAlign: 'center' }}>
            <Button
              variant='contained'
              color='primary'
              disabled={isLoading}
              onClick={() => handleNoteSubmit()}>
              Add Note
            </Button>
          </div>
        </div>
      </Fade>
    </Modal>
  )
}

export default ClientLogsTable
