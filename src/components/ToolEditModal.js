import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Scrollbars } from 'react-custom-scrollbars'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Modal from '@material-ui/core/Modal'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'

import KitchenCabinets from '../components/InteriorTab/KitchenCabinets'
import RegularTemplate from '../components/InteriorTab/RegularTemplate'
import CustomInterior from '../components/InteriorTab/CustomInterior'
import IronWroughtTemplate from '../components/ExteriorTab/IronWroughtTemplate'
import SidingAndExteriorTemplate from '../components/ExteriorTab/SidingAndExteriorTemplate'
import CustomExterior from '../components/ExteriorTab/CustomExterior'
import CustomWorks from '../components/CustomWorks'

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  Innerpaper: {
    padding: theme.spacing(2),
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

const ToolEditModal = ({ activeWork, onClose }) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [modalStyle] = useState(getModalStyle())

  const renderRespectiveTool = () => {
    if (activeWork.workKey === 'kitchenCabinets') {
      return <KitchenCabinets editMode={true} data={activeWork} onClose={onClose} />
    } else if (activeWork.workKey === 'residentialRegular') {
      return (
        <RegularTemplate
          editMode={true}
          data={activeWork}
          onClose={onClose}
          workCatKey='residentialRegular'
          title='Peinture Intérieur Résidentielle'
          btnTitle='Mettre à jour Peinture Intérieur Résidentielle'
        />
      )
    } else if (activeWork.workKey === 'commercialRegular') {
      return (
        <RegularTemplate
          editMode={true}
          data={activeWork}
          onClose={onClose}
          workCatKey='commercialRegular'
          title='Peinture Intérieur Commerciale'
          btnTitle='Mettre à jour Peinture Intérieur Commerciale'
        />
      )
    } else if (activeWork.workKey === 'customInterior') {
      return <CustomInterior editMode={true} data={activeWork} onClose={onClose} />
    } else if (activeWork.workKey === 'metalIronWrought') {
      return (
        <IronWroughtTemplate
          editMode={true}
          data={activeWork}
          onClose={onClose}
          workCatKey='metalIronWrought'
          title='Métal Fer Forgé'
          btnTitle='Mettre à jour Métal Fer Forgé'
        />
      )
    } else if (activeWork.workKey === 'woodIronWrought') {
      return (
        <IronWroughtTemplate
          editMode={true}
          data={activeWork}
          onClose={onClose}
          workCatKey='woodIronWrought'
          title='Bois Fer Forgé'
          btnTitle='Mettre à jour Bois Fer Forgé'
        />
      )
    } else if (activeWork.workKey === 'houseSiding') {
      return (
        <SidingAndExteriorTemplate
          editMode={true}
          data={activeWork}
          onClose={onClose}
          workCatKey='houseSiding'
          title='House Siding'
          btnTitle='Mettre à jour House Siding'
        />
      )
    } else if (activeWork.workKey === 'commercialExterior') {
      return (
        <SidingAndExteriorTemplate
          editMode={true}
          data={activeWork}
          onClose={onClose}
          workCatKey='commercialExterior'
          title='Commercial Exterior Job'
          btnTitle='Mettre à jour Commercial Exterior'
        />
      )
    } else if (activeWork.workKey === 'customExterior') {
      return <CustomExterior editMode={true} data={activeWork} onClose={onClose} />
    } else if (activeWork.workKey === 'customWorks') {
      return <CustomWorks editMode={true} data={activeWork} onClose={onClose} />
    }
  }

  return (
    <Modal open={true}>
      <div
        style={{
          ...modalStyle,
          width: isMobile ? '100%' : '90%',
          height: isMobile ? '100%' : '90%',
        }}
        className={classes.paperModal}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant='h4' align='left' gutterBottom>
              <CancelOutlinedIcon
                style={{ float: 'right', cursor: 'pointer' }}
                fontSize='large'
                onClick={() => onClose()}
              />
              Edit Entry Panel
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Scrollbars style={{ height: isMobile ? '80vh' : '70vh' }}>
              {renderRespectiveTool()}
            </Scrollbars>
          </Grid>
        </Grid>
      </div>
    </Modal>
  )
}

export default ToolEditModal
