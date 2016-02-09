'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    nv = require('../../../utils/dependencies/nvd3'), 
    fips2state = require('../../../utils/data/fips2state'),

    //-- for making the chart
    ChartBuilder = require('../../charts/chartMaker.react.js'),
    DataTable = require('../../utils/DataTable.react'),    
    saveSvgAsPng = require('save-svg-as-png'),
    downloadFile = require('../../utils/downloadHelper'),


    //-- Stores

    //-- Utils
    colorRange = ["#313695", "#4575b4", "#74add1", "#fdae61", "#f46d43", "#d73027", "#a50026"],//colorbrewer.RdYlBu[5],
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
                    console.log('test',data)
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
    formatData : function(){
        var scope = this,            
            fieldNames = ['Station Id','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            lines = '',
            line = '';

        var chartData = scope.chartData();

        Object.keys(chartData).forEach(function(station){
            //console.log(chartData[station]);

            Object.keys(chartData[station]).forEach(function(column){
                //console.log(chartData[station][column]);

                if(column === 'key'){
                    line = chartData[station][column] + "," + line;
                }
                else if(column === '11'){
                    line = line + chartData[station][column];
                }
                else{
                    line = line + chartData[station][column] + ',';
                }
            })

            if(navigator.msSaveBlob){ //IF WE R IN IE :(
                lines += line + '\r\n';
            }else{
                lines += line + '%0A';
            }
            line = '';
            //console.log(line);
        })

        if(navigator.msSaveBlob){ //IF WE R IN IE :(
            lines = fieldNames.join(',') + '\r\n' + lines;
        }else{
            lines = fieldNames.join(',') + '%0A' + lines;
        }
        return lines;
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
    downloadPng : function(){
        console.log("downloading png");
        var svgId = "madt-graph"+this.props.graphType;
        var chartFileName = svgId + ".png";
        saveSvgAsPng.saveSvgAsPng(document.getElementById(svgId), chartFileName);
    },
    downloadCsv : function(id){
        var scope = this;

        console.log("downloading csv");

        var type = "data:text/csv;charset=utf-8,";
        var fname = "madtgraph"+this.props.graphType+".csv";
        var formattedData =  scope.formatData();

        // /console.log(formattedData);
        downloadFile(type,formattedData,fname,id);

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
               

                var title = scope.props.graphType === 'count' ?  ' MADT' : '(MADT / AADT)'
                chart.  yAxis
                    .axisLabel('title')


                
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
        var svgId = "madt-graph"+this.props.graphType;
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
                        <svg id={svgId} style={svgStyle}></svg>
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
                    {key:'0', name:'Jan'},
                    {key:'1', name:'Feb'},
                    {key:'2', name:'Mar'},
                    {key:'3', name:'Apr'},
                    {key:'4', name:'May'},
                    {key:'5', name:'Jun'},
                    {key:'6', name:'Jul'},
                    {key:'7', name:'Aug'},
                    {key:'8', name:'Sep'},
                    {key:'9', name:'Oct'},
                    {key:'10', name:'Nov'},
                    {key:'11', name:'Dec'},
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