'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    nv = require('../../../utils/dependencies/nvd3'), 

    //-- Stores
    StateWideStore = require('../../../stores/StatewideStore'),

    //-- Utils
    colorRange = colorbrewer.RdBu[5],
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange);

function getStatefromStores(){
    return {
        selectedState : StateWideStore.getSelectedState(),
        classByDay : StateWideStore.getClassByDay()
    }
};

var GraphContainer = React.createClass({
    getInitialState: function() {
        return getStatefromStores();
    },
    
    componentDidMount: function() {

        StateWideStore.addChangeListener(this._onChange);
        
    },
    
    componentWillUnmount: function() {
        StateWideStore.removeChangeListener(this._onChange);
    },
    
    _onChange:function(){
        
        this.setState(getStatefromStores());
        var scope = this;
        this.updateGraph();
    },
    updateGraph: function(){
        var scope = this;
        if(Object.keys(this.state.classByDay.getDimensions()).length > 0){


            var stationADT = scope.state.classByDay.getGroups()
                .ADT.order(function(p){return p.avg})
                .top(Infinity)

            AdtScale.domain(stationADT.map(function(ADT){
                return ADT.value.avg;
            }));
            //console.log('draw graph');
            //var colorScale = d3.scale.quantile
            nv.addGraph(function() {
                var chart = nv.models.discreteBarChart()
                  .x(function(d) { return d.label })    //Specify the data accessors.
                  .y(function(d) { return d.value })
                  .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
                  .tooltips(true)        //Don't show tooltips
                  .showValues(false)       //...instead, show the bar value right on top of each bar.
                  .transitionDuration(350)
                  .showXAxis(false);
                
                d3.select('#adtchart svg')
                    .datum(
                        [{
                            key:"ADT",
                            values:scope.state.classByDay.getGroups()
                            .ADT.order(function(p){return p.avg || 0 })
                            .top(Infinity)
                            .filter(function(p){ 
                                return !isNaN(p.value.avg);
                            })
                            .map(function (ADT){
                                return {
                                    "label":ADT.key,
                                    "value":ADT.value.avg,
                                    "color":AdtScale(ADT.value.avg)
                                }
                            })
                        }]
                    )
                    .call(chart);

                nv.utils.windowResize(chart.update);

                return chart;
            });
       }
    },

    render: function() {
        var svgStyle = {
          height: '300px',
          width: '100%'
        };
        return (
        	<section className="widget large">
                <header>
                    <h4>
                        {this.state.selectedState}
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