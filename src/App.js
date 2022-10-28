import React, { useEffect } from 'react'
import { Observer } from 'mobx-react-lite'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import yall from 'yall-js'

import './App.scss'

import Layout from './components/common/Layout'

import MainPage from './pages/MainPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import EstimatorPage from './pages/EstimatorPage'
import TimeTrackerPage from './pages/TimeTrackerPage'
import AdminPage from './pages/AdminPage'
import InvoicePage from './pages/InvoicePage'
import EstimatesRequestPage from './pages/EstimatesRequestPage'
import LeadsAssignedPage from './pages/LeadsAssignedPage'
import AppointmentScheduledPage from './pages/AppointmentScheduledPage'
import EstimatesSentPage from './pages/EstimatesSentPage'
import EstimatesDraftPage from './pages/EstimatesDraftPage'
import InvoicesDraftPage from './pages/InvoicesDraftPage'
import EstimatesScheduledPage from './pages/EstimatesScheduledPage'
import InvoicesSentPage from './pages/InvoicesSentPage'
import InvoicesPaidPage from './pages/InvoicesPaidPage'
import SoldPage from './pages/SoldPage'
import SaleLostPage from './pages/SaleLostPage'
import ClientsPage from './pages/ClientsPage'
import ContactInfoPage from './pages/ContactInfoPage'
import ProductionCalendarPage from './pages/ProductionCalendarPage'
import EstimatesRequestFormPage from './pages/EstimatesRequestFormPage'
import NotFoundPage from './pages/NotFoundPage'

import { Constants } from './scripts/constants'
import { setAuthStateChangeListener } from './scripts/remoteActions'

function App() {
  useEffect(() => {
    document.addEventListener('DOMContentLoaded', () => {
      yall({
        observeChanges: true, // For dynamically inserted elements
      })
    })
  }, [])

  useEffect(() => {
    setAuthStateChangeListener()
  })

  return (
    <Observer>
      {() => (
        <Router>
          <Layout>
            <Switch>
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Others.routes.Home.route}
                component={MainPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Others.routes.Admin.route}
                component={AdminPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Others.routes.Login.route}
                component={LoginPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Others.routes.Profile.route}
                component={ProfilePage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Tools.routes.Estimate.route}
                component={EstimatorPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Tools.routes.Timer.route}
                component={TimeTrackerPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Tools.routes.Invoice.route}
                component={InvoicePage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Leads.routes.EstimatesRequest.route}
                component={EstimatesRequestPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Leads.routes.LeadsAssigned.route}
                component={LeadsAssignedPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Leads.routes.AppointmentScheduled.route}
                component={AppointmentScheduledPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Estimates.routes.EstimatesScheduled.route}
                component={EstimatesScheduledPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Estimates.routes.EstimatesSent.route}
                component={EstimatesSentPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Estimates.routes.EstimatesDraft.route}
                component={EstimatesDraftPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Invoices.routes.InvoicesSent.route}
                component={InvoicesSentPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Invoices.routes.InvoicesPaid.route}
                component={InvoicesPaidPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Invoices.routes.InvoicesDraft.route}
                component={InvoicesDraftPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Estimates.routes.Sold.route}
                component={SoldPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Estimates.routes.SaleLost.route}
                component={SaleLostPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Others.routes.Clients.route}
                component={ClientsPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Others.routes.ContactInfo.route}
                component={ContactInfoPage}
              />
              <Route
                exact
                path={
                  Constants.jobsConfigs.allPaths.ProjectPipeline.routes.ProductionCalendar.route
                }
                component={ProductionCalendarPage}
              />
              <Route
                exact
                path={Constants.jobsConfigs.allPaths.Others.routes.EstimatesRequestForm.route}
                component={EstimatesRequestFormPage}
              />
              <Route component={NotFoundPage} />
            </Switch>
          </Layout>
        </Router>
      )}
    </Observer>
  )
}

export default App
