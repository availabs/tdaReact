

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

      //-- Filters
    FILTER_YEAR:null,

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
    TMG_CLASS_BYDAY: null,
    TMG_CLASS_BYMONTH: null

  }),

  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })

};
