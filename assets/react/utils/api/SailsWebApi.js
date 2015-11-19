
'use strict';
/*
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 *.
 */

//var io =                    require('./sails.io.js')();
var ServerActionCreators =    require('../../actions/ServerActionsCreator'),
    ClientActionCreators =    require('../../actions/ClientActionsCreator'),
    d3 =                      require('d3'),
    fips2state =              require('../data/fips2state');


function listenToSockets(sessionUser){
  
  var io = require('./sails.io.js')();

  io.socket.on("job_created", function(e){
    console.log('job_created',e)
    ServerActionCreators.receiveData('job',[e])
  });

  io.socket.on("job_updated", function(e){
    console.log('job_updated',e)
    ServerActionCreators.receiveData('job',e)
  });

}  

var api = {

  initAdmin: function(user,agencyId,fips){

    ServerActionCreators.setAppSection('admin');
    ServerActionCreators.setSessionUser(user);
    ClientActionCreators.setSelectedAgency(agencyId)
    ClientActionCreators.setSelectedState(fips);


    this.read('user');
    this.read('agency');
    this.readStations();
    listenToSockets();
    
  
  },
  //--------------------------------------------------
  // Set Session Database
  //--------------------------------------------------
  setDatasource:function(agencyId){
    d3.json('/database/set/'+agencyId,function(err,data){
      if(err){ console.log('setDatasource error:',err)}
      console.log('setDatasource',data)
    })
  },
  //--------------------------------------------------
  // Class Data Routes
  //--------------------------------------------------
  


  getDataOverview : function(agency){
    
    d3.json('/data/overview/'+agency.datasource+'/class',function(err,data){
        ServerActionCreators.getDataOverview(data,agency.id,'class')
    })

    d3.json('/data/overview/'+agency.datasource+'/wim',function(err,data){
        ServerActionCreators.getDataOverview(data,agency.id,'wim')
    })
  
  },

  getDataOverviewDay : function(agency){
    
    d3.json('/data/overview/day/'+agency.datasource+'/class',function(err,data){
      ServerActionCreators.getDataOverviewDay(data,agency.id,'class')
    })

    d3.json('/data/overview/day/'+agency.datasource+'/wim',function(err,data){
        ServerActionCreators.getDataOverviewDay(data,agency.id,'wim')
    })
  
  },
  
  //---------------------------------------------------
  // HPMS Data Routes
  //---------------------------------------------------
  getHpms : function(fips){
    var state = fips2state[fips].name.replace(/\s/g,'').toLowerCase()+'2012';
    d3.json('/hpms/'+state,function(err,data){
      console.log('get HPMS',data.length)
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
    d3.json('/'+type).post(JSON.stringify(data),function(err,resData){
      //ToDo Check for Errors and Throw Error Case
      //console.log('utils/sailsWebApi/createUser',resData);
      //add new user back to store through 
      ServerActionCreators.receiveData(type,[resData]);
    });
  },
  
  read: function(type,filter) {
    
    var where = ''
    if(filter){ 
      where = '/?'+getAsUriParameters(filter); 
    }
    if(filter && filter.type === 'where'){
      where = '/?where='+filter.where;
    }
    
    d3.json('/'+type+where,function(err,data){     
      if(! (data instanceof Array)){
        data = [data];
      }
      //console.log('READS',type,where,data.length);
    
      //onsole.log('got data','/'+type+where,loadChildren,data)

     
      if( type.indexOf('/') >= 0){
        type = type.split('/')[0]
      }
      ServerActionCreators.receiveData(type,data);

    });
  
  },


  update: function(type,data){
    d3.json('/'+type+'/'+data.id)
    .send('PUT',JSON.stringify(data),function(err,resData){
      //ToDo Check for Errors and Throw Error Case
      console.log('utils/sailsWebApi/updateData',resData);

      //add new user back to store through 
      ServerActionCreators.receiveData(type,[resData]);
    });
  },

  delete: function(type,id){
    d3.json('/'+type+'/'+id)
    .send('DELETE',function(err,resData){
      //ToDo Check for Errors and Throw Error Case
      console.log('utils/sailsWebApi/delete',resData,id);

      //Delete 
      ServerActionCreators.deleteData(type,id);
    });
  }


};
//console.log('this is my sailsWebApi',api);
module.exports = api;

function getAsUriParameters (data) {
  return Object.keys(data).map(function (k) {
    if ( data[k] instanceof Array ) {
      var keyE = encodeURIComponent(k + '[]');
      return data[k].map(function (subData) {
        return keyE + '=' + encodeURIComponent(subData);
      }).join('&');
    } else {
      return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
    }
  }).join('&');
};
