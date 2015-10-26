'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    nv = require('../../../utils/dependencies/nvd3'),
    fips2state = require('../../../utils/data/fips2state'),

    //-- for making the chart
    ChartBuilder = require('../../charts/chartMaker.react.js'),
    DataTable = require('../../utils/DataTable.react'),

    //-- Stores
    StateWideStore = require('../../../stores/StatewideStore'),

    //-- Utils
    colorRange = colorbrewer.RdYlBu[5],
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

    getInitialState:function(){
        return {
            toggleChart:false
        }
    },

    _processData:function(){
        var scope = this;
        if(Object.keys(scope.props.classByMonth.getDimensions()).length > 0){

            var stationADT= scope.props.classByMonth.getGroups()
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
            //console.log('_processData',stationADT)
            return stationADT
        }
        return []
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

        
           

            AdtScale.domain(stationADT.map(function(ADT){
                return ADT.value.classAvg.reduce( function(a,b){ return a+b});
            }));
            
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
    
    toggleChartClick:function(){
        console.log('toggleChart')
        this.setState({toggleChart:!this.state.toggleChart})
    },

    renderDownload : function(){
        return (
            <div className="btn-group pull-right">
                
                <button className="btn btn-info btn-sm dropdown-toggle" data-toggle="dropdown" data-original-title="" title="" aria-expanded="false">
                    <span className="fa fa-download"></span>
                </button>
                <ul className="dropdown-menu">
                    <li><a href="#">PNG</a></li>
                    <li><a href="#">CSV</a></li>
                </ul>
            </div>
        )
    },

    render: function() {
        var scope = this;
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
        }, 
        title = 'Annual Average Daily Traffic';
        

        //console.log('_processData',this._processData())
        var graph = (
           
                <div className="body">
                    <div id="adtchart">
                        <svg style={svgStyle}></svg>
                    </div>
                    {this._updateGraph()}
                    
                </div>
           
        ),
        chart = (
             <div>
                <DataTable 
                data={this._processData()} 
                pageLength={7}
                columns={ [
                    {key:'label', name:'Station ID'},
                    {key:'value', name:'AADT'}
                ]} />
            </div>
        );
        
        //console.log('adtGraph',this._processData())

        return (
            
            <section className="widget large" style={{ background:'none'}}>
                <header>
                    <h4 style={headerStyle}>
                        {title}

                        {this.renderDownload()}
                        <a onClick={this.toggleChartClick} className='btn btn-sm btn-success pull-right' style={{marginRight:'5px'}}>
                            {scope.state.toggleChart ? <span className='fa fa-bar-chart'/> : <span className='fa fa-list'/>}
                        </a>
              
                    </h4>
                    
                </header>
             
              {scope.state.toggleChart ? chart : graph}
            </section>
            
        );
    }
});

module.exports = GraphContainer;