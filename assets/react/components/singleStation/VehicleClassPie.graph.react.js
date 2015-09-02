'use strict';

var React = require('react'),
   
    // -- Utils
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    colorRange = colorbrewer.Paired[12],
    nv = require('../../utils/dependencies/nvd3.js'),
    $lime = "#8CBF26",
    $red = "#e5603b",
    $redDark = "#d04f4f",
    $blue = "#6a8da7",
    $green = "#56bc76",
    $orange = "#eac85e",
    $pink = "#E671B8",
    $purple = "#A700AE",
    $brown = "#A05000",
    $teal = "#4ab0ce",
    $gray = "#666",
    $white = "#fff",
    $textColor = $gray,
     COLOR_VALUES = [$green, $teal, $redDark,  $blue, $red, $orange  ],

    //actions
    ClientActionsCreator = require('../../actions/ClientActionsCreator');



var VehicleClassPie = React.createClass({
	
   getDefaultProps:function(){
      return {
          height:400
      }
    },
    getInitialState:function(){
        return {
            toggleChart:false,
            currentData:[],
            loading:true
        }
    },
    
    componentWillReceiveProps:function(nextProps){
        //console.log(nextProps.filters.year,this.props.filters.year,nextProps.filters.year !== this.props.filters.year)
        this._loadData(nextProps.fips,nextProps.selectedStation);
      
    },

    _loadData:function(fips,stationId){
        var scope = this;
        if(stationId){
            //var filters = getAsUriParameters(scope.props.filters)
            //console.log('filters',scope.props.filters)
            //console.log('/tmgClass/classPie/station/'+fips+'/'+stationId+'?database=allWim')
            scope.setState({loading:true})
            d3.json('/tmgClass/classPie/station/'+fips+'/'+stationId+'?database=allWim')
              .post(JSON.stringify({filters:scope.props.filters}),function(err,data){
                //console.log('classpie',data)
                if(data.loading){
                    setTimeout(function(){ scope._loadData(fips,stationId) }, 3000);
                }else{
                    
                    scope.setState({
                        currentData:data,
                        loading:false
                    })
                }
            })
        }
         
    },

    renderGraph:function(){
        var scope = this;
        nv.addGraph(function(){
            var chart = nv.models.pieChart()
                .x(function(d) { return d.key })
                .y(function(d) { return d.value })
                .color(COLOR_VALUES)
                .showLegend(false)
                .showLabels(false)
                .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
                .margin({top: -20, right: 0, bottom: -5, left: 0});
            chart.pie.margin({top: 10, bottom: -20});


            d3.select('#VehicleClassPie svg')
                .datum(scope.state.currentData)
                .call(chart);

            nv.utils.windowResize(chart.update);
        })
        
    },

    renderFooter:function(){
        var scope = this,
            feet = <span />
        if(this.state.currentData){
            var total = this.state.currentData.reduce(function(a,b){
                
                return  a +b.value;
            },0)
            var feet = this.state.currentData.map(function(val,i){
                var controlStyle={
                    'borderTopWidth': '3px',
                    'borderTopStyle': 'solid',
                    'borderTopColor': scope.props.filters.classGroups.indexOf(val.key) === -1 ? COLOR_VALUES[i] : '#fff',
                    'width':'29%'
                };
                return(
                    // onClick={ClientActionsCreator.filterClassGroup.bind(this, val.key)}
                    <div className="control" style={controlStyle} >
                        <div className="key">{val.key}</div>
                        <div className="value">{ ((+val.value/+total)*100).toFixed(1)}%</div>
                    </div>
                )
            })
        }

        return (
            <footer id="data-chart-footer" className="pie-chart-footer">
                <div className="controls">
                    {feet}
                </div>
            </footer>

        )
    },
    componentDidUpdate:function(){
        if(!this.state.loading){
            //console.log('render graph',this.state.currentData)
            this.renderGraph();
        }
    },
    render:function(){
      	var scope = this;
    	var svgStyle = {
          height: '100%',
          width: '100%'
        },
        
        titleStyle = {
            'left': '114.5px',
            'top': '84px'
        };
        //console.log('render pie',this.state.currentData,this.props.stationData)
        
      	// <div className="visits">15866<br/> visits </div>

        var svg = <svg style={svgStyle}/>
        if(this.state.loading){
           
            svg = <div style={{height:'256px',margin:'0 auto'}}>Loading {this.props.selectedStation}</div> 
            
        }
    	return(
    		<section className="widget large">
                <header>
                    <h4><i className="fa fa-home"></i> Class Group by %</h4>
                </header>
                <div className="body">
                    <div id="VehicleClassPie" className="chart pie-chart">
                           {svg}
                        <div className="total" style={titleStyle}>
                           
                        </div>
                    </div>
                </div>
                
            </section>	
    	)
    },

  
});

module.exports = VehicleClassPie;