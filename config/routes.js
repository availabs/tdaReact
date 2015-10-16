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
  //-- Full Data
  '/tmgClass/byDay' : 'TmgClassController.byDay',
  '/tmgClass/byMonth' : 'TmgClassController.byMonth',
  '/tmgClass/byHour' : 'TmgClassController.byHour',

  //-- Processed Data
  '/tmgClass/byHour/station/:fips/:stationId': 'TmgClassController.CountByTime',
  '/tmgClass/avgHour/station/:fips/:stationId': 'TmgClassController.AvgHour',
  '/tmgClass/classPie/station/:fips/:stationId': 'TmgClassController.classPie',
  '/tmgClass/stateAADT/:fips' : 'TmgClassController.getStateAADT',
  '/tmgClass/stateMADT/:fips/:graphType' : 'TmgClassController.getStateMADT',
  // '/tmgClass/classByMonthFilters':'TmgClassController.getClassByMonthFilters',


  // -- WIM data
  '/tmgWim/tonnage/:fips' : 'TmgWimController.Tonage',
  '/tmgWim/tonnage/month/:fips/' :'TmgWimController.TonageMonthGraph',
  '/tmgWim/tonnage/madt/:fips/' :'TmgWimController.TonageMadtGraph',
  '/tmgWim/:fips/:stationId':'TmgWimController.getWimStationData',

  // -- Hpms Data
  '/hpms/:state' : 'HpmsController.getStateData',

  // -- Upload Data
  '/upload/:dataBase' : 'UploadController.upload'

};
