'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    nv = require('../../../utils/dependencies/nvd3'), 
    fips2state = require('../../../utils/data/fips2state'),

    //-- Stores
    StateWideStore = require('../../../stores/StatewideStore'),

    //-- Utils
    colorRange = colorbrewer.RdBu[5],
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange),
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

var GraphContainer = React.createClass({
    
    getDefaultProps:function(){
        return {
            height: 300,
            classByMonth:StateWideStore.getClassByMonth(),
            graphType:'count',
            index:0
        }
    },
    
    _updateGraph: function(){
        var scope = this;
        if(Object.keys(this.props.classByMonth.getDimensions()).length > 0){

            var stationADT = scope.props.classByMonth.getGroups()
                .ADT.order(function(p){return p.avg})
                .top(Infinity)

             var data = scope.props.classByMonth.getGroups()
                    .ADT.order(function(p){return p.avg || 0})
                    .top(Infinity)
                    .filter(function(p){ 
                        return p.value.avg && !isNaN(p.value.avg);
                    })
                    .map(function(p,i){
                        if(p.value.monthAvg.length > 12){
                            p.value.monthAvg =  p.value.monthAvg.filter(function(d,i){
                                return i < 12 && !isNaN(d);
                            })
                        }
                        return p.value.monthAvg.reduce(function(a,b){ return a+b})
                    });
                   
            // console.log(
            //     'update graph',
            //     stationADT
            // )

            AdtScale.domain(stationADT.map(function(ADT){
                return ADT.value.avg;
            }));
            //var colorScale = d3.scale.quantile
            nv.addGraph(function() {
                var chart = nv.models.lineChart()
                  .x(function(d) { return d.month })    //Specify the data accessors.
                  .y(function(d) { return d.y })
                  .showLegend(false)
                  .useInteractiveGuideline(false)       //Don't show tooltips
                  .transitionDuration(350)
                  .showXAxis(true);

                chart.xAxis     //Chart x-axis settings
                    .axisLabel('Months')
                    .tickFormat(function(d){
                        return months[d];
                    })
               


                
                d3.select('#madtchart_'+scope.props.index+' svg')
                    .datum(
                        
                            
                            scope.props.classByMonth.getGroups()
                            .ADT.order(function(p){return p.avg})
                            .top(Infinity)
                            .filter(function(d){ 
                                return d.value.avg  
                            })
                            .map(function (ADT){
                                return {
                                    "key":(ADT.key),
                                    "values":ADT.value.monthAvg.map(function(d,i){ 
                                        var value = d.reduce(function(a,b){ return a+b}) || 0;
                                        if(scope.props.graphType === 'season'){
                                            value = value / ADT.value.classAvg.reduce( function(a,b){ return a+b})
                                        }
                                        if(value === Infinity){
                                            value = 0
                                        }
                                        return {month:i,y:value}
                                    }),
                                    "color":AdtScale(ADT.value.avg || 0)
                                }
                            })
                        
                    )
                    .call(chart);

                nv.utils.windowResize(chart.update);

                return chart;
            });
       }
    },

    render: function() {
        var scope = this;
        var svgStyle = {
          height: '300px',
          width: '100%'
        };
        var widgetStyle = {
            background:'none'
        }
        this._updateGraph();
        
        var id = "madtchart_"+this.props.index;
        var headerStyle = {
            backgroundColor:'none',
            width:'100%',
            padding:'5px',
            marginLeft:'-10px',
            fontWeight:'700',
            display: Object.keys(scope.props.classByMonth.getDimensions()).length > 0 ? 'block' : 'none'
        }

        var title = this.props.graphType === 'count' ?  ' Monthly Average Daily Traffic' : ' Seasonal Adjustment Factor (MADT / AADT) ';
        
        return (
        	<section className="widget large" style={{ background:'none'}}>
                <header>
                    <h4 style={headerStyle}>
                        {title}
                    </h4>
                    
                </header>
                <div className="body">
                    <div id={id} >
                        <svg style={svgStyle}></svg>
                    </div>
                </div>
            </section>
        );
    }
});

module.exports = GraphContainer;