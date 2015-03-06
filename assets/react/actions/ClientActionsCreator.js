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
  // Agency
  //------------------------------------
  setSelectedAgency:function(id){
    AppDispatcher.handleServerAction({
      type: ActionTypes.SET_SELECTED_AGENCY,
      Id:id
    })
  },

  setSelectedState:function(id){
    
    AppDispatcher.handleViewAction({
      type: ActionTypes.SET_SELECTED_STATE,
      Id:id
    })
  
  },

  filterYear : function(year){
  
    AppDispatcher.handleViewAction({
      type: ActionTypes.FILTER_YEAR,
      year:year
    })
  
  },

  filterMonth : function(month){
  
    AppDispatcher.handleViewAction({
      type: ActionTypes.FILTER_MONTH,
      month:month
    })
  
  },

  filterClass: function(vclass){
    AppDispatcher.handleViewAction({
      type: ActionTypes.FILTER_VCLASS,
      vclass:vclass
    })
  
  },

  filterStations: function(stations){
  
    AppDispatcher.handleViewAction({
      type: ActionTypes.FILTER_STATIONS,
      stations:stations
    })
  
  },
  
  classByMonthInitialized: function(){
  
    AppDispatcher.handleViewAction({
      type: ActionTypes.CBM_INITIALIZED
    })
  
  }

};
