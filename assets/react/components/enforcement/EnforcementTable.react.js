'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    Sparklines = require('../charts/sparklines').Sparklines,
    SparklinesLine  = require('../charts/sparklines').SparklinesLine,
    Heatmap = require('./heatmap.react'),
    ClientActionsCreator = require('../../actions/ClientActionsCreator'),
    ReactSelect = require('react-select'),
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
            loading:false,
            toggleChart:false,
            currentData:[],
            sortBy:'percent',
            activeStation:null,
            activeOver: 90000,
            displayOver:90000,
            type:'total'
        }
    },
    
    componentDidMount:function(){
        console.log('mount')
        if(this.props.selectedState){
            this._loadData(this.props.selectedState,this.props.agency);
        }
    },

    componentWillReceiveProps:function(nextProps){
        if(nextProps.selectedState  && nextProps.agency
            && (nextProps.selectedState !== this.props.selectedState ||
                nextProps.agency !== this.props.agency)){

            this._loadData(this.props.selectedState,this.props.agency);
       
        }


        if(nextProps.selectedStation !== this.props.selectedStation){
            var el = $('#station_'+nextProps.selectedStation);
            //console.log('new station scroll','#station_'+nextProps.selectedStation,el.offset().top)
            if( el.offset() ){
                setTimeout(function(){
                    $('html,body').animate({
                      scrollTop: el.offset().top
                    }, 1000)
                },300)
            }
        }
    },

    _loadData:function(fips,agency,threshold,type){
        var scope = this;
       
        if(!this.state.loading && fips && agency){
            var url = '/enforcement/'+fips+'?database='+agency;

            this.setState({
                loading:true,
                currentData:[]
            });

            console.log('loading data',threshold || this.state.activeOver)
            d3.json(url)
                .post(JSON.stringify({
                    type: type || this.state.type,
                    threshold:threshold || this.state.activeOver,
                    filters:scope.props.filters
                }),function(err,data){
                //console.log('adtGraph data',data)

                    scope.setState({
                        loading:false,
                        currentData:scope.processData(data)
                    });
                
            })
        }

    },

    stationClick:function(id){
        ClientActionsCreator.setSelectedStation(id,this.props.selectedState);
    },

    toggleStation:function(){
        ClientActionsCreator.setSelectedStation(null,this.props.selectedState)
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

    changeSettings: function(e){
        console.log('change',e.target.value)
        this.setState({displayOver:e.target.value})
    },

    setWeight: function (){
        this._loadData(this.props.selectedState,this.props.agency,this.state.displayOver);
        this.setState({activeOver:this.state.displayOver})
    },
    typeChange:function(v){
        console.log(v);
        var newWeight = v === 'axle' ? 25000 : 90000;
        this._loadData(this.props.selectedState,this.props.agency,newWeight,v);
        this.setState({
            type:v,
            activeOver:newWeight,
            displayOver:newWeight
        })

    },

    renderSettings: function(){
        var disabled = this.state.displayOver === this.state.activeOver ? ' disabled' : '',
            typeOptions = [
                { value:'total', label:'Gross Vehichle Weight' },
                { value:'axle', label:'Axle Weight' },
                { value:'bridge', label:'Bridge Forula' },

            ]

        return (
            <div className='row'>

            <div className='col-md-6'>

                    Type: 
                    <div className='form-group' style={{fontSize:10}}>
                        <ReactSelect options={typeOptions} value={this.state.type} onChange={this.typeChange} />
                    </div>
                </div>
                <div className='col-md-6'>

                   Threshold (lbs) : 
                    <div className='form-group'>
                        <div className='input-group'>
                            <input type='number' onChange={this.changeSettings} step='1000' className='form-control' value={this.state.displayOver} />
                            <div className='input-group-btn'>
                                <button type="button" className={"btn btn-default"+disabled} onClick={this.setWeight} >Set</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    shouldComponentUpdate:function(nextProps,nextState){
        // if(this.state.loading !== nextState.loading || this.props.selectedStation !== nextProps.selectedStation){
        //     //console.log('should update?',this.state.loading !== nextState.loading,this.state.loading, nextState.loading)
        //     return true;
        // }
        // return false;
        return true
    },
    render: function() {
        var scope = this;
       
        if(this.state.loading || this.state.currentData.length === 0){
           
            return (
                <section className="widget" style={{ background:'none'}}>
                     {this.renderSettings()}
                     <div style={{position:'relative',top:'20%',left:'40%',width:'200px'}}>
                         Loading {this.props.selectedStation}<br /> 
                         <img src={'/images/loading.gif'} />
                     </div> 
                </section>
            )

            
        }
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
            if(scope.props.selectedStation === station.id){
                heatMap = (
                    <tr>
                        <td colSpan={8} style={{height:300}}>
                             <i onClick={scope.toggleStation} className="fa fa-times pull-right" style={{cursor:'pointer',fontSize:14,padding:10}}> </i>
                                <br />
                             <Heatmap threshold={scope.state.activeOver} type={scope.state.type} selectedState={scope.props.selectedState} agency={scope.props.agency} station={scope.props.selectedStation} />
                        </td>
                    </tr>
                )
            }
            return (
                <tbody
                    onMouseOut={scope.stationMouseOut.bind(null,station.id)}
                    onMouseOver={scope.stationMouseOver.bind(null,station.id)}>
                <tr style={{height:40}} id ={'station_'+station.id}
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
                    <td style={{textAlign:'right',color:"#0000ee"}}>{station.overCount[station.overCount.length-1].toLocaleString('en-US',{maximumFractionDigits:0})}<br/>{d3.mean(station.overCount).toLocaleString('enUS',{maximumFractionDigits:0})}</td>
                    <td style={{textAlign:'right'}}>{station.TT[station.TT.length-1].toLocaleString('en-US',{maximumFractionDigits:0})}<br/>{d3.mean(station.TT).toLocaleString('en-US',{maximumFractionDigits:0})}</td>
                    
                </tr>
                {heatMap}
                </tbody>
            )
        })



        return (
           
            <section className="widget" style={{ background:'none'}}>
                 {this.renderSettings()}
                
                 <table className='table table-hover' style={{backgroundColor:'#fff'}} >
                    <thead>
                    <tr>
                         <th colSpan={3} style={{textAlign:'center'}}>Station</th>
                         <th colSpan={2}></th>
                         <th colSpan={3}> Tractor Trailor Weight </th>
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