'use strict';

var React = require('react'),
   
    // -- Utils
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    colorRange = colorbrewer.Paired[12],
    nv = require('../../utils/dependencies/nvd3.js'),
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
    COLOR_VALUES = [$green, $teal, $redDark,  $blue, $red, $orange  ];




var RouteTotalGraph = React.createClass({
	
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
      
    },

    _loadData:function(fips,stationId){
        var scope = this;
        if(stationId){
            //var filters = getAsUriParameters(scope.props.filters)
            //console.log('filters',scope.props.filters)
           // console.log('/tmgClass/byHour/station/'+fips+'/'+stationId+'?database=allWim')
            scope.setState({loading:true})
            d3.json('/tmgClass/byHour/station/'+fips+'/'+stationId+'?database=allWim')
              .post(JSON.stringify({filters:scope.props.filters}),function(err,data){
                //console.log('CountbyTime',data)
                if(data.loading){
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
   
    renderGraph:function(timeName){
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
                .showLegend(false);

             chart.xAxis
                .axisLabel(timeName)

            d3.select('#routeTotalGraph svg')
                .datum(scope.state.currentData)
                .call(chart);

         
        
            nv.utils.windowResize(chart.update);
        })
        
    },
    
    componentDidUpdate:function(){
        if(!this.state.loading){
            //console.log('render graph',this.state.currentData)
            this.renderGraph();
        }
    },

    render:function(){
      //console.log('render graph',this.processData(),this.props.stationData)
    	var scope = this;
    	var svgStyle = {
          height: '100%',
          width: '100%'
        };
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
            var yearName = 'All Years'
            if(scope.props.filters.year){ yearName = scope.props.filters.year;}
            timeFor = ' for '+scope.props.filters.month +' '+yearName;
            avg = '';
        }
        this.renderGraph(timeName);


    	return(
    		<section className="widget large" style={{background:'none'}}>
                <header>
                    <h4><i className="fa fa-bar-chart-o"></i> {avg} Daily Traffic by {timeName} {timeFor}
                        <small  className="hidden-xs"></small>
                   
                    </h4>
                </header>
                <div id="routeTotalGraph" className="body chart">
                    {svg}
                </div>
            </section>	
    	)
    }
   
});

module.exports = RouteTotalGraph;

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
