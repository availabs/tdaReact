'use strict';
/**
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 */

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    Constants = require('../constants/AppConstants'),
    EventEmitter = require('events').EventEmitter,
    assign = require('object-assign'),

    ActionTypes = Constants.ActionTypes,
    CHANGE_EVENT = 'change';

var _selectedStation = null,
    _selectedState = null,
    _selectedStations = [],
    _stations = {};

function _addStations(rawData) {
  rawData.forEach(function(station,i) {
    
    if(!_stations[station.state_fips]){
      _stations[station.state_fips] = {}
    }


    if(station.longitude.length > 1){
      

      if(station.longitude.toString().substr(0,1) == '0'){
        station.longitude = station.longitude.toString().substr(1,station.longitude.toString().length)
      }

      if ( /^1/.test(station.longitude.toString()) ) {  
        station.longitude = station.longitude.toString().replace(/\s+/g, '').replace(/^(1\d\d)/, '-$1.'); 
      }
      else { 
        station.longitude = station.longitude.replace(/\s+/g, '').replace(/^(\d\d)/, '-$1.'); 
      }
      
      station.latitude = station.latitude.replace(/\s+/g, '').replace(/^(\d\d)/, '$1.');
      
      
      var feature = {type:"Feature",properties:station,geometry:{type:"Point",coordinates:[+station.longitude,+station.latitude]}}
              
       _stations[station.state_fips][station.station_id] = feature;
    }
    
  });
};

function _deleteUser(id){
  //console.log('stores/StationStore/deleteuser',id)
  delete _users[id];
  _editUserID = null;
}

function _setEditUserID(id){
    _editUserID = id;
};

var StationStore = assign({}, EventEmitter.prototype, {

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  StationsAdded: function() {
    this.emit('new_stations');
  },
  
  /**
   * @param {function} callback
   */

  addStationListener: function(callback) {
    this.on('new_stations', callback);
  },
  
  removeStationListener: function(callback) {
    this.removeListener('new_stations', callback);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  getStateStations: function(fips) {
    if(_stations[fips]){
      return Object.keys(_stations[fips]).map(function(key){
        return _stations[fips][key];
      });
    }else{
      return [];
    }
  },

  getAll: function() {
    return _stations;
  },

  getSelectedStation:function(){
    if(_stations[_selectedState]){
      return _stations[_selectedState][_selectedStation];
    }
    return {};
  }

 

});

StationStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;
  
  switch(action.type) {

    case ActionTypes.SET_SELECTED_STATION:
      _selectedStation = action.Id;
      _selectedState = action.fips
      StationStore.emitChange();
    break;

    case ActionTypes.RECEIVE_STATIONS:
      //console.log('StationStore / receieve_stations')
      _addStations(action.data);
      StationStore.StationsAdded();
    break;

    default:
      // do nothing
  }

});

module.exports = StationStore;
