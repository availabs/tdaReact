'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    Sparklines = require('../../charts/sparklines').Sparklines,
    SparklinesLine  = require('../../charts/sparklines').SparklinesLine,
    DashHeader = require('./dashheader.react'),
    //, SparklinesBars, SparklinesLine, SparklinesNormalBand, SparklinesReferenceLine, SparklinesSpots }

    //-- Stores


    //-- Utils
    colorRange = colorbrewer.RdYlBu[5],
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange),
    stnCardMeta =        require('../../../utils/data/stnCardMeta');
 

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
            loading: false,
            toggleChart:false,
            months:[],
            currentData:[],
            sortBy:'madt',
            activeStation:null,
            currentMonth:null
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
            var url = '/tmgClass/byMonthTable/'+fips+'?database='+agency;

            console.log('load data',fips,agency,url)
            this.setState({
                currentData:[],
                loading:true
            });

            d3.json(url)
                .post(JSON.stringify({filters:scope.props.filters}),function(err,data){
                //console.log('adtGraph data',data)
                   
                var newData = scope.processData(data);
                console.log('got data',newData);
                scope.setState({
                    currentData:newData.data,
                    months:newData.months,
                    currentMonth:newData.months.length-1,
                    loading:false
                });
                
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
        var rows = {},
            months = [];

        //[{"station_id":"000280","madt":"1437","oversingle":"471","TT":"9305","single":"39562","month":"9","year":"12"},
        // {"station_id":"009631","overTT":"3517","oversingle":"0","TT":"24194","single":"8663","month":"7","year":"13"}];

        data.forEach(function(d){
            
            if(!rows[d.station_id] ){
                rows[d.station_id] = {"station_id":d.stationId,"ct":{},"madt":{},"pov":{},"su":{},"tt":{}}
            }
            var year = d.year.length > 1 ? d.year : '0'+d.year,
                month = d.month.length > 1 ? d.month : '0'+d.month;

            if(months.indexOf(year+'_'+month) === -1 ){ months.push(year+'_'+month) };
            
            rows[d.station_id].ct[year+'_'+month] = d.ct;
            rows[d.station_id].madt[year+'_'+month] = d.ct / d.days;
            rows[d.station_id].pov[year+'_'+month] = (+d.c1+ +d.c2+ +d.c3) / d.days; 
            rows[d.station_id].su[year+'_'+month] = (+d.c4 + +d.c5+ +d.c6+ +d.c7 + +d.c8) / d.days;
            rows[d.station_id].tt[year+'_'+month] = (+d.c9 + +d.c10+ +d.c11 + +d.c12 + +d.c13) / d.days; 

            
        })
        var thisYear = new Date().getFullYear().toString().substr(2,2);

        console.log(months,thisYear)
        months = months.filter((d) => parseInt( d.split('_')[0] ) < +thisYear  ).sort()
        return {data:rows,months:months}
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
    setCurrentMonth:function(m){
        this.setState({
            currentMonth:m
        })
    },

    render: function() {
        var scope = this;
       
        
        //console.log('adtGraph',this._processData())

        var max = {
            madt: false,
            pov : false,
            su : false,
            tt : false
        },

        dataSets = { madt:[],pov:[],su:[],tt:[] }
        var startMonth = this.state.currentMonth - 12 < 0 ? 0 : this.state.currentMonth - 12,
            displayMonths = this.state.months.slice(startMonth,this.state.currentMonth+1)

        var rowsData = Object.keys(this.state.currentData).map(function(station){
           

            Object.keys(dataSets).forEach(function(setKey){

                dataSets[setKey] = displayMonths.map(function(month){
                    if(!max[setKey] || max[setKey] < +scope.state.currentData[station][setKey][month] || 0) { max[setKey] = +scope.state.currentData[station][setKey][month] || 0 }
                    return +scope.state.currentData[station][setKey][month] || 0
                })
            })

           
           
            return {
                id:station,
                madt:dataSets['madt'],
                pov:dataSets['pov'],
                su:dataSets['su'],
                tt:dataSets['tt'],
                routeSign : scope.props.stations[scope.props.selectedState][station] ? stnCardMeta.posted_route_sign_abbr[scope.props.stations[scope.props.selectedState][station].properties.posted_route_sign]+'-'+ parseInt(scope.props.stations[scope.props.selectedState][station].properties.posted_sign_route_num) : '',
                funcClass : scope.props.stations[scope.props.selectedState][station] ? scope.props.stations[scope.props.selectedState][station].properties.func_class_code : ''
            
            }

        });

        var rows = rowsData.sort(function(a,b){
            switch(scope.state.sortBy){
               
                case 'madt':
                    return b.madt[b.madt.length-1] - a.madt[a.madt.length-1]; 
                break

               
                case 'pov':
                    return b.pov[b.pov.length-1] - a.pov[a.pov.length-1]; 
                break

                 case 'su':
                    return b.su[b.su.length-1] - a.su[a.su.length-1]; 
                break

                case 'tt':
                    return b.tt[b.tt.length-1] - a.tt[a.tt.length-1]; 
                break

                case 'class':
                    return a.funcClass[0] - b.funcClass[0]; 
                break

                case 'route':
                    return b.routeSign - a.routeSign; 
                break

                default:
                    return b.madt[b.madt.length-1] - a.madt[a.madt.length-1]; 
            }
            
        }).map(function(station,i){
            var singleStation = null;
            if(scope.state.activeStation === station.id){
                singleStation = (
                    <tr>
                        <td colSpan={10} style={{height:300}}>
                            Single Station View
                        </td>
                    </tr>
                )
            }
            if(d3.mean(station.madt) === 0) {return}
            return (

                <tbody
                    onMouseOut={scope.stationMouseOut.bind(null,station.id)}
                    onMouseOver={scope.stationMouseOver.bind(null,station.id)}>
                <tr style={{height:40}}
                    onClick={scope.stationClick.bind(null,station.id)}>
                    <td>{i+1}</td>
                    <td>{station.id}</td>
                    <td>{station.funcClass}</td>

                    <td>{station.routeSign}</td>
                    <td style={{width:150}}>
                        <Sparklines style={{position:'relateive'}}>
                            <SparklinesLine  data={station[scope.state.sortBy]}  />
                        </Sparklines>
                    </td>
                    <td style={{textAlign:'right'}}> current: <br /> avg : </td>
                    <td style={{textAlign:'right' }}>
                        {station.madt[station.madt.length-1].toLocaleString('en-US',{maximumFractionDigits:0})}<br />
                        {d3.mean(station.madt).toLocaleString('en-US',{maximumFractionDigits:0})}
                    </td>
                    <td style={{textAlign:'right' }}>
                        {station.pov[station.pov.length-1].toLocaleString('en-US',{maximumFractionDigits:0})}<br />
                        {d3.mean(station.pov).toLocaleString('en-US',{maximumFractionDigits:0})}
                    </td>
                    <td style={{textAlign:'right' }}>
                        {station.su[station.su.length-1].toLocaleString('en-US',{maximumFractionDigits:0})}<br />
                        {d3.mean(station.su).toLocaleString('en-US',{maximumFractionDigits:0})}
                    </td>
                    <td style={{textAlign:'right' }}>
                        {station.tt[station.tt.length-1].toLocaleString('en-US',{maximumFractionDigits:0})}<br />
                        {d3.mean(station.tt).toLocaleString('en-US',{maximumFractionDigits:0})}
                    </td>
                </tr>
                {singleStation}
                </tbody>
            )
        }).filter((d) => d);



        return (
           
            <section className="widget" style={{ background:'none'}}>
                 <DashHeader setMonth={this.setCurrentMonth} months={this.state.months} currentMonth={this.state.currentMonth} />
                 <table className='table table-hover'>
                    <thead>
                    <tr>
                         <th colSpan={3} style={{textAlign:'center'}}>Station</th>
                         <th colSpan={2}></th>
                         <th colSpan={4}> Average Daily Traffic </th>
                    </tr>
                    <tr>
                        <th></th>
                        <th>Id</th>
                        <th className={scope.state.sortBy === 'class' ? 'active' : ''} onClick={scope.sortClick.bind(null,'class')} >Class</th>
                        <th className={scope.state.sortBy === 'route' ? 'active' : ''} onClick={scope.sortClick.bind(null,'route')}>Route</th>
                        <th colSpan={2}></th>
                        <th className={scope.state.sortBy === 'madt' ? 'active' : ''} style={{textAlign:'right',cursor:'pointer'}} onClick={scope.sortClick.bind(null,'madt')}> 
                            Total 
                        </th>
                         <th className={scope.state.sortBy === 'pov' ? 'active' : ''} style={{textAlign:'right',cursor:'pointer'}} onClick={scope.sortClick.bind(null,'pov')}> 
                            POV 
                        </th>
                        <th className={scope.state.sortBy === 'su' ? 'active' : ''} style={{textAlign:'right',cursor:'pointer'}} onClick={scope.sortClick.bind(null,'su')}> 
                            SU 
                        </th>
                        <th className={scope.state.sortBy === 'tt' ? 'active' : ''} style={{textAlign:'right',cursor:'pointer'}} onClick={scope.sortClick.bind(null,'tt')}> 
                            TT 
                        </th>
                    </tr>
                    </thead>

                    {rows}
                    
                 </table>
            </section>
            
        );
    }
});

module.exports = GraphContainer; 