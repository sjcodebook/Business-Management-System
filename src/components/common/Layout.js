import React, { useEffect } from 'react'
import { Observer } from 'mobx-react-lite'
import ScrollToTop from 'react-scroll-up'
import { ToastContainer } from 'react-toastify'
import CssBaseline from '@material-ui/core/CssBaseline'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import { ThemeProvider } from '@material-ui/core/styles'

import appStore from './../../store/AppStore'

import Header from './Header'
import Footer from './Footer'

const Layout = (props) => {
  useEffect(() => {
    let darkMode = localStorage.getItem('darkMode')
    if (darkMode) {
      if (darkMode === 'ON') {
        appStore.setDarkMode(true)
      } else {
        appStore.setDarkMode(false)
      }
    }
  }, [])

  return (
    <Observer>
      {() => (
        <ThemeProvider theme={appStore.getDarkTheme}>
          <CssBaseline />
          <Header />
          <br />
          <br />
          <br />
          <br />
          {props.children}
          <ToastContainer />
          <Footer />
          <ScrollToTop
            showUnder={300}
            duration={700}
            easing='easeInOutCubic'
            style={{ bottom: 30, right: 20 }}>
            <ArrowUpwardIcon color='primary' fontSize='large' />
          </ScrollToTop>
        </ThemeProvider>
      )}
    </Observer>
  )
}

export default Layout
