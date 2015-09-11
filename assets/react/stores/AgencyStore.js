'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    Constants = require('../constants/AppConstants'),
    EventEmitter = require('events').EventEmitter,
    assign = require('object-assign'),


    ActionTypes = Constants.ActionTypes,
    CHANGE_EVENT = 'change';

var SailsWebApi = require('../utils/api/SailsWebApi');
    
var _selectedAgency = 1,
    _agencies = {"1":{id:1,datasource:'allWim',name:'TMAS'}},
    _default = {datasource:'allWim',name:'TMAS'},
    _overviewData = {},
    _overviewDayData = {},
    _uploads= {};

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
    return _agencies[_selectedAgency] ?  _agencies[_selectedAgency] : _default;
  },

  getAgencyOverview:function(){
    if(_agencies[_selectedAgency] && _agencies[_selectedAgency].datasource){
      if(_overviewData[_selectedAgency] && _overviewData[_selectedAgency] !== 'loading'){
        return _overviewData[_selectedAgency]
      }
      if(!_overviewData[_selectedAgency]){
        SailsWebApi.getDataOverview(_agencies[_selectedAgency]);
        _overviewData[_selectedAgency] = 'loading';
      }
    }
    return {}
  },

  getUploads:function(){

    if(_uploads[_agencies[_selectedAgency]] && _uploads[_agencies[_selectedAgency]] !== 'loading'){
      return _uploads[_agencies[_selectedAgency]];
    }else{
      SailsWebApi.read('uploadjob',{source:_agencies[_selectedAgency].datasource})
       _uploads[_agencies[_selectedAgency]] = 'loading' 
    }
    return []
  },

  getAgencyOverviewDay:function(){
    if(_agencies[_selectedAgency] && _agencies[_selectedAgency].datasource){
      if(_overviewDayData[_selectedAgency] && _overviewDayData[_selectedAgency] !== 'loading'){
        return _overviewDayData[_selectedAgency]
      }
      if(!_overviewDayData[_selectedAgency]){
        SailsWebApi.getDataOverviewDay(_agencies[_selectedAgency]);
        _overviewDayData[_selectedAgency] = 'loading';
      }
    }
    return {}
  }



});

AgencyStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

    case ActionTypes.SET_SELECTED_AGENCY:
      _selectedAgency = action.Id;
      AgencyStore.emitChange();
    break;

    case ActionTypes.RECEIEVE_UPLOADJOBS:
      console.log('RECEIEVE_UPLOADJOBS',action);
      //AgencyStore.emitChange();
    break;

    case ActionTypes.RECEIVE_AGENCYS:
      _addAgencies(action.data);
      AgencyStore.emitChange();
    break;

    case ActionTypes.DELETE_AGENCY:
      _deleteUser(action.Id);
      AgencyStore.emitChange();
    break;

    case ActionTypes.GET_DATA_OVERVIEW:
      //console.log('test GET_DATA_OVERVIEW',action)
      if(_overviewData[action.id] === 'loading'){
        _overviewData[action.id] = {}
      }
      
      _overviewData[action.id][action.dataType] = action.data;
      AgencyStore.emitChange();
    break;

     case ActionTypes.GET_DATA_OVERVIEW_DAY:

      if(_overviewDayData[action.id] === 'loading'){
        _overviewDayData[action.id] = {}
      }
      
      _overviewDayData[action.id][action.dataType] = action.data;
      AgencyStore.emitChange();
    break;

    default:

   
   
      // do nothing
  }

});

module.exports = AgencyStore;
