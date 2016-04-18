
'use strict';

var React = require('react'),
    Router = require('react-router'),
    colorRange =  ["#4575b4", "#91bfdb", "#e0f3f8", "#ffffbf", "#fee090", "#fc8d59", "#d73027"], 
    colorScale = d3.scale.quantile().domain([0,70000]).range(colorRange),
    
    
    // -- components 
    Uploader = require('../../components/dataManagement/Uploader.react'),
    FileList = require('../../components/dataManagement/FileList.react'),
    CalendarGraph = require('../../components/dataManagement/calendarGraph.react'),
    DataTable = require('../../components/utils/DataTable.react'),
    ToolTip = require('../../components/utils/nytToolTip.react'),
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
        var front = '20';
          if(+year > 20){
              front = '19'
          }
          year = parseInt(front+year)
        }
      if(year.length == 1){
        year = parseInt('200'+year)
      }
      return year;
    }

    function getTime(time){
      
      if(time.length == 1){
        time = '0'+time;
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
      var fullDomain = scope.props.agencyOverviewDay[type].map(function(d){ return +d.f0_ })
      var minMaxDomain = [d3.min(fullDomain), d3.max(fullDomain)]
          
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
   
    
    Object.keys(yearsArray)
    var rows = []

    rows =  Object.keys(Years).map(function(key){

        if(key != 'null'){
            var graphId = 'cg'+type+key;
            var year = getYear(key);
            var interactiveFunctions = {
                dayOver:function(yearKey,pos){
                    var scope = this,
                        dayStrings = ['0','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
                        data = yearsArray[key][yearKey];
                   
                    d3.select("#nytg-tooltip").style('top',(pos[1]-10)+"px").style('left',pos[0]+"px").style('display','block')
                    
                    d3.select("#nytg-tooltip .nytg-name").html(
                        key+'<br>'+
                        '<table style="width:100%;">'+
                        '<tr><td style="text-align:left"># Stations Reporting:</td><td style="text-align:right"><strong>'+(data ? data.toLocaleString() : '') +'</strong></td></tr>'+
                        '</table>'
                        
                    )   
                },

                dayMove:function(pos){
                    d3.select("#nytg-tooltip").style('top',(pos[1]-10)+"px").style('left',pos[0]+"px").style('display','block')        
                },

                dayOut:function(e){

                    d3.select("#nytg-tooltip").style('display','none')
                }
            }
            // console.log('-------' + year + '--------')
            // console.log(year,minMaxDomain, colorRange)
            if(year > 1995){
                return (
                    <tr>
                        <td> 
                            <CalendarGraph 
                                divId={graphId} 
                                year={year} 
                                data={ yearsArray[key] }
                                range={ colorRange }
                                domain={ minMaxDomain }
                                dayOver={interactiveFunctions.dayOver}
                                dayOut={interactiveFunctions.dayOut}
                                dayMove={interactiveFunctions.dayMove}
                            />
                            {'Total Active Stations: '+Years[key]}
                        </td>
                    </tr>
                )
            }
        }
    }).filter(function(d){return d})
    
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
                              <div className='row'>
                                <div className='col-xs-6'>
                                  <h4> Class Files </h4>
                                  <FileList type='class' agency={this.props.currentAgency} data={this.props.agencyOverviewFiles} />
                                 
                                </div>
                                <div className='col-xs-6'>
                                  <h4> Wim Files </h4>
                                  <FileList type='wim' agency={this.props.currentAgency} data={this.props.agencyOverviewFiles} />
                                 
                                </div>
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
                <ToolTip />
            </div>
        );
    },


});

module.exports = Overview;