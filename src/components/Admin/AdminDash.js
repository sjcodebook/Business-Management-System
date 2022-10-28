import React, { useState, useEffect } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import WeekStats from './WeekStats'
import VisualizationPanel from './VisualizationPanel'
import EventLogs from './EventLogs'
import Calendly from './Calendly'
import UserSearchCard from './UserSearch'
import TimeTrackerRecords from './TimeTrackerRecords'
import ExpensesPanel from './ExpensesPanel'
import ConfigureJobs from './ConfigureJobs'
import SalesRevenueChart from './../SalesRevenueChart'
import EstimateSearch from './../EstimateSearch'
import InvoiceSearch from './../InvoiceSearch'

import { getUsers } from './../../scripts/remoteActions'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: 20,
  },
}))

const AdminDash = () => {
  const classes = useStyles()
  const [users, setUsers] = useState(null)

  useEffect(() => {
    getUsers().then((snapshot) => {
      if (!snapshot.empty) {
        setUsers(snapshot.docs.map((doc) => doc.data()).filter((user) => user.isActive))
      }
    })
  }, [])

  return (
    <div className={classes.root}>
      <Container fixed>
        <Grid container spacing={5}>
          <Grid item xs={12}>
            <Typography variant='h3' align='center' gutterBottom>
              Admin Dashboard
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <SalesRevenueChart />
          </Grid>
          <Grid item xs={12}>
            <WeekStats />
          </Grid>
          <Grid item xs={12}>
            <ConfigureJobs />
          </Grid>
          <Grid item xs={12}>
            <EventLogs />
          </Grid>
          <Grid item xs={12}>
            <VisualizationPanel />
          </Grid>
          <Grid item xs={12}>
            <Calendly />
          </Grid>
          <Grid item xs={12}>
            <UserSearchCard users={users} />
          </Grid>
          <Grid item xs={12}>
            <ExpensesPanel users={users} />
          </Grid>
          <Grid item xs={12}>
            <TimeTrackerRecords users={users} />
          </Grid>
          <Grid item xs={12}>
            <EstimateSearch />
          </Grid>
          <Grid item xs={12}>
            <InvoiceSearch />
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}

export default AdminDash
