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
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange);


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
            toggleChart:false,
            currentData:[]
        }
    },

    componentDidMount:function(){
        if(this.props.selectedState){
            this._loadData(this.props.selectedState);
        }
    },

    componentWillReceiveProps:function(nextProps){
        //if(nextProps.selectedState !== this.props.selectedState){
            this._loadData(nextProps.selectedState);
        //}
    },

    _loadData:function(fips){
        var scope = this;
        if(fips){
            d3.json('/tmgWim/tonnage/month/'+fips+'/?database=allWim')
                .post(JSON.stringify({filters:scope.props.filters}),function(err,data){
                
                if(data.loading){
                        console.log('reloading')
                        setTimeout(function(){ scope._loadData(fips,stationId) }, 2000);
                        
                    
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

                    scope.setState({currentData:output})
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
            //display: Object.keys(scope.props.classByMonth.getDimensions()).length > 0 ? 'block' : 'none'
        }, 
        title = 'Annual Average Daily Tonnage';
        

        //console.log('_processData',this._processData())
        var graph = (
           
                <div className="body">
                    <div id="tonnagechart">
                        <svg style={svgStyle}></svg>
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
                    {key:'value', name:'AAD Tonnage'}
                ]} />
            </div>
        );
        
        //console.log('adtGraph',this.props.selectedState,this.state.currentData)

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
             test
                {this.props.selectedState}
                {scope.state.toggleChart ? chart : graph}
            </section>
            
        );
    }
});

module.exports = GraphContainer;