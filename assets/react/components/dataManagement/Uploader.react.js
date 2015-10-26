
'use strict';

var React = require('react'),
    request = require('superagent'),
    
    // -- components 
    Dropzone = require('react-dropzone'),
    JobList = require('./JobList.react');
    
    // -- stores
   

    // -- actions
    


var Upload = React.createClass({
   
    getInitialState: function(){
        return{
            recieved:[]            
        }

    },

    uploadStarted: function(err,data){
        console.log('upload started',err,data);
    },

    onDrop: function(files){
        var scope = this;
        var curState = scope.state;
        if(files && files.length > 0){
            
            files.forEach( function (file){
                curState.recieved.push(file.name);
                var req = request.post('/upload/'+scope.props.currentAgency.datasource)  
                    .attach('file', file, file.name)
                    .end(scope.uploadStarted)
                    .on('progress', function(e) {
                        console.log('Percentage done: ', e.percent);
                    });
            
            });
            if(this.isMounted()){
                scope.setState(curState);               
            }

        }
    },
    
    render: function() {
        
        console.log('datasource overview',this.props.currentAgency);

        var recieved = "";

        var scope = this;

        if(scope.state.recieved.length == 0){
            recieved = "None";
        }
        else if(scope.state.recieved.length == 1){
            recieved = scope.state.recieved[0];
        }
        else{
            scope.state.recieved.forEach(function(fileName,index){
                if(index == scope.state.recieved.length-1){
                    recieved = recieved + fileName;               
                }
                else{
                    recieved = recieved + fileName + ", ";
                }

            })            
        }







        return (
            <div>
                <div style={{fontSize:'12px'}}>Drop Files below or Click to Upload.</div>
                <Dropzone onDrop={this.onDrop} size="100%">
                    <div style={{fontSize:'10px'}}>Upload Here</div>
                </Dropzone>
                <div style={{fontSize:'12px',marginTop:'10px',marginBottom:'10px'}}>
                    Files recieved: {recieved}
                </div>
                <div>
                    <JobList activeJobs={this.props.activeJobs} />
                </div>
            </div>
           
        );
    },


});

module.exports = Upload;