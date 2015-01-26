'use strict';
/*
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 *.
 */

var io = require('./sails.io.js')(),
  ServerActionCreators = require('../../actions/ServerActionsCreator'),
  d3 = require('d3'),

  AgencyStore = require('../../stores/AgencyStore');
    

module.exports = {

  initAdmin: function(user){

    ServerActionCreators.setAppSection('admin');
    ServerActionCreators.setSessionUser(user);

    this.read('user');
    this.read('agency');
    this.readStations();
    
  
  },
  //--------------------------------------------------
  // Class Data Routes
  //--------------------------------------------------
  getClassByDay : function(fips){
    if(!AgencyStore.getSelectedAgency()){
      console.log('Error: No Agency Datasource Selected');
      return []
    }

    io.socket.post('/tmgClass/byDay',{database:AgencyStore.getSelectedAgency().datasource,fips:fips},function(data){
      ServerActionCreators.getClassByDay(data,fips);
    })
  },

  //---------------------------------------------------
  //  Get GeoJson
  //---------------------------------------------------
  readStations : function(){
    d3.json('/geo/stations.json',function(resdata){
      ServerActionCreators.receiveData('station',resdata)
    })
  },

  //---------------------------------------------------
  // Sails Rest Route
  //---------------------------------------------------
  create: function(type,data){
    io.socket.post('/'+type,data,function(resData){
      //ToDo Check for Errors and Throw Error Case
      console.log('utils/sailsWebApi/createUser',resData);

      //add new user back to store through 
      ServerActionCreators.receiveData(type,[resData]);
    });
  },
  
  read: function(type) {
    io.socket.get('/'+type,function(data){     
      //console.log('utils/sailsWebApi/getUsers',data);
      ServerActionCreators.receiveData(type,data);
    });
  },


  update: function(type,data){
    io.socket.put('/'+type+'/'+data.id,data,function(resData){
      //ToDo Check for Errors and Throw Error Case
      console.log('utils/sailsWebApi/updateData',resData);

      //add new user back to store through 
      ServerActionCreators.receiveData(type,[resData]);
    });
  },

  delete: function(type,id){
    io.socket.delete('/'+type+'/'+id,function(resData){
      //ToDo Check for Errors and Throw Error Case
      console.log('utils/sailsWebApi/delete',resData,id);

      //Delete 
      ServerActionCreators.deleteData(type,id);
    });
  }


};
