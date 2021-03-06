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
    colorRange = ["#313695", "#4575b4", "#74add1", "#fdae61", "#f46d43", "#d73027", "#a50026"],//colorbrewer.RdYlBu[5],
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange),
    saveSvgAsPng = require('save-svg-as-png'),
    downloadFile = require('../../utils/downloadHelper');


var removeLabels = function(){
    d3.selectAll('#adtchart svg .nv-x .tick text').text('')
}

var GraphContainer = React.createClass({

    
    getDefaultProps:function(){
        return {
            height: 300,
            loading:false,
        }
    },

    getInitialState:function(){
        return {
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
        if(nextProps.selectedState && nextProps.agency && !this.state.loading){
            this._loadData(nextProps.selectedState,nextProps.agency);
        }
    },

    _loadData:function(fips,agency){
        var scope = this;
        if(fips && agency){
            this.setState({loading:true})
            var url = '/tmgClass/stateAADT/'+fips+'?database='+agency;
            d3.json(url)
                .post(JSON.stringify({filters:scope.props.filters}),function(err,data){
                //console.log('adtGraph data',data)
                if(data.loading){
                        console.log('reloading')
                        setTimeout(function(){ scope._loadData(fips) }, 2000);
                        
                }else{
                    AdtScale.domain(data.map(function(ADT){
                        return ADT.value;
                    }));

                    var output = data.map(function(d){
                        d.color = AdtScale(d.value)
                        return d
                    }).sort(function(a,b){
                        return b.value - a.value
                    })
                    if(scope.props.onDataChange){
                        console.log('send up class')
                        scope.props.onDataChange(output)
                    }
                    scope.setState({
                        currentData:output,
                        loading:false
                    });
                }
            })
        }

    },
    _updateGraph: function(){
        var scope = this;
          
            nv.addGraph(function() {
                var chart = nv.models.discreteBarChart()
                  .x(function(d) { return d.label })    //Specify the data accessors.
                  .y(function(d) { return d.value })
                  .staggerLabels(false)    //Too many bars and not enough room? Try staggering labels.
                  .tooltips(true)        //Don't show tooltips
                  .showValues(false)       //...instead, show the bar value right on top of each bar.
                  .transitionDuration(350)
                  .showXAxis(true)
                  .showYAxis(true);

                chart.xAxis     //Chart x-axis settings
                    .axisLabel('Stations')

                 chart.yAxis     //Chart y-axis settings
                  .axisLabel('Voltage (v)')
                  

                d3.select('#adtchart svg')
                    .datum(
                        [
                            {
                                key:'ADT',
                                values:scope.state.currentData
                            }
                        ]
                    )
                    .call(chart);
                removeLabels();
                nv.utils.windowResize(chart.update);
                nv.utils.windowResize(removeLabels);
                
                return chart;
            });
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
                    <li><a onClick={scope.downloadCsv.bind(null,this.props.id)} href="#">CSV</a></li>
                </ul>
            </div>
        )
    },
    formatData : function(){
        var scope = this,            
            fieldNames = ['Station ID','AADT'],
            lines = '',
            line = '';

        Object.keys(scope.state.currentData).forEach(function(station){
            line = station + "," + scope.state.currentData[station].value;

            if(navigator.msSaveBlob){ //IF WE R IN IE :(
                lines += line + '\r\n';
            }else{
                lines += line + '%0A';
            }

        })

        if(navigator.msSaveBlob){ //IF WE R IN IE :(
            lines = fieldNames.join(',') + '\r\n' + lines;
        }else{
            lines = fieldNames.join(',') + '%0A' + lines;
        }
        return lines;
    },
    downloadPng : function(){
        console.log("downloading png");
        saveSvgAsPng.saveSvgAsPng(document.getElementById("adtchart-graph"), "adtchart.png");
    },
    downloadCsv : function(id){
        var scope = this;

        console.log("downloading csv");

        var type = "data:text/csv;charset=utf-8,";
        var fname = "adtGraph.csv";
        var formattedData =  scope.formatData();

        downloadFile(type,formattedData,fname,id);

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
            //display: Object.keys(scope.props.classByMonth.getDimensions()).length > 0 ? 'block' : 'none'
        }, 
        title = 'Annual Average Daily Traffic';
        

        //console.log('_processData',this._processData())
        var graph = (
           
                <div className="body">
                    <div id="adtchart">
                        <svg id="adtchart-graph" style={svgStyle}></svg>
                    </div>
                    {this._updateGraph()}
                    
                </div>
           
        ),
        chart = (
             <div>
                <DataTable 
                data={scope.state.currentData} 
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