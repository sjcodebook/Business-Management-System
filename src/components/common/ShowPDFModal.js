import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import Button from '@material-ui/core/Button'

const getModalStyle = () => {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: 5,
    boxShadow: theme.shadows[5],
    padding: 20,
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}))

const ShowPDFModal = ({ pdfBuffer, onClose }) => {
  const classes = useStyles()
  const [modalStyle] = useState(getModalStyle)
  const [open] = useState(true)

  return (
    <div>
      <Modal open={open}>
        <div style={modalStyle} className={classes.paper}>
          <iframe
            src={'data:application/pdf;base64,' + pdfBuffer}
            title='PDF Modal'
            style={{ height: '90%', width: '100%' }}></iframe>
          <Button variant='contained' color='primary' style={{ marginTop: 20 }}>
            <a
              download={'document'}
              style={{ textDecoration: 'none', color: 'white' }}
              href={'data:application/pdf;base64,' + pdfBuffer}>
              Download PDF
            </a>
          </Button>
          <Button
            variant='contained'
            color='secondary'
            style={{ marginLeft: 20, marginTop: 20 }}
            onClick={() => onClose()}>
            close
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default ShowPDFModal
