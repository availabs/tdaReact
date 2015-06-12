/**
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/AppConstants');

var ActionTypes = Constants.ActionTypes;

module.exports = {
  //------------------------------------
  // App
  //------------------------------------
  setAppSection: function(data){
    //console.log('set app section action',data)
    AppDispatcher.handleServerAction({
      type: ActionTypes.SET_APP_SECTION,
      section: data
    })
  },

  //------------------------------------
  // TMG Class
  //------------------------------------
  getClassByHour : function(data,stationId,fips){
    AppDispatcher.handleServerAction({
      type: ActionTypes.TMG_CLASS_BYHOUR,
      data: data,
      stationId: stationId,
      fips:fips
    })
  },

  getClassByDay : function(data,fips){
    AppDispatcher.handleServerAction({
      type: ActionTypes.TMG_CLASS_BYDAY,
      data: data,
      fips: fips
    })
  },
  
  getClassByMonth : function(data,fips){
    AppDispatcher.handleServerAction({
      type: ActionTypes.TMG_CLASS_BYMONTH,
      data: data,
      fips: fips
    })
  },

  //------------------------------------
  // Hpms Data
  //------------------------------------
  getHpms : function(data,fips){
    AppDispatcher.handleServerAction({
      type: ActionTypes.RECEIEVE_STATE_HPMS,
      data: data,
      fips: fips
    })
  },

  //------------------------------------
  // User
  //------------------------------------
  setSessionUser:function(data){
    AppDispatcher.handleServerAction({
      type: ActionTypes.SET_SESSION_USER,
      user:data
    })
  },

  //------------------------------------
  // Agency
  //------------------------------------
  setSelectedAgency:function(id){
    AppDispatcher.handleServerAction({
      type: ActionTypes.SET_SELECTED_AGENCY,
      Id:id
    })
  },

  getDataOverview:function(data,id,dataType){
    AppDispatcher.handleServerAction({
      type: ActionTypes.GET_DATA_OVERVIEW,
      data:data,
      dataType:dataType,
      id:id
    })
  },

  getDataOverviewDay:function(data,id,dataType){
    AppDispatcher.handleServerAction({
      type: ActionTypes.GET_DATA_OVERVIEW_DAY,
      data:data,
      dataType:dataType,
      id:id
    })
  },
  
  //------------------------------------
  // CRUD Handlers
  //------------------------------------

  receiveData: function(type,data) {
    //handles Create,Read & Update

    var actiontype = 'RECEIVE_'+type.toUpperCase()+'S';
    AppDispatcher.handleServerAction({
      type: ActionTypes[actiontype],
      data: data
    });
  },
  
  deleteData:function(id){
    AppDispatcher.handleServerAction({
      type: ActionTypes.DELETE_USER,
      Id: id
    });
  }
  
};
