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
            //state:selectedState,
            //stationData:StateWideStore.getstationData() //This will be changed to hold the report data
        }
    },
    incrementIndex: function(){
        
        this.setState({
          _index: this.state._index + 1
        });

        
    },
    resetIndex: function(){
        
        this.setState({
            _index: 0
        })
        
    },
    decrementIndex: function(){
        
        if(this.state._index > 0){
            this.setState({
              _index: this.state._index - 1
            });
        }
        
    },
    
    getInitialState: function(){
        return {
          _index: 0,
          parsedData: [],
          DailyVol: [],
          minDate: "",
          maxDate: "",
          dir1: "",
          dir2: "",
          yearFilter:"",
          monthFilter:"",
          total_: 0
        }
    },
    renderTable: function(){
        if(!this.props.stationData){
            return (
                <span />
            )
        }
        
        return (
            [
            <table id="reportTable" className="table">
                        <tbody>
                            <tr>
                                <th colSpan='2'><strong>Location: {this.props.stationInfo.station_location}</strong></th>
                                <th colSpan='2'><strong>Functional Class: {this.props.stationInfo.func_class_code}</strong></th>
                            </tr>
                        </tbody>
            </table>,
            <table id="reportTableData" className="table">
                <tbody>
                    {this._updateGraph()}
                </tbody>
            </table>
            ]
            
            )
    },


    _updateGraph: function(){
        var scope = this;   //Hold the prop
        
        /*Below segment of code is what handles the data management. It only runs
          when the page is loaded or the filters are changed. 
          Has extra conditional logic to prevent extra runs.*/
        if(scope.state.parsedData.length < 1){
            scope.state.yearFilter = scope.props.filters.year
            scope.state.monthFilter = scope.props.filters.month
        }
        
        if(scope.props.stationData.initialized() && ((scope.state.yearFilter !== scope.props.filters.yearFilter) || scope.state.monthFilter !== scope.props.filters.monthFilter) ){
            var x = 0
            //Data management below
            
            var total = 0           
            var temp = null
            scope.state.parsedData = []
            scope.state.DailyVol = []

            //This segment of the code is the same as the old report table code just with
            //the new variables switched in

            scope.props.stationData.getDimension('stationId').top(Infinity).forEach(function(row){
                    
                    total += parseInt(row.f0_)
                    if(parseInt(row.year) < 10){
                        row.year = "0"+row.year
                    }
                    if(temp != null){
                        
                        if(temp.year+'/'+temp.month+'/'+temp.day+'/'+temp.hour === row.year+'/'+row.month+'/'+row.day+'/'+row.hour){
                            scope.state.parsedData[scope.state.parsedData.length-1].HourVol += parseInt(row.f0_)
                            if(scope.state.parsedData[scope.state.parsedData.length-1].PeakHourVol <= parseInt(row.f0_)){
                                scope.state.parsedData[scope.state.parsedData.length-1].PeakHourVol = parseInt(row.f0_)
                                scope.state.parsedData[scope.state.parsedData.length-1].Direction = getDir(parseInt(row.dir))
                            }
                            scope.state.parsedData[scope.state.parsedData.length-1].PerPeakHour = ((scope.state.parsedData[scope.state.parsedData.length-1].PeakHourVol/scope.state.parsedData[scope.state.parsedData.length-1].HourVol)*100).toFixed(2)
                            temp = row
                        }
                        else{
                            scope.state.parsedData.push({'Date':row.month+'/'+row.day+'/'+row.year,'hour':row.hour,'DoW':getDOW(row.year,row.month,row.day),'Direction':getDir(parseInt(row.dir)),'HourVol':parseInt(row.f0_),'PeakHourVol':parseInt(row.f0_),'PerPeakHour':"100"})  
                            temp = row
                        }
                    }
                    else{
                        temp = row
                        scope.state.parsedData.push({'Date':row.month+'/'+row.day+'/'+row.year,'hour':row.hour,'DoW':getDOW(row.year,row.month,row.day),'Direction':getDir(parseInt(row.dir)),'HourVol':parseInt(row.f0_),'PeakHourVol':parseInt(row.f0_),'PerPeakHour':"100"})  
                    }
                    if(indexSearch(row.month+'/'+row.day+'/'+row.year,"Date") == -1){
                        scope.state.DailyVol.push({'Date':row.month+'/'+row.day+'/'+row.year,'Total':parseInt(row.f0_)})
                    }
                    else{
                        scope.state.DailyVol[indexSearch(row.month+'/'+row.day+'/'+row.year,"Date")].Total += parseInt(row.f0_)
                    }
                    if(scope.state.minDate === ""){
                        scope.state.minDate = {"month":parseInt(row.month),"day":parseInt(row.day),"date":row.month+'/'+row.day+'/'+row.year}
                    }
                    else{
                        if(scope.state.minDate.month >= parseInt(row.month) && scope.state.minDate.day >= parseInt(row.day)){
                            scope.state.minDate = {"month":parseInt(row.month),"day":parseInt(row.day),"date":row.month+'/'+row.day+'/'+row.year}
                        }
                    }
                    if(scope.state.maxDate === ""){
                        scope.state.maxDate = {"month":parseInt(row.month),"day":parseInt(row.day),"date":row.month+'/'+row.day+'/'+row.year}
                    }
                    else{
                        if(scope.state.maxDate.month <= parseInt(row.month) && scope.state.maxDate.day <= parseInt(row.day)){
                            scope.state.maxDate = {"month":parseInt(row.month),"day":parseInt(row.day),"date":row.month+'/'+row.day+'/'+row.year}
                        }
                    }
                    if(scope.state.dir1 === ""){
                        scope.state.dir1 = getDir(parseInt(row.dir))
                    }
                    else if(parseInt(row.dir) !== scope.state.dir1){
                        scope.state.dir2 = "/"+getDir(parseInt(row.dir))
                    }
            });
            scope.state.total_ = total
        
            
        }
       if(scope.props.stationData.getDimension('stationId').top(Infinity).length >0){

                if(scope.state.DailyVol.length > 0){
                    var AADT = parseInt((scope.state.total_/scope.state.DailyVol.length).toFixed(0))
                }
                else{
                    var AADT = 0
                }
                $('#reportTable tbody').html('')
                $('#reportTableData').html('')
                $('#reportTable tbody').append('<tr><th colspan=2><strong>Date Range: '+scope.state.minDate.date+' - '+scope.state.maxDate.date+'</strong></th><th colspan=2><strong>Station Direction: '+scope.state.dir1+scope.state.dir2+'</strong></th></tr>')
                $('#reportTableData').append('<tbody><tr><td rowspan="2" colspan="2" style="vertical-align:bottom;text-align:center;background:#B8B8B8">Date</td><td rowspan="2" style="vertical-align:bottom;text-align:center;background:#B8B8B8">Day of Week</td><td rowspan="2" style="vertical-align:bottom;text-align:right;background:#B8B8B8">AADT</td><td colspan ="2" style="text-align:center;background:#B8B8B8">Daily Data</td><td colspan="4" style="text-align:center;background:#B8B8B8">Peak Hour</td><td colspan="5" style="text-align:center;background:#B8B8B8">Peak Directional Data</td></tr><tr><td style="text-align:right;background:#B8B8B8">Daily Vol</td><td style="text-align:right;background:#B8B8B8">% AADT</td><td style="text-align:right;background:#B8B8B8">Hour</td><td style="text-align:right;background:#B8B8B8">Hr Vol</td><td style="text-align:right;background:#B8B8B8">% Daily Vol</td><td style="text-align:right;background:#B8B8B8">% AADT</td><td style="text-align:center;background:#B8B8B8">Dir</td><td style="text-align:right;background:#B8B8B8">Hr Vol</td><td style="text-align:right;background:#B8B8B8">% Peak Hr</td><td style="text-align:right;background:#B8B8B8">%Daily Vol</td><td style="text-align:right;background:#B8B8B8">% AADT</td></tr></tbody>')
                var appendString = ""
                
                this.state.DailyVol.sort(compareVolDay)
                this.state.parsedData.sort(compareVolHour)
                if((10*this.state._index) + 10 > this.state.DailyVol.length){
                    var endPoint = this.state.DailyVol.length
                }
                else{
                   var endPoint = (10*this.state._index) + 10
                }
                
                for(var x = (10*this.state._index);x<endPoint;x++){
        
                    appendString = appendString + '<tr><td style="background:#B8B8B8">'+(x+1)+
                                                  '</td><td>'+this.state.DailyVol[x].Date+
                                                  '</td><td>'+this.state.parsedData[indexSearch(this.state.DailyVol[x].Date,"Day")].DoW+
                                                  '</td><td>'+AADT+
                                                  '</td><td>'+this.state.DailyVol[x].Total+
                                                  '</td><td>'+((this.state.DailyVol[x].Total/AADT)*100).toFixed(2)+
                                                  '%</td><td>'+this.state.parsedData[indexSearch(this.state.DailyVol[x].Date,"Day")].hour+
                                                  '</td><td>'+this.state.parsedData[indexSearch(this.state.DailyVol[x].Date,"Day")].HourVol+
                                                  '</td><td>'+((this.state.parsedData[indexSearch(this.state.DailyVol[x].Date,"Day")].HourVol/this.state.DailyVol[x].Total)*100).toFixed(2)+
                                                  '%</td><td>'+((this.state.parsedData[indexSearch(this.state.DailyVol[x].Date,"Day")].HourVol/AADT)*100).toFixed(2)+
                                                  '%</td><td>'+this.state.parsedData[indexSearch(this.state.DailyVol[x].Date,"Day")].Direction+
                                                  '</td><td>'+this.state.parsedData[indexSearch(this.state.DailyVol[x].Date,"Day")].PeakHourVol+
                                                  '</td><td>'+this.state.parsedData[indexSearch(this.state.DailyVol[x].Date,"Day")].PerPeakHour+
                                                  '%</td><td>'+((this.state.parsedData[indexSearch(this.state.DailyVol[x].Date,"Day")].PeakHourVol/this.state.DailyVol[x].Total)*100).toFixed(2)+
                                                  '%</td><td>'+((this.state.parsedData[indexSearch(this.state.DailyVol[x].Date,"Day")].PeakHourVol/AADT)*100).toFixed(2)+
                                                  '</td></tr>'
                }
                
                $("#reportTableData tbody").append(appendString)

            }
       function indexSearch(index,kind){
            if(kind === "Date"){
                return scope.state.DailyVol.map(function(el) {return el.Date;}).indexOf(index)  
            }
            else if(kind === "Day"){
                return scope.state.parsedData.map(function(el) {return el.Date;}).indexOf(index)
            }
        }
       
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

        var title = 'Yearly Highest Days Report';
        //console.log(this.props)       
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
                    {this.renderTable()}
                </div>
                
            </section>
        );
    }
});

