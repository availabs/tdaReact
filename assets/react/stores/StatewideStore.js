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
    ClassByDayFilter = require('../utils/dataFilters/classByDayFilter.js'),
    ClassByMonthFilter = require('../utils/dataFilters/classByMonthFilter.js');

var _selectedState = null,
    _classbyDay = {},
    _classbyMonth = {},
    _filters={
      year:null,
      stations:[]
    };

function _setState(fips){
  //console.log('StatewideStore / _setState ',fips)
  _selectedState = fips;
}

function _filterYear(year){
  //ClassByDayFilter.getDimension('year').filter(year);
  ClassByMonthFilter.getDimension('year').filter(year);
}

function _filterStations(stations){
  ClassByMonthFilter.getDimension('stationId').filterFunction(function(d){
    //console.log('filter stations',stations.indexOf(d),d)
    return stations.indexOf(d) >= 0;
  });
}

var StatewideStore = assign({}, EventEmitter.prototype, {

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

  getClassByDay:function(){
    //if data is loaded send it
    if(_classbyDay[_selectedState] && _classbyDay[_selectedState] !== 'loading' ){
      ClassByDayFilter.init(_classbyDay[_selectedState],_selectedState);
      return ClassByDayFilter;
    }
    
    //if data hasn't start started loading, load it 
    if(_classbyDay[_selectedState] !== 'loading'){
      SailsWebApi.getClassByDay(_selectedState);
      _classbyDay[_selectedState] = 'loading';
    }

    //if requested data isn't loaded send most recent data
    // may want to rethink this
    return ClassByDayFilter;
  },

  getClassByMonth:function(){
    
    //if data is loaded send it
    if(_classbyMonth[_selectedState] && _classbyMonth[_selectedState] !== 'loading' ){
      ClassByMonthFilter.init(_classbyMonth[_selectedState],_selectedState);
      return ClassByMonthFilter;
    }
    
    if(_classbyMonth[_selectedState] !== 'loading'){
      SailsWebApi.getClassByMonth(_selectedState);
      _classbyMonth[_selectedState] = 'loading';
    }

    //if requested data isn't loaded send most recent data
    // may want to rethink this
    return ClassByMonthFilter;
  }



});

StatewideStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

   
    case ActionTypes.SET_SELECTED_STATE:
      _setState(action.Id);
      StatewideStore.emitChange();
    break;

    case ActionTypes.FILTER_YEAR:
      _filterYear(action.year);
      StatewideStore.emitChange();
    break;

    case ActionTypes.FILTER_STATIONS:
      _filterStations(action.stations);
      StatewideStore.emitChange();
    break;

    case ActionTypes.TMG_CLASS_BYDAY:
      _classbyDay[action.fips] = action.data;
      StatewideStore.emitChange();
    break;

    case ActionTypes.TMG_CLASS_BYMONTH:
      //console.log('---------------------------StatewideStore Action1',action.type);
      _classbyMonth[action.fips] = action.data;
      StatewideStore.emitChange();
      //console.log('StatewideStore Action----------------------------',action.type);
    break;

     case ActionTypes.CBM_INITIALIZED:
      StatewideStore.emitChange();
    break;


    default:
      // do nothing
  }

});

module.exports = StatewideStore;
