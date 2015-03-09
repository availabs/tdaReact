'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    nv = require('../../../utils/dependencies/nvd3'), 

    //-- Stores
    HpmsStore = require('../../../stores/HpmsStore'),

    //-- Utils
    colorRange = colorbrewer.RdBu[5],
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange);



var GraphContainer = React.createClass({

    
    getDefaultProps:function(){
        return {
            height: 300,
            hpmsData:HpmsStore.getStateData(),
            groupKey:'type_vdt'
        }
    },


    _updateGraph: function(){
        var scope = this;
        
        if(Object.keys(scope.props.hpmsData.getDimensions()).length > 0){

            var stationADT = scope.props.hpmsData.getGroups()[scope.props.groupKey].order(function(p){return p.value})
                .top(Infinity)

            console.log('HpmsType / updateGraph',
                scope.props.hpmsData,
                stationADT
            );
            


            AdtScale.domain(stationADT.map(function(ADT){
                return ADT.value;
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
                
                d3.select("#hpmschart_"+scope.props.groupKey+' svg')
                    .datum(
                        [{
                            key:"type_vdt",
                            values:scope.props.hpmsData.getGroups()[scope.props.groupKey]
                                .top(Infinity)
                                
                                .sort(function(a,b){
                                    return b.value-a.value;
                                })
                                .map(function (ADT){
                                    return {
                                        "label":ADT.key,
                                        "value":ADT.value,
                                        "color":AdtScale(ADT.value)
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
          height: this.props.height+'px',
          width: '100%'
        };
        this._updateGraph();
        var id = "hpmschart_"+this.props.groupKey;
        return (
        	<section className="widget large" style={{ background:'none'}}>
                <header>
                    <h4>
                        {this.props.selectedState}
                    </h4>
                    
                </header>
                <div className="body">
                    <div id={id}>
                        <svg style={svgStyle}></svg>
                    </div>
                </div>
            </section>
        );
    }
});

module.exports = GraphContainer;