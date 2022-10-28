import Configs from './configs'

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'
// import 'firebase/database';
// import 'firebase/messaging';
// import 'firebase/functions';

const config = Configs.FirebaseConfig
let fire

if (!firebase.apps.length) {
  fire = firebase.initializeApp(config)
} else {
  fire = firebase.app() // if already initialized, use that one
}

const firestore = fire.firestore()
// firestore.settings({ host: 'localhost:8080', ssl: false })
const auth = fire.auth()
// const database = fire.database();
const storage = fire.storage()
// firestore.settings({ timestampsInSnapshots: true });

export { firebase, firestore, auth, storage }
export default fire

// Exmaple usage: import fire, {firebase, firestore} from '../scripts/fire';
