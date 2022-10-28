import React, { useState, useEffect } from 'react'
import { Calendar, Views } from 'react-big-calendar'
import dayjs from 'dayjs'
import { Scrollbars } from 'react-custom-scrollbars'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Modal from '@material-ui/core/Modal'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'

import { showToast, calculatePriceWithoutTax } from '../../scripts/localActions'
import {
  setListenerOnCalendarEvents,
  getEstimateById,
  getTeamById,
  changeCalendarEventDates,
  getUsers,
  getAllTeams,
  getCleintById,
  changeCalendarEventTeam,
  changeCalendarEventStatusColor,
} from '../../scripts/remoteActions'

import dayjsLocalizer from '../../utils/dayjsLocalizer'

const localizer = dayjsLocalizer()

const DragAndDropCalendar = withDragAndDrop(Calendar)

const useStyles = makeStyles((theme) => ({
  paper: {
    color: theme.palette.text.secondary,
  },
  paperModal: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  formControl: {
    minWidth: 140,
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

const MainCalendar = () => {
  const [rawEvents, setRawEvents] = useState([])
  const [events, setEvents] = useState([])
  const [refreshCalen, setRefreshCalen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let unsubscribeListenerOnEvents = setListenerOnCalendarEvents(setRawEvents)
    return () => {
      unsubscribeListenerOnEvents()
    }
  }, [refreshCalen])

  useEffect(() => {
    ;(async () => {
      try {
        await Promise.all(
          rawEvents.map(async (r) => {
            let title = 'Event with no title'
            r.start = dayjs.unix(r.startUnix).toDate()
            r.end = dayjs.unix(r.endUnix).toDate()
            if (r.targetType === 'SOLD_ESTIMATE' && r.targetId) {
              let estimate = await getEstimateById(r.targetId)
              if (estimate.exists) {
                let estimateData = estimate.data()
                r.estimate = estimateData
                title = `${estimateData.generatedForName}'s estimate ${
                  estimateData.estimateNo ? `(${estimateData.estimateNo})` : ''
                } ${
                  calculatePriceWithoutTax(JSON.parse(estimateData?.allInfo)) ===
                  'Multiple products'
                    ? 'containing multiple products'
                    : `totalling ${calculatePriceWithoutTax(
                        JSON.parse(estimateData?.allInfo)
                      )} (before tax)`
                }`
                if (r.teamId) {
                  let team = await getTeamById(r.teamId)
                  if (team.exists) {
                    let teamData = team.data()
                    r.team = teamData
                    title = title + ` (${teamData.label})`
                  }
                }
              } else {
                r.estimate = null
              }
              r.title = title
            }
          })
        )
        setEvents(rawEvents)
      } catch (err) {
        console.error(err)
        showToast('Something went wrong', 'error')
      }
    })()
  }, [rawEvents])

  const moveEvent = ({ event, start, end }) => {
    const nextEvents = events.map((existingEvent) => {
      return existingEvent.id === event.id ? { ...existingEvent, start, end } : existingEvent
    })
    setEvents(nextEvents)
    changeCalendarEventDates(event.id, dayjs(start).unix(), dayjs(end).unix()).catch((err) => {
      showToast('Something went wrong updating event', 'error')
      console.error(err)
    })
  }

  const resizeEvent = ({ event, start, end }) => {
    const nextEvents = events.map((existingEvent) => {
      return existingEvent.id === event.id ? { ...existingEvent, start, end } : existingEvent
    })
    setEvents(nextEvents)
    changeCalendarEventDates(event.id, dayjs(start).unix(), dayjs(end).unix()).catch((err) => {
      showToast('Something went wrong updating event', 'error')
      console.error(err)
    })
  }

  return (
    <>
      <div style={{ textAlign: 'right' }}>
        <Button
          variant='contained'
          color='primary'
          size='small'
          style={{ marginBottom: 10 }}
          disabled={isLoading}
          onClick={() => {
            setRefreshCalen((prevVal) => !prevVal)
            setIsLoading(true)
            setTimeout(() => {
              setIsLoading(false)
            }, 2000)
          }}>
          Refresh Calender
        </Button>
      </div>
      <div style={{ backgroundColor: '#f8f8f8', color: '#000', padding: 10, borderRadius: 5 }}>
        <DragAndDropCalendar
          selectable
          localizer={localizer}
          events={events}
          onEventDrop={moveEvent}
          resizable
          onEventResize={resizeEvent}
          defaultView={Views.MONTH}
          defaultDate={new Date()}
          popup={true}
          dragFromOutsideItem={null}
          views={['month']}
          style={{ height: 800 }}
          components={{
            event: EventComponent,
          }}
        />
      </div>
    </>
  )
}

const EventComponent = ({ event }) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <div
      onDoubleClick={(e) => {
        setShowModal(true)
      }}>
      <div
        style={{
          width: '92%',
          float: 'left',
          backgroundColor: event.team ? event.team.color : '#3174ad',
          padding: 4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
        <span style={{ fontWeight: 'bold' }}>{event.title}</span>
      </div>
      <div
        className='center-flex-row'
        style={{
          float: 'right',
          width: '8%',
          padding: 4,
          backgroundColor: '#fff',
          color: '#000',
        }}>
        <FiberManualRecordIcon fontSize='small' style={{ color: event.eventStatusColor }} />
      </div>
      {showModal && <CalendarEventDetailModal event={event} onClose={() => setShowModal(false)} />}
    </div>
  )
}

const CalendarEventDetailModal = ({ event, onClose }) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [modalStyle] = useState(getModalStyle())
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [allTeams, setAllTeams] = useState([])
  const [clientInfo, setClientInfo] = useState({})
  const [selectedTeam, setSelectedTeam] = useState(event.teamId)
  const [selectedColor, setSelectedColor] = useState(event.eventStatusColor)

  useEffect(() => {
    if (event && event.estimate && event.estimate.clientId) {
      getCleintById(event.estimate.clientId).then((doc) => {
        if (doc.exists) {
          setClientInfo({
            ...doc.data(),
            id: doc.id,
          })
        }
      })
    }
    getUsers().then((snapshot) => {
      if (!snapshot.empty) {
        setUsers(snapshot.docs.map((doc) => doc.data()).filter((user) => user.isActive))
      }
    })
    getAllTeams().then((snapshot) => {
      if (!snapshot.empty) {
        setAllTeams(
          snapshot.docs.map((doc) => {
            return {
              ...doc.data(),
              id: doc.id,
            }
          })
        )
      }
    })
  }, [event])

  const handleTeamUpdate = async () => {
    try {
      setIsLoading(true)
      await changeCalendarEventTeam(event.id, selectedTeam)
      setIsLoading(false)
      showToast('Team updated successfully')
      onClose()
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong updating team', 'error')
    }
  }

  const handleEventStatusColorUpdate = async () => {
    try {
      setIsLoading(true)
      await changeCalendarEventStatusColor(event.id, selectedColor)
      setIsLoading(false)
      showToast('Event status updated successfully')
      onClose()
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong updating event status', 'error')
    }
  }

  return (
    <Modal open={true} onClose={onClose}>
      <div
        style={{
          ...modalStyle,
          width: isMobile ? '100%' : '60%',
          height: isMobile ? '100%' : '62%',
        }}
        className={classes.paperModal}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography
              variant='h6'
              gutterBottom
              className='center-flex-row'
              style={{ justifyContent: 'space-between' }}>
              {event.title}
              <CancelOutlinedIcon
                style={{ float: 'right', cursor: 'pointer' }}
                fontSize='large'
                onClick={() => onClose()}
              />
            </Typography>
          </Grid>
          <Scrollbars style={{ height: isMobile ? '80vh' : '48vh' }}>
            <div style={{ margin: '0 10px 30px' }}>
              <Grid item xs={12}>
                <div className='center-flex-column' style={{ alignItems: 'flex-start' }}>
                  <h2>Client Info:</h2>
                  <p>
                    <b>Client Name: </b> {clientInfo.name}
                  </p>
                  <p>
                    <b>Client Email: </b> {clientInfo.email}
                  </p>
                  <p>
                    <b>Client Phone: </b> {clientInfo.phone}
                  </p>
                  <p>
                    <b>Client Address: </b> {clientInfo.address}
                  </p>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div
                  className='center-flex-row'
                  style={{ marginTop: 20, justifyContent: 'flex-start' }}>
                  <FormControl variant='outlined' style={{ marginLeft: 0, minWidth: 100 }}>
                    <InputLabel id='event-status-select-label'>Event Status</InputLabel>
                    <Select
                      labelId='event-status-select-label'
                      id='event-status-select'
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      label='Event Status'>
                      <MenuItem value={'#f50157'}>
                        <FiberManualRecordIcon fontSize='small' style={{ color: '#f50157' }} />
                      </MenuItem>
                      <MenuItem value={'#ffc723'}>
                        <FiberManualRecordIcon fontSize='small' style={{ color: '#ffc723' }} />
                      </MenuItem>
                      <MenuItem value={'#60e315'}>
                        <FiberManualRecordIcon fontSize='small' style={{ color: '#60e315' }} />
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    style={{ marginLeft: 20 }}
                    disabled={isLoading}
                    onClick={() => handleEventStatusColorUpdate()}>
                    Update Event Status
                  </Button>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className='center-flex-column' style={{ alignItems: 'flex-start' }}>
                  <h2>Assigned Team:</h2>
                  <FormControl
                    variant='outlined'
                    className={classes.formControl}
                    style={{ marginLeft: 0 }}>
                    <InputLabel id='team-select-label'>Team</InputLabel>
                    <Select
                      labelId='team-select-label'
                      id='team-select'
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      label='Team'>
                      {allTeams.map((team) => (
                        <MenuItem value={team.id}>{team.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <br />
                  <div>
                    <h4>All Team Members:</h4>
                    <List dense alignItems='flex-start'>
                      {(allTeams.find((t) => t.id === selectedTeam)
                        ? allTeams.find((t) => t.id === selectedTeam).members
                        : []
                      ).map((memId) => {
                        let user = users.find((u) => u.uid === memId)
                        return (
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar alt={user?.name} src={user?.picUrl} />
                            </ListItemAvatar>
                            <ListItemText primary={user?.nickname || user?.name} secondary={null} />
                          </ListItem>
                        )
                      })}
                    </List>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12}>
                {event.teamId && selectedTeam !== event.teamId && (
                  <div style={{ textAlign: 'center', marginTop: 10 }}>
                    <Button
                      variant='contained'
                      color='primary'
                      size='small'
                      disabled={isLoading}
                      onClick={() => handleTeamUpdate()}>
                      Update Team
                    </Button>
                  </div>
                )}
              </Grid>
            </div>
          </Scrollbars>
        </Grid>
      </div>
    </Modal>
  )
}

export default MainCalendar
