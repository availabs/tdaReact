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
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange);


var removeLabels = function(){
    d3.selectAll('#adtchart svg .nv-x .tick text').text('')
}

var GraphContainer = React.createClass({

    
    getDefaultProps:function(){
        return {
            height: 300,
            classByMonth:StateWideStore.getClassByMonth()
        }
    },


    _updateGraph: function(){
        var scope = this;
        

        if(Object.keys(scope.props.classByMonth.getDimensions()).length > 0){


            var stationADT = scope.props.classByMonth.getGroups()
                .ADT.order(function(p){return p.classAvg.reduce( function(a,b){ return a+b}) })
                .top(Infinity)
                .filter(function(p){ 
                    var value = p.value.classAvg.reduce( function(a,b){ return a+b});
                    return !isNaN(value) && value > 0;
                });

           // console.log(
           //      'update graph',
           //      stationADT
           //  )

            AdtScale.domain(stationADT.map(function(ADT){
                return ADT.value.classAvg.reduce( function(a,b){ return a+b});
            }));
            //console.log('draw graph');
            //var colorScale = d3.scale.quantile
            nv.addGraph(function() {
                var chart = nv.models.discreteBarChart()
                  .x(function(d) { return d.label })    //Specify the data accessors.
                  .y(function(d) { return d.value })
                  .staggerLabels(false)    //Too many bars and not enough room? Try staggering labels.
                  .tooltips(true)        //Don't show tooltips
                  .showValues(false)       //...instead, show the bar value right on top of each bar.
                  .transitionDuration(350)
                  .showXAxis(true);

                chart.xAxis     //Chart x-axis settings
                    .axisLabel('Stations')
                    

                
                d3.select('#adtchart svg')
                    .datum(
                        [{
                            key:"ADT",
                            values:scope.props.classByMonth.getGroups()
                                .ADT
                                .top(Infinity)
                                .filter(function(p){ 
                                    var value = p.value.classAvg.reduce( function(a,b){ return a+b});
                                    return !isNaN(value) && value > 0;
                                })
                                .sort(function(a,b){
                                    return b.value.classAvg.reduce( function(a,b){ return a+b})-a.value.classAvg.reduce( function(a,b){ return a+b});
                                })
                                .map(function (ADT){
                                    return {
                                        "label":ADT.key,
                                        "value":ADT.value.classAvg.reduce( function(a,b){ return a+b}),
                                        "color":AdtScale(ADT.value.classAvg.reduce( function(a,b){ return a+b}))
                                    }
                                })
                        }]
                    )
                    .call(chart);
                removeLabels();
                nv.utils.windowResize(chart.update);
                nv.utils.windowResize(removeLabels);
                
                return chart;
            });
            
       }
       
    },
    render: function() {
        var scope = this;
        this._updateGraph();
        var svgStyle = {
          height: this.props.height+'px',
          width: '100%'
        },
        headerStyle = {
            backgroundColor:'none',
            width:'100%',
            padding:'5px',
            marginLeft:'-10px',
            fontWeight:'700',
            display: Object.keys(scope.props.classByMonth.getDimensions()).length > 0 ? 'block' : 'none'
        }

        var title = 'Annual Average Daily Traffic';
        
        return (
        	<section className="widget large" style={{ background:'none'}}>
                <header>
                    <h4 style={headerStyle}>
                        {title}
                    </h4>
                    
                </header>
                <div className="body">
                    <div id="adtchart">
                        <svg style={svgStyle}></svg>
                    </div>
                </div>
            </section>
        );
    }
});

module.exports = GraphContainer;