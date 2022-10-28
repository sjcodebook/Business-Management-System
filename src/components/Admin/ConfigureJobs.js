/* eslint-disable no-restricted-globals */
import React, { useState, useEffect, useMemo } from 'react'
import Masonry from 'react-responsive-masonry'
import { Scrollbars } from 'react-custom-scrollbars'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Modal from '@material-ui/core/Modal'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CircularProgress from '@material-ui/core/CircularProgress'
import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'
import DeleteIcon from '@material-ui/icons/Delete'

import { Constants } from '../../scripts/constants'
import { toCamelCase, showToast } from '../../scripts/localActions'
import {
  createNewJob,
  getJobById,
  getAllJobs,
  addNewEventLog,
  removeJob,
  updateJobConfig,
  getUsersByJobId,
} from '../../scripts/remoteActions'

import userStore from '../../store/UserStore'
import appStore from '../../store/AppStore'

const useStyles = makeStyles((theme) => ({
  paper: {
    color: theme.palette.text.secondary,
  },
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

const ConfigureJobs = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const classes = useStyles()
  const [jobs, setJobs] = useState([])
  const [activeJob, setActiveJob] = useState({})
  const [jobLabel, setJobLabel] = useState('')
  const [addJob, setAddJob] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setAllJobs()
  }, [refresh])

  const setAllJobs = async () => {
    try {
      setIsLoading(true)
      let allJobs = await getAllJobs()
      if (!allJobs.empty) {
        setJobs(
          allJobs.docs.map((doc) => {
            return { ...doc.data(), id: doc.id }
          })
        )
      }
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong while fetching job', 'error')
    }
  }

  const handleJobAdd = async () => {
    if (jobLabel.trim()) {
      try {
        setIsLoading(true)
        let job = await getJobById(toCamelCase(jobLabel.toLowerCase()))
        if (job.exists) {
          setIsLoading(false)
          return showToast('Job already exists', 'error')
        }
        let res = await createNewJob(jobLabel.trim())
        // Creating Event Log-------------------------------------------------------------------
        let targetType = Constants.Events.NEW_JOB_ADDED.Type
        let eventDesc = Constants.Events.NEW_JOB_ADDED.Desc
        let byId = userStore.currentUser.id
        let moreInfo = {
          prevObj: {},
          newObj: res,
        }
        await addNewEventLog(byId, 'notAvailable', res.id, targetType, eventDesc, moreInfo)
        //--------------------------------------------------------------------------------------
        setIsLoading(false)
        setAddJob(false)
        setJobLabel('')
        setRefresh((prevVal) => !prevVal)
        return showToast('Job created successfully')
      } catch (err) {
        setIsLoading(false)
        console.error(err)
        showToast('Something went wrong while adding job', 'error')
      }
    }
  }

  return (
    <Paper className={classes.paper}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant='h6' align='left'>
            ⚙️ Configure Jobs
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} style={{ textAlign: 'right' }}>
              <>
                {isLoading && (
                  <CircularProgress
                    style={{ float: 'left', marginRight: 15 }}
                    size={25}
                    color='secondary'
                  />
                )}
                {addJob ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      alignItems: 'baseline',
                    }}>
                    <TextField
                      label='Job Label'
                      type='text'
                      variant='outlined'
                      value={jobLabel}
                      style={{ width: 150, marginRight: 15 }}
                      onChange={(e) => {
                        setJobLabel(e.target.value)
                      }}
                    />
                    <br />
                    <Button
                      variant='contained'
                      color='secondary'
                      size='small'
                      disabled={isLoading}
                      style={{ marginRight: 5 }}
                      onClick={() => handleJobAdd()}>
                      Add
                    </Button>
                    <Button
                      size='small'
                      disabled={isLoading}
                      style={{ marginTop: 10 }}
                      onClick={() => setAddJob(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant='contained'
                    size='small'
                    color='secondary'
                    onClick={() => setAddJob(true)}>
                    <AddCircleOutlinedIcon style={{ marginRight: 10 }} />
                    Add New Job
                  </Button>
                )}
              </>
            </Grid>
            <Grid item xs={12} style={{ textAlign: 'right' }}>
              <Paper
                style={{
                  display: 'block',
                  backgroundColor: appStore.darkMode ? '#303030' : '#fcfcfc',
                  width: '100%',
                  padding: 15,
                }}>
                <Masonry columnsCount={isMobile ? 2 : 4} gutter='10px'>
                  {jobs.map((job) => (
                    <Card
                      key={job.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setActiveJob(job)
                        setShowModal(true)
                      }}>
                      <CardContent>
                        <div className='center-flex-row'>
                          <h3>{job?.label}</h3>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </Masonry>
              </Paper>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      {showModal && (
        <ConfigureJobsModal
          activeJob={activeJob}
          setRefresh={setRefresh}
          onClose={() => setShowModal(false)}
        />
      )}
    </Paper>
  )
}

