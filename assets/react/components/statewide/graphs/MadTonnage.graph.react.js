'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    nv = require('../../../utils/dependencies/nvd3'),
    fips2state = require('../../../utils/data/fips2state'),

    //-- for making the chart
    DataTable = require('../../utils/DataTable.react'),
    saveSvgAsPng = require('save-svg-as-png'),
    downloadFile = require('../../utils/downloadHelper'),

    //-- Stores
    StateWideStore = require('../../../stores/StatewideStore'),

    //-- Utils
    colorRange = ["#313695", "#4575b4", "#74add1", "#fdae61", "#f46d43", "#d73027", "#a50026"],//colorbrewer.RdYlBu[5],
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange),
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];;


var removeLabels = function(){
    d3.selectAll('#tonnagechart svg .nv-x .tick text').text('')
}

var GraphContainer = React.createClass({

    getDefaultProps:function(){
        return {
            height: 300,
            //index:0
        }
    },
    

    getInitialState:function(){
        return {
            loading:false,
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

    _loadData:function(fips,agency){
        
        var scope = this;
        var filters = scope.props.filters;
        var season = false;
        if(scope.props.type==='season'){
            season=true;
        }
         if(!this.state.loading && fips && agency){
            this.setState({loading:true,currentData:[]})
            var url = '/tmgWim/tonnage/'+fips+'/?monthly=true&database='+agency,
                old = '/tmgWim/tonnage/madt/'+fips+'/?database='+agency;
                //console.log('get data madt',url)
            d3.json(url)
                .post(JSON.stringify({monthly:true}),function(err,data){
                
                    var output = {}
                    data.forEach(function(d){
                        if(!output[d.label]){ output[d.label] = {key:d.label,values:[]} }
                        output[d.label].values.push({month:d.month,y:+(d.value/2000)})
                    })
                    var output = Object.keys(output).map(function(k){
                        if(season){
                            var mean = d3.mean(output[k].values,function(d){ return d.y} )
                            output[k].values = output[k].values.map(function(v){
                                return {y:(v.y / mean).toFixed(2),month:v.month}
                            })
                        }
                        output[k].values = output[k].values.sort(function(a,b){ return b.month - a.month});
                        return output[k]
                    })

                    AdtScale.domain(output.map(function(station){
                        return d3.mean(station.values, function(d) { return d.y } )
                    }));

                    var output = output.map(function(station){

                        station.color = AdtScale( d3.mean(station.values,function(d){ return d.y}) )
                        return station
                    })

                    
                    //console.log('madt tonnage',season,output)
                    scope.setState({
                        loading:false,
                        currentData:output
                    })
                
                
            })
        }
         
    },

    _updateGraph: function(){
        var scope = this;
        nv.addGraph(function() {
            var chart = nv.models.lineChart()
              .x(function(d) { return d.month })    //Specify the data accessors.
              .y(function(d) { return +d.y })
              .showLegend(false)
              .useInteractiveGuideline(false)       //Don't show tooltips
              .transitionDuration(350)
              .showXAxis(true);

            var title = scope.props.graphType === 'season' ?   '(MAD Tons / AAD Tons)' : ' MADTons';
               
            chart.yAxis
                .axisLabel('title')
                .tickFormat(function(d){
                    var label = +d;
                    if(scope.props.type==='season'){
                        return label.toFixed(2)
                    }
                    return parseInt(label);
                }) 
            
            chart.xAxis     //Chart x-axis settings
                .axisLabel('Months')
                .tickFormat(function(d){
                    return months[d-1];
                })
           


            
            d3.select('#madTonchart_'+scope.props.index+' svg')
                .datum(scope.state.currentData)
                .call(chart);
            
            removeLabels();
            nv.utils.windowResize(chart.update);
            nv.utils.windowResize(removeLabels);
            return chart;
        });
        
       
    },
    
    toggleChartClick:function(){
        //console.log('toggleChart')
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

                if(column === 'label'){
                    line = chartData[station][column] + "," + line;
                }
                else if(column == '7'){
                    line = line + chartData[station][column] + ', ,';
                }
                else if(column === '12'){
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
        //console.log(scope.state.currentData);
        flatData = Object.keys(scope.state.currentData).map(function(station){

            var curStation = {};

            curStation.label = scope.state.currentData[station].label;

            scope.state.currentData[station].values.forEach(function(month){
                curStation[month.month] = month.y;
            })

            return curStation;

        })
        return flatData;

    },
    
    downloadPng : function(){
       
        var svgId = "madtonnage-graph"+this.props.type;
        var chartFileName = svgId + ".png";
        saveSvgAsPng.saveSvgAsPng(document.getElementById(svgId), chartFileName);
    },

    downloadCsv : function(id){
        var scope = this;

       

        var type = "data:text/csv;charset=utf-8,";
        var fname = "madtonnagegraph"+this.props.graphType+".csv";
        var formattedData =  scope.formatData();

        // /console.log(formattedData);
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
        title = this.props.type === 'season' ? 'Seasonality of Tonnage':'Monthly Average Daily Tonnage';
        var svgId = "madtonnage-graph"+this.props.type;
        var chartData = scope.chartData();
        var output = null;
        if(this.state.loading || this.state.currentData.length === 0){
           
            output = <div style={{position:'relative',top:'20%',left:'40%',width:'200px'}}>Loading {this.props.selectedStation}<br /> <img src={'/images/loading.gif'} /></div> 
            
        }else{
            output = !scope.state.toggleChart ? (
           
                <div className="body">
                    <div id={'madTonchart_'+scope.props.index}>
                        <svg id={svgId} style={svgStyle}></svg>
                    </div>
                    {this._updateGraph()}
                    
                </div>
           
            ) : 
            (
                 <div>
                    <DataTable 
                    data={chartData} 
                    pageLength={5}
                    columns={ [
                        {key:'key', name:'Station ID'},
                        {key:'1', name:'Jan'},
                        {key:'2', name:'Feb'},
                        {key:'3', name:'Mar'},
                        {key:'4', name:'Apr'},
                        {key:'5', name:'May'},
                        {key:'6', name:'Jun'},
                        {key:'7', name:'Jul'},
                        {key:'8', name:'Aug'},
                        {key:'9', name:'Sep'},
                        {key:'10', name:'Oct'},
                        {key:'11', name:'Nov'},
                        {key:'12', name:'Dec'},
                    ]} />
                </div>
            );
        }
        
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
                {output}
            </section>
            
        );
    }
});

module.exports = GraphContainer;