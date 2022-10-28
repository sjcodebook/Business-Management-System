import React, { useState, useEffect } from 'react'
import * as dayjs from 'dayjs'
import randomstring from 'randomstring'
import { Scrollbars } from 'react-custom-scrollbars'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Autocomplete from '@material-ui/lab/Autocomplete'
import Modal from '@material-ui/core/Modal'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Checkbox from '@material-ui/core/Checkbox'
import DeleteIcon from '@material-ui/icons/Delete'

import { showToast, precisionRound, getCustomTime, getPrettyMs } from './../../scripts/localActions'
import {
  searchTrackRecord,
  createLogoutEntry,
  editEntry,
  setListenerOnExpenses,
  removeTimeTrackRecord,
  addNewEventLog,
} from './../../scripts/remoteActions'
import { Constants } from './../../scripts/constants'

import appStore from './../../store/AppStore'
import userStore from './../../store/UserStore'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: 20,
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  Innerpaper: {
    padding: theme.spacing(2),
  },
  table: {
    minWidth: 650,
  },
  paperModal: {
    position: 'absolute',
    width: '85%',
    height: '70%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: 5,
    boxShadow: theme.shadows[5],
    padding: 20,
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    overflow: 'scroll',
  },
}))

const TimeTrackerRecords = ({ users }) => {
  let unsubscribeListenerOnExpenses = null
  const classes = useStyles()
  const [email, setEmail] = useState('')
  const [startDate, setStartDate] = useState(dayjs().startOf('day').unix())
  const [endDate, setEndDate] = useState(dayjs().endOf('day').unix())
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [resLimit, setResLimit] = useState(100)
  const [totalWeekSalary, setTotalWeekSalary] = useState(0)
  const [approvedExpensesTotal, setApprovedExpensesTotal] = useState(0)
  const [expenses, setExpenses] = useState([])
  const [allUsers, setAllUsersInfo] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [activeEditEntry, setActiveEditEntry] = useState(null)
  const [resetKey, setResetKey] = useState(randomstring.generate())
  const [selectedRecords, setSelectedRecords] = useState([])

  useEffect(() => {
    if (users) {
      setAllUsersInfo(users.filter((user) => user.uid !== userStore.currentUser.id))
    }
  }, [users])

  useEffect(() => {
    setApprovedExpensesTotal(
      expenses
        .filter((expense) => expense.isActive && expense.isApproved)
        .reduce((acc, curr) => {
          return (curr.totalAmount || 0) + acc
        }, 0)
    )
  }, [expenses])

  const handleReset = () => {
    setEmail('')
    setStartDate(dayjs().startOf('day').unix())
    setEndDate(dayjs().endOf('day').unix())
    setIsLoading(false)
    setSearchResults(null)
    setResLimit(100)
    setResetKey(randomstring.generate())
  }

  const handleSubmit = () => {
    setIsLoading(true)
    if (unsubscribeListenerOnExpenses) {
      unsubscribeListenerOnExpenses()
    }
    let user = allUsers.find((user) => user.email === email)
    unsubscribeListenerOnExpenses = setListenerOnExpenses(
      startDate,
      endDate,
      setExpenses,
      user ? user.uid : null
    )
    searchTrackRecord(email, startDate, endDate, resLimit)
      .then((res) => {
        setIsLoading(false)
        setSearchResults(res)
        setTotalWeekSalary(
          res.reduce((acc, curr) => {
            return (curr.totalSalary || 0) + acc
          }, 0)
        )
        if (res.length === 0) {
          showToast('No record(s) found', 'info')
        }
      })
      .catch((err) => {
        setIsLoading(false)
        setSearchResults(null)
        showToast('Something Went wrong fetching record(s).', 'error')
      })
  }

  const handleLogoutEntry = (record) => {
    setIsLoading(true)
    createLogoutEntry(
      record.userId,
      record.id,
      getCustomTime(),
      getCustomTime(),
      record.userData.salary,
      false,
      null
    )
      .then((res) => {
        handleSubmit()
        showToast('Logout Entry created successfully!')
      })
      .catch((err) => {
        setIsLoading(false)
        showToast('Something Went wrong creating entry.', 'error')
      })
  }

  const handleTimeTrackRemove = async () => {
    try {
      // eslint-disable-next-line no-restricted-globals
      if (confirm(`Are You Sure to delete ${selectedRecords.length} record(s)?`)) {
        showToast('Deleting...', 'info')
        await Promise.all(
          selectedRecords.map(async (recordId) => {
            await removeTimeTrackRecord(recordId)

            // Creating Event Log-------------------------------------------------------------------
            let targetType = Constants.Events.TIME_TRACK_RECORD_DELETED.Type
            let eventDesc = Constants.Events.TIME_TRACK_RECORD_DELETED.Desc
            let byId = userStore.currentUser.id
            let record = searchResults?.find((record) => record.id === recordId)
            let forId = record ? record.userData.uid : ''
            let moreInfo = {
              prevObj: record,
              newObj: null,
            }
            await addNewEventLog(byId, forId, recordId, targetType, eventDesc, moreInfo)
            //--------------------------------------------------------------------------------------
          })
        )
        handleSubmit()
        setSelectedRecords([])
        showToast('Deleted Successfully')
      }
    } catch (err) {
      showToast('Something went wrong while deleting', 'error')
      console.error(err)
    }
  }

  return (
    <Paper className={classes.paper}>
      <Typography variant='h4' color='textPrimary' align='left' gutterBottom>
        Search Time Track Record(s)
        <Button color='secondary' onClick={() => handleReset()}>
          Reset
        </Button>
      </Typography>
      <Paper
        style={{ backgroundColor: appStore.darkMode ? '#303030' : '#fcfcfc' }}
        className={classes.Innerpaper}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={3}>
            <div style={{ textAlign: 'center' }}>
              <Autocomplete
                key={resetKey}
                options={allUsers}
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
          <Grid item xs={12} sm={12} md={3}>
            <div style={{ textAlign: 'center' }}>
              <TextField
                id='user-email-tracker'
                label='Search By Email'
                value={email}
                variant='outlined'
                onChange={(e) => setEmail(e.target.value.trim())}
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            <div style={{ textAlign: 'center' }}>
              <TextField
                id='start-date'
                label='Start Date'
                value={dayjs.unix(startDate).format('YYYY-MM-DD')}
                type='date'
                onChange={(e) => {
                  setStartDate(dayjs(e.target.value, 'YYYY-MM-DD').startOf('day').unix())
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            <div style={{ textAlign: 'center' }}>
              <TextField
                id='end-date'
                label='End Date'
                value={dayjs.unix(endDate).format('YYYY-MM-DD')}
                type='date'
                onChange={(e) => {
                  setEndDate(dayjs(e.target.value, 'YYYY-MM-DD').endOf('day').unix())
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            <div style={{ textAlign: 'center' }}>
              <TextField
                id='res-limit-tracker'
                label='Result Limit'
                variant='outlined'
                type='number'
                value={resLimit}
                onChange={(e) => setResLimit(e.target.value)}
              />
            </div>
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <div style={{ textAlign: 'center' }}>
              <Button
                variant='contained'
                color='primary'
                disabled={isLoading}
                onClick={() => handleSubmit()}>
                Search Record(s)
              </Button>
            </div>
          </Grid>
        </Grid>
      </Paper>
      <br />
      {searchResults && (
        <div style={{ textAlign: 'center' }}>
          {selectedRecords.length !== 0 ? (
            <Button
              variant='contained'
              color='secondary'
              size='small'
              disabled={selectedRecords.length === 0}
              startIcon={<DeleteIcon />}
              style={{ marginBottom: 10 }}
              onClick={handleTimeTrackRemove}>
              Delete Selected
            </Button>
          ) : (
            <Typography
              style={{ marginBottom: 15 }}
              variant='body1'
              color='textSecondary'
              align='center'
              gutterBottom>
              Total Results: {searchResults.length}
            </Typography>
          )}
        </div>
      )}
      {searchResults && (
        <Paper
          style={{ backgroundColor: appStore.darkMode ? '#303030' : '#fcfcfc' }}
          className={classes.Innerpaper}>
          <TableContainer component={Paper}>
            <Scrollbars style={{ height: 600 }}>
              <Table className={classes.table} size='small' stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding='checkbox'>
                      <Checkbox
                        indeterminate={
                          selectedRecords.length !== 0 &&
                          selectedRecords.length !== searchResults.length
                        }
                        checked={
                          searchResults.length !== 0 &&
                          selectedRecords.length === searchResults.length
                        }
                        onChange={(e) => {
                          if (selectedRecords.length !== 0) {
                            setSelectedRecords([])
                          } else {
                            setSelectedRecords(searchResults.map((rec) => rec.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align='center'>
                      <b>Nickname / Name</b>
                    </TableCell>
                    <TableCell align='center'>
                      <b>Email</b>
                    </TableCell>
                    <TableCell align='center'>
                      <b>Date</b>
                    </TableCell>
                    <TableCell align='center'>
                      <b>Start Time</b>
                    </TableCell>
                    <TableCell align='center'>
                      <b>Finish Time</b>
                    </TableCell>
                    <TableCell align='center'>
                      <b>Duration</b>
                    </TableCell>
                    <TableCell align='center'>
                      <b>LunchBreak</b>
                    </TableCell>
                    <TableCell align='center'>
                      <b>Salary</b>
                    </TableCell>
                    <TableCell align='center'>
                      <b>Action</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell padding='checkbox'>
                        <Checkbox
                          checked={selectedRecords.includes(record.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRecords((prevVal) => {
                                return [...prevVal, record.id]
                              })
                            } else {
                              setSelectedRecords((prevVal) => {
                                return prevVal.filter((val) => val !== record.id)
                              })
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell align='center'>
                        {record.userData.nickname || record.userData.name}
                      </TableCell>
                      <TableCell align='center'>{record.userData.email}</TableCell>
                      <TableCell align='center'>
                        {dayjs.unix(record.createdAt).format('(ddd) DD/MM/YYYY')}
                      </TableCell>
                      <TableCell align='center'>
                        {dayjs.unix(record.entry).format('HH:mm')}
                      </TableCell>
                      <TableCell align='center'>
                        {record.actualExit ? dayjs.unix(record.actualExit).format('HH:mm') : 'N/A'}
                      </TableCell>
                      <TableCell align='center'>
                        {record.exit ? getPrettyMs((record.exit - record.entry) * 1000) : 'N/A'}
                      </TableCell>
                      <TableCell align='center'>
                        {record.lunchBreak
                          ? `Yes (${record.lunchBreakDur ? record.lunchBreakDur + 'm' : 'N/A'})`
                          : 'No'}
                      </TableCell>
                      <TableCell align='center'>
                        {!record.isActive ? (
                          <b>
                            {`$${precisionRound(record.totalSalary, 2)} ($${precisionRound(
                              record.salary,
                              2
                            )}/hr)`}
                          </b>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {record.isActive ? (
                          <Button
                            variant='contained'
                            color='secondary'
                            size='small'
                            disabled={isLoading}
                            onClick={() => {
                              handleLogoutEntry(record)
                            }}>
                            Logout
                          </Button>
                        ) : (
                          <Button
                            variant='contained'
                            color='primary'
                            size='small'
                            disabled={isLoading}
                            onClick={() => {
                              setActiveEditEntry(record)
                              setOpenModal(true)
                            }}>
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell
                      align='center'
                      style={{ backgroundColor: appStore.darkMode ? '#303030' : '#6FA0CC' }}>
                      <b>Total</b>
                    </TableCell>
                    <TableCell
                      align='center'
                      style={{ backgroundColor: appStore.darkMode ? '#303030' : '#6FA0CC' }}>
                      <b>${precisionRound(totalWeekSalary, 2)}</b>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell
                      align='center'
                      style={{ backgroundColor: appStore.darkMode ? '#303030' : '#6FA0CC' }}>
                      <b>Approved Expenses</b>
                    </TableCell>
                    <TableCell
                      align='center'
                      style={{ backgroundColor: appStore.darkMode ? '#303030' : '#6FA0CC' }}>
                      <b>${precisionRound(approvedExpensesTotal, 2)}</b>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell align='center' />
                    <TableCell
                      align='center'
                      style={{ backgroundColor: appStore.darkMode ? '#303030' : '#6FA0CC' }}>
                      <b>Overall (Salary + Expenses)</b>
                    </TableCell>
                    <TableCell
                      align='center'
                      style={{ backgroundColor: appStore.darkMode ? '#303030' : '#6FA0CC' }}>
                      <b>${precisionRound(totalWeekSalary + approvedExpensesTotal, 2)}</b>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Scrollbars>
          </TableContainer>
        </Paper>
      )}
      {openModal && (
        <EntryUpdateModal
          activeEditEntry={activeEditEntry}
          onClose={() => setOpenModal(false)}
          handleSubmit={handleSubmit}
        />
      )}
    </Paper>
  )
}

const getModalStyle = () => {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
    overflowX: 'hidden',
  }
}

const EntryUpdateModal = ({ activeEditEntry, onClose, handleSubmit }) => {
  const classes = useStyles()
  const [modalStyle] = useState(getModalStyle)
  const [open] = useState(true)
  const [createdAt, setCreatedAt] = useState(activeEditEntry.createdAt)
  const [entry, setEntry] = useState(dayjs.unix(activeEditEntry.entry).format('HH:mm'))
  const [exit, setExit] = useState(dayjs.unix(activeEditEntry.actualExit).format('HH:mm'))
  const [takenLunchBreak, setTakenLunchBreak] = useState(activeEditEntry.lunchBreak)
  const [lunchBreakDur, setLunchBreakDur] = useState(activeEditEntry.lunchBreakDur)
  const [isLoading, setIsLoading] = useState(false)

  const getUnixFromTime = (time) => {
    return dayjs(dayjs.unix(createdAt).format('YYYY-MM-DD') + ':' + time, 'YYYY-MM-DD:HH:mm').unix()
  }

  const handleEdit = () => {
    let entryUnix = getUnixFromTime(entry)
    let actualExit = getUnixFromTime(exit)
    let exitUnix = actualExit
    if (takenLunchBreak) {
      exitUnix = actualExit - lunchBreakDur * 60
    }
    setIsLoading(true)
    editEntry(
      activeEditEntry.id,
      createdAt,
      entryUnix,
      exitUnix,
      actualExit,
      activeEditEntry.userData.salary,
      takenLunchBreak,
      lunchBreakDur
    )
      .then((res) => {
        // Creating Event Log-------------------------------------------------------------------
        let targetType = Constants.Events.TIME_TRACK_RECORD_INFO_EDITED.Type
        let eventDesc = Constants.Events.TIME_TRACK_RECORD_INFO_EDITED.Desc
        let byId = userStore.currentUser.id
        let forId = activeEditEntry.userData.uid
        let moreInfo = {
          prevObj: activeEditEntry,
          newObj: res,
        }
        addNewEventLog(byId, forId, activeEditEntry.id, targetType, eventDesc, moreInfo)
        //--------------------------------------------------------------------------------------

        handleSubmit()
        setIsLoading(false)
        onClose()
        showToast('Entry Edited successfully!')
      })
      .catch((err) => {
        setIsLoading(false)
        showToast('Something Went wrong editing entry.', 'error')
      })
  }

  if (!activeEditEntry) {
    return null
  }

  return (
    <div>
      <Modal open={open} onClose={() => onClose()}>
        <div style={modalStyle} className={classes.paperModal}>
          <Grid container spacing={0}>
            <Grid item xs={12} sm={12}>
              <div style={{ textAlign: 'center' }}>
                <h1>Entry Edit Panel</h1>
              </div>
            </Grid>
            <Grid item xs={12} sm={12}>
              <div style={{ textAlign: 'center' }}>
                <h4>Entry Created By:</h4>
                <Typography color='textSecondary' align='center' gutterBottom>
                  {activeEditEntry.userData.name} ({activeEditEntry.userData.email})
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm={12}>
              <div style={{ textAlign: 'center' }}>
                <h4>Creation Date:</h4>
                <TextField
                  value={dayjs.unix(createdAt).format('YYYY-MM-DD')}
                  type='date'
                  onChange={(e) => {
                    setCreatedAt(dayjs(e.target.value, 'YYYY-MM-DD').startOf('day').unix())
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </div>
            </Grid>
            <Grid item xs={12} sm={12}>
              <div style={{ textAlign: 'center' }}>
                <h4>Start Time:</h4>
                <TextField
                  value={entry}
                  type='time'
                  onChange={(e) => {
                    setEntry(e.target.value)
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </div>
            </Grid>
            <Grid item xs={12} sm={12}>
              <div style={{ textAlign: 'center' }}>
                <h4>Actual Finish Time:</h4>
                <TextField
                  value={exit}
                  type='time'
                  onChange={(e) => {
                    setExit(e.target.value)
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </div>
            </Grid>
            <Grid item xs={12} sm={12}>
              <div style={{ textAlign: 'center' }}>
                <h4>Taken Lunch Break:</h4>
                <Select
                  value={takenLunchBreak}
                  onChange={(e) => {
                    setTakenLunchBreak(e.target.value)
                    if (!e.target.value) {
                      setLunchBreakDur(null)
                    }
                  }}>
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </div>
            </Grid>
            {takenLunchBreak && (
              <Grid item xs={12} sm={12}>
                <div style={{ textAlign: 'center' }}>
                  <h4>Lunch Break Duration:</h4>
                  <Select value={lunchBreakDur} onChange={(e) => setLunchBreakDur(e.target.value)}>
                    <MenuItem value={15}>15 Min.</MenuItem>
                    <MenuItem value={30}>30 Min.</MenuItem>
                    <MenuItem value={45}>45 Min.</MenuItem>
                    <MenuItem value={60}>1 Hr.</MenuItem>
                  </Select>
                </div>
              </Grid>
            )}
            <Grid item xs={12} sm={12}>
              <div style={{ textAlign: 'center' }}>
                <Button
                  disabled={isLoading}
                  variant='contained'
                  color='primary'
                  style={{ marginTop: 20 }}
                  onClick={() => handleEdit()}>
                  Edit Entry
                </Button>
                <Button
                  disabled={isLoading}
                  variant='contained'
                  color='secondary'
                  style={{ marginLeft: 20, marginTop: 20 }}
                  onClick={() => onClose()}>
                  Cancel
                </Button>
              </div>
            </Grid>
          </Grid>
        </div>
      </Modal>
    </div>
  )
}

export default TimeTrackerRecords