const ConfigureJobsModal = ({ activeJob, onClose, setRefresh }) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [modalStyle] = useState(getModalStyle())
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPaths, setSelectedPaths] = useState([])
  const [selectedDefaultPath, setSelectedDefaultPath] = useState('')
  const [selectedCards, setSelectedCards] = useState([])
  const [selectedActions, setSelectedActions] = useState([])

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
    setSelectedDefaultPath(activeJob.defaultPath)
    setSelectedPaths(
      activeJob.paths.map((path) => Object.values(allPaths).find((p) => p.id === path) || {})
    )
    setSelectedCards(
      activeJob.cards.map(
        (card) => Object.values(Constants.jobsConfigs.allCards).find((c) => c.id === card) || {}
      )
    )
    setSelectedActions(
      activeJob.actions.map(
        (action) =>
          Object.values(Constants.jobsConfigs.allActions).find((a) => a.id === action) || {}
      )
    )
  }, [activeJob, allPaths])

  const handleJobRemove = async () => {
    try {
      setIsLoading(true)
      let usersWithJobId = await getUsersByJobId(activeJob.id)
      if (usersWithJobId.length !== 0) {
        alert(
          `There are currently ${usersWithJobId.length} user(s) as ${activeJob.label}. Please reassign them to other roles first. `
        )
        setIsLoading(false)
        return
      } else if (!confirm('Are you sure to delete this job?')) {
        setIsLoading(false)
        return
      }
      showToast('Deleting...', 'info')
      await removeJob(activeJob.id)

      // Creating Event Log-------------------------------------------------------------------
      let targetType = Constants.Events.JOB_DELETED.Type
      let eventDesc = Constants.Events.JOB_DELETED.Desc
      let byId = userStore.currentUser.id
      let moreInfo = {
        prevObj: activeJob,
        newObj: {},
      }
      await addNewEventLog(byId, 'notAvailable', activeJob.id, targetType, eventDesc, moreInfo)
      //--------------------------------------------------------------------------------------

      setIsLoading(false)
      showToast('Successfully Deleted')
      setRefresh((prevVal) => !prevVal)
      onClose()
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong deleting job', 'error')
    }
  }

  const handleJobUpdate = async () => {
    try {
      showToast('Updating...', 'info')
      setIsLoading(true)
      await updateJobConfig(
        activeJob.id,
        selectedPaths.map((path) => path.id),
        selectedCards.map((card) => card.id),
        selectedActions.map((action) => action.id),
        selectedDefaultPath
      )

      // Creating Event Log-------------------------------------------------------------------
      let targetType = Constants.Events.JOB_UPDATED.Type
      let eventDesc = Constants.Events.JOB_UPDATED.Desc
      let byId = userStore.currentUser.id
      let moreInfo = {
        prevObj: activeJob,
        newObj: {
          ...activeJob,
          paths: selectedPaths.map((path) => path.id),
          cards: selectedCards.map((card) => card.id),
          actions: selectedActions.map((action) => action.id),
          defaultPath: selectedDefaultPath,
        },
      }
      await addNewEventLog(byId, 'notAvailable', activeJob.id, targetType, eventDesc, moreInfo)
      //--------------------------------------------------------------------------------------

      setIsLoading(false)
      showToast('Successfully Updated')
      setRefresh((prevVal) => !prevVal)
      onClose()
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong updating job', 'error')
    }
  }

  return (
    <Modal open={true} onClose={onClose}>
      <div
        style={{
          ...modalStyle,
          width: isMobile ? '100%' : '80%',
          height: isMobile ? '100%' : '80%',
        }}
        className={classes.paperModal}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              variant='h4'
              gutterBottom
              className='center-flex-row'
              style={{ justifyContent: 'space-between' }}>
              {activeJob.label}
              <CancelOutlinedIcon
                style={{ float: 'right', cursor: 'pointer' }}
                fontSize='large'
                onClick={() => onClose()}
              />
            </Typography>
          </Grid>
          <Scrollbars style={{ height: isMobile ? '80vh' : '65vh' }}>
            <div style={{ margin: '0 10px 30px' }}>
              <Grid item xs={12}>
                <div className='center-flex-row' style={{ justifyContent: 'flex-end' }}>
                  <Button
                    variant='contained'
                    color='secondary'
                    size='small'
                    disabled={isLoading}
                    onClick={() => handleJobRemove()}>
                    <DeleteIcon />
                  </Button>
                </div>
              </Grid>
              <Grid item xs={12}>
                <h3>All Paths:</h3>
                <Card style={{ backgroundColor: appStore.darkMode ? '#303030' : '#f7f7f7' }}>
                  <CardContent>
                    {Object.values(Constants.jobsConfigs.allPaths)
                      .filter((path) => path.selectable)
                      .map((path) => (
                        <>
                          <h4>{path.label}</h4>
                          <Masonry columnsCount={isMobile ? 2 : 4} gutter='15px'>
                            {Object.values(path.routes)
                              .filter((route) => route.selectable)
                              .map((route) => (
                                <Card
                                  style={
                                    selectedPaths.find((j) => j.id === route.id)
                                      ? {
                                          cursor: 'pointer',
                                          backgroundColor: '#6cd331',
                                          color: '#353535',
                                        }
                                      : { cursor: 'pointer' }
                                  }
                                  onClick={() => {
                                    if (selectedPaths.find((j) => j.id === route.id)) {
                                      setSelectedPaths((prevVal) =>
                                        prevVal.filter((j) => j.id !== route.id)
                                      )
                                    } else {
                                      setSelectedPaths((prevVal) => [...prevVal, route])
                                    }
                                  }}>
                                  <CardContent>
                                    <div
                                      className='center-flex-row'
                                      style={{ alignItems: 'center' }}>
                                      <span style={{ fontSize: 18 }}>{route?.label}</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </Masonry>
                        </>
                      ))}
                  </CardContent>
                </Card>
              </Grid>
              <br />
              <Grid item xs={12}>
                <h3>Access Cards:</h3>
                <Card style={{ backgroundColor: appStore.darkMode ? '#303030' : '#f7f7f7' }}>
                  <CardContent>
                    <Masonry columnsCount={isMobile ? 2 : 4} gutter='15px'>
                      {Object.values(Constants.jobsConfigs.allCards)
                        .filter((card) => card.selectable)
                        .map((card) => (
                          <Card
                            style={
                              selectedCards.find((c) => c.id === card.id)
                                ? {
                                    cursor: 'pointer',
                                    backgroundColor: '#6cd331',
                                    color: '#353535',
                                  }
                                : { cursor: 'pointer' }
                            }
                            onClick={() => {
                              if (selectedCards.find((c) => c.id === card.id)) {
                                setSelectedCards((prevVal) =>
                                  prevVal.filter((c) => c.id !== card.id)
                                )
                              } else {
                                setSelectedCards((prevVal) => [...prevVal, card])
                              }
                            }}>
                            <CardContent>
                              <div className='center-flex-row' style={{ alignItems: 'center' }}>
                                <span style={{ fontSize: 18 }}>{card?.label}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </Masonry>
                  </CardContent>
                </Card>
              </Grid>
              <br />
              <Grid item xs={12}>
                <h3>All Actions:</h3>
                <Card style={{ backgroundColor: appStore.darkMode ? '#303030' : '#f7f7f7' }}>
                  <CardContent>
                    <Masonry columnsCount={isMobile ? 2 : 4} gutter='15px'>
                      {Object.values(Constants.jobsConfigs.allActions)
                        .filter((action) => action.selectable)
                        .map((action) => (
                          <Card
                            style={
                              selectedActions.find((a) => a.id === action.id)
                                ? {
                                    cursor: 'pointer',
                                    backgroundColor: '#6cd331',
                                    color: '#353535',
                                  }
                                : { cursor: 'pointer' }
                            }
                            onClick={() => {
                              if (selectedActions.find((a) => a.id === action.id)) {
                                setSelectedActions((prevVal) =>
                                  prevVal.filter((a) => a.id !== action.id)
                                )
                              } else {
                                setSelectedActions((prevVal) => [...prevVal, action])
                              }
                            }}>
                            <CardContent>
                              <div className='center-flex-row' style={{ alignItems: 'center' }}>
                                <span style={{ fontSize: 18 }}>{action?.label}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </Masonry>
                  </CardContent>
                </Card>
              </Grid>
              <br />
              <Grid item xs={12}>
                <h3>Default Path:</h3>
                <Card style={{ backgroundColor: appStore.darkMode ? '#303030' : '#f7f7f7' }}>
                  <CardContent>
                    <Masonry columnsCount={isMobile ? 2 : 4} gutter='15px'>
                      {Constants.jobsConfigs.defaultPaths.map((path) => {
                        let pathConfigs = Object.values(allPaths).find((p) => p.id === path)
                        return (
                          <Card
                            style={
                              pathConfigs.id === selectedDefaultPath
                                ? {
                                    cursor: 'pointer',
                                    backgroundColor: '#6cd331',
                                    color: '#353535',
                                  }
                                : { cursor: 'pointer' }
                            }
                            onClick={() => setSelectedDefaultPath(path)}>
                            <CardContent>
                              <div className='center-flex-row' style={{ alignItems: 'center' }}>
                                <span style={{ fontSize: 18 }}>
                                  {pathConfigs?.label} ({pathConfigs?.route})
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </Masonry>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    disabled={isLoading}
                    onClick={() => handleJobUpdate()}>
                    Update Job Config
                  </Button>
                </div>
              </Grid>
            </div>
          </Scrollbars>
        </Grid>
      </div>
    </Modal>
  )
}

export default ConfigureJobs
