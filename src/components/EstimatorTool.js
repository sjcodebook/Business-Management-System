import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Observer } from 'mobx-react-lite'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Avatar from '@material-ui/core/Avatar'

import InteriorTab from './InteriorTab/InteriorTab'
import ExteriorTab from './ExteriorTab/ExteriorTab'

import appStore from './../store/AppStore'

import House from './../assets/house.png'
import Sofa from './../assets/sofa.png'

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && (
        <Box p={3}>
          <Typography component={'span'}>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    marginTop: '20px',
  },
}))

const EstimatorTool = () => {
  const classes = useStyles()
  const [value, setValue] = useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Observer>
      {() => (
        <div className={classes.root}>
          <AppBar
            position='static'
            style={{ backgroundColor: `${appStore.darkMode ? '#303030' : '#3776f1'}` }}>
            <Tabs value={value} onChange={handleChange} variant='fullWidth'>
              <Tab label={<Avatar variant='square' src={Sofa} />} {...a11yProps(0)} />
              <Tab label={<Avatar variant='square' src={House} />} {...a11yProps(1)} />
            </Tabs>
          </AppBar>
          <Container style={{ padding: 20 }} fixed>
            <div style={{ display: `${value === 0 ? 'block' : 'none'}` }}>
              <InteriorTab />
            </div>
            <div style={{ display: `${value === 1 ? 'block' : 'none'}` }}>
              <ExteriorTab />
            </div>
          </Container>
        </div>
      )}
    </Observer>
  )
}

export default EstimatorTool
