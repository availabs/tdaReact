'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    nv = require('../../../utils/dependencies/nvd3'),
    fips2state = require('../../../utils/data/fips2state'),

    //-- for making the chart
    DataTable = require('../../utils/DataTable.react'),

    //-- Stores
    StateWideStore = require('../../../stores/StatewideStore'),

    //-- Utils
    colorRange = colorbrewer.RdYlBu[5],
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange),   
    saveSvgAsPng = require('save-svg-as-png'),
    downloadFile = require('../../utils/downloadHelper');


var removeLabels = function(){
    d3.selectAll('#tonnagechart svg .nv-x .tick text').text('')
}

var GraphContainer = React.createClass({

    getDefaultProps:function(){
        return {
            height: 300
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
        if(!this.state.loading && fips && agency){
            this.setState({loading:true,currentData:[]})
            var url = '/tmgWim/tonnage/'+fips+'/?database='+agency;
            
            d3.json(url)
                .post(JSON.stringify({filters:scope.props.filters}),function(err,data){
                
                    console.log('tonnage data',data)
                    AdtScale.domain(data.map(function(ADT){
                        return ADT.value;
                    }));

                    var output = data.map(function(d){

                        d.color = AdtScale(d.value)
                       
                        return d
                    }).sort(function(a,b){
                        return b.value - a.value
                    })

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
                

            
            d3.select('#tonnagechart svg')
                .datum(
                    [
                        {
                            key:'stations',
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
        //console.log('toggleChart')
        this.setState({toggleChart:!this.state.toggleChart})
    },

    renderDownload : function(){
        var scope = this;
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
            fieldNames = ['Station ID','AAD Tonnage'],
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
        saveSvgAsPng.saveSvgAsPng(document.getElementById("tonnagechart-graph"), "tonnagechart.png");
    },
    downloadCsv : function(id){
        var scope = this;

        console.log("downloading csv");

        var type = "data:text/csv;charset=utf-8,";
        var fname = "tonnagechart.csv";
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
        title = 'Annual Average Daily Tonnage';
        

        //console.log('_processData',this._processData())
        var output = null;
        if(this.state.loading || this.state.currentData.length === 0){
           
            output = <div style={{position:'relative',top:'20%',left:'40%',width:'200px'}}>Loading {this.props.selectedStation}<br /> <img src={'/images/loading.gif'} /></div> 
            
        }else{
            output = !scope.state.toggleChart ? (
               
                    <div className="body">
                        <div id="tonnagechart">
                            <svg id= "tonnagechart-graph" style={svgStyle}></svg>
                        </div>
                        {this._updateGraph()}
                        
                    </div>
               
            ) :
            (
                 <div>
                    <DataTable 
                    data={scope.state.currentData} 
                    pageLength={7}
                    columns={ [
                        {key:'label', name:'Station ID'},
                        {key:'value', name:'AAD Tonnage'}
                    ]} />
                </div>
            );
        }
        
        
        //console.log('adtGraph',this.props.selectedState,this.state.currentData)

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
                { output }
            </section>
            
        );
    }
});

module.exports = GraphContainer;