function getDOW(year,month,day2){
        if(year < 10){
            var fullDate = new Date(getMonth(month)+' '+day2+', 200'+year+' 23:15:30')    
        }
        else{
            var fullDate = new Date(getMonth(month)+' '+day2+', 20'+year+' 23:15:30')    
        }
        var day = fullDate.getDay()
            if(day == 0){
                return 'Sunday'
            }
            else if(day == 1){
                return 'Monday'
            }
            else if(day == 2){
                return 'Tuesday'
            }
            else if(day == 3){
                return 'Wednesday'
            }
            else if(day == 4){
                return 'Thursday'
            }
            else if(day == 5){
                return 'Friday'
            }
            else if(day == 6){
                return 'Saturday'
            }
        }
function getMonth(month){
    if(month == 1){
        return "January"
    }
    else if(month == 2){
        return "February"
    }
    else if(month == 3){
        return "March"
    }
    else if(month == 4){
        return "April"
    }
    else if(month == 5){
        return "May"
    }
    else if(month == 6){
        return "June"
    }
    else if(month == 7){
        return "July"
    }
    else if(month == 8){
        return "August"
    }
    else if(month == 9){
        return "September"
    }
    else if(month == 10){
        return "October"
    }
    else if(month == 11){
        return "November"
    }
    else if(month == 12){
        return "December"
    }
}

    function getDir(dir){
          if(dir == 0){
            return "EW/SENW"
          }
          else if(dir == 1){
            return "North"
          }
          else if(dir == 2){
            return "Northeast"
          }
          else if(dir == 3){
            return "East"
          }
          else if(dir == 4){
            return "Southeast"
          }
          else if(dir == 5){
            return "South"
          }
          else if(dir == 6){
            return "Southwest"
          }
          else if(dir == 7){
            return "West"
          }
          else if(dir == 8){
            return "Northwest"
          }
          else{
            return "NS/NESW"
          }
        }

        function compareVolDay(a, b) {
            return b.Total - a.Total
        }
        function compareVolHour(a, b) {
            return b.HourVol - a.HourVol 
        }


module.exports = tableContainer;