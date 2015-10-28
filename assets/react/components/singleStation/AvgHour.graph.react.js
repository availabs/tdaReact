'use strict';

var React = require('react'),
   
    // -- Utils
    d3 = require('d3'),
    $lime = "#8CBF26",
    $red = "#e5603b",
    $redDark = "#d04f4f",
    $blue = "#6a8da7",
    $green = "#56bc76",
    $orange = "#eac85e",
    $pink = "#E671B8",
    $purple = "#A700AE",
    $brown = "#A05000",
    $teal = "#4ab0ce",
    $gray = "#666",
    $white = "#fff",
    $textColor = $gray,
    COLOR_VALUES = [$green, $teal, $redDark,  $blue, $red, $orange,  ];
    nv = require('../../utils/dependencies/nvd3.js');




var AvgHourGraph = React.createClass({
	
   getDefaultProps:function(){
      return {
          height:400
      }
    },
    getInitialState:function(){
        return {
            toggleChart:false,
            currentData:[],
            loading:true
        }
    },
    
    componentWillReceiveProps:function(nextProps){
        //console.log(nextProps.filters.year,this.props.filters.year,nextProps.filters.year !== this.props.filters.year)
        this._loadData(nextProps.fips,nextProps.selectedStation);
        // if(nextProps.fips+''+nextProps.selectedStation !== this.props.fips+''+this.props.selectedStation){
        //     this._loadData(nextProps.fips,nextProps.selectedStation);
        // }else if(nextProps.filters.year !== this.props.filters.year){
        //     this._loadData(nextProps.fips,nextProps.selectedStation);
        // }
    },

    _loadData:function(fips,stationId){
        var scope = this;
        if(stationId){
            //var filters = getAsUriParameters(scope.props.filters)
            //console.log('filters',scope.props.filters)
            //console.log('avg hour Load data','/tmgClass/avgHour/station/'+fips+'/'+stationId+'?database=allWim');
            scope.setState({loading:true})
            d3.json('/tmgClass/avgHour/station/'+fips+'/'+stationId+'?database=allWim')
              .post(JSON.stringify({filters:scope.props.filters}),function(err,data){
                
                if(data.loading){
                    //console.log('reloading')
                    setTimeout(function(){ scope._loadData(fips,stationId) }, 2000);
                    
                
                }else{
                    
                    scope.setState({
                        currentData:data,
                        loading:false
                    })
                }
            })
        }
         
    },
    renderGraph:function(){
        var scope = this;
        
        nv.addGraph(function(){
            var chart = nv.models.multiBarChart()
                .x(function(d) { return d.key })    //Specify the data accessors.
                .y(function(d) { return d.value })
                .color(COLOR_VALUES)
              //.staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
                .tooltips(true)        //Don't show tooltips
              //.showValues(false)       //...instead, show the bar value right on top of each bar.
                .transitionDuration(350)
                .stacked(true)
                .showControls(false)
                .showLegend(false)  
            
            chart.xAxis
                .axisLabel('Hour')

            d3.select('#AvgHourGraph svg')
                .datum(scope.state.currentData.map(function(d){
                    if( scope.props.filters.classGroups.indexOf(d.key) > -1){
                        d.values = d.values.map(function(v){
                            v.value = 0;
                            return v;
                        })    
                    }
                    
                    return d; 
                }))
                .call(chart);  
        
            nv.utils.windowResize(chart.update);
        })
        
    },
    componentDidUpdate:function(){
        if(!this.state.loading){
            //console.log('render graph',this.state.currentData, d3.select('#AvgHourGraph svg'))
            this.renderGraph();
        }
    },
    render:function(){
      //console.log('render avg hour graph',this.processData(),this.props.stationData)
    	var scope = this;
    	var svgStyle = {
          height: '100%',
          width: '100%'
        }
        var svg = <svg style={svgStyle}/>
        if(this.state.loading){
           
             svg = <div style={{position:'relative',top:'20%',left:'40%',width:'200px'}}>Loading {this.props.selectedStation}<br /> <img src={'/images/loading.gif'} /></div> 
            
        }
        
      	
         var timeName = 'Year',
            timeFor = '',
            avg = 'Average'
        if(scope.props.filters.year){
            timeName = 'Month'
            timeFor = ' for ' +scope.props.filters.year
        }
        if(scope.props.filters.month){
            timeName = 'Day'
            timeFor = ' for '+scope.props.filters.month +' '+scope.props.filters.year;
            avg = '';
        }
    	return(
            <section className="widget large" style={{background:'none'}}>
                <header>
                    <h4><i className="fa fa-bar-chart-o"></i> Average Hourly Traffic {timeFor}
                        <small  className="hidden-xs"></small>
                    </h4>
                </header>
                <div id="AvgHourGraph" className="body chart">
                   {svg}
                </div>
            </section>
    		
    	)
    }
});

module.exports = AvgHourGraph;