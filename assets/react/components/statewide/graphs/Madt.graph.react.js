'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    nv = require('../../../utils/dependencies/nvd3'), 
    fips2state = require('../../../utils/data/fips2state'),

    //-- Stores

    //-- Utils
    colorRange = colorbrewer.RdBu[5],
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange),
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

var GraphContainer = React.createClass({
    
    getDefaultProps:function(){
        return {
            graphType:'count',
            height:300,
            index:0
        }
    },
    getInitialState:function(){
        return{
            currentData:[]
        }
    },
    componentDidMount:function(){
        if(this.props.selectedState){
            this._loadData(this.props.selectedState);
        }
    },

    componentWillReceiveProps:function(nextProps){
            this._loadData(nextProps.selectedState);
    },
    _loadData: function(fips){
        var scope = this; 

        d3.json('/tmgClass/stateMADT/'+fips+'/'+scope.props.graphType+'?database=allWim')
            .post(JSON.stringify({filters:scope.props.filters}),function(err,data){
            
            if(data.loading){
                    console.log('reloading')
                    setTimeout(function(){ scope._loadData(fips) }, 2000);
            }else{
                scope.setState({currentData:data});
            }
        })
    },
    
    _updateGraph: function(){
        var scope = this;

            
            //var colorScale = d3.scale.quantile
            nv.addGraph(function() {
                var chart = nv.models.lineChart()
                  .x(function(d) { return d.month })    //Specify the data accessors.
                  .y(function(d) { return +d.y })
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
                    .datum(scope.state.currentData)
                    .call(chart);

                nv.utils.windowResize(chart.update);

                return chart;
            });
    },

    render: function() {
        var scope = this;
        var svgStyle = {
          height: this.props.height+'px',
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
            //display: Object.keys(scope.props.classByMonth.getDimensions()).length > 0 ? 'block' : 'none'
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