import React from 'react'
import { Link } from 'react-router-dom'

import Container from '@material-ui/core/Container'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import { Constants } from './../scripts/constants'

const NotFoundPage = () => {
  return (
    <Container fixed style={{ marginTop: '20px' }}>
      <Typography variant='h4' align='center' gutterBottom>
        Page Not Found...
      </Typography>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link
          to={Constants.jobsConfigs.allPaths.Others.routes.Home.route}
          style={{ textDecoration: 'none' }}>
          <Button variant='contained' color='primary'>
            Go To Home Page
          </Button>
        </Link>
      </div>
    </Container>
  )
}

export default NotFoundPage
