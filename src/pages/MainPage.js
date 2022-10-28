import React, { useMemo } from 'react'
import { Observer } from 'mobx-react-lite'
import { Redirect } from 'react-router-dom'
import Container from '@material-ui/core/Container'
import BlockIcon from '@material-ui/icons/Block'

import AuthChecker from './../components/common/AuthChecker'
import Dashboard from './../components/Dashboard'

import userStore from './../store/UserStore'

import { Constants } from './../scripts/constants'

const MainPage = () => {
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

  return (
    <Observer>
      {() => (
        <AuthChecker
          children={
            <>
              {userStore.currentUser.isAdmin ? (
                <Redirect to={allPaths.Admin.route} />
              ) : (
                <>
                  {userStore.currentUser.jobConfig &&
                  userStore.currentUser.jobConfig.defaultPath !== 'Home' ? (
                    <Redirect to={allPaths[userStore.currentUser.jobConfig.defaultPath].route} />
                  ) : (
                    <HomeContent />
                  )}
                </>
              )}
            </>
          }
        />
      )}
    </Observer>
  )
}

const HomeContent = () => {
  if (!userStore.currentUser.jobApproved) {
    return (
      <Container fixed style={{ textAlign: 'center', marginTop: '15vh' }}>
        <BlockIcon color='error' style={{ width: '100px', height: '100px' }} />
        <h2>This route is inactive for your account.</h2>
        <h2>Please contact Admin to activate this route for you.</h2>
      </Container>
    )
  }

  return <Observer>{() => <Dashboard />}</Observer>
}

export default MainPage
