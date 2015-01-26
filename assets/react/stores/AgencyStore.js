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

var _selectedAgency = 1,
    _agencies = {};

function _addAgencies(rawData) {
  //console.log('stores/AgencyStore/_addUsers',rawData);
  rawData.forEach(function(agency) {
    
      _agencies[agency.id] = agency;
    
  });
};

function _deleteAgency(id){
  //console.log('stores/AgencyStore/deleteuser',id)
  delete _agencies[id];
  //_editUserID = null;
}

var AgencyStore = assign({}, EventEmitter.prototype, {

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },
  
  /**
   * @param {function} callback
   */

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  get: function(id) {
    return _agencies[id];
  },

  getAll: function() {
    return _agencies;
  },

  getSelectedAgency:function(){
    return _agencies[_selectedAgency];
  }

});

AgencyStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

    case ActionTypes.SET_SELECTED_AGENCY:
      _selectedAgency = action.Id;
      AgencyStore.emitChange();
    break;

    case ActionTypes.RECEIVE_AGENCYS:
      _addAgencies(action.data);
      AgencyStore.emitChange();
    break;

    case ActionTypes.DELETE_AGENCY:
      _deleteUser(action.Id);
      AgencyStore.emitChange();
    break;

    default:
      // do nothing
  }

});

module.exports = AgencyStore;
