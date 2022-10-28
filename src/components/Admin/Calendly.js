import React, { useState } from 'react'
import { InlineWidget } from 'react-calendly'
import randomstring from 'randomstring'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Grid from '@material-ui/core/Grid'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { Constants } from './../../scripts/constants'

import appStore from './../../store/AppStore'

const useStyles = makeStyles((theme) => ({
  paper: {
    color: theme.palette.text.secondary,
  },
}))

const Calendly = () => {
  const classes = useStyles()
  const [minutes, setMinutes] = useState(30)
  const [resetKey, setResetKey] = useState(randomstring.generate())

  return (
    <Paper className={classes.paper}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='calendly-content'
          id='calendly-header'>
          <Typography variant='h6' align='left'>
            Set Meeting Panel (Calendly)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={0}>
            <Grid item xs={6}>
              <div style={{ textAlign: 'left', paddingTop: 20, paddingLeft: 20 }}>
                <span style={{ fontSize: 30, fontWeight: 'bold' }}>Calendly:</span>
                <Button
                  color='secondary'
                  style={{ marginLeft: 10 }}
                  onClick={() => setResetKey(randomstring.generate())}>
                  Reset
                </Button>
              </div>
            </Grid>
            <Grid item xs={6}>
              <div style={{ textAlign: 'right', paddingTop: 20, paddingRight: 40 }}>
                <InputLabel id='minutes-selector'>Minutes</InputLabel>
                <Select
                  labelId='minutes-selector'
                  value={minutes}
                  style={{ minWidth: 80 }}
                  onChange={(e) => setMinutes(e.target.value)}>
                  <MenuItem value={15}>15</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                  <MenuItem value={60}>60</MenuItem>
                </Select>
              </div>
            </Grid>
            <Grid item xs={12}>
              <InlineWidget
                key={resetKey}
                url={Constants.CalendlyUrl + `${minutes}min`}
                pageSettings={{
                  backgroundColor: appStore.darkMode ? '303030' : 'fcfcfc',
                  hideEventTypeDetails: false,
                  hideLandingPageDetails: false,
                  primaryColor: '00a2ff',
                  textColor: appStore.darkMode ? 'ffffff' : '000000',
                }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Paper>
  )
}

export default Calendly
