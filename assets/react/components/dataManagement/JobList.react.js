var React = require('react');


var JobList = React.createClass({
    
    getInitialState:function(){
        return{
             finishedJobs:[]
        }
    },

    componentWillReceiveProps:function(nextProps){
        //-----------------------------------------
        // OQ : should this filter for active jobs?
        //-----------------------------------------
        var scope = this, 
            finishedJobs = this.state.finishedJobs;


        var activeIds = this.props.activeJobs.map(function(d){
            return d.id;
        })
        
        var newIds = nextProps.activeJobs.map(function(d){
            return d.id;
        })
        
        activeIds.forEach(function(d,i){
            if(newIds.indexOf(d) == -1){
                finishedJobs.push(scope.props.activeJobs[i])
            }   
        })
        this.setState({finishedJobs:finishedJobs})

    },
    
    _removeFinished:function(e){
        //console.log(e.target.getAttribute('value'))
        var spliceIndex = e.target.getAttribute('value');
        var finishedJobs = this.state.finishedJobs;
        //finishedJobs.splice(spliceIndex,1);
        //this.setState({finishedJobs:finishedJobs})

    },

    render: function() {
        var scope = this;
        var JobList = this.props.activeJobs.map(function(job,i){
            var progressStyle = {width: job.progress+'%'}
            var progress = '';
            if(+job.progress > 0){
                progress = job.progress+"%"
            }
            var showClose = <span />
            if(job.isFinished){
                showClose = <a className="close" onClick={scope._removeFinished} value={i}>×</a>;
            }
            return (
                <div className="alert fade in" key={job.id}>
                    {showClose}
                    <span className="fw-semi-bold">{job.type} {progress}
                    </span> <br/>
                    <div className="progress progress-xs mt-xs mb-0">
                        <div className="progress-bar progress-bar-gray-light" style={progressStyle}></div>
                    </div>
                    <small>
                    {job.filename} <br/>
                    Status:{job.status}
                    </small>
                </div>
            )
        });

        var FinishedList = this.state.finishedJobs.map(function(job,i){
            var progressStyle = {width: job.progress+'%'}
            var index = i;
            return (
                <div className="alert fade in" key={job.id}>
                    <a className="close" onClick={scope._removeFinished} value={index}>×</a>
                    <span className="text-white fw-semi-bold">{job.type}</span> <br/>
                    <div className="progress progress-xs mt-xs mb-0">
                        <div className="progress-bar progress-bar-gray-light" style={progressStyle}></div>
                    </div>
                    <small>
                        Status:Finished {i}<br/>
                        {job.filename}
                    </small>
                </div>
            )
        });

        return (
            <div className="sidebar-alerts">
                
                {FinishedList}
                {JobList}
            
            </div>
        );
    }
});

module.exports = JobList;

