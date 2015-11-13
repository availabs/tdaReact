'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    Sparklines = require('../charts/sparklines').Sparklines,
    SparklinesLine  = require('../charts/sparklines').SparklinesLine,
    CalendarGraph = require('../dataManagement/calendarGraph.react'),
    //-- Stores


    //-- Utils
    colorRange =  ["#4575b4", "#91bfdb", "#e0f3f8", "#ffffbf", "#fee090", "#fc8d59", "#d73027"], //colorbrewer.Greys[7], //colorbrewer.RdYlBu[7],
    colorScale = d3.scale.quantile().domain([0,70000]).range(colorRange),
    directionCodes = require('../../utils/data/directionCodes');
 

var removeLabels = function(){
    d3.selectAll('#adtchart svg .nv-x .tick text').text('')
}

var GraphContainer = React.createClass({

    
    getDefaultProps:function(){
        return {
           
        }
    },

    getInitialState:function(){
        return {
            currentData:[],
            display:'total',
            direction:null,
        }
    },

    componentDidMount:function(){
        if(this.props.selectedState && this.props.station){
            this._loadData(this.props.selectedState,this.props.station,this.props.agency);
        }
    },

    componentWillReceiveProps:function(nextProps){
        if(nextProps.selectedState && nextProps.agency  && nextProps.station){
            this._loadData(nextProps.selectedState, nextProps.station, nextProps.agency);
        }
    },



    _loadData:function(fips,station,agency){
        var scope = this;
       
        if(fips && agency){
            var url = '/heatcalendar/'+fips+'/'+station+'?database='+agency;
            console.log('heatcalendar load data',url)
            this.setState({currentData:[]});
            d3.json(url)
            .post(JSON.stringify({filters:scope.props.filters}),function(err,data){
                    
                if(err){ console.log('error:',err),  scope.setState({currentData:[]});}
                var newData = scope.processData(data)
                scope.setState({
                    currentData:newData,
                    direction:Object.keys(newData)[0]
                });
                
            })
        }

    },



   

    processData:function(data){
        var dirs ={years:[]}


        data.forEach(function(d){
            
            if(dirs.years.indexOf(d.y) === -1) dirs.years.push(d.y)

            if(!dirs[d.dir] ) dirs[d.dir] = {} 
            
            dirs[d.dir][getYear(d.y)+'-'+getTime(d.m)+'-'+getTime(d.d)] = {y:d.y,over:d.o,total:d.t }
        
        })
        

        return dirs;
    },

    drawGraphs:function(){
        
        if( !this.state.currentData.years || !this.state.currentData[this.props.direction] ) return;

        var scope = this,
            element = document.querySelector('#calDiv'),
            elemWidth = parseInt(window.getComputedStyle(element).width) *0.95;


        return scope.state.currentData.years.map(function(year){

            var yearData = {},
                domain = Object.keys(scope.state.currentData[scope.props.direction]).map(function(k){
                    var point = scope.state.currentData[scope.props.direction][k];
                    var out = scope.props.display === 'percent' ? (point.over/point.total) * 100 : point.o;
                    return 
                })

            Object.keys(scope.state.currentData[scope.props.direction]).filter(function(key){
                
                return scope.state.currentData[scope.props.direction][key].y === year;

            }).forEach(function(key){
                //console.log(key)
                var point = scope.state.currentData[scope.props.direction][key];
                var out = scope.props.display === 'percent' ? (point.over/point.total) * 100 : point.over;
                return yearData[key] = out
            })

            console.log('year data',yearData,colorRange);

            return (
                <CalendarGraph
                    dayOver={scope.dayOver}
                    dayOut={scope.dayOut}
                    dayMove={scope.dayMove}
                    width={elemWidth}
                    domain={domain}
                    range={colorRange}
                    divId={'ecg_'+getYear(year)} 
                    year={getYear(year)} 
                    data={ yearData }/>
            )

        })
    },

    dayOver:function(key,pos){
        var scope = this,
            dayStrings = ['0','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            data = scope.state.currentData[scope.state.direction][key];
        //console.log('over',data);

        d3.select("#nytg-tooltip").style('top',(pos[1]-10)+"px").style('left',pos[0]+"px").style('display','block')
        d3.select("#nytg-tooltip .nytg-department").text('Station '+this.props.station)
        d3.select("#nytg-tooltip .nytg-name").html(
            key+'<br>'+
            '<table style="width:100%;">'+
            '<tr><td style="text-align:left"># Violations:</td><td style="text-align:right"><strong>'+(data ? data.over.toLocaleString() : '') +'</strong></td></tr>'+
            '<tr><td style="text-align:left"># Tractor Trailers:</td><td  style="text-align:right"><strong>'+(data ? data.total.toLocaleString() : '') +'</strong></td></tr>'+
            '<tr><td style="text-align:left">% violations:</td><td style="text-align:right"><strong>'+(data ? ((data.over/data.total)*100).toFixed(2) : '')+'%</strong></td></tr></table>'
            
        )   
    },

    dayMove:function(pos){
        d3.select("#nytg-tooltip").style('top',(pos[1]-10)+"px").style('left',pos[0]+"px").style('display','block')        
    },

    dayOut:function(e){

        d3.select("#nytg-tooltip").style('display','none')
    },

    render: function() {
        var scope = this;
       
        
        //console.log('adtGraph',this._processData())
        return (
           
            <div  className='row' id='calDiv'>
                <div className='col-sm-12'>
                                    
                    {JSON.stringify(this.state.currentData.years)}
                    {scope.props.display}
                    {scope.drawGraphs()}
                </div>
            </div>            
        );
    }
});

function getTime(time){
          
    if(time.length == 1){
        time = '0'+time
    }
    return time;
}
function getYear(year){
            
    if(year.length  == 2){
            year = parseInt('20'+year)
        }
    if(year.length == 1){
        year = parseInt('200'+year)
    }
    return year;
}
module.exports = GraphContainer; 