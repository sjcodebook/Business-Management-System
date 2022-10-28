/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import * as dayjs from 'dayjs'
import randomstring from 'randomstring'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import { makeStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import Fade from '@material-ui/core/Fade'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import PublishIcon from '@material-ui/icons/Publish'
import LinearProgress from '@material-ui/core/LinearProgress'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'

import { storage } from '../scripts/fire'
import { showToast, resizeFile, renameFile } from '../scripts/localActions'
import { addExpenseRecord } from '../scripts/remoteActions'

import appStore from '../store/AppStore'
import userStore from '../store/UserStore'

const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #211b30',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    borderRadius: 5,
  },
}))

export default function ExpenseModal({ onClose }) {
  const classes = useStyles()
  const [startUpload, setStartUpload] = useState(false)
  const [showDropzone, setShowDropzone] = useState(false)
  const [totalAmount, setTotalAmount] = useState(null)
  const [name, setName] = useState('')
  const [timeStamp, setTimeStamp] = useState(dayjs().unix())
  const [files, setFiles] = useState([])

  return (
    <div>
      <Modal
        aria-labelledby='transition-modal-title'
        aria-describedby='transition-modal-description'
        className='center-flex-column'
        open={true}
        onClose={() => onClose()}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}>
        <Fade in={true}>
          <div className={classes.paper}>
            {showDropzone ? (
              <motion.div initial={{ y: '100vh' }} animate={{ y: 0 }}>
                <Dropzone
                  startUpload={startUpload}
                  setStartUpload={setStartUpload}
                  onClose={onClose}
                  files={files}
                  setFiles={setFiles}
                  totalAmount={totalAmount}
                  name={name}
                  timeStamp={timeStamp}
                  setShowDropzone={setShowDropzone}
                />
              </motion.div>
            ) : (
              <ExpenseInfo
                totalAmount={totalAmount}
                setTotalAmount={setTotalAmount}
                name={name}
                setName={setName}
                timeStamp={timeStamp}
                setTimeStamp={setTimeStamp}
                setShowDropzone={setShowDropzone}
              />
            )}
          </div>
        </Fade>
      </Modal>
    </div>
  )
}

