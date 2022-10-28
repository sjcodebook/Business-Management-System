import React from 'react'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import AllTeamsPanel from './ConfigureTeams'
import Calendar from './Calendar'

const ProductionCalendar = () => {
  return (
    <Container fixed>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant='h3' align='center' gutterBottom>
            Production Calendar
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <AllTeamsPanel />
        </Grid>
        <Grid item xs={12}>
          <Calendar />
        </Grid>
      </Grid>
    </Container>
  )
}

export default ProductionCalendar
