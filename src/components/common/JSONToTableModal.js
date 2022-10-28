import React, { useState } from 'react'
import { JsonToTable } from 'react-json-to-table'
import { Scrollbars } from 'react-custom-scrollbars'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'

const useStyles = makeStyles((theme) => ({
  paperModal: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}))

const getModalStyle = () => {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
    borderRadius: 20,
  }
}

const JSONToTableModal = ({ onClose, json, title = 'Raw Data' }) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [modalStyle] = useState(getModalStyle())

  return (
    <Modal open={true} onClose={onClose}>
      <div
        style={{
          ...modalStyle,
          width: isMobile ? '90%' : '60%',
          height: '70vh',
        }}
        className={classes.paperModal}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              variant='h4'
              gutterBottom
              className='center-flex-row'
              style={{ justifyContent: 'space-between' }}>
              {title}
              <CancelOutlinedIcon
                style={{ float: 'right', cursor: 'pointer' }}
                fontSize='large'
                onClick={() => onClose()}
              />
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Scrollbars style={{ height: '55vh' }}>
              <div
                style={{ backgroundColor: '#f8f8f8', color: '#000', padding: 10, borderRadius: 5 }}>
                <JsonToTable json={json} />
              </div>
            </Scrollbars>
          </Grid>
        </Grid>
      </div>
    </Modal>
  )
}

export default JSONToTableModal