const Dropzone = ({
  startUpload,
  setStartUpload,
  onClose,
  files,
  setFiles,
  totalAmount,
  name,
  timeStamp,
  setShowDropzone,
}) => {
  const [currFile, setCurrFile] = useState(null)
  const [currFileIndex, setCurrFileIndex] = useState(0)
  const [opStatus, setOpStatus] = useState(null)
  const [err, setErr] = useState(null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [imagesUrl, setImagesUrl] = useState([])
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    maxFiles: 4,
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      )
    },
    onDropRejected: (fileRejections) => {
      return showToast('Max 4 images allowed.', 'error')
    },
  })

  const thumbsContainer = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  }

  const thumb = {
    position: 'relative',
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: 'border-box',
  }

  const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden',
  }

  const thumbButton = {
    position: 'absolute',
    right: 10,
    bottom: 10,
    background: 'rgba(0,0,0,.8)',
    color: '#fff',
    border: 0,
    borderRadius: '.325em',
    cursor: 'pointer',
  }

  const img = {
    display: 'block',
    width: 'auto',
    height: '100%',
  }

  useEffect(
    () => () => {
      if (uploadComplete) {
        // Make sure to revoke the data uris to avoid memory leaks
        files.forEach((file) => URL.revokeObjectURL(file.preview))
      }
    },
    [files]
  )

  useEffect(() => {
    if (uploadComplete) {
      setTimeout(() => {
        onClose()
      }, 1500)
    }
  }, [uploadComplete])

  useEffect(() => {
    ;(async () => {
      if (opStatus === 'complete' && files[currFileIndex + 1]) {
        setTimeout(() => {
          setCurrFile(files[currFileIndex + 1])
          setCurrFileIndex(currFileIndex + 1)
        }, 500)
      }
      if (opStatus === 'complete' && !files[currFileIndex + 1]) {
        await addExpenseRecord(
          userStore.currentUser.id,
          totalAmount,
          imagesUrl,
          name.trim(),
          timeStamp
        ).catch((err) => {
          onClose()
          return showToast('Something went wrong while uploading images.', 'error')
        })
        setUploadComplete(true)
      }
      if (opStatus === 'failed') {
        showToast('Something went wrong while uploading.', 'error')
        console.error(err)
        onClose()
      }
    })()
  }, [opStatus])

  const thumbs = files.map((file) => (
    <motion.div initial={{ y: '-100vh' }} animate={{ y: 0 }} style={thumb} key={file.name}>
      <div style={thumbInner}>
        <motion.img layout src={file.preview} style={img} alt={''} />
      </div>
      <button
        style={thumbButton}
        onClick={() => {
          setFiles((prevVal) => {
            return prevVal.filter((f) => f.name !== file.name)
          })
        }}>
        x
      </button>
    </motion.div>
  ))

  return (
    <div>
      {startUpload ? (
        <div>
          {!uploadComplete && currFile && (
            <Progress
              currFile={currFile}
              setOpStatus={setOpStatus}
              setErr={setErr}
              setImagesUrl={setImagesUrl}
            />
          )}
          {uploadComplete && (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <motion.div
                animate={{
                  scale: [1, 2, 2, 1, 1],
                  rotate: [0, 0, 270, 270, 0],
                  borderRadius: ['20%', '20%', '50%', '50%', '20%'],
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}>
                <CheckCircleIcon style={{ color: '#60e315', fontSize: 60 }} />
              </motion.div>
              Upload Completed!
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={{ textAlign: 'left' }}>
            <Button
              onClick={() => {
                setShowDropzone(false)
              }}>
              <ArrowBackIosIcon />
            </Button>
          </div>
          <div style={{ margin: 40 }}>
            <div
              style={{
                borderStyle: 'dotted',
                textAlign: 'center',
                padding: 40,
                cursor: 'pointer',
                background: appStore.darkMode ? '#303030' : '#f7f7f7',
              }}
              {...getRootProps({ className: 'dropzone' })}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop image(s) here, or click to select image(s)</p>
              <em>(max 4 images)</em>
            </div>
            <aside style={thumbsContainer}>{thumbs}</aside>
            {files.length !== 0 && (
              <>
                <br />
                <br />
                <div style={{ textAlign: 'center' }}>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => {
                      setCurrFile(files[0])
                      setStartUpload(true)
                    }}>
                    <PublishIcon style={{ marginRight: 10 }} />
                    Upload
                  </Button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const Progress = ({ currFile, setOpStatus, setErr, setImagesUrl }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'))
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    uploadImageAsPromise(currFile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currFile])

  const uploadImageAsPromise = async (imageFile) => {
    try {
      const resizedImage = await resizeFile(imageFile)
      const newImageFile = renameFile(resizedImage, randomstring.generate() + '.JPEG')
      return new Promise(function (resolve, reject) {
        setOpStatus('running')
        // references
        const storageRef = storage.ref('Expenses/' + newImageFile.name)
        // const collectionRef = projectFirestore.collection('images')
        storageRef.put(resizedImage).on(
          'state_changed',
          (snap) => {
            let percentage = (snap.bytesTransferred / snap.totalBytes) * 100
            setProgress(percentage)
          },
          (err) => {
            setOpStatus('failed')
            setErr(err)
            reject(err)
          },
          async () => {
            const url = await storageRef.getDownloadURL()
            setImagesUrl((prevVal) => {
              return [...prevVal, url]
            })
            setOpStatus('complete')
            resolve(imageFile)
          }
        )
      })
    } catch (err) {
      console.error(err)
      showToast('Something Went Wrong Uploading File', 'error')
    }
  }

  return (
    <div style={{ margin: 10 }}>
      <div
        style={{
          width: isMobile ? '100%' : '500px',
          height: isMobile ? '100%' : '300px',
          marginBottom: 10,
        }}>
        <motion.img
          initial={{ y: '-100vh' }}
          animate={{ y: 0 }}
          src={currFile.preview}
          alt={currFile.name}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <LinearProgress color='secondary' variant='determinate' value={progress} />
    </div>
  )
}

const ExpenseInfo = ({
  totalAmount,
  setTotalAmount,
  name,
  setName,
  timeStamp,
  setTimeStamp,
  setShowDropzone,
}) => {
  return (
    <div style={{ margin: 40 }}>
      <h4>Expense Name:</h4>
      <TextField
        value={name || ''}
        autoFocus={true}
        variant='outlined'
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <h4>Expense Amount ($):</h4>
      <TextField
        type='number'
        value={totalAmount || ''}
        variant='outlined'
        onChange={(e) => setTotalAmount(parseFloat(e.target.value))}
      />
      <br />
      <br />
      <TextField
        label='Expense Date'
        type='date'
        value={dayjs.unix(timeStamp).format('YYYY-MM-DD')}
        onChange={(e) => {
          setTimeStamp(dayjs(e.target.value, 'YYYY-MM-DD').unix())
        }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <br />
      <br />
      <br />
      <div style={{ textAlign: 'center' }}>
        <Button
          variant='contained'
          color='primary'
          onClick={() => {
            if (!name.trim()) {
              return showToast('Please Enter a name for the expense.', 'error')
            }
            if (!totalAmount || totalAmount < 1) {
              return showToast('Please Enter a valid amount.', 'error')
            }
            setShowDropzone(true)
          }}>
          Next Step
        </Button>
      </div>
    </div>
  )
}
