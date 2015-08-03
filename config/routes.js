/**
 * Route Mappings
 * (sails.config.routes)
 * CoffeeScript for the front-end.
 *
 * For more information on routes, check out:
 * http://links.sailsjs.org/docs/config/routes
 */

module.exports.routes = {

  //-------------------------------
  // User controller 
  //-------------------------------
  '/landing': 'LandingController.index', //Landing View
  '/': 'LandingController.flux', //Main Flux App

  //-------------------------------
  // User controller 
  //-------------------------------

  //Views
  '/login':'UserController.login',
  
  //Auth
  '/logout':'UserController.logout',
  '/login/auth':'UserController.auth',


  //------------------------------
  // Data Routes
  //------------------------------

  // -- Set Datasource  
  '/data/overview/:database/:dataType' : 'TmGClassController.datasetOverview',
  '/data/overview/day/:database/:dataType' : 'TmGClassController.datasetOverviewDay',

  // -- Class  Data
  '/tmgClass/byDay' : 'TmgClassController.byDay',
  '/tmgClass/byMonth' : 'TmgClassController.byMonth',
  '/tmgClass/byHour' : 'TmgClassController.byHour',

  // -- WIM data
  '/tmgWim/tonnage/:fips/:stationId' : 'TmgWimController.Tonage',
  '/tmgWim/tonnage/:fips' : 'TmgWimController.Tonage',
  
  // -- Hpms Data
  '/hpms/:state' : 'HpmsController.getStateData',

  // -- Upload Data
  '/upload/:dataBase' : 'UploadController.upload'

};
