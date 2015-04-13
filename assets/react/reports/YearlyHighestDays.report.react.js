'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    nv = require('../../utils/dependencies/nvd3'),
    fips2state = require('../../utils/data/fips2state'),

    //-- Stores
    StateWideStore = require('../../stores/StatewideStore'),

    //-- Utils
    colorRange = colorbrewer.RdBu[5],
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange);


var removeLabels = function(){
    d3.selectAll('#adtchart svg .nv-x .tick text').text('')
}

var tableContainer = React.createClass({

    
    getDefaultProps:function(){
        return {
            height: 300,
            classByDay:StateWideStore.getClassByDay() //This will be changed to hold the report data
        }
    },
    incrementIndex: function(){
        console.log(this.state._index)
        this.setState({
          _index: this.state._index + 1
        });
        console.log(this.state._index)
    },
    resetIndex: function(){
        console.log(this.state._index)
        this.setState({
            _index: 0
        })
        console.log(this.state._index)
    },
    decrementIndex: function(){
        console.log(this.state._index)
        if(this.state._index > 0){
            this.setState({
              _index: this.state._index - 1
            });
        }
        console.log(this.state._index)
    },
    
    getInitialState: function(){
        return {
          _index: 0
        }
    },

    _updateGraph: function(){
        var scope = this;   //Hold the prop
        

        if(Object.keys(scope.props.classByDay.getDimensions()).length > 0){
            console.log(Object.keys(scope.props.classByDay.getDimensions()))
            console.log('A')
            console.log(scope.props.classByDay.getDimensions())
            console.log('B')
            console.log(scope.props.classByDay.getGroups().ADT)
            scope.props.classByDay.getGroups().ADT.order(function(p,i){if(i<5){console.log("G", p)} }).top(Infinity)
            console.log('D')
            console.log(Object.keys(scope.props.classByDay.getDimensions()).length)
            
            
            var stationADT = scope.props.classByDay.getGroups()
                .ADT.order(function(p){console.log("Z", p);return p.classAvg.reduce( function(a,b){ return a+b}) })
                .top(Infinity)
                .filter(function(p){ 
                    var value = p.value.classAvg.reduce( function(a,b){ return a+b});
                    return !isNaN(value) && value > 0;
                });
            //Data management below

            // var parsedData = []
            // var DailyVol = []
            // var total = 0
            // var minDate = ""
            // var maxDate = ""
            // var dir1 = ""
            // var dir2 = ""
            // var temp = null

        
            // data.rows.forEach(function(row){
            //         total += parseInt(row.f[6].v)
            //         if(parseInt(row.f[0].v) < 10){
            //             row.f[0].v = "0"+row.f[0].v
            //         }
            //         if(temp != null){
            //             //console.log()
            //             if(temp.f[0].v+'/'+temp.f[1].v+'/'+temp.f[2].v+'/'+temp.f[3].v === row.f[0].v+'/'+row.f[1].v+'/'+row.f[2].v+'/'+row.f[3].v){
            //                 parsedData[parsedData.length-1].HourVol += parseInt(row.f[6].v)
            //                 if(parsedData[parsedData.length-1].PeakHourVol <= parseInt(row.f[6].v)){
            //                     parsedData[parsedData.length-1].PeakHourVol = parseInt(row.f[6].v)
            //                     parsedData[parsedData.length-1].Direction = getDir(parseInt(row.f[5].v))
            //                 }
            //                 parsedData[parsedData.length-1].PerPeakHour = ((parsedData[parsedData.length-1].PeakHourVol/parsedData[parsedData.length-1].HourVol)*100).toFixed(2)
            //                 temp = row
            //             }
            //             else{
            //                 parsedData.push({'Date':row.f[1].v+'/'+row.f[2].v+'/'+row.f[0].v,'hour':row.f[3].v,'DoW':getDOW(parseInt(row.f[4].v)),'Direction':getDir(parseInt(row.f[5].v)),'HourVol':parseInt(row.f[6].v),'PeakHourVol':parseInt(row.f[6].v),'PerPeakHour':"100"})  
            //                 temp = row
            //             }
            //         }
            //         else{
            //             temp = row
            //             parsedData.push({'Date':row.f[1].v+'/'+row.f[2].v+'/'+row.f[0].v,'hour':row.f[3].v,'DoW':getDOW(parseInt(row.f[4].v)),'Direction':getDir(parseInt(row.f[5].v)),'HourVol':parseInt(row.f[6].v),'PeakHourVol':parseInt(row.f[6].v),'PerPeakHour':"100"})  
            //         }
            //         if(indexSearch(row.f[1].v+'/'+row.f[2].v+'/'+row.f[0].v,"Date") == -1){
            //             DailyVol.push({'Date':row.f[1].v+'/'+row.f[2].v+'/'+row.f[0].v,'Total':parseInt(row.f[6].v)})
            //         }
            //         else{
            //             DailyVol[indexSearch(row.f[1].v+'/'+row.f[2].v+'/'+row.f[0].v,"Date")].Total += parseInt(row.f[6].v)
            //         }
            //         if(minDate === ""){
            //             minDate = {"month":parseInt(row.f[1].v),"day":parseInt(row.f[2].v),"date":row.f[1].v+'/'+row.f[2].v+'/'+row.f[0].v}
            //         }
            //         else{
            //             if(minDate.month >= parseInt(row.f[1].v) && minDate.day >= parseInt(row.f[2].v)){
            //                 minDate = {"month":parseInt(row.f[1].v),"day":parseInt(row.f[2].v),"date":row.f[1].v+'/'+row.f[2].v+'/'+row.f[0].v}
            //             }
            //         }
            //         if(maxDate === ""){
            //             maxDate = {"month":parseInt(row.f[1].v),"day":parseInt(row.f[2].v),"date":row.f[1].v+'/'+row.f[2].v+'/'+row.f[0].v}
            //         }
            //         else{
            //             if(maxDate.month <= parseInt(row.f[1].v) && maxDate.day <= parseInt(row.f[2].v)){
            //                 maxDate = {"month":parseInt(row.f[1].v),"day":parseInt(row.f[2].v),"date":row.f[1].v+'/'+row.f[2].v+'/'+row.f[0].v}
            //             }
            //         }
            //         if(dir1 === ""){
            //             dir1 = getDir(parseInt(row.f[5].v))
            //         }
            //         else if(parseInt(row.f[5].v) !== dir1){
            //             dir2 = "/"+getDir(parseInt(row.f[5].v))
            //         }
            // });
        
        


            // $('#reportTable tbody').append('<tr><th colspan=2><strong>Date Range: '+minDate.date+' - '+maxDate.date+'</strong></th><th colspan=2><strong>Station Direction: '+dir1+dir2+'</strong></th></tr>')
            // $('#reportTableData').append('<tbody><tr><td rowspan="2" colspan="2" style="vertical-align:bottom;text-align:center;background:#B8B8B8">Date</td><td rowspan="2" style="vertical-align:bottom;text-align:center;background:#B8B8B8">Day of Week</td><td rowspan="2" style="vertical-align:bottom;text-align:right;background:#B8B8B8">AADT</td><td colspan ="2" style="text-align:center;background:#B8B8B8">Daily Data</td><td colspan="4" style="text-align:center;background:#B8B8B8">Peak Hour</td><td colspan="5" style="text-align:center;background:#B8B8B8">Peak Directional Data</td></tr><tr><td style="text-align:right;background:#B8B8B8">Daily Vol</td><td style="text-align:right;background:#B8B8B8">% AADT</td><td style="text-align:right;background:#B8B8B8">Hour</td><td style="text-align:right;background:#B8B8B8">Hr Vol</td><td style="text-align:right;background:#B8B8B8">% Daily Vol</td><td style="text-align:right;background:#B8B8B8">% AADT</td><td style="text-align:center;background:#B8B8B8">Dir</td><td style="text-align:right;background:#B8B8B8">Hr Vol</td><td style="text-align:right;background:#B8B8B8">% Peak Hr</td><td style="text-align:right;background:#B8B8B8">%Daily Vol</td><td style="text-align:right;background:#B8B8B8">% AADT</td></tr></tbody>')
            // var appendString = ""
            

            // DailyVol.sort(compareVolDay)
            // parsedData.sort(compareVolHour)
            // if(this.state._index + 10 > DailyVol.length){
            //     endPoint = DailyVol.length
            // }
            // else{
            //     endPoint = this.state._index + 10
            // }
            // for(var x = 0+this.state._index;x<endPoint;x++){
            //     appendString = appendString + '<tr><td style="background:#B8B8B8">'+(x+1)+
            //                                   '</td><td>'+DailyVol[x].Date+
            //                                   '</td><td>'+parsedData[indexSearch(DailyVol[x].Date,"Day")].DoW+
            //                                   '</td><td>'+AADT+
            //                                   '</td><td>'+DailyVol[x].Total+
            //                                   '</td><td>'+((DailyVol[x].Total/AADT)*100).toFixed(2)+
            //                                   '%</td><td>'+parsedData[indexSearch(DailyVol[x].Date,"Day")].hour+
            //                                   '</td><td>'+parsedData[indexSearch(DailyVol[x].Date,"Day")].HourVol+
            //                                   '</td><td>'+((parsedData[indexSearch(DailyVol[x].Date,"Day")].HourVol/DailyVol[x].Total)*100).toFixed(2)+
            //                                   '%</td><td>'+((parsedData[indexSearch(DailyVol[x].Date,"Day")].HourVol/AADT)*100).toFixed(2)+
            //                                   '%</td><td>'+parsedData[indexSearch(DailyVol[x].Date,"Day")].Direction+
            //                                   '</td><td>'+parsedData[indexSearch(DailyVol[x].Date,"Day")].PeakHourVol+
            //                                   '</td><td>'+parsedData[indexSearch(DailyVol[x].Date,"Day")].PerPeakHour+
            //                                   '%</td><td>'+((parsedData[indexSearch(DailyVol[x].Date,"Day")].PeakHourVol/DailyVol[x].Total)*100).toFixed(2)+
            //                                   '%</td><td>'+((parsedData[indexSearch(DailyVol[x].Date,"Day")].PeakHourVol/AADT)*100).toFixed(2)+
            //                                   '</td></tr>'
            // }
            // $("#reportTableData tbody").append(appendString)
            
            
       }
       
    },
    render: function() {
        var scope = this;
        this._updateGraph();
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
            //display: Object.keys(scope.props.classByDay.getDimensions()).length > 0 ? 'block' : 'none'
        }

        var title = 'Yearly Highest Days Report';
        
        return (
        	<section className="widget large" style={{ background:'none'}}>
                <header>
                    <h4 style={headerStyle}>
                        {title}
                    </h4>
                    <button type="button" className='btn btn-info' onClick={this.decrementIndex}>Back</button>
                    <button type="button" className='btn btn-info' onClick={this.resetIndex}>Reload</button>
                    <button type="button" className='btn btn-info' onClick={this.incrementIndex}>Forward</button>
                </header>
                <div className="tableBody">
                    <table id="reportTable" className="table">
                        <tbody>
                            <tr>
                                <th colSpan='2'><strong>Location: </strong></th>
                                <th colSpan='2'><strong>Functional Class: </strong></th>
                            </tr>
                        </tbody>
                    </table>
                    <table id="reportTableData" className="table" border="1">
                    </table>
                </div>
                
            </section>
        );
    }
});

module.exports = tableContainer;