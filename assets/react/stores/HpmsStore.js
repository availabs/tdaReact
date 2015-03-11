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
    CHANGE_EVENT = 'change',

    SailsWebApi = require('../utils/api/SailsWebApi'),
    hpmsFilter = require('../utils/dataFilters/hpmsFilter.js');

var _selectedState = null,
    _hpms = {};

function _setState(fips){
  //console.log('HpmsStore / _setState ',fips)
  _selectedState = fips;
}

function _filterYear(year){
  //hpmsFilter.getDimension('year').filter(year);
}

var HpmsStore = assign({}, EventEmitter.prototype, {

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

  getSelectedState:function(){
    return _selectedState;
  },

  getStateData:function(){
    
    //if data is loaded send it
    //console.log('HpmsStore / gethpms',_selectedState);
    if(_hpms[_selectedState] && _hpms[_selectedState] !== 'loading' ){
      hpmsFilter.init(_hpms[_selectedState],_selectedState);
      return hpmsFilter;
    }
    
    //if data hasn't start started loading, load it 
    if(_selectedState && _hpms[_selectedState] !== 'loading'){
      SailsWebApi.getHpms(_selectedState);
      _hpms[_selectedState] = 'loading';
    }

    //if requested data isn't loaded send most recent data
    // may want to rethink this
    return hpmsFilter;
  }



});

HpmsStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

    case ActionTypes.SET_SELECTED_STATE:
      _setState(action.Id);
      HpmsStore.emitChange();
    break;

    // case ActionTypes.FILTER_YEAR:
    //   _filterYear(action.year);
    //   HpmsStore.emitChange();
    // break;

    case ActionTypes.RECEIEVE_STATE_HPMS:
     
      _hpms[action.fips] = action.data;
      HpmsStore.emitChange();
    break;

    default:
      // do nothing
  }

});

module.exports = HpmsStore;
