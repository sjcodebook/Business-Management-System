import { makeAutoObservable, configure } from 'mobx'
import randomstring from 'randomstring'
import * as dayjs from 'dayjs'

configure({
  enforceActions: 'never',
})

function EstimatorStore() {
  return makeAutoObservable({
    customerInfo: {
      id: '',
      name: '',
      address: '',
      phone: '',
      email: '',
      warranty: false,
      hideTotalBox: false,
      depositAmt: 0,
      paymentsInfo: [
        {
          id: randomstring.generate(),
          paymentAmount: 0,
          paymentDate: dayjs().format('DD-MM-YYYY'),
        },
      ],
      paid: false,
    },
    finalEstimates: {},
    customNote: '',
    createdAt: null,
    worksMap: {
      interiorWorks: {
        kitchenCabinets: {
          catName: 'Cabinets de Cuisines',
          name: 'Nom',
          notes: 'Notes',
          prepWork: 'Préparation',
          color: 'Couleur',
          cabinets: 'Cabinets',
          clientSC: 'Client SC',
          clientDA: 'Client DA',
          all: 'All',
        },
        residentialRegular: {
          catName: 'Peinture Intérieur Résidentielle',
          name: 'Nom',
          notes: 'Notes',
          prepWork: 'Préparation',
          color: 'Couleur',
          smallHoleSize: 'Small Hole Extra (+$)',
          bigHoleSize: 'Big Hole Extra (+$)',
          roomCondition: 'Room Condition (+%)',
          floor: 'Floor SQ/FT',
          wall: 'Wall SQ/FT',
          ceiling: 'Plafond',
          oneSheen: '1 Lustre',
          twoSheens: '2 Lustres',
          threeSheens: '3 Lustres',
          primerOneSheen: 'Primer + 1 Lustre',
          primerTwoSheens: 'Primer + 2 Lustres',
          primerThreeSheens: 'Primer + 3 Lustres',
        },
        commercialRegular: {
          catName: 'Peinture Intérieur Commerciale',
          name: 'Nom',
          notes: 'Notes',
          prepWork: 'Préparation',
          color: 'Couleur',
          smallHoleSize: 'Small Hole Extra (+$)',
          bigHoleSize: 'Big Hole Extra (+$)',
          roomCondition: 'Room Condition (+%)',
          floor: 'Floor SQ/FT',
          wall: 'Wall SQ/FT',
          ceiling: 'Plafond',
          oneSheen: '1 Lustre',
          twoSheens: '2 Lustres',
          threeSheens: '3 Lustres',
          primerOneSheen: 'Primer + 1 Lustre',
          primerTwoSheens: 'Primer + 2 Lustres',
          primerThreeSheens: 'Primer + 3 Lustres',
        },
        customInterior: {
          catName: 'Entre sur mesure',
          name: 'Nom',
          notes: 'Notes',
          prepWork: 'Préparation',
          color: 'Couleur',
          price: 'Prix',
        },
      },
      exteriorWorks: {
        metalIronWrought: {
          catName: 'Métal Fer Forgé',
          name: 'Nom',
          notes: 'Notes',
          prepWork: 'Préparation',
          color: 'Couleur',
          steps: 'Marches',
          railings: 'Rampes',
          easy: 'Facile',
          medium: 'Moyen',
          hard: 'Hardcore',
        },
        woodIronWrought: {
          catName: 'Bois Fer Forgé',
          name: 'Nom',
          notes: 'Notes',
          prepWork: 'Préparation',
          color: 'Couleur',
          steps: 'Marches',
          railings: 'Rampes',
          easy: 'Facile',
          medium: 'Moyen',
          hard: 'Hardcore',
        },
        houseSiding: {
          catName: 'House Siding',
          name: 'Name',
          notes: 'Notes',
          prepWork: 'PrepWork',
          color: 'Couleur',
          floor: 'Floor SQ/FT',
          oneSheen: '1 Sheen',
          twoSheens: '2 Sheens',
          threeSheens: '3 Sheens',
          primerOneSheen: 'Primer + 1 Sheen',
          primerTwoSheens: 'Primer + 2 Sheens',
          primerThreeSheens: 'Primer + 3 Sheens',
        },
        commercialExterior: {
          catName: 'Commercial Exterior Job',
          name: 'Name',
          notes: 'Notes',
          prepWork: 'PrepWork',
          color: 'Couleur',
          floor: 'Floor SQ/FT',
          oneSheen: '1 Sheen',
          twoSheens: '2 Sheens',
          threeSheens: '3 Sheens',
          primerOneSheen: 'Primer + 1 Sheen',
          primerTwoSheens: 'Primer + 2 Sheens',
          primerThreeSheens: 'Primer + 3 Sheens',
        },
        customExterior: {
          catName: 'Custom Exterior Work',
          name: 'Name',
          notes: 'Notes',
          prepWork: 'PrepWork',
          color: 'Couleur',
          price: 'Price',
        },
      },
      customWorks: {
        customWorks: {
          catName: 'Entre sur mesure',
          name: 'Nom',
          notes: 'Notes',
          prepWork: 'Préparation',
          price: 'Prix',
        },
      },
    },
    get interiorWorks() {
      let result = {}
      Object.keys(this.finalEstimates).forEach((key) => {
        if (this.worksMap.interiorWorks[key]) {
          if (!result[key]) result[key] = []
          result[key] = {
            data: this.finalEstimates[key],
            worksMap: this.worksMap.interiorWorks[key],
          }
        }
      })
      return result
    },
    get exteriorWorks() {
      let result = {}
      Object.keys(this.finalEstimates).forEach((key) => {
        if (this.worksMap.exteriorWorks[key]) {
          if (!result[key]) result[key] = []
          result[key] = {
            data: this.finalEstimates[key],
            worksMap: this.worksMap.exteriorWorks[key],
          }
        }
      })
      return result
    },
    get customWorks() {
      let result = {}
      Object.keys(this.finalEstimates).forEach((key) => {
        if (this.worksMap.customWorks[key]) {
          if (!result[key]) result[key] = []
          result[key] = {
            data: this.finalEstimates[key],
            worksMap: this.worksMap.customWorks[key],
          }
        }
      })
      return result
    },
    getWorksMap(key) {
      let allWorksMap = {}
      Object.values(this.worksMap).forEach((val) => {
        allWorksMap = {
          ...allWorksMap,
          ...val,
        }
      })
      return allWorksMap[key] || {}
    },
    setFinalEstimate(key, value) {
      if (!this.finalEstimates[key]) this.finalEstimates[key] = []
      this.finalEstimates[key].push({
        id: randomstring.generate(),
        ...value,
      })
    },
    updateFinalEstimate(key, valueId, value) {
      if (this.finalEstimates[key]) {
        this.finalEstimates[key].forEach((obj, i) => {
          if (obj.id === valueId) {
            this.finalEstimates[key][i] = {
              id: valueId,
              ...value,
            }
          }
        })
      }
    },
    addToolsImages(key, valueId, imagesUrl) {
      if (this.finalEstimates[key]) {
        this.finalEstimates[key].forEach((obj, i) => {
          if (obj.id === valueId) {
            let images = []
            if (this.finalEstimates[key][i]['images']) {
              images = [...this.finalEstimates[key][i]['images']]
            }
            images = [...images, ...imagesUrl]
            this.finalEstimates[key][i] = {
              ...this.finalEstimates[key][i],
              images,
            }
          }
        })
      }
    },
    removeToolsImage(key, valueId, imageUrl) {
      if (this.finalEstimates[key]) {
        this.finalEstimates[key].forEach((obj, i) => {
          if (obj.id === valueId) {
            let images = []
            if (this.finalEstimates[key][i]['images']) {
              images = [...this.finalEstimates[key][i]['images']].filter((img) => img !== imageUrl)
            }
            this.finalEstimates[key][i] = {
              ...this.finalEstimates[key][i],
              images,
            }
          }
        })
      }
    },
    removeFinalEstimate(key, id) {
      if (this.finalEstimates[key]) {
        this.finalEstimates[key] = this.finalEstimates[key].filter((estimate) => estimate.id !== id)
      }
    },
    setCustInfoAndFinalEstimate(customerInfo, finalEstimates, customNote) {
      this.finalEstimates = finalEstimates
      this.customerInfo = customerInfo
      this.customNote = customNote
    },
    setCreatedAt(createdAt) {
      this.createdAt = createdAt
    },
    resetStore() {
      this.customerInfo = {
        name: '',
        address: '',
        phone: '',
        email: '',
        warranty: false,
        hideTotalBox: false,
        depositAmt: 0,
        paymentsInfo: [
          {
            id: randomstring.generate(),
            paymentAmount: 0,
            paymentDate: dayjs().format('DD-MM-YYYY'),
          },
        ],
        paid: false,
      }
      this.finalEstimates = {}
      this.customNote = ''
      this.createdAt = null
    },
  })
}

const estimatorStore = new EstimatorStore()
export default estimatorStore
