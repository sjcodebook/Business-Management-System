import firebase from 'firebase'
// import userStore from './../store/UserStore'

import { Constants } from './../scripts/constants'

const Configs = {
  Production: {
    Env: 'Production',
    FirebaseConfig: {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
    },
    FirebaseFunctionUrl: '/api',
    uiConfig: {
      signInFlow: 'redirect',
      signInSuccessUrl: Constants.jobsConfigs.allPaths.Others.routes.Login.route,
      signInOptions: [
        {
          provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          customParameters: {
            prompt: 'select_account',
          },
        },
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
      callbacks: {
        // signInSuccessWithAuthResult: (authResult, redirectUrl) => {
        //   if (authResult.user) {
        //     const currentUser = authResult.user
        //     userStore.setCurrentUser(currentUser.uid, currentUser.email, currentUser.displayName, currentUser.picURL)
        //   }
        // },
      },
    },
    systemUserId: process.env.REACT_APP_SYSTEM_USER_ID,
  },
  Staging: {
    Env: 'Staging',
    FirebaseConfig: {
      apiKey: process.env.REACT_APP_DEV_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_DEV_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_DEV_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_DEV_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_DEV_FIREBASE_MESSAGE_SENDER_ID,
      appId: process.env.REACT_APP_DEV_FIREBASE_APP_ID,
    },
    FirebaseFunctionUrl: '/api',
    uiConfig: {
      signInFlow: 'redirect',
      signInSuccessUrl: Constants.jobsConfigs.allPaths.Others.routes.Login.route,
      signInOptions: [
        {
          provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          customParameters: {
            prompt: 'select_account',
          },
        },
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
      callbacks: {
        // signInSuccessWithAuthResult: (authResult, redirectUrl) => {
        //   if (authResult.user) {
        //     const currentUser = authResult.user
        //     userStore.setCurrentUser(currentUser.uid, currentUser.email, currentUser.displayName, currentUser.picURL)
        //   }
        // },
      },
    },
    systemUserId: process.env.REACT_APP_DEV_SYSTEM_USER_ID,
  },
  Local: {
    Env: 'Local',
    FirebaseConfig: {
      apiKey: process.env.REACT_APP_DEV_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_DEV_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_DEV_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_DEV_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_DEV_FIREBASE_MESSAGE_SENDER_ID,
      appId: process.env.REACT_APP_DEV_FIREBASE_APP_ID,
    },
    FirebaseFunctionUrl: 'http://localhost:5001/ilias-crm/us-central1',
    uiConfig: {
      signInFlow: 'redirect',
      signInSuccessUrl: Constants.jobsConfigs.allPaths.Others.routes.Login.route,
      signInOptions: [
        {
          provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          customParameters: {
            prompt: 'select_account',
          },
        },
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
      callbacks: {
        // signInSuccessWithAuthResult: (authResult, redirectUrl) => {
        //   if (authResult.user) {
        //     const currentUser = authResult.user
        //     userStore.setCurrentUser(currentUser.uid, currentUser.email, currentUser.displayName, currentUser.picURL)
        //   }
        // },
      },
    },
    systemUserId: process.env.REACT_APP_DEV_SYSTEM_USER_ID,
  },
}

let Config
if (process.env.NODE_ENV === 'development') {
  Config = Configs.Local
  console.log(Config.Env + ' Environment')
} else if (
  window.location.hostname === 'crm.xxxxxxxxx.com' &&
  process.env.NODE_ENV === 'production'
) {
  Config = Configs.Production
  // Do not console.log
} else {
  Config = Configs.Staging
  console.log(Config.Env + ' Environment')
}

export default Config
