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
    COLOR_VALUES = [$red, $orange, $green, $blue, $teal, $redDark];;




var RouteTotalGraph = React.createClass({
	
    getDefaultProps:function(){
      return {
          height:400
      }
    },
    processData:function() {
		var scope = this,
            classGrouping = 'classGroup';

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
                        values: scope.props.stationData.getGroup('average_daily_traffic').top(Infinity).map(function(time){
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
                    return b.key - a.key;
                });
                // if(scope.props.filters.year){
                //     dirSet[0].values = dirSet[0].values.filter(function(d){ return d.key == scope.props.filters.year; })
                // }
                return dirSet[0];
            }).sort(function(a,b){
                return a.key.split(' ')[0] - b.key.split(' ')[0];
            });
           
            if(!scope.props.filters.month){
                      
                dailyTraffic = dailyTraffic.map(function(d){
                    var sums = {}
                    d.values.forEach(function(v){
                        var split = v.key.split('_'),
                            year=split[0],
                            month = split[1],
                            day = split[2],
                            dir = v.value < 0 ? 'one' : 'two',
                            sumKey = year+"_"+dir,
                            valKey = year;

                        if(scope.props.filters.year){
                            sumKey = year+'_'+month+"_"+dir,
                            valKey = month;
                        }  
                      
                        if( !sums[sumKey] ){
                            sums[sumKey] ={key:valKey,sum:0,count:0}
                        }

                        if(v.value > 0 || v.value < 0){
                            sums[sumKey].sum+= v.value || 0;
                            sums[sumKey].count++;
                        }
                        

                    })
                    d.values = Object.keys(sums).map(function(key){
                        sums[key].value = Math.round(sums[key].sum/sums[key].count) || 0;
                        if(isNaN(sums[key].value)){
                            console.log('isNaN',sums,sums[key].value)
                        }
                        return sums[key];
                    }).sort(function(a,b){
                        return +a.key - +b.key
                    })
               
                    return d;
                })
            }else{
                dailyTraffic = dailyTraffic.map(function(d){
                    d.values = d.values.filter(function(v){
                        var split = v.key.split('_');
                        v.key = split[2]
                        return  split[1] == scope.props.filters.month
                    }).sort(function(a,b){
                        return +a.key - +b.key
                    })
                    return d;
                })
            }


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


                    d3.select('#routeTotalGraph svg')
                        .datum(scope.processData().map(function(d){
                            console.log(d);
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
      console.log('render graph',this.processData(),this.props.stationData)
    	var scope = this;
    	var svgStyle = {
          height: this.props.height+'px',
          width: '100%'
        }
        this.renderGraph();
      	
    	return(
    		<div id="routeTotalGraph">
                {this.props.filters}
    			<svg style={svgStyle}/>
                
    		</div>	
    	)
    }
});

module.exports = RouteTotalGraph;