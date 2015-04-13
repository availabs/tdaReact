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
    processData:function() {
		var scope = this,
            classGrouping = 'classGroup' 
        if(scope.props.stationData.initialized()){
            
            var dailyTraffic = scope.props.stationData.getGroup(classGrouping).top(Infinity).map(function(vclass,i){
                scope.props.stationData.getDimension(classGrouping).filter(vclass.key);
                return scope.props.stationData.getGroup('dir').top(Infinity).map(function(dir,i){
                    scope.props.stationData.getDimension('dir').filter(dir.key);
                    var mult = 1;
                    if(i > 0){
                        mult = -1;
                    }
                    return {
                        key:vclass.key,
                        values: scope.props.stationData.getGroup('average_hourly_traffic').top(Infinity).map(function(time){
                            return {
                                key:time.key,
                                value:time.value.avg*mult
                            }
                        })
                    }
                })
            }).map(function(dirSet,i){
                if(dirSet[1]){
                    dirSet[1].values.forEach(function(d){
                        dirSet[0].values.push(d);
                    })
                }
                //dirSet[0].color = colorRange[i];
                dirSet[0].values.sort(function(a,b){
                    return a.key - b.key;
                });
                
                return dirSet[0];
            }).sort(function(a,b){
                return a.key.split(' ')[0] - b.key.split(' ')[0];
            });
           
           


            return dailyTraffic;
        }
        return [{key:'none',values:[]}]
		
	},
    renderGraph:function(){
        var scope = this;
        if(scope.props.stationData.initialized){
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
                        .datum(scope.processData().map(function(d){
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
        }
    },

    render:function(){
      //console.log('render avg hour graph',this.processData(),this.props.stationData)
    	var scope = this;
    	var svgStyle = {
          height: '100%',
          width: '100%'
        }
        this.renderGraph();
      	
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
                    <svg style={svgStyle}/>
                </div>
            </section>
    		
    	)
    }
});

module.exports = AvgHourGraph;