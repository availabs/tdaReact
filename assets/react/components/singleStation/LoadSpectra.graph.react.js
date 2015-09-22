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




var SpectraGraph = React.createClass({
	
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
        if(nextProps.fips+''+nextProps.selectedStation !== this.props.fips+''+this.props.selectedStation){
           
        }
    },

    _loadData:function(fips,stationId){
        var scope = this;
        if(stationId){
            //var filters = getAsUriParameters(scope.props.filters)
            //console.log('filters',scope.props.filters)
            console.log('loadspectra','/tmgWim/'+fips+'/'+stationId+'?database=allWim');
            scope.setState({loading:true})
            d3.json('/tmgWim/'+fips+'/'+stationId+'?database=allWim')
              .post(JSON.stringify({filters:scope.props.filters}),function(err,data){
                if(err){
                    console.log('loading load spectra err',err)
                }
                if(data.loading){
                    console.log(' LS reloading')
                    setTimeout(function(){ scope._loadData(fips,stationId) }, 2000);
                    
                
                }else{
                    console.log('ls data',data)
                    scope.setState({
                        currentData:data,
                        loading:false
                    })
                }
            })
        }
         
    },
    
    processData:function(){
        var scope = this;
        var curData = this.state.currentData;
        if(scope.props.filters.class){
            curData = curData.filter(function(d){
                return d.class == scope.props.filters.class
            })
        }
        var pairs = curData.reduce(function(prev,next){
            if(!prev[next.weight]){

                prev[next.weight] = 0
            }
            prev[next.weight] += parseInt(next.amount);
            return prev
        },{})
        var dataArray = Object.keys(pairs).map(function(d){
            return {key:d, value:pairs[d]}
        }).filter(function(ds){
            return ds.key < 500
        })

        return [{"key": "Spectra",values:dataArray}]  
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
                .axisLabel('Tons')
                .tickFormat(function(d){
                    return parseInt(d*220.462);
                })

            d3.select('#SpectraGraph svg')
                .datum(scope.processData())
                .call(chart);  
        
            nv.utils.windowResize(chart.update);
        })
        
    },

    componentDidUpdate:function(){
        if(!this.state.loading){
            //console.log('render spectra graph',this.state.currentData,this.processData())
            this.renderGraph();
        }
    },

    render:function(){
      	var scope = this;
    	var svgStyle = {
          height: '100%',
          width: '100%'
        }
        var svg = <svg style={svgStyle}/>
        if(this.state.loading){
           
            svg = <div style={{height:'256px',margin:'0 auto'}}>Loading {this.props.selectedStation}</div> 
            
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
                    <h4><i className="fa fa-bar-chart-o"></i> Load Spectra {timeFor}
                        <small  className="hidden-xs"></small>
                    </h4>
                </header>
                <div id="SpectraGraph" className="body chart">
                   {svg}
                </div>
            </section>
    		
    	)
    }
});

module.exports = SpectraGraph;