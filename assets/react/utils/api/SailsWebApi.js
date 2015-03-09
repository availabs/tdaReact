'use strict';
/*
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 *.
 */

//var io =                    require('./sails.io.js')();
var ServerActionCreators =    require('../../actions/ServerActionsCreator'),
    d3 =                      require('d3'),
    fips2state =              require('../data/fips2state'),
    AgencyStore =             require('../../stores/AgencyStore');
    

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
    var url = '/tmgClass/byDay';
    var postData = {database:AgencyStore.getSelectedAgency().datasource,fips:fips};
    d3.json(url).post(JSON.stringify(postData),function(err,data){
     ServerActionCreators.getClassByDay(data,fips);
    });

  },
  getClassByMonth : function(fips){
    if(!AgencyStore.getSelectedAgency()){
      console.log('Error: No Agency Datasource Selected');
      return []
    }
    var postData ={database:AgencyStore.getSelectedAgency().datasource,fips:fips};
    d3.json('/tmgClass/byMonth').post(JSON.stringify(postData),function(err,data){
      ServerActionCreators.getClassByMonth(data,fips);
    });
  },
  
  //---------------------------------------------------
  // HPMS Data Routes
  //---------------------------------------------------
  getHpms : function(fips){
    console.log('SAILSWEBAPI / getHpms',fips)
    var state = fips2state[fips].name.replace(/\s/g,'').toLowerCase()+'2012';
    d3.json('/hpms/'+state,function(err,data){
      ServerActionCreators.getHpms(data,fips);
    });
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
    d3.xhr('/'+type).post(JSON.stringify(data),function(err,resData){
      //ToDo Check for Errors and Throw Error Case
      //console.log('utils/sailsWebApi/createUser',resData);
      //add new user back to store through 
      ServerActionCreators.receiveData(type,[resData]);
    });
  },
  
  read: function(type) {
    d3.json('/'+type,function(err,data){     
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
