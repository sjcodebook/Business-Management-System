import React, { useState, useEffect } from 'react'
import { Scrollbars } from 'react-custom-scrollbars'
import { makeStyles } from '@material-ui/core/styles'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import appStore from '../../../store/AppStore'

import Estimates from './estimates'
import Invoices from './invoices'
import Business from './business'

const useStyles = makeStyles((theme) => ({
  paper: {
    color: theme.palette.text.secondary,
  },
  Innerpaper: {
    padding: theme.spacing(2),
  },
}))

const VisualizationPanel = () => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [chartWidth, setChartWidth] = useState(isMobile ? 500 : 1100)
  const [tabVal, setTabVal] = useState(0)

  useEffect(() => {
    setChartWidth(isMobile ? 500 : 1100)
  }, [isMobile])

  return (
    <Paper className={classes.paper}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='visualization-content'
          id='visualization-header'>
          <Typography variant='h6' align='left'>
            Visualization Panel
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Scrollbars style={{ height: 850 }}>
            <Paper
              style={{ backgroundColor: appStore.darkMode ? '#303030' : '#fcfcfc' }}
              className={classes.Innerpaper}>
              <Paper square>
                <Tabs
                  value={tabVal}
                  indicatorColor={appStore.darkMode ? 'secondary' : 'primary'}
                  textColor={appStore.darkMode ? 'secondary' : 'primary'}
                  variant='scrollable'
                  scrollButtons='auto'
                  onChange={(event, newValue) => {
                    setTabVal(newValue)
                  }}>
                  <Tab label='Estimates' />
                  <Tab label='Invoices' />
                  <Tab label='Business' />
                </Tabs>
              </Paper>
              <br />
              <div style={{ marginLeft: 10, marginRight: 10 }}>
                {tabVal === 0 && (
                  <Estimates chartWidth={chartWidth} setChartWidth={setChartWidth} />
                )}
                {tabVal === 1 && <Invoices chartWidth={chartWidth} setChartWidth={setChartWidth} />}
                {tabVal === 2 && <Business chartWidth={chartWidth} setChartWidth={setChartWidth} />}
              </div>
            </Paper>
          </Scrollbars>
        </AccordionDetails>
      </Accordion>
    </Paper>
  )
}

export default VisualizationPanel
