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

    //-- Utils
    colorRange = colorbrewer.RdYlBu[5],
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
            toggleChart:false,
            currentData:[]
        }
    },

    componentDidMount:function(){
        if(this.props.selectedState){
            this._loadData(this.props.selectedState,this.props.agency);
        }
    },

    componentWillReceiveProps:function(nextProps){
        if(nextProps.selectedState && nextProps.agency){
            this._loadData(nextProps.selectedState,nextProps.agency);
        }
    },

    _loadData: function(fips,agency){
        var scope = this; 
        if(fips && agency){
            d3.json('/tmgClass/stateMADT/'+fips+'/'+scope.props.graphType+'?database='+agency)
                .post(JSON.stringify({filters:scope.props.filters}),function(err,data){
                
                if(data.loading){
                        console.log('reloading')
                        setTimeout(function(){ scope._loadData(fips) }, 2000);
                }else{
                    scope.setState({currentData:data});
                }
            })
        }
    },
    toggleChartClick:function(){
        console.log('toggleChart')
        this.setState({toggleChart:!this.state.toggleChart})
    },
    renderDownload : function(){
        var scope=this;
        return (
            <div className="btn-group pull-right">
                
                <button className="btn btn-info btn-sm dropdown-toggle" data-toggle="dropdown" data-original-title="" title="" aria-expanded="false">
                    <span className="fa fa-download"></span>
                </button>
                <ul className="dropdown-menu">
                    <li><a onClick={scope.downloadPng} href="#">PNG</a></li>
                    <li><a onClick={scope.downloadCsv} href="#">CSV</a></li>
                </ul>
            </div>
        )
    },
    chartData : function (){
        //Function flattens data so that each station has a field for every month
        //Rather than each station having an object that has a field for every month

        var scope = this,
            flatData = [];

        flatData = Object.keys(scope.state.currentData).map(function(station){

            var curStation = {};

            curStation.key = scope.state.currentData[station].key;

            scope.state.currentData[station].values.forEach(function(month){
                curStation[month.month] = month.y;
            })

            return curStation;

        })
        return flatData;

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

    //DOWNLOADS
    //Col 1 = Station Id (every row gets a station ID)
    //Col 2-14 = months (each row has 12 months)
    //Seasonal will follow suit

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



        var chartData = scope.chartData();


        var title = this.props.graphType === 'count' ?  ' Monthly Average Daily Traffic' : ' Seasonal Adjustment Factor (MADT / AADT) ';
        var graph = (
           
                <div className="body">
                    <div id={id} >
                        <svg style={svgStyle}></svg>
                    </div>
                </div>
           
        ),
        chart = (
             <div>
                <DataTable 
                data={chartData} 
                pageLength={5}
                columns={ [
                    {key:'key', name:'Station ID'},
                    {key:'0', name:'January'},
                    {key:'1', name:'February'},
                    {key:'2', name:'March'},
                    {key:'3', name:'April'},
                    {key:'4', name:'May'},
                    {key:'5', name:'June'},
                    {key:'6', name:'July'},
                    {key:'7', name:'August'},
                    {key:'8', name:'September'},
                    {key:'9', name:'October'},
                    {key:'10', name:'November'},
                    {key:'11', name:'December'},
                ]} />
            </div>
        );



        return (
            <section className="widget large" style={{ background:'none'}}>
                <header>
                    <h4 style={headerStyle}>
                        {title} {this.props.agency}

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