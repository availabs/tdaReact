'use strict';

var React = require('react'),
   
    // -- Utils
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    colorRange = colorbrewer.Paired[12],
    nv = require('../../utils/dependencies/nvd3.js');




var VehicleClassPie = React.createClass({
	
    getDefaultProps:function(){
      return {
          height:200
      }
    },
    processData:function() {
		var scope = this;  
        if(scope.props.stationData.initialized()){
            
            return scope.props.stationData.getGroup('classSum').top(Infinity).map(function(vclass,i){
               
                return {
                    key:'Class '+vclass.key,
                    value: vclass.value
                }
            
            }).sort(function(a,b){
                return a.key.split(' ')[1] - b.key.split(' ')[1];
            });
            
        }
        return [];
		
	},
    renderGraph:function(){
        var scope = this;
        if(scope.props.stationData.initialized){
            nv.addGraph(function(){
                    var chart = nv.models.pieChart()
                        .x(function(d) { return d.key })
                        .y(function(d) { return d.value })
                        .showLegend(false)
                        .showLabels(true)
                        .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
                        .donutRatio(0.35);


                    d3.select('#VehicleClassPie svg')
                        .datum(scope.processData())
                        .call(chart);

                    nv.utils.windowResize(chart.update);
                })
        }
    },

    render:function(){
      console.log('render pie',this.processData(),this.props.stationData)
    	var scope = this;
    	var svgStyle = {
          height: this.props.height+'px',
          width: '100%'
        }
        this.renderGraph();
      	
    	return(
    		<div id="VehicleClassPie">
                <h4 style={{color:'#000',textAlign:'center'}}>
                 Vehicle Class Makeup
                </h4>
    			<svg style={svgStyle}/>
                
    		</div>	
    	)
    }
});

module.exports = VehicleClassPie;