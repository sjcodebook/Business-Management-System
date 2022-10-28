import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'

import appStore from './../../store/AppStore'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: 100,
  },
  text: {
    padding: theme.spacing(2, 2, 0),
  },
  appBar: {
    position: 'fixed',
    height: '30px',
    bottom: 0,
    left: 0,
    right: 0,
    marginBottom: 0,
    zIndex: 100,
    justifyContent: 'center',
  },
}))

export default function Footer() {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <AppBar
        position='static'
        style={{ backgroundColor: appStore.darkMode ? '#303030' : '#f8f8f8' }}
        className={classes.appBar}>
        <Toolbar style={{ color: appStore.darkMode ? '#fff' : '#808080' }}>
          Copyright &copy; {new Date().getFullYear()}&nbsp; &lt; &gt; &nbsp; Business Manager Made
          with ❤️ by
          <a href='https://github.com/sjcodebook' style={{ color: 'orange', marginLeft: '5px' }}>
            Sahil Jain (@sjcodebook)
          </a>
        </Toolbar>
      </AppBar>
    </div>
  )
}
