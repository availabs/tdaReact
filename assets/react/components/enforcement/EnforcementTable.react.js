'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    Sparklines = require('../charts/sparklines').Sparklines,
    SparklinesLine  = require('../charts/sparklines').SparklinesLine,
    Heatmap = require('./heatmap.react'),
    //, SparklinesBars, SparklinesLine, SparklinesNormalBand, SparklinesReferenceLine, SparklinesSpots }

    //-- Stores


    //-- Utils
    colorRange = colorbrewer.RdYlBu[5],
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange),
    stnCardMeta =        require('../../utils/data/stnCardMeta');
 

var removeLabels = function(){
    d3.selectAll('#adtchart svg .nv-x .tick text').text('')
}

var GraphContainer = React.createClass({

    
    getDefaultProps:function(){
        return {
            height: 300,
        }
    },

    getInitialState:function(){
        return {
            toggleChart:false,
            currentData:[],
            sortBy:'percent',
            activeStation:null
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
       
        if(fips && agency){
            var url = '/enforcement/'+fips+'?database='+agency;

             console.log('load data',fips,agency,url)
            this.setState({currentData:[]});
            d3.json(url)
                .post(JSON.stringify({filters:scope.props.filters}),function(err,data){
                //console.log('adtGraph data',data)
                if(data.loading){
                        console.log('reloading')
                        setTimeout(function(){ scope._loadData(fips) }, 2000);
                        
                }else{
                   

                    scope.setState({currentData:scope.processData(data)});
                }
            })
        }

    },

    stationClick:function(id){
        this.setState({activeStation:id})
    },

    sortClick:function(type){
        this.setState({sortBy:type})
    },

    processData:function(data){
        var rows = {};

        //[{"station_id":"000280","overTT":"1437","oversingle":"471","TT":"9305","single":"39562","month":"9","year":"12"},
        // {"station_id":"009631","overTT":"3517","oversingle":"0","TT":"24194","single":"8663","month":"7","year":"13"}];

        data.forEach(function(d){
            
            if(!rows[d.station_id] ){
                rows[d.station_id] = {"station_id":d.stationId,"overTT":{},"oversingle":{},"TT":{},"single":{}}
            }
            var year = d.year.length > 1 ? d.year : '0'+d.year,
                month = d.month.length > 1 ? d.month : '0'+d.month;

            rows[d.station_id].overTT[year+'_'+month] = d.overTT;
            rows[d.station_id].oversingle[year+'_'+month] = d.oversingle;
            rows[d.station_id].TT[year+'_'+month] = d.TT;
            rows[d.station_id].single[year+'_'+month] = d.single;
        
        })

        return rows;
    },
    
    stationMouseOver:function(id){
        d3.select('.station_'+id)
            .attr('stroke','#000')
            .attr('stroke-width',5)
    },
    stationMouseOut:function(id){
        d3.select('.station_'+id)
            .attr('stroke-width',0)
    },

    render: function() {
        var scope = this;
       
        
        //console.log('adtGraph',this._processData())

        var trafficMax = false,
            overMax = false,
            percentMax = false;

        var rowsData = Object.keys(this.state.currentData).map(function(station){
            var months = Object.keys(scope.state.currentData[station].TT).sort(function(a,b){
                
                return a-b;

            }).map(function(d){
                return d
            });
            
            var TT = Object.keys(scope.state.currentData[station].TT).sort(function(a,b){
                
                return a-b;

            }).map(function(month){

                if(!trafficMax || trafficMax < +scope.state.currentData[station].TT[month]) { trafficMax = +scope.state.currentData[station].TT[month] }
                return +scope.state.currentData[station].TT[month]
            
            })

            var overTT = Object.keys(scope.state.currentData[station].overTT).map(function(month){
                var percent = ((scope.state.currentData[station].overTT[month] / scope.state.currentData[station].TT[month])*100).toFixed(2);
                if(!percentMax || percentMax < +percent) { percentMax = percent}
                return percent;
            })

             var overCount = Object.keys(scope.state.currentData[station].overTT).map(function(month){
                if(!overMax.max || overMax < +scope.state.currentData[station].overTT[month]) { overMax = +scope.state.currentData[station].overTT[month] }
                return +scope.state.currentData[station].overTT[month]
            })


            // <Sparklines style={{position:'relative'}}>
            //     
               
            // </Sparklines>
            //console.log('data',TT)
            return {
                id:station,
                TT:TT,
                overTT:overTT,
                overCount:overCount,
                months:months,
                routeSign : scope.props.stations[scope.props.selectedState][station] ? stnCardMeta.posted_route_sign_abbr[scope.props.stations[scope.props.selectedState][station].properties.posted_route_sign]+'-'+ parseInt(scope.props.stations[scope.props.selectedState][station].properties.posted_sign_route_num) : '',
                funcClass : scope.props.stations[scope.props.selectedState][station] ? scope.props.stations[scope.props.selectedState][station].properties.func_class_code : ''
            
            }

        });

        var rows = rowsData.sort(function(a,b){
            switch(scope.state.sortBy){
                case 'percent':
                    return b.overTT[b.overTT.length-1] - a.overTT[a.overTT.length-1]; 
                break

                case 'over':
                    return b.overCount[b.overCount.length-1] - a.overCount[a.overCount.length-1]; 
                break

                case 'traffic':
                    return b.TT[b.TT.length-1] - a.TT[a.TT.length-1]; 
                break

                case 'class':
                console.log('class sourct')
                    return a.funcClass[0] - b.funcClass[0]; 
                break

                case 'route':
                    console.log('route sourct')
                    return b.routeSign - a.routeSign; 
                break
            }
            return b.overTT[b.overTT.length-1] - a.overTT[a.overTT.length-1]; 
        }).map(function(station){
            var heatMap = null;
            if(scope.state.activeStation === station.id){
                heatMap = (
                    <tr>
                        <td colSpan={8} style={{height:300}}>
                            <Heatmap selectedState={scope.props.selectedState} agency={scope.props.agency} station={scope.state.activeStation} />
                        </td>
                    </tr>
                )
            }
            return (
                <tbody
                    onMouseOut={scope.stationMouseOut.bind(null,station.id)}
                    onMouseOver={scope.stationMouseOver.bind(null,station.id)}>
                <tr style={{height:40}}
                    onClick={scope.stationClick.bind(null,station.id)}>
                    <td>{station.id}</td>
                    <td>{station.funcClass}</td>

                    <td>{station.routeSign}</td>
                    <td style={{width:150}}>
                        <Sparklines style={{position:'relateive'}}>
                            <SparklinesLine  data={station.TT}  min={0} max={trafficMax} style={{ fill: "none" }} />
                            <SparklinesLine data={station.overTT} min={0} max={percentMax}  style={{ fill: "none" }} color="#ff0000" />
                            <SparklinesLine data={station.overCount} min={0} max={trafficMax}  style={{ fill: "none" }} color="#0000ff" />
                        </Sparklines>
                    </td>
                    <td style={{textAlign:'right'}}> current: <br /> avg : </td>
                    <td style={{textAlign:'right',color:"#ee0000" }}>{station.overTT[station.overTT.length-1].toLocaleString()}%<br />{d3.mean(station.overTT).toFixed(2).toLocaleString()}%</td>
                    <td style={{textAlign:'right',color:"#0000ee"}}>{station.overCount[station.overCount.length-1].toLocaleString('en-US',{maximumFractionDigits:0})}<br / >{d3.mean(station.overCount).toLocaleString('en-US',{maximumFractionDigits:0})}</td>
                    <td style={{textAlign:'right'}}>{station.TT[station.TT.length-1].toLocaleString('en-US',{maximumFractionDigits:0})}<br / >{d3.mean(station.TT).toLocaleString('en-US',{maximumFractionDigits:0})}</td>
                    
                </tr>
                {heatMap}
                </tbody>
            )
        })



        return (
           
            <section className="widget" style={{ background:'none'}}>
               
                 {this.props.selectedState}<br /> {this.props.agency}<br />
                 <table className='table table-hover'>
                    <thead>
                    <tr>
                         <th colSpan={3} style={{textAlign:'center'}}>Station</th>
                         <th colSpan={2}></th>
                         <th colSpan={3}> Tractor Trailor Weight Violations </th>
                    </tr>
                    <tr>
                        <th>Id</th>
                        <th className={scope.state.sortBy === 'class' ? 'active' : ''} onClick={scope.sortClick.bind(null,'class')} >Class</th>
                        <th className={scope.state.sortBy === 'route' ? 'active' : ''} onClick={scope.sortClick.bind(null,'route')}>Route</th>
                        <th colSpan={2}></th>
                        <th className={scope.state.sortBy === 'percent' ? 'active' : ''} style={{textAlign:'right'}} onClick={scope.sortClick.bind(null,'percent')}> over % </th>
                        <th className={scope.state.sortBy === 'over' ? 'active' : ''} style={{textAlign:'right'}} onClick={scope.sortClick.bind(null,'over')}> over  </th>
                        <th className={scope.state.sortBy === 'traffic' ? 'active' : ''} style={{textAlign:'right'}} onClick={scope.sortClick.bind(null,'traffic')}> total  </th>
                    </tr>
                    </thead>

                    {rows}
                    
                 </table>
            </section>
            
        );
    }
});

module.exports = GraphContainer; 