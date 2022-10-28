/* eslint-disable eqeqeq */
import React, { useState, useEffect } from 'react'
import Masonry from 'react-responsive-masonry'
import { Scrollbars } from 'react-custom-scrollbars'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import Modal from '@material-ui/core/Modal'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import CircularProgress from '@material-ui/core/CircularProgress'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Checkbox from '@material-ui/core/Checkbox'
import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined'
import BookmarkIcon from '@material-ui/icons/Bookmark'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import AddBoxIcon from '@material-ui/icons/AddBox'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'

import userStore from '../../store/UserStore'
import appStore from '../../store/AppStore'

import { Constants } from '../../scripts/constants'
import { showToast } from '../../scripts/localActions'
import {
  createNewTeam,
  getAllTeams,
  getUsers,
  addNewEventLog,
  removeTeam,
  updateTeamConfig,
} from '../../scripts/remoteActions'

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

const AllTeamsPanel = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const classes = useStyles()
  const [teams, setTeams] = useState([])
  const [activeTeam, setActiveTeam] = useState({})
  const [teamLabel, setTeamLabel] = useState('')
  const [teamColor, setTeamColor] = useState('#000')
  const [addTeam, setAddTeam] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setAllTeams()
  }, [refresh])

  const setAllTeams = async () => {
    try {
      setIsLoading(true)
      let allTeams = await getAllTeams()
      if (!allTeams.empty) {
        setTeams(
          allTeams.docs.map((doc) => {
            return { ...doc.data(), id: doc.id }
          })
        )
      }
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong while fetching teams', 'error')
    }
  }

  const handleTeamAdd = async () => {
    if (teamLabel.trim()) {
      try {
        setIsLoading(true)
        let res = await createNewTeam(teamLabel.trim(), teamColor)
        // Creating Event Log-------------------------------------------------------------------
        let targetType = Constants.Events.NEW_TEAM_ADDED.Type
        let eventDesc = Constants.Events.NEW_TEAM_ADDED.Desc
        let byId = userStore.currentUser.id
        let moreInfo = {
          prevObj: {},
          newObj: res,
        }
        await addNewEventLog(byId, 'notAvailable', res.id, targetType, eventDesc, moreInfo)
        //--------------------------------------------------------------------------------------
        setIsLoading(false)
        setAddTeam(false)
        setTeamLabel('')
        setRefresh((prevVal) => !prevVal)
        return showToast('Team created successfully')
      } catch (err) {
        setIsLoading(false)
        console.error(err)
        showToast('Something went wrong while adding team', 'error')
      }
    }
  }

  return (
    <Paper className={classes.paper}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant='h6' align='left'>
            ⚙️ Configure Teams
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
                {addTeam ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      alignItems: 'baseline',
                    }}>
                    <TextField
                      label='Team Label'
                      type='text'
                      variant='outlined'
                      value={teamLabel}
                      style={{ maxWidth: 150, marginRight: 15 }}
                      onChange={(e) => {
                        setTeamLabel(e.target.value)
                      }}
                    />
                    <br />
                    <div style={{ marginRight: 15 }}>
                      <input
                        type='color'
                        id='teamColor'
                        name='teamColor'
                        value={teamColor}
                        onChange={(e) => setTeamColor(e.target.value)}
                      />
                      <label for='teamColor' style={{ marginLeft: 5 }}>
                        Team Color
                      </label>
                    </div>
                    <br />
                    <Button
                      variant='contained'
                      color='secondary'
                      size='small'
                      disabled={isLoading}
                      style={{ marginRight: 5 }}
                      onClick={() => handleTeamAdd()}>
                      Add
                    </Button>
                    <Button
                      size='small'
                      disabled={isLoading}
                      style={{ marginTop: 10 }}
                      onClick={() => setAddTeam(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant='contained'
                    size='small'
                    color='secondary'
                    onClick={() => setAddTeam(true)}>
                    <AddCircleOutlinedIcon style={{ marginRight: 10 }} />
                    Add New Team
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
                  {teams.map((team) => (
                    <Card
                      key={team.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setActiveTeam(team)
                        setShowModal(true)
                      }}>
                      <CardContent>
                        <div className='center-flex-row'>
                          <h3>{team?.label}</h3>
                          <BookmarkIcon style={{ color: team?.color }} />
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
        <ConfigureTeamsModal
          activeTeam={activeTeam}
          setRefresh={setRefresh}
          onClose={() => setShowModal(false)}
        />
      )}
    </Paper>
  )
}

