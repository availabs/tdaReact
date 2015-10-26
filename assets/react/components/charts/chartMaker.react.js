'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    nv = require('../../utils/dependencies/nvd3'),
    fips2state = require('../../utils/data/fips2state'),

    //-- Stores
    StateWideStore = require('../../stores/StatewideStore'),

    //-- Utils
    colorRange = colorbrewer.RdYlBu[5],
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange);


var removeLabels = function(){
    d3.selectAll('#adtchart svg .nv-x .tick text').text('')
}

var tableContainer = React.createClass({

    
    getDefaultProps:function(){
        return {
            height: 300,
            //state:selectedState,
            //stationData:StateWideStore.getstationData() //This will be changed to hold the report data
        }
    },
    makeRow: function(index){
            return(
                    <tr>
                        <th style={{background:'#B8B8B8'}}>Class {index+1}</th>
                        <th>{this.state.avgs[0][index]}</th>
                        <th>{this.state.avgs[1][index]}</th>
                        <th>{this.state.avgs[2][index]}</th>
                        <th>{this.state.avgs[3][index]}</th>
                        <th>{this.state.avgs[4][index]}</th>
                        <th>{this.state.avgs[5][index]}</th>
                        <th>{this.state.avgs[6][index]}</th>
                        <th>{this.state.avgs[7][index]}</th>
                        <th>{this.state.avgs[8][index]}</th>
                        <th>{this.state.avgs[9][index]}</th>
                        <th>{this.state.avgs[10][index]}</th>
                        <th>{this.state.avgs[11][index]}</th>
                    </tr>          
                )
    },
    getInitialState: function(){
        return {
            avgs: [],
        }
    },
    renderTable: function(){
        var scope = this.props.chartData
        if(scope[0] === undefined){
            return (
                <span />
            )
        }
        var rowHolder = []

        
        this.state.avgs.splice(0,this.state.avgs.length)
        for(var yy = 0; yy<12; yy++){
            this.state.avgs.push([0,0,0,0,0,0,0,0,0,0,0,0,0])
        }
        for(var x = 0;x<scope.length;x++){
            for(var y = 0;y < 12;y++){
                for(var zz = 0;zz<13;zz++){
                    this.state.avgs[y][zz] = this.state.avgs[y][zz] + scope[x].value.monthAvg[y][zz]
                }
            }
        }
        
        for(var z = 0;z<13;z++){
            for(var zzz = 0;zzz<12;zzz++){
                this.state.avgs[zzz][z] = Math.floor(this.state.avgs[zzz][z]/scope.length)
                
            }
            rowHolder.push(this.makeRow(z))
        }
        
        
        return (
                
                <table id="seasonal_Table" className="table table-bordered">
                    <tr style={{background:'#B8B8B8'}}>
                        <th>Class/Month</th>
                        <th>January</th>
                        <th>February</th>
                        <th>March</th>
                        <th>April</th>
                        <th>May</th>
                        <th>June</th>
                        <th>July</th>
                        <th>August</th>
                        <th>September</th>
                        <th>October</th>
                        <th>November</th>
                        <th>December</th>
                    </tr>
                    {rowHolder}
                </table>


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
            fontWeight:'700'//,
            //display: Object.keys(scope.props.stationData.getDimensions()).length > 0 ? 'block' : 'none'
        }

        return (
        	<section className="widget large" style={{ background:'none'}}>
                <div className="tableBody">
                    {this.renderTable()}
                </div>
                
            </section>
        );
    }
});

module.exports = tableContainer;