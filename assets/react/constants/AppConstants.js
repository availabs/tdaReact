

var keyMirror = require('keymirror');

module.exports = {

  ActionTypes: keyMirror({
    
    //-------------------------------------------------------
    //View actions 
    //-------------------------------------------------------
    SELECT_USER: null,
    CREATE_USER:null,
    SET_SELECTED_AGENCY:null,
    SET_SELECTED_STATE:null,
    SET_SELECTED_STATION:null,
    CBM_INITIALIZED:null,
    DELETE_USER:null,

    // -- Filters
    FILTER_YEAR:null,
    FILTER_MONTH:null,
    FILTER_VCLASS:null,
    FILTER_VCLASS_GROUP:null,
    FILTER_STATIONS:null,

    //-------------------------------------------------------
    //Server actions 
    //-------------------------------------------------------
    SET_APP_SECTION:null,

    //---STATIONS--------------------------------------------
    RECEIVE_STATIONS:null,
    RECEIVE_AGENCYS:null,
    
    //-------User--------------------------------------------
    RECEIVE_USERS: null,
    SET_SESSION_USER:null,

    //-------Data--------------------------------------------
    GET_DATA_OVERVIEW:null,
    GET_DATA_OVERVIEW_DAY:null,
    TMG_CLASS_BYDAY: null,
    TMG_CLASS_BYMONTH: null,
    TMG_CLASS_BYHOUR:null,
    RECEIEVE_STATE_HPMS:null,

    RECEIVE_JOBS:null,

  }),

  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })

};