const ConfigureTeamsModal = ({ activeTeam, onClose, setRefresh }) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [modalStyle] = useState(getModalStyle())
  const [isLoading, setIsLoading] = useState(false)
  const [addMembers, setAddMembers] = useState(false)
  const [users, setUsers] = useState([])
  const [teamLabel, setTeamLabel] = useState(activeTeam.label)
  const [teamColor, setTeamColor] = useState(activeTeam.color)
  const [teamMembers, setTeamMembers] = useState([...activeTeam.members])

  useEffect(() => {
    getUsers().then((snapshot) => {
      if (!snapshot.empty) {
        setUsers(snapshot.docs.map((doc) => doc.data()).filter((user) => user.isActive))
      }
    })
  }, [])

  const handleTeamRemove = async () => {
    try {
      setIsLoading(true)
      // eslint-disable-next-line no-restricted-globals
      if (!confirm('Are you sure to delete this team?')) {
        setIsLoading(false)
        return
      }
      showToast('Deleting...', 'info')
      await removeTeam(activeTeam.id)

      // Creating Event Log-------------------------------------------------------------------
      let targetType = Constants.Events.TEAM_DELETED.Type
      let eventDesc = Constants.Events.TEAM_DELETED.Desc
      let byId = userStore.currentUser.id
      let moreInfo = {
        prevObj: activeTeam,
        newObj: {},
      }
      await addNewEventLog(byId, 'notAvailable', activeTeam.id, targetType, eventDesc, moreInfo)
      //--------------------------------------------------------------------------------------

      setIsLoading(false)
      showToast('Successfully Deleted')
      setRefresh((prevVal) => !prevVal)
      onClose()
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong deleting team', 'error')
    }
  }

  const handleTeamUpdate = async () => {
    try {
      showToast('Updating...', 'info')
      setIsLoading(true)
      await updateTeamConfig(activeTeam.id, teamLabel.trim(), teamColor, teamMembers)

      // Creating Event Log-------------------------------------------------------------------
      let targetType = Constants.Events.TEAM_UPDATED.Type
      let eventDesc = Constants.Events.TEAM_UPDATED.Desc
      let byId = userStore.currentUser.id
      let moreInfo = {
        prevObj: activeTeam,
        newObj: {
          ...activeTeam,
          label: teamLabel.trim(),
          color: teamColor,
          members: teamMembers,
        },
      }
      await addNewEventLog(byId, 'notAvailable', activeTeam.id, targetType, eventDesc, moreInfo)
      //--------------------------------------------------------------------------------------

      setIsLoading(false)
      showToast('Successfully Updated')
      setRefresh((prevVal) => !prevVal)
      onClose()
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      showToast('Something went wrong updating team', 'error')
    }
  }

  return (
    <Modal open={true} onClose={onClose}>
      <div
        style={{
          ...modalStyle,
          width: isMobile ? '100%' : '60%',
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
              {teamLabel}
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
                    onClick={() => handleTeamRemove()}>
                    <DeleteIcon />
                  </Button>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div
                  className='center-flex-row'
                  style={{
                    marginTop: 20,
                  }}>
                  <TextField
                    label='Team Label'
                    type='text'
                    variant='outlined'
                    value={teamLabel}
                    style={{ maxWidth: 150, marginRight: 15 }}
                    onChange={(e) => setTeamLabel(e.target.value)}
                  />
                  <br />
                  <div style={{ marginRight: 15 }}>
                    <input
                      type='color'
                      id='teamColor'
                      name='teamColor'
                      value={teamColor}
                      onChange={(e) => setTeamColor(e.target.value)}
                    />
                    <label for='teamColor' style={{ marginLeft: 5 }}>
                      Team Color
                    </label>
                  </div>
                </div>
              </Grid>
              <br />
              <Grid item xs={12}>
                {addMembers ? (
                  <>
                    <Typography
                      variant='h6'
                      gutterBottom
                      className='center-flex-row'
                      style={{ justifyContent: 'flex-start' }}>
                      <ArrowBackIosIcon
                        style={{ cursor: 'pointer', marginRight: 10 }}
                        color='secondary'
                        onClick={() => setAddMembers(false)}
                      />
                      Add Members:
                    </Typography>
                    <div style={{ paddingRight: 30, paddingLeft: 30 }}>
                      <List dense alignItems='flex-start'>
                        {users.map((user) => (
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar alt={user.name} src={user.picUrl} />
                            </ListItemAvatar>
                            <ListItemText primary={user.nickname || user.name} secondary={null} />
                            <ListItemSecondaryAction>
                              <IconButton edge='start'>
                                <Checkbox
                                  checked={teamMembers.find((memId) => user.uid === memId)}
                                  onChange={(e) =>
                                    setTeamMembers((prevVal) => {
                                      if (e.target.checked) {
                                        return [...prevVal, user.uid]
                                      } else {
                                        return prevVal.filter((val) => val !== user.uid)
                                      }
                                    })
                                  }
                                  color='primary'
                                />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </div>
                  </>
                ) : (
                  <>
                    <Typography
                      variant='h6'
                      gutterBottom
                      className='center-flex-row'
                      style={{ justifyContent: 'flex-start' }}>
                      All Members:
                      <AddBoxIcon
                        style={{ float: 'right', cursor: 'pointer', marginLeft: 10 }}
                        color='secondary'
                        onClick={() => setAddMembers(true)}
                      />
                    </Typography>
                    {teamMembers.length === 0 ? (
                      <Typography
                        variant='subtitle2'
                        gutterBottom
                        className='center-flex-row'
                        style={{ justifyContent: 'flex-start' }}>
                        No Members Added Yet.
                      </Typography>
                    ) : (
                      <div style={{ paddingRight: 30, paddingLeft: 30 }}>
                        <List dense alignItems='flex-start'>
                          {teamMembers.map((memId) => {
                            let user = users.find((u) => u.uid === memId)
                            return (
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar alt={user?.name} src={user?.picUrl} />
                                </ListItemAvatar>
                                <ListItemText
                                  primary={user?.nickname || user?.name}
                                  secondary={null}
                                />
                                <ListItemSecondaryAction>
                                  <IconButton edge='start'>
                                    <CloseIcon
                                      onClick={() =>
                                        setTeamMembers((prevVal) =>
                                          prevVal.filter((val) => val !== user.uid)
                                        )
                                      }
                                    />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            )
                          })}
                        </List>
                      </div>
                    )}
                  </>
                )}
              </Grid>
              <Grid item xs={12}>
                {!addMembers && (
                  <div style={{ textAlign: 'center', marginTop: 50 }}>
                    <Button
                      variant='contained'
                      color='primary'
                      size='small'
                      disabled={isLoading}
                      onClick={() => handleTeamUpdate()}>
                      Update Team Config
                    </Button>
                  </div>
                )}
              </Grid>
            </div>
          </Scrollbars>
        </Grid>
      </div>
    </Modal>
  )
}

export default AllTeamsPanel
