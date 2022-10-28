import React, { useState } from 'react'
import { Observer } from 'mobx-react-lite'
import * as dayjs from 'dayjs'
import Button from '@material-ui/core/Button'
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import EditIcon from '@material-ui/icons/Edit'

import AuthChecker from './../components/common/AuthChecker'
import QuestionScreen from './../components/common/QuestionScreen'

import appStore from '../store/AppStore'
import userStore from '../store/UserStore'

import { logout } from './../scripts/remoteActions'

const ProfilePage = () => {
  const [showEditScreen, setShowEditScreen] = useState(false)

  if (showEditScreen) {
    return (
      <Observer>
        {() => (
          <AuthChecker
            children={<QuestionScreen userStore={userStore} setVisiblity={setShowEditScreen} />}
          />
        )}
      </Observer>
    )
  }

  return (
    <Observer>
      {() => (
        <AuthChecker
          children={
            <Grid
              container
              spacing={0}
              direction='column'
              alignItems='center'
              justify='center'
              style={{ marginTop: '40px' }}>
              <Grid item xs={12}>
                <Avatar
                  alt='User Account'
                  src={userStore.currentUser.picUrl}
                  style={{
                    width: '100px',
                    height: '100px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                />
              </Grid>
              <br />
              <Grid item xs={12}>
                <Card style={{ minWidth: 290, textAlign: 'center', padding: '20px' }}>
                  <CardContent>
                    <div style={{ textAlign: 'right' }}>
                      <EditIcon
                        style={{ cursor: 'pointer' }}
                        onClick={() => setShowEditScreen(true)}
                      />
                    </div>
                    <Typography variant='h5' component='h2'>
                      {userStore.currentUser.name}
                    </Typography>
                    <br />
                    <Typography color='textSecondary'>{userStore.currentUser.email}</Typography>
                    <Typography color='textSecondary'>{userStore.currentUser.phone}</Typography>
                    <Typography color='textSecondary'>
                      {dayjs.unix(userStore.currentUser.dob).format('DD/MM/YYYY')}
                    </Typography>
                    <br />
                    <Typography>
                      {userStore.currentUser.isAdmin ? (
                        <b>ADMIN</b>
                      ) : (
                        <>
                          <b>Job: </b>
                          {userStore.currentUser.jobConfig?.label}
                        </>
                      )}
                    </Typography>
                    <Typography>
                      <b>Address: </b>
                      {userStore.currentUser.address}
                    </Typography>
                    <Typography>
                      <b>Salary: </b>
                      {userStore.currentUser.salary
                        ? `$${userStore.currentUser.salary}/hr`
                        : 'Not Entered'}
                    </Typography>
                    <br />
                    <Card
                      style={{
                        textAlign: 'center',
                        backgroundColor: appStore.darkMode ? '#303030' : '#ebebeb',
                      }}>
                      <CardContent>
                        <h4>Emergency Contact Person Information:</h4>
                        <Typography>
                          <b>Name:</b> {userStore.currentUser.emergencyContactName}
                        </Typography>
                        <Typography>
                          <b>Phone Number:</b> {userStore.currentUser.emergencyContactNumber}
                        </Typography>
                      </CardContent>
                    </Card>
                  </CardContent>
                  <br />
                  <Button variant='contained' color='secondary' onClick={logout}>
                    Logout
                  </Button>
                </Card>
              </Grid>
            </Grid>
          }
        />
      )}
    </Observer>
  )
}

export default ProfilePage
