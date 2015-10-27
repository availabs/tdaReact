'use strict';

//---------------------------------------
// App Controller View 
// One Per Server Side Route
//---------------------------------------

//  --- Libraries
var React = require('react'),
    Router = require('react-router'),
    Route = Router.Route,
    Routes = Router.Routes,
    Redirect = Router.Redirect,
    DefaultRoute = Router.DefaultRoute,
    
//  --- Layout File
    App = require('./pages/layout.react'),

//  --- Pages
    StateIndex = require('./pages/StateIndex.react'),
    AgencySettings = require('./pages/dataManagement/AgencySettings.react'),
    DataSourcesList = require('./pages/dataManagement/DataSourceList.react'),
    DataSourceOverview = require('./pages/dataManagement/DataSourceOverview.react'),
    DataSourceUpload = require('./pages/dataManagement/DataSourceUpload.react'),
    SingleStation = require('./pages/SingleStation.react'),
    UserAdmin = require('./pages/UserAdmin.react'),

// --- Server API
    sailsWebApi = require('./utils/api/SailsWebApi.js');

// --- Initialize the API with the session User  
sailsWebApi.initAdmin(window.User,window.Datasource,window.Fips);

//  --- Routes 
var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="stateIndex" handler={StateIndex}/>
    <Route name="datasourceList" handler={DataSourcesList}/>
    <Route name="agencySettings" path="settings/:agencyId" handler={AgencySettings}/>
    <Route name="datasourceSingle" path="data/:agencyId" handler={DataSourceOverview}/>
    <Route name="datasourceUpload" path="data/:agencyId/upload" handler={DataSourceUpload}/>
    <Route name="singleStation" path="station/:fips/:stationId" handler={SingleStation}/>
    <Route name="userAdmin" path="admin/users"  handler={UserAdmin} />
    <DefaultRoute handler={StateIndex}/>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});

