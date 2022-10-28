import { makeAutoObservable, configure } from 'mobx'

import { Constants } from '../scripts/constants'

configure({
  enforceActions: 'never',
})

function UserStore() {
  return makeAutoObservable({
    currentUser: {
      id: null,
      email: null,
      name: null,
      address: null,
      phone: null,
      dob: null,
      jobConfig: null,
      jobApproved: false,
      salary: null,
      picUrl: null,
      isAdmin: false,
      lastSeen: null,
      createdAt: null,
      emergencyContactName: null,
      emergencyContactNumber: null,
      isFirstLogin: null,
    },

    get isLoggedIn() {
      if (this.currentUser.id) {
        return true
      }
      return false
    },

    get hasOthersContentAccess() {
      if (
        this.currentUser.isAdmin ||
        (this.currentUser.jobConfig &&
          this.currentUser.jobConfig.actions.includes(
            Constants.jobsConfigs.allActions.AccessOthersData.id
          ))
      ) {
        return true
      }
      return false
    },

    setCurrentUser(
      id,
      email,
      name,
      address,
      phone,
      dob,
      jobConfig,
      jobApproved,
      salary,
      picUrl,
      isAdmin,
      lastSeen,
      createdAt,
      emergencyContactName,
      emergencyContactNumber,
      isFirstLogin
    ) {
      this.currentUser.id = id
      this.currentUser.email = email
      this.currentUser.name = name
      this.currentUser.address = address
      this.currentUser.phone = phone
      this.currentUser.dob = dob
      this.currentUser.jobConfig = jobConfig
      this.currentUser.jobApproved = jobApproved
      this.currentUser.salary = salary
      this.currentUser.picUrl = picUrl
      this.currentUser.isAdmin = isAdmin
      this.currentUser.lastSeen = lastSeen
      this.currentUser.createdAt = createdAt
      this.currentUser.emergencyContactName = emergencyContactName
      this.currentUser.emergencyContactNumber = emergencyContactNumber
      this.currentUser.isFirstLogin = isFirstLogin
    },

    resetStore() {
      this.currentUser = {
        id: null,
        email: null,
        name: null,
        address: null,
        phone: null,
        dob: null,
        jobConfig: null,
        jobApproved: false,
        salary: null,
        picUrl: null,
        isAdmin: false,
        lastSeen: null,
        createdAt: null,
        emergencyContactName: null,
        emergencyContactNumber: null,
        isFirstLogin: null,
      }
    },
  })
}

const userStore = new UserStore()
export default userStore
