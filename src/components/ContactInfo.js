import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Scrollbars } from 'react-custom-scrollbars'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import CircularProgress from '@material-ui/core/CircularProgress'

import { getUsers, getAllJobs } from './../scripts/remoteActions'
import { showToast } from './../scripts/localActions'

import userStore from '../store/UserStore'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: 20,
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  table: {
    minWidth: 650,
  },
}))

const ContactInfo = () => {
  const classes = useStyles()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (userStore.currentUser.isAdmin || userStore.currentUser.jobApproved) {
      setIsLoading(true)
      getUsers()
        .then((snapshot) => {
          if (!snapshot.empty) {
            setUsers(
              snapshot.docs
                .map((doc) => doc.data())
                .filter((user) => user.uid !== userStore.currentUser.id)
            )
          }
          setIsLoading(false)
        })
        .catch((err) => {
          setIsLoading(false)
          console.error(err)
          showToast('Something went wrong fetching users', 'error')
        })
    }
  }, [])

  return (
    <div className={classes.root}>
      <Container fixed>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant='h3' align='center' gutterBottom>
              Contacts
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  {isLoading ? <CircularProgress /> : <ContactInfoTable users={users} />}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}

const ContactInfoTable = ({ users }) => {
  const classes = useStyles()
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
  }, [])

  return (
    <Paper>
      <br />
      <Typography variant='body1' color='textSecondary' align='center' gutterBottom>
        Total Results: {users.length}
      </Typography>
      <br />
      <TableContainer component={Paper}>
        <Scrollbars style={{ height: 800 }}>
          <Table className={classes.table} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align='center'>
                  <b>Nickname / Name</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Email</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Phone</b>
                </TableCell>
                {/* <TableCell align='center'>
                  <b>Address</b>
                </TableCell> */}
                <TableCell align='center'>
                  <b>Emergency Contact Name</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Emergency Contact Number</b>
                </TableCell>
                <TableCell align='center'>
                  <b>Job</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell align='center'>{user.nickname || user.name}</TableCell>
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
                  {/* <TableCell align='center'>{user.address}</TableCell> */}
                  <TableCell align='center'>{user.emergencyContactName}</TableCell>
                  <Tooltip title='Click To Call' placement='bottom'>
                    <TableCell
                      align='center'
                      style={{ cursor: 'pointer' }}
                      onClick={() => window.open(`tel:${user.emergencyContactNumber}`)}>
                      {user.emergencyContactNumber}
                    </TableCell>
                  </Tooltip>
                  <TableCell align='center'>
                    {allJobs.find((job) => job.id === user.job)?.label}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Scrollbars>
      </TableContainer>
    </Paper>
  )
}

export default ContactInfo
