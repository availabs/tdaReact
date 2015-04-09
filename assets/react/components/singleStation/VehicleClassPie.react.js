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
    COLOR_VALUES = [$red, $orange, $green, $blue, $teal, $redDark],

    //actions
    ClientActionsCreator = require('../../actions/ClientActionsCreator');



var VehicleClassPie = React.createClass({
	
    getDefaultProps:function(){
      return {
          height:200
      }
    },

    processData:function() {
		var scope = this;  
        var classGrouping = 'classGroupSum'
        if(scope.props.stationData.initialized()){
            
            return scope.props.stationData.getGroup(classGrouping).top(Infinity).map(function(vclass,i){
               
                return {
                    key:vclass.key,
                    color:COLOR_VALUES[i],
                    value: vclass.value
                }
            
            }).sort(function(a,b){
                return a.key.split(' ')[0] - b.key.split(' ')[0];
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
                        .color(COLOR_VALUES)
                        .showLegend(false)
                        .showLabels(false)
                        .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
                        .margin({top: -20, right: 0, bottom: -5, left: 0});
                    chart.pie.margin({top: 10, bottom: -20});


                    d3.select('#VehicleClassPie svg')
                        .datum(scope.processData().map(function(d){
                            if( scope.props.filters.classGroups.indexOf(d.key) > -1){
                                d.value = 0;
                            }
                            return d; 
                        }))
                        .call(chart);

                    nv.utils.windowResize(chart.update);
                })
        }
    },

    renderFooter:function(){
        var scope = this,
            feet = <span />
        if(scope.props.stationData.initialized()){
            var total = this.processData().reduce(function(a,b){
                
                return  a +b.value;
            },0)
            var feet = this.processData().map(function(val,i){
                var controlStyle={
                    'borderTopWidth': '3px',
                    'borderTopStyle': 'solid',
                    'borderTopColor': scope.props.filters.classGroups.indexOf(val.key) === -1 ? COLOR_VALUES[i] : '#fff',
                    'width':'29%'
                };
                return(
                    <div className="control" style={controlStyle}  onClick={ClientActionsCreator.filterClassGroup.bind(this, val.key)}>
                        <div className="key">{val.key}</div>
                        <div className="value">{ ((+val.value/+total)*100).toFixed(1)}%</div>
                    </div>
                )
            })
        }

        return (
            <footer id="data-chart-footer" className="pie-chart-footer">
                <div className="controls">
                    {feet}
                </div>
            </footer>

        )
    },
    
    render:function(){
      	var scope = this;
    	var svgStyle = {
          height: '100%',
          width: '100%'
        },
        
        titleStyle = {
            'left': '114.5px',
            'top': '84px'
        };
         console.log('render pie',this.processData(),this.props.stationData)
        this.renderGraph();
      	// <div className="visits">15866<br/> visits </div>
    	return(
    		<section className="widget large">
                <header>
                    <h4><i className="fa fa-home"></i> Class Group by %</h4>
                </header>
                <div className="body">
                    <div id="VehicleClassPie" className="chart pie-chart">
                            <svg style={svgStyle}/>
                        <div className="total" style={titleStyle}>
                           
                        </div>
                    </div>
                </div>
                {this.renderFooter()}
            </section>	
    	)
    },

  
});

module.exports = VehicleClassPie;