'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    nv = require('../../../utils/dependencies/nvd3'), 

    //-- Stores
    HpmsStore = require('../../../stores/HpmsStore'),

    //-- Utils
    colorRange = colorbrewer.RdYlBu[5],
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
                                .map(function (ADT,i){
                                    if(i>0 && i < 30){
                                        return {
                                            "label":ADT.key,
                                            "value":ADT.value,
                                            "color":AdtScale(ADT.value)
                                        }
                                    }
                                    return;
                                })
                                .filter(function(d){ return d; })
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
        var headerStyle = {
            backgroundColor:'none',
            width:'100%',
            padding:'5px',
            marginLeft:'-10px',
            fontWeight:'700',
            display: Object.keys(this.props.hpmsData.getDimensions()).length > 0 ? 'block' : 'none'
        }

        var title = this.props.graphType === 'count' ?  ' Monthly Average Daily Traffic' : ' Seasonal Adjustment Factor (MADT / AADT) ';
        switch(this.props.groupKey) {

            case 'type_vdt':
              title = 'HPMS VMT by Road Type';
            break;

            case 'type_length':
              title = 'HPMS Total Length of Road Type';
            break;

            case 'route_vdt':
              title = 'HPMS VMT by Route';
            break;

            case 'route_length':
              title = 'HPMS Total Length of Route';
            break;

            default:
              // do nothing
          }


        return (
        	<section className="widget large" style={{ background:'none'}}>
                <header>
                    <h4 style={headerStyle}>
                        {title}
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