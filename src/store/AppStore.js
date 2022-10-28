import { makeAutoObservable, configure } from 'mobx'
import { createMuiTheme } from '@material-ui/core/styles'

configure({
  enforceActions: 'never',
})

function AppStore() {
  return makeAutoObservable({
    darkMode: true,

    setDarkMode(status) {
      this.darkMode = status
    },

    get getDarkTheme() {
      const palletType = this.darkMode ? 'dark' : 'light'
      return createMuiTheme({
        palette: {
          type: palletType,
        },
      })
    },

    resetStore() {
      this.darkMode = true
    },
  })
}

const appStore = new AppStore()
export default appStore
