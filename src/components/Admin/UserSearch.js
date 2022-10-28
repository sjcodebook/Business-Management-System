import React, { useState, useEffect, Fragment } from 'react'
import * as dayjs from 'dayjs'
import randomstring from 'randomstring'
import { Scrollbars } from 'react-custom-scrollbars'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Modal from '@material-ui/core/Modal'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Collapse from '@material-ui/core/Collapse'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CancelIcon from '@material-ui/icons/Cancel'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Autocomplete from '@material-ui/lab/Autocomplete'
import MenuIcon from '@material-ui/icons/Menu'
import DeleteIcon from '@material-ui/icons/Delete'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'

import { showToast } from './../../scripts/localActions'
import {
  searchUser,
  setAdminStatus,
  deactivateUser,
  updateUserSalaryAndNickname,
  addNewEventLog,
  getAllJobs,
  setJobApproveStatus,
} from './../../scripts/remoteActions'

import appStore from './../../store/AppStore'
import userStore from './../../store/UserStore'
import { Constants } from '../../scripts/constants'

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
  rowRoot: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
  formControlSelect: {
    // margin: theme.spacing(1),
    minWidth: 220,
  },
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

const UserSearchCard = ({ users }) => {
  const classes = useStyles()
  const [email, setEmail] = useState('')
  const [accessSearch, setAccessSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [allUsers, setAllUsersInfo] = useState([])
  const [resetKey, setResetKey] = useState(randomstring.generate())
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [activeUser, setActiveUser] = useState({})
  const [allJobs, setAllJobs] = useState([])

  useEffect(() => {
    getAllJobs()
      .then((snap) => {
        if (!snap.empty) {
          setAllJobs(
            snap.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }))
          )
        }
      })
      .catch((err) => {
        console.error('getAllJobs\n', err)
      })
  }, [searchResults])

  useEffect(() => {
    if (users) {
      setAllUsersInfo(users.filter((user) => user.uid !== userStore.currentUser.id))
    }
  }, [users])

  const handleReset = () => {
    setEmail('')
    setAccessSearch('')
    setIsLoading(false)
    setSearchResults(null)
    setResetKey(randomstring.generate())
  }

  const handleSubmit = () => {
    setIsLoading(true)
    searchUser(email, accessSearch)
      .then((res) => {
        res = res.filter((user) => user.id !== userStore.currentUser.id)
        setIsLoading(false)
        setSearchResults(res)
        if (res.length === 0) {
          showToast('No user(s) found', 'info')
        }
      })
      .catch((err) => {
        setIsLoading(false)
        setSearchResults(null)
        showToast('Something Went wrong fetching user(s).', 'error')
      })
  }

  return (
    <Paper className={classes.paper}>
      <Typography variant='h4' color='textPrimary' align='left' gutterBottom>
        Search User(s)
        <Button color='secondary' onClick={() => handleReset()}>
          Reset
        </Button>
      </Typography>
      <Paper
        style={{ backgroundColor: appStore.darkMode ? '#303030' : '#fcfcfc' }}
        className={classes.Innerpaper}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={4}>
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
          <Grid item xs={12} sm={12} md={4}>
            <div style={{ textAlign: 'center' }}>
              <TextField
                id='user-email'
                label='Search By Email'
                value={email}
                variant='outlined'
                onChange={(e) => setEmail(e.target.value.trim())}
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <div style={{ textAlign: 'center' }}>
              <FormControl variant='outlined' className={classes.formControlSelect}>
                <InputLabel id='access-search-label'>Search By Job</InputLabel>
                <Select
                  disabled={Boolean(email)}
                  labelId='access-search-label'
                  id='access-search'
                  value={accessSearch}
                  onChange={(e) => setAccessSearch(e.target.value)}
                  label='Search By Job'>
                  <MenuItem value=''>
                    <em>None</em>
                  </MenuItem>
                  {allJobs.map((job) => (
                    <MenuItem key={job.id} value={job.id}>
                      {job.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </Grid>
        </Grid>
        <br />
        <br />
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <div style={{ textAlign: 'center' }}>
              <Button
                variant='contained'
                color='primary'
                disabled={isLoading}
                onClick={() => handleSubmit()}>
                Search User(s)
              </Button>
            </div>
          </Grid>
        </Grid>
      </Paper>
      <br />
      {searchResults && (
        <Typography variant='body1' color='textSecondary' align='center' gutterBottom>
          Total Results: {searchResults.length}
        </Typography>
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
                    <TableCell />
                    <TableCell align='center'>
                      <b>Name</b>
                    </TableCell>
                    <TableCell align='center'>
                      <b>Nickname</b>
                    </TableCell>
                    <TableCell align='center'>
                      <b>Email</b>
                    </TableCell>
                    <TableCell align='center'>
                      <b>Phone</b>
                    </TableCell>
                    <TableCell align='center'>
                      <b>Job</b>
                    </TableCell>
                    <TableCell align='center'>
                      <b>Job Approved</b>
                    </TableCell>
                    <TableCell align='center'>
                      <b>Salary ($/hr)</b>
                    </TableCell>
                    <TableCell align='center'>
                      <b>Action</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults.map((user) => (
                    <Row
                      key={user.id}
                      user={user}
                      setShowSettingsModal={setShowSettingsModal}
                      setActiveUser={setActiveUser}
                      allJobs={allJobs}
                    />
                  ))}
                </TableBody>
              </Table>
            </Scrollbars>
          </TableContainer>
        </Paper>
      )}
      {showSettingsModal && (
        <UserSettingsModal
          activeUser={activeUser}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          allJobs={allJobs}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </Paper>
  )
}

const Row = ({ user, setShowSettingsModal, setActiveUser, allJobs }) => {
  const classes = useStyles()
  const [open, setOpen] = useState(false)

  return (
    <Fragment>
      <TableRow key={user.id} className={classes.rowRoot}>
        <TableCell>
          <IconButton aria-label='expand row' size='small' onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align='center'>{user.name}</TableCell>
        <TableCell align='center'>{user.nickname || ''}</TableCell>
        <Tooltip title='Click To Mail' placement='bottom'>
          <TableCell
            align='center'
            style={{ cursor: 'pointer' }}
            onClick={() => window.open(`mailto:${user.email}`)}>
            {user.email}
          </TableCell>
        </Tooltip>
        <Tooltip title='Click To Call' placement='bottom'>
          <TableCell
            align='center'
            style={{ cursor: 'pointer' }}
            onClick={() => window.open(`tel:${user.phone}`)}>
            {user.phone}
          </TableCell>
        </Tooltip>
        <TableCell align='center'>
          {user.isAdmin ? 'Admin' : allJobs.find((job) => job.id === user.job)?.label}
        </TableCell>
        <TableCell align='center' style={{ width: '10em' }}>
          {user.isAdmin ? (
            'N/A'
          ) : user.jobApproved ? (
            <CheckCircleIcon color='primary' />
          ) : (
            <CancelIcon color='secondary' />
          )}
        </TableCell>
        <TableCell align='center' style={{ width: '10em' }}>
          {user.salary}
        </TableCell>
        <TableCell align='center'>
          <MenuIcon
            style={{
              fontSize: 30,
              cursor: 'pointer',
            }}
            onClick={() => {
              setActiveUser(user)
              setShowSettingsModal(true)
            }}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        {/* <TableCell /> */}
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse style={{ padding: 10 }} in={open} timeout='auto' unmountOnExit>
            <MoreInfoTable user={user} />
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  )
}

const MoreInfoTable = ({ user }) => {
  return (
    <Box
      margin={1}
      style={{
        backgroundColor: appStore.darkMode ? '#303030' : '#ececec',
        padding: 10,
        borderRadius: 10,
      }}>
      <Typography variant='h6' gutterBottom component='div'>
        More Information on <b>{user.name}</b>
      </Typography>
      <Table size='small' align='center'>
        <TableHead>
          <TableRow>
            <TableCell align='center'>
              <b>user Id</b>
            </TableCell>
            <TableCell align='center'>
              <b>Address</b>
            </TableCell>
            <TableCell align='center'>
              <b>D.O.B</b>
            </TableCell>
            <TableCell align='center'>
              <b>Emergency Contact Name</b>
            </TableCell>
            <TableCell align='center'>
              <b>Emergency Contact Number</b>
            </TableCell>
            <TableCell align='center'>
              <b>Last Seen</b>
            </TableCell>
            <TableCell align='center'>
              <b>Joined On</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell align='center'>{user.id}</TableCell>
            <TableCell align='center'>{user.address}</TableCell>
            <TableCell align='center'>{dayjs.unix(user.dob).format('DD/MM/YYYY')}</TableCell>
            <TableCell align='center'>{user.emergencyContactName}</TableCell>
            <TableCell align='center'>{user.emergencyContactNumber}</TableCell>
            <TableCell align='center'>
              {dayjs.unix(user.lastSeen).format('DD/MM/YYYY: HH:mm')}
            </TableCell>
            <TableCell align='center'>{dayjs.unix(user.createdAt).format('DD/MM/YYYY')}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  )
}

const UserSettingsModal = ({
  activeUser,
  handleSubmit,
  onClose,
  isLoading,
  setIsLoading,
  allJobs,
}) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [modalStyle] = useState(getModalStyle())
  const [nickname, setNickname] = useState(activeUser.nickname || '')
  const [salary, setSalary] = useState(activeUser.salary)

  const handleAdminAccess = async (isAdmin) => {
    try {
      setIsLoading(true)
      await setAdminStatus(activeUser.id, isAdmin)

      // Creating Event Log-------------------------------------------------------------------
      let event = isAdmin ? 'ADMIN_ADDED' : 'ADMIN_REMOVED'
      let targetType = Constants.Events[event].Type
      let eventDesc = Constants.Events[event].Desc
      let byId = userStore.currentUser.id
      let moreInfo = {
        prevObj: {
          isAdmin: !isAdmin,
        },
        newObj: {
          isAdmin,
        },
      }
      await addNewEventLog(byId, activeUser.id, activeUser.id, targetType, eventDesc, moreInfo)
      //--------------------------------------------------------------------------------------

      handleSubmit()
      setIsLoading(false)
      onClose()
      showToast('Successfully updated admin status')
    } catch (err) {
      setIsLoading(false)
      showToast('Something went wrong while changing admin status', 'error')
      console.error(err)
    }
  }

  const handleJobApprove = async (jobApproved) => {
    try {
      setIsLoading(true)
      await setJobApproveStatus(activeUser.id, jobApproved)

      // Creating Event Log-------------------------------------------------------------------
      let event = jobApproved ? 'JOB_APPROVED' : 'JOB_DISAPPROVED'
      let targetType = Constants.Events[event].Type
      let eventDesc = Constants.Events[event].Desc
      let byId = userStore.currentUser.id
      let moreInfo = {
        prevObj: {
          job: allJobs.find((job) => job.id === activeUser.job),
          jobApproved: !jobApproved,
        },
        newObj: {
          job: allJobs.find((job) => job.id === activeUser.job),
          jobApproved,
        },
      }
      await addNewEventLog(byId, activeUser.id, activeUser.id, targetType, eventDesc, moreInfo)
      //--------------------------------------------------------------------------------------

      handleSubmit()
      setIsLoading(false)
      onClose()
      showToast('Successfully updated job approved status')
    } catch (err) {
      setIsLoading(false)
      showToast('Something went wrong while changing job approved status', 'error')
      console.error(err)
    }
  }

  const handleUserDeactivate = async () => {
    try {
      // eslint-disable-next-line no-restricted-globals
      if (confirm(`Are You Sure to deactivate ${activeUser.name}?`)) {
        showToast('Deactivating...', 'info')
        setIsLoading(true)
        await deactivateUser(activeUser.uid)

        // Creating Event Log-------------------------------------------------------------------
        let targetType = Constants.Events.EMPLOYEE_DEACTIVATED.Type
        let eventDesc = Constants.Events.EMPLOYEE_DEACTIVATED.Desc
        let byId = userStore.currentUser.id
        let moreInfo = {
          prevObj: {
            isActive: true,
          },
          newObj: {
            isActive: false,
          },
        }
        await addNewEventLog(byId, activeUser.uid, activeUser.uid, targetType, eventDesc, moreInfo)
        //--------------------------------------------------------------------------------------

        handleSubmit()
        setIsLoading(false)
        onClose()
        showToast('Deactivated Successfully')
      }
    } catch (err) {
      setIsLoading(false)
      showToast('Something went wrong while deactivating', 'error')
      console.error(err)
    }
  }

  const handleInfoUpdate = async () => {
    try {
      showToast('Updating...', 'info')
      setIsLoading(true)
      await updateUserSalaryAndNickname(activeUser.id, salary, nickname)

      if (salary !== activeUser.salary) {
        // Creating Event Log-------------------------------------------------------------------
        let targetType = Constants.Events.EMPLOYEE_SALARY_UPDATED.Type
        let eventDesc = Constants.Events.EMPLOYEE_SALARY_UPDATED.Desc
        let byId = userStore.currentUser.id
        let moreInfo = {
          prevObj: {
            salary: activeUser.salary,
          },
          newObj: {
            salary,
          },
        }
        await addNewEventLog(byId, activeUser.id, activeUser.id, targetType, eventDesc, moreInfo)
        //--------------------------------------------------------------------------------------
      }

      handleSubmit()
      setIsLoading(false)
      onClose()
      showToast('User info updated Successfully')
    } catch (err) {
      setIsLoading(false)
      showToast('Something went wrong updating user info', 'error')
      console.error(err)
    }
  }

  return (
    <Modal open={true} onClose={onClose}>
      <div
        style={{
          ...modalStyle,
          width: isMobile ? '95%' : '45%',
          height: '55vh',
        }}
        className={classes.paperModal}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography
              variant='h4'
              gutterBottom
              className='center-flex-row'
              style={{ justifyContent: 'space-between' }}>
              {activeUser.name} (
              {activeUser.isAdmin
                ? 'Admin'
                : allJobs.find((job) => job.id === activeUser.job)?.label}
              )
              <CancelOutlinedIcon
                style={{ float: 'right', cursor: 'pointer' }}
                fontSize='large'
                onClick={() => onClose()}
              />
            </Typography>
          </Grid>
          <Scrollbars style={{ height: isMobile ? '80vh' : '65vh' }}>
            <div style={{ margin: '0 10px 30px' }}>
              <Grid item xs={12}>
                <div className='center-flex-row' style={{ justifyContent: 'flex-start' }}>
                  {activeUser.isAdmin ? (
                    <Button
                      variant='contained'
                      color='primary'
                      size='small'
                      disabled={isLoading}
                      style={{ marginRight: 10 }}
                      onClick={() => handleAdminAccess(false)}>
                      Remove Admin
                    </Button>
                  ) : (
                    <Button
                      variant='contained'
                      color='secondary'
                      size='small'
                      disabled={isLoading}
                      style={{ marginRight: 10 }}
                      onClick={() => handleAdminAccess(true)}>
                      Make Admin
                    </Button>
                  )}
                  {!activeUser.isAdmin &&
                    activeUser.job &&
                    (activeUser.jobApproved ? (
                      <Button
                        variant='contained'
                        color='primary'
                        size='small'
                        disabled={isLoading}
                        style={{ marginRight: 10 }}
                        onClick={() => handleJobApprove(false)}>
                        Disapprove Job
                      </Button>
                    ) : (
                      <Button
                        variant='contained'
                        color='secondary'
                        size='small'
                        disabled={isLoading}
                        style={{ marginRight: 10 }}
                        onClick={() => handleJobApprove(true)}>
                        Approve Job
                      </Button>
                    ))}
                  <Button
                    variant='contained'
                    color='secondary'
                    size='small'
                    disabled={isLoading}
                    onClick={() => handleUserDeactivate()}>
                    <DeleteIcon />
                  </Button>
                </div>
              </Grid>
              <br />
              <br />
              <br />
              <Grid item xs={12}>
                <div className='center-flex-row' style={{ justifyContent: 'center' }}>
                  <TextField
                    style={{ minWidth: 50, marginRight: 20 }}
                    label='Nickname'
                    defaultValue={nickname}
                    variant='outlined'
                    onChange={(e) => setNickname(e.target.value)}
                  />
                  <TextField
                    type='number'
                    style={{ minWidth: 50 }}
                    label='Salary ($/hr)'
                    defaultValue={salary}
                    variant='outlined'
                    onChange={(e) => setSalary(e.target.value)}
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
                    onClick={() => handleInfoUpdate()}>
                    Update
                  </Button>
                </div>
              </Grid>
            </div>
          </Scrollbars>
        </Grid>
      </div>
    </Modal>
  )
}

export default UserSearchCard
