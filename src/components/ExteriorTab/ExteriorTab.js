import React, { useState } from 'react'
import { Observer } from 'mobx-react-lite'
import { withStyles } from '@material-ui/core/styles'
import loadable from '@loadable/component'
import Typography from '@material-ui/core/Typography'
import MuiAccordion from '@material-ui/core/Accordion'
import MuiAccordionSummary from '@material-ui/core/AccordionSummary'
import MuiAccordionDetails from '@material-ui/core/AccordionDetails'

const IronWroughtTemplate = loadable(() => import('./IronWroughtTemplate'), {
  fallback: <div>Loading...</div>,
})
const SidingAndExteriorTemplate = loadable(() => import('./SidingAndExteriorTemplate'), {
  fallback: <div>Loading...</div>,
})
const CustomExterior = loadable(() => import('./CustomExterior'), {
  fallback: <div>Loading...</div>,
})

const Accordion = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiAccordion)

const AccordionSummary = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiAccordionSummary)

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiAccordionDetails)

const ExteriorTab = () => {
  const [expanded, setExpanded] = useState('panel1')

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
  }

  return (
    <Observer>
      {() => (
        <div>
          <Accordion style={{ marginTop: '20px' }} expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
            <AccordionSummary aria-controls='panel1d-content' id='panel1d-header'>
              <Typography>Métal Fer Forgé</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <IronWroughtTemplate workCatKey='metalIronWrought' title='Métal Fer Forgé' btnTitle='Ajouter Métal Fer Forgé' />
            </AccordionDetails>
          </Accordion>

          <Accordion style={{ marginTop: '20px' }} expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
            <AccordionSummary aria-controls='panel2d-content' id='panel2d-header'>
              <Typography>Bois Fer Forgé</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <IronWroughtTemplate workCatKey='woodIronWrought' title='Bois Fer Forgé' btnTitle='Ajouter Bois Fer Forgé' />
            </AccordionDetails>
          </Accordion>

          <Accordion style={{ marginTop: '20px' }} expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
            <AccordionSummary aria-controls='panel3d-content' id='panel3d-header'>
              <Typography>House Siding</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <SidingAndExteriorTemplate workCatKey='houseSiding' title='House Siding' btnTitle='Ajouter House Siding' />
            </AccordionDetails>
          </Accordion>

          <Accordion style={{ marginTop: '20px' }} expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
            <AccordionSummary aria-controls='panel4d-content' id='panel4d-header'>
              <Typography>Commercial Exterior Job</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <SidingAndExteriorTemplate workCatKey='commercialExterior' title='Commercial Exterior Job' btnTitle='Ajouter Commercial Exterior' />
            </AccordionDetails>
          </Accordion>

          <Accordion style={{ marginTop: '20px' }} expanded={expanded === 'panel5'} onChange={handleChange('panel5')}>
            <AccordionSummary aria-controls='panel5d-content' id='panel5d-header'>
              <Typography>Custom Exterior Work</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CustomExterior />
            </AccordionDetails>
          </Accordion>
        </div>
      )}
    </Observer>
  )
}

export default ExteriorTab
