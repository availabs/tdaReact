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
    SingleStation = require('./pages/SingleStation.react'),
    UserAdmin = require('./pages/UserAdmin.react')

// --- Server API
    sailsWebApi = require('./utils/api/SailsWebApi.js');

// --- Initialize the API with the session User  
sailsWebApi.initAdmin(window.User);

//  --- Routes 
var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="stateIndex" handler={StateIndex}/>
    <Route name="singleStation" path="station/:fips/:stationId" handler={SingleStation}/>
    <Route name="userAdmin" path="admin/users"  handler={UserAdmin} />
    <DefaultRoute handler={StateIndex}/>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});

