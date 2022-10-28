import React, { useState, useEffect, useMemo } from 'react'
import { Observer } from 'mobx-react-lite'
import { Link, withRouter } from 'react-router-dom'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import BlockIcon from '@material-ui/icons/Block'

import QuestionScreen from './QuestionScreen'

import userStore from './../../store/UserStore'
import appStore from './../../store/AppStore'

import { Constants } from './../../scripts/constants'
import { asyncForEach } from './../../scripts/localActions'

const AuthChecker = (props) => {
  const excludedPaths = [
    Constants.jobsConfigs.allPaths.Others.routes.Home.route,
    Constants.jobsConfigs.allPaths.Others.routes.Profile.route,
    Constants.jobsConfigs.allPaths.Others.routes.ContactInfo.route,
  ]
  const [showLoader, setShowLoader] = useState(false)
  const [userExists, setUserExists] = useState(false)
  const [intervalId, setIntervalId] = useState(null)
  const [removeInterval, setRemoveInterval] = useState(false)

  const allPaths = useMemo(() => {
    let pathsObj = {}
    Object.values(Constants.jobsConfigs.allPaths).forEach((path) => {
      pathsObj = {
        ...pathsObj,
        ...path.routes,
      }
    })
    return pathsObj
  }, [])

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
            setShowLoader(false)
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

  const canAccessPath = () => {
    let result = false
    let route = Object.keys(allPaths).find((key) => allPaths[key].route === props.location.pathname)
    if (
      userStore.currentUser.isAdmin ||
      excludedPaths.includes(props.location.pathname) ||
      (userStore.currentUser.jobApproved && userStore.currentUser.jobConfig.paths.includes(route))
    ) {
      result = true
    }
    return result
  }

  if (showLoader) {
    return (
      <Observer>
        {() => (
          <div
            className='center-flex-column'
            style={{
              height: '20vh',
            }}>
            <CircularProgress size={60} color={appStore.darkMode ? 'secondary' : 'primary'} />
          </div>
        )}
      </Observer>
    )
  }

  return (
    <Observer>
      {() => (
        <>
          {userStore.isLoggedIn ? (
            <>
              {userStore.currentUser.isFirstLogin && !userStore.currentUser.isAdmin ? (
                <QuestionScreen userStore={userStore} firstLogin={true} />
              ) : (
                <>
                  {canAccessPath() ? (
                    <>{props.children}</>
                  ) : (
                    <Container fixed style={{ textAlign: 'center', marginTop: '15vh' }}>
                      <BlockIcon color='error' style={{ width: '100px', height: '100px' }} />
                      <h2>This route is inactive for your account.</h2>
                      <h2>Please contact Admin to activate this route for you.</h2>
                    </Container>
                  )}
                </>
              )}
            </>
          ) : (
            <Container fixed style={{ textAlign: 'center', marginTop: '15vh' }}>
              <h2>You need to login to use this application</h2>
              <Link
                to={Constants.jobsConfigs.allPaths.Others.routes.Login.route}
                style={{
                  textDecoration: 'none',
                  padding: 10,
                }}>
                <Button variant='contained' color='primary' style={{ marginLeft: '10px' }}>
                  Login
                </Button>
              </Link>
            </Container>
          )}
        </>
      )}
    </Observer>
  )
}

export default withRouter(AuthChecker)
