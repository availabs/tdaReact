'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    EventEmitter = require('events').EventEmitter,
    assign = require('object-assign'),
    UserConstants = require('../constants/AppConstants').ActionTypes,

    CHANGE_EVENT = 'change';

var USERS = [],
    SESSION_USER = {},
    EDIT_TARGET = null,
    ERROR_MESSAGE = null;

var UserStore = assign({}, EventEmitter.prototype, {

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },
    
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    getUser: function(id) {
        return USERS[id];
    },
    getAllUsers: function() {
        return USERS;
    },
    getSessionUser:function() {
        return SESSION_USER;
    },
    getEditTarget: function() {
        return EDIT_TARGET;
    },
    getErrorMessage: function() {
        return ERROR_MESSAGE;
    }

});

UserStore.dispatchToken = AppDispatcher.register(function(payload) {
    var action = payload.action;
    switch(action.type) {

    case UserConstants.RECEIVE_USER_MANAGEMENT_ERRORS:
        console.log('----RECEIVE_USER_MANAGEMENT_ERRORS----',action)
        ERROR_MESSAGE = action.data[0]
        UserStore.emitChange();
        break;

    case UserConstants.SET_SESSION_USER:
        console.log('set session user',action)
        if(action.user){
          SESSION_USER = action.user;
          UserStore.emitChange();
        }
        break;

    case UserConstants.GET_ALL_USERS:
        USERS = action.users;
        UserStore.emitChange();
        break;

    case UserConstants.RECEIVE_USERS:
      console.log('RECEIVE_USERS',action, USERS.length)

        action.data.forEach(function(d){
          var updateIndex = USERS.map(function(u) { return u.id}).indexOf(d.id)
          if(SESSION_USER.agency && SESSION_USER.agency[0] && !d.agency){
            d.agency = [SESSION_USER.agency[0]]
          }
          if(updateIndex === -1){
            USERS.push(d);  
          }else{
            console.log('update',updateIndex)
            USERS[updateIndex] = d;
            EDIT_TARGET = null;
          }
        })
        console.log('new users update',USERS.length)
        UserStore.emitChange();
        break;

    case UserConstants.SET_EDIT_TARGET:
        EDIT_TARGET = action.user;
        UserStore.emitChange();
        break;

    case UserConstants.DELETE_USER:
        USERS = USERS.filter(function(d) { return d.id != action.user.id; });
        EDIT_TARGET = null;
        UserStore.emitChange();
        break;

    case UserConstants.CREATE_USER:
        USERS.push(action.user);
        EDIT_TARGET = null;
        UserStore.emitChange();
        break;

    case UserConstants.UPDATE_USER:
        USERS = USERS.filter(function(d) { return d.id != action.user.id; });
        USERS.push(action.user);
        EDIT_TARGET = action.user;
        UserStore.emitChange();
        break;
  }

});

module.exports = UserStore;
