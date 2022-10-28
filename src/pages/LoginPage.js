import React, { useState, useEffect } from 'react'
import { Observer } from 'mobx-react-lite'
import { Redirect } from 'react-router-dom'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import CircularProgress from '@material-ui/core/CircularProgress'
import Container from '@material-ui/core/Container'

import Configs from './../scripts/configs'
import { auth } from './../scripts/fire'
import { Constants } from './../scripts/constants'
import { asyncForEach } from './../scripts/localActions'

import userStore from './../store/UserStore'
import appStore from './../store/AppStore'

const Login = () => {
  const [showLoader, setShowLoader] = useState(false)
  const [hasUser, setHasUser] = useState(false)
  const [userExists, setUserExists] = useState(false)
  const [intervalId, setIntervalId] = useState(null)
  const [removeInterval, setRemoveInterval] = useState(false)

  useEffect(() => {
    const dbDump = {}
    const dbRequest = window.indexedDB.open('firebaseLocalStorageDb')
    dbRequest.onsuccess = () => {
      const db = dbRequest.result
      const stores = ['firebaseLocalStorage']

      const tx = db.transaction(stores)
      asyncForEach(
        stores,
        (store, next) => {
          const req = tx.objectStore(store).getAll()
          req.onsuccess = () => {
            dbDump[store] = req.result
            next()
          }
        },
        () => {
          if (dbDump.firebaseLocalStorage) {
            dbDump.firebaseLocalStorage.forEach((obj) => {
              if (obj.fbase_key && obj.fbase_key.startsWith('firebase:authUser')) {
                setUserExists(true)
              }
            })
          }
        }
      )
    }
  }, [])

  useEffect(() => {
    if (userExists) {
      setShowLoader(true)
      setIntervalId(
        setInterval(() => {
          if (userStore.isLoggedIn) {
            setHasUser(true)
            setRemoveInterval(true)
          }
        }, 500)
      )
    }
  }, [userExists])

  useEffect(() => {
    if (removeInterval && userStore.isLoggedIn) {
      clearInterval(intervalId)
    }
  }, [removeInterval, intervalId])

  if (hasUser) {
    return <Redirect to={Constants.jobsConfigs.allPaths.Others.routes.Home.route} />
  }

  if (showLoader) {
    return (
      <div
        className='center-flex-column'
        style={{
          height: '20vh',
        }}>
        <CircularProgress size={60} color={appStore.darkMode ? 'secondary' : 'primary'} />
      </div>
    )
  }

  return (
    <Observer>
      {() => (
        <>
          {!userStore.isLoggedIn ? (
            <Container fixed style={{ textAlign: 'center', marginTop: '15vh' }}>
              <h2>Please login using your preffered method</h2>
              <br />
              <StyledFirebaseAuth uiConfig={Configs.uiConfig} firebaseAuth={auth} />
            </Container>
          ) : (
            <Redirect to={Constants.jobsConfigs.allPaths.Others.routes.Home.route} />
          )}
        </>
      )}
    </Observer>
  )
}

export default Login
