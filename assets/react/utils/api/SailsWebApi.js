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

  initAdmin: function(user){

    ServerActionCreators.setAppSection('admin');
    ServerActionCreators.setSessionUser(user);

    this.read('user');
    this.read('agency');
    this.readStations();
    listenToSockets();
    
  
  },
  //--------------------------------------------------
  // Class Data Routes
  //--------------------------------------------------
  
  getClassByDay : function(fips,agency){
    if(!agency){
      return []
    }
    var url = '/tmgClass/byDay';
    var postData = {database:agency.datasource,fips:fips};
    d3.json(url).post(JSON.stringify(postData),function(err,data){
     ServerActionCreators.getClassByDay(data,fips);
    });

  },

  getClassByMonth : function(fips,agency){
    if(!agency){
      //console.log('Error: No Agency Datasource Selected');
      return []
    }
    var postData ={database:agency.datasource,fips:fips};
    d3.json('/tmgClass/byMonth').post(JSON.stringify(postData),function(err,data){
      ServerActionCreators.getClassByMonth(data,fips);
    });
  },

  getClassByHour : function(stationId,fips,agency){
    if(!agency){
      return []
    }

    var postData ={database:agency.datasource,stationId:stationId,fips:fips};
    d3.json('/tmgClass/byHour').post(JSON.stringify(postData),function(err,data){
      if(err){console.log('classbyHour error',err)}
      //console.log('getClassByHour',data)
      ServerActionCreators.getClassByHour(data,stationId,fips);
    });
  },

  getDataOverview : function(agency){
    
    d3.json('/data/overview/'+agency.datasource+'/class',function(err,data){
        ServerActionCreators.getDataOverview(data,agency.id,'class')
    })

    d3.json('/data/overview/'+agency.datasource+'/wim',function(err,data){
        ServerActionCreators.getDataOverview(data,agency.id,'wim')
    })
  
  },
  
  //---------------------------------------------------
  // HPMS Data Routes
  //---------------------------------------------------
  getHpms : function(fips){
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
    d3.json('/'+type).post(JSON.stringify(data),function(err,resData){
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
console.log('this is my sailsWebApi',api);
module.exports = api;