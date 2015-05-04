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
    ClassByMonthFilter = require('../utils/dataFilters/classByMonthFilter.js'),
    ClassByHourFilter = require('../utils/dataFilters/classByHourFilter.js');

var _selectedState = null,
    _classbyDay = {},
    _classbyMonth = {},
    _selectedStation = null,
    _selectedState = null,
    _classbyHour = {},
    _filters={
      year:null,
      month:null,
      class:null,
      stations:[]
    };

function _setState(fips){
  _filters={
      year:null,
      month:null,
      class:null,
      stations:[]
  };
  _selectedState = fips;
}

function _setStation(stationId,fips){
  //console.log('StationStore / _setState ',fips)
  //reset filters
  _filters={
      year:null,
      month:null,
      class:null,
      stations:[],
      classGroups:[]
  };

  _selectedStation = stationId;
  _selectedState = fips;
}

function _filterYear(year){
  //ClassByDayFilter.getDimension('year').filter(year);
  ClassByMonthFilter.getDimension('year').filter(year);
  if(ClassByHourFilter.initialized()){
    ClassByHourFilter.getDimension('year').filter(year);
  }
  _filters.year = year;
}

function _filterMonth(data){
  //ClassByDayFilter.getDimension('year').filter(year);
  ClassByMonthFilter.getDimension('month').filter(data);
  if(ClassByHourFilter.initialized()){
    ClassByHourFilter.getDimension('month').filter(data);
  }
  _filters.month = data;
}


function _filterClass(data){
  //ClassByDayFilter.getDimension('year').filter(year);

  ClassByMonthFilter.getDimension('class').filter(data);
  _filters.class = data;
}

function _filterClassGroup(data){
  //ClassByDayFilter.getDimension('year').filter(year);

  if(_filters.classGroups.indexOf(data) === -1){
    _filters.classGroups.push(data)
  }else{
    _filters.classGroups.splice(_filters.classGroups.indexOf(data),1)
  }

  ClassByHourFilter.getDimension('classGroup').filterFunction(function(d){
    return _filters.classGroups.indexOf(d.classGroup) > -1
  });
  
}


function _filterStations(stations){
  if(!stations){
    ClassByMonthFilter.getDimension('stationId').filter(null);
    _filters.stations = [];
  }else if(stations.length > 0){

    _filters.stations = stations;
    ClassByMonthFilter.getDimension('stationId').filterFunction(function(d){
      //console.log('filter stations',stations.indexOf(d),d)
      return stations.indexOf(d) >= 0;
    });
  }
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

  getSelectedStation:function(){
    return _selectedStation;
  },

  getClassByHour:function(){
    //if data is loaded send it
    if(_classbyHour[_selectedStation] && _classbyHour[_selectedStation] !== 'loading' ){
      ClassByHourFilter.init(_classbyHour[_selectedStation],_selectedStation);
      return ClassByHourFilter;
    }
    
    //if data hasn't start started loading, load it 
    if(_classbyHour[_selectedStation] !== 'loading'){
      console.log('load',_selectedStation,_selectedState)
      SailsWebApi.getClassByHour(_selectedStation,_selectedState);
      _classbyHour[_selectedStation] = 'loading';
    }

    //if requested data isn't loaded send most recent data
    // may want to rethink this
    return ClassByHourFilter;
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
  },

  activeFilters:function(){
    return _filters
  }



});

StatewideStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

   
    case ActionTypes.SET_SELECTED_STATE:
      _setState(action.Id);
      StatewideStore.emitChange();
    break;

     case ActionTypes.SET_SELECTED_STATION:
      _setStation(action.Id,action.fips);
      StatewideStore.emitChange();
    break;

    case ActionTypes.FILTER_YEAR:
      _filterYear(action.year);
      StatewideStore.emitChange();
    break;

    case ActionTypes.FILTER_MONTH:
      _filterMonth(action.month);
      StatewideStore.emitChange();
    break;

    case ActionTypes.FILTER_VCLASS:
      _filterClass(action.vclass);
      StatewideStore.emitChange();
    break;
     case ActionTypes.FILTER_VCLASS_GROUP:
      _filterClassGroup(action.classGroup);
      StatewideStore.emitChange();
    break;
    
    case ActionTypes.FILTER_STATIONS:
      _filterStations(action.stations);
      StatewideStore.emitChange();
    break;

    case ActionTypes.TMG_CLASS_BYHOUR:
      _classbyHour[action.stationId] = action.data;
      StatewideStore.emitChange();
    break;

    case ActionTypes.TMG_CLASS_BYDAY:
      _classbyDay[action.fips] = action.data;
      StatewideStore.emitChange();
    break;

    case ActionTypes.TMG_CLASS_BYMONTH:
      _classbyMonth[action.fips] = action.data;
      StatewideStore.emitChange();
    break;

    case ActionTypes.CBM_INITIALIZED:
      StatewideStore.emitChange();
    break;


    default:
      // do nothing
  }

});

module.exports = StatewideStore;
