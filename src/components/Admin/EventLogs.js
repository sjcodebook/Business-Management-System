import React, { useState, useEffect } from 'react'
import ReadMoreReact from 'read-more-react'
import * as dayjs from 'dayjs'
import { Scrollbars } from 'react-custom-scrollbars'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import TableChartIcon from '@material-ui/icons/TableChart'

import { Constants } from '../../scripts/constants'
import { constructEventDesc } from '../../scripts/localActions'
import { setListenerOnEvents, getUserById, getCleintById } from '../../scripts/remoteActions'

import appStore from '../../store/AppStore'

import JSONToTableModal from '../common/JSONToTableModal'

const useStyles = makeStyles((theme) => ({
  paper: {
    color: theme.palette.text.secondary,
  },
  Innerpaper: {
    width: '100%',
  },
}))

const EventLogs = () => {
  const classes = useStyles()
  const [rawEvents, setRawEvents] = useState([])
  const [logs, setLogs] = useState([])
  const [selectedEvent, setSelectedEvent] = useState({})
  const [showRawEventModal, setShowRawEventModal] = useState(false)

  useEffect(() => {
    let unsubscribeListenerOnEvents = setListenerOnEvents(setRawEvents)
    return () => {
      unsubscribeListenerOnEvents()
    }
  }, [])

  useEffect(() => {
    addByAndForInfoInEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawEvents])

  const addByAndForInfoInEvents = async () => {
    let finalLogs = []
    await Promise.all(
      rawEvents.map(async (e) => {
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
        eventObj['formattedDesc'] = constructEventDesc(eventObj, true)
        finalLogs.push(eventObj)
      })
    )
    finalLogs.sort((a, b) => b.createdAt - a.createdAt)
    setLogs(finalLogs)
  }

  return (
    <Paper className={classes.paper}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='visualization-content'
          id='visualization-header'>
          <Typography variant='h6' align='left' className='center-flex-row'>
            <FiberManualRecordIcon
              color='secondary'
              fontSize='small'
              style={{
                marginRight: 5,
                animation: 'blinker 1s cubic-bezier(.5, 0, 1, 1) infinite alternate',
              }}
            />{' '}
            Live Events Logs
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper
            style={{ backgroundColor: appStore.darkMode ? '#303030' : '#fcfcfc' }}
            className={classes.Innerpaper}>
            <TableContainer>
              <Scrollbars style={{ height: 400 }}>
                <Table size='small' align='center' stickyHeader>
                  <TableHead component={Paper}>
                    <TableRow>
                      <TableCell align='left'>
                        <b>Event Date</b>
                      </TableCell>
                      <TableCell align='left'>
                        <b>Event Creator</b>
                      </TableCell>
                      <TableCell align='left'>
                        <b>Event Description</b>
                      </TableCell>
                      <TableCell align='left'>
                        <b>Raw Event</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell align='left'>
                          {dayjs.unix(log?.createdAt).format("DD MMM 'YY")}
                        </TableCell>
                        <TableCell align='left'>
                          {log?.byInfo?.nickname || log?.byInfo?.name}
                        </TableCell>
                        <TableCell align='left'>
                          <ReadMoreReact
                            ideal={250}
                            max={300}
                            text={log?.formattedDesc}
                            readMoreText='... read more'
                          />
                        </TableCell>
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
            </TableContainer>
          </Paper>
        </AccordionDetails>
      </Accordion>
      {showRawEventModal && (
        <JSONToTableModal
          title='Raw Event'
          json={selectedEvent}
          onClose={() => setShowRawEventModal(false)}
        />
      )}
    </Paper>
  )
}

export default EventLogs
