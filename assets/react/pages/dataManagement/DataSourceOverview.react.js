
'use strict';

var React = require('react'),
    Router = require('react-router'),

    
    // -- components 
    Uploader = require('../../components/dataManagement/Uploader.react'),
    CalendarGraph = require('../../components/dataManagement/calendarGraph.react'),
    DataTable = require('../../components/utils/DataTable.react'),
    
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
        var scope = this,
            Years = {};
        
        function getYear(year){
            
            if(year.length  == 2){
                    year = parseInt('20'+year)
                }
            if(year.length == 1){
                year = parseInt('200'+year)
            }
            return year;
        }

        function getTime(time){
          
             if(time.length == 1){
                time = '0'+time
            }
            return time;
        }

        if(this.props.agencyOverview[type]){
           
            this.props.agencyOverview[type].forEach(function(d,i){
                if(d.year != 'null'){
                    if(!Years[d.year]){ Years[d.year] = 0};
                    Years[d.year]++;
                }
            })

        }
        
        var yearsArray = {};
        
        if(this.props.agencyOverviewDay[type]){
            //console.log('Day data',this.props.agencyOverviewDay[type])
             Object.keys(Years).forEach(function(year){
                if(year != 'null'){
                    var yearData = {};
                    var yearDays = scope.props.agencyOverviewDay[type].filter(function(d){
                        return d.year === year;
                    });

                    yearDays.forEach(function(day){
                        yearData[getYear(day.year)+'-'+getTime(day.month)+'-'+getTime(day.day)] = parseInt(day.f0_);
                    });

                    yearsArray[year] = yearData;

                }
            })
        }
       
        
        //console.log('yearsArray',type,yearsArray);

        var rows = Object.keys(Years).map(function(key){
            if(key != 'null'){
                var graphId = 'cg'+type+key;
                var year = getYear(key);
                //console.log('write row',yearsArray[key])
                return (
                    <tr>
                        <td> 
                            <CalendarGraph divId={graphId} year={year} data={ yearsArray[key] }/>
                            {'Total Active Stations: '+Years[key]}
                        </td>
                    </tr>
                )
            }
        })
        
        return (
             <div className='col-md-6'>
                <h4>{type.toUpperCase()} Stations</h4>
                <table className='table'>
                    <thead>
                        <tr>
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
        
        //console.log('datasource overview',this.props.agencyOverview);

        return (
            <div className="content container">
                <h2 className="page-title" style={{color:'#000'}}>
                    {this.props.currentAgency.name}
                    <small> Data Management</small>
                </h2>
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
                        <section className="widget whitesmoke">
                            
                            <div className="body">
                                <section className="widget">
                                    <header>
                                        <h4>
                                            Uploads
                                        </h4>
                                        
                                    </header>
                                    <div className="body no-margin">
                                        <DataTable 
                                            data={this.props.uploads.filter(function(d){ return !d.isFinished })} 
                                            pageLength={10}
                                            columns={ [
                                                {key:'filename', name:'Filename'},
                                                {key:'status', name:'Status'}
                                            ]} />
                                        <DataTable 
                                            data={this.props.uploads.filter(function(d){ return d.isFinished })} 
                                            pageLength={10}
                                            columns={ [
                                                {key:'filename', name:'Filename'},
                                                {key:'status', name:'Status'}
                                            ]} />

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