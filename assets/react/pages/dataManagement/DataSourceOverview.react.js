
'use strict';

var React = require('react'),
    Router = require('react-router'),

    
    // -- components 
    Uploader = require('../../components/dataManagement/Uploader.react'),
    
    // -- stores
   

    // -- actions
    ClientActionsCreator = require('../../actions/ClientActionsCreator');


var Overview = React.createClass({
    mixins: [Router.State],

    statics: {
        
        willTransitionTo: function (transition, params) {
            
            if(params.agencyId){
               
               ClientActionsCreator.setSelectedAgency(params.agencyId);

            }
        }
    
    },

    renderOverviewDiv:function(type){
        var Years = {}
        if(this.props.agencyOverview[type]){
           
            this.props.agencyOverview[type].forEach(function(d,i){
                if(!Years[d.year]){ Years[d.year] = 0};
                Years[d.year]++;
            })

        }
        
        var rows = Object.keys(Years).map(function(key){
            if(key != 'null'){
                return (
                    <tr><td>{key} </td><td> {Years[key]}</td></tr>
                )
            }
        })
        return (
             <div className='col-md-4'>
                <h4>{type.toUpperCase()} Stations</h4>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Year</th>
                            <th>Active Stations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>

            </div>
        )
    },

    render: function() {
        
        console.log('datasource overview',this.props.agencyOverview);

        return (
            <div className="content container">
                <h2 className="page-title" style={{color:'#000'}}>{this.props.currentAgency.name}<small> Data Management</small></h2>
                <div className="row">
                    <div className="col-lg-8">
                        <section className="widget whitesmoke">
                            
                            <div className="body">
                               <div className='row'>

                                    {this.renderOverviewDiv('class')}
                                    {this.renderOverviewDiv('wim')}
                               
                               </div>
                            </div>
                        </section>                        
                    </div>
                    <div className="col-lg-4">
                        <section className="widget whitesmoke">
                            
                            <div className="body">
                                <section className="widget">
                                    <header>
                                        <h4>
                                            Upload New Data
                                        </h4>
                                        
                                    </header>
                                    <div className="body no-margin">
                                        <Uploader currentAgency = {this.props.currentAgency} activeJobs={this.props.activeJobs}/>
                                    </div>
                                </section>
                            </div>
                        </section> 
                    </div>
                </div>
            </div>
        );
    },


});

module.exports = Overview;