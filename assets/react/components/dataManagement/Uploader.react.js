
'use strict';

var React = require('react'),
    request = require('superagent'),
    
    // -- components 
    Dropzone = require('react-dropzone'),
    JobList = require('./JobList.react');
    
    // -- stores
   

    // -- actions
    


var Upload = React.createClass({
   
    uploadStarted: function(err,data){
        console.log('upload started',err,data);
    },

    onDrop: function(files){
        var scope = this;
        if(files && files.length > 0){
            
            files.forEach( function (file){
                
                var req = request.post('/upload/'+scope.props.currentAgency.datasource)  
                    .attach('file', file, file.name)
                    .end(scope.uploadStarted)
                    .on('progress', function(e) {
                        console.log('Percentage done: ', e.percent);
                    });
            
            });
            
        }
    },
    
    render: function() {
        
        console.log('datasource overview',this.props.currentAgency);

        return (
            <div>
                <Dropzone onDrop={this.onDrop} size="100%">
                  <div style={{fontSize:'12px'}}>Drop Files here or Click to Upload.</div>
                </Dropzone>
                <div>
                    <JobList activeJobs={this.props.activeJobs} />
                </div>
            </div>
           
        );
    },


});

module.exports = Upload;