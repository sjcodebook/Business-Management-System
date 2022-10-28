import React from 'react'
import ReactDOM from 'react-dom'
import DayjsUtils from '@date-io/dayjs'
import SimpleReactLightbox from 'simple-react-lightbox'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'

import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <SimpleReactLightbox>
      <MuiPickersUtilsProvider utils={DayjsUtils}>
        <App />
      </MuiPickersUtilsProvider>
    </SimpleReactLightbox>
  </React.StrictMode>,
  document.getElementById('root')
)
