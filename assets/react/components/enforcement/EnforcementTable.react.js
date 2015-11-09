'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    Sparklines = require('react-sparklines').Sparklines,
    SparklinesLine  = require('react-sparklines').SparklinesLine,
    SparklinesSpots = require('react-sparklines').SparklinesSpots,
    //, SparklinesBars, SparklinesLine, SparklinesNormalBand, SparklinesReferenceLine, SparklinesSpots }

    //-- Stores


    //-- Utils
    colorRange = colorbrewer.RdYlBu[5],
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange);
 

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
    

    render: function() {
        var scope = this;
       
        
        //console.log('adtGraph',this._processData())
        var rows = Object.keys(this.state.currentData).map(function(station){
            
            var TT = Object.keys(scope.state.currentData[station].TT).sort(function(a,b){
                
                return a-b;

            }).map(function(month){

                return scope.state.currentData[station].TT[month]
            
            })

            var overTT = Object.keys(scope.state.currentData[station].overTT).map(function(month){
                return ((scope.state.currentData[station].overTT[month] / scope.state.currentData[station].TT[month])*100).toFixed(2);
            })


            return (
                <tr style={{height:40}}>
                    <td>{station}</td>
                    <td style={{height:40}}>
                        <Sparklines data={TT} style={{position:'relateive'}}>
                            <SparklinesLine style={{ fill: "none" }} />
                            <SparklinesSpots />
                        </Sparklines>


                        <Sparklines data={overTT} min={0} max={30} style={{position:'relative'}}>
                            <SparklinesLine style={{ fill: "none" }} color="#ff0000" />
                            <SparklinesSpots />
                        </Sparklines>

                    </td>
                    <td>{d3.max(overTT)}</td>
                    <td>{d3.mean(overTT).toFixed(2)}</td>
                    <td>{d3.median(overTT).toFixed(2)}</td>
                </tr>
            )
        });

        return (
           
            <section className="widget" style={{ background:'none'}}>
               
                 {this.props.selectedState}<br /> {this.props.agency}<br />
                 <table className='table table-hover'>
                    <tbody>
                        {rows}
                    </tbody>
                 </table>
            </section>
            
        );
    }
});

module.exports = GraphContainer; 