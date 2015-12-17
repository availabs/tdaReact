'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    Sparklines = require('../charts/sparklines').Sparklines,
    SparklinesLine  = require('../charts/sparklines').SparklinesLine,
    ToolTip = require('../utils/nytToolTip.react'),
    EnforcementCalendar = require('./enforcementCalendar.react'),
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
            loading:true
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
            var url = '/heatmap/'+fips+'/'+station+'?database='+agency;

            this.setState({currentData:[],loading:true});
            d3.json(url)
            .post(JSON.stringify({
                type:scope.props.type,
                threshold:scope.props.threshold ,
                filters:scope.props.filters}),function(err,data){
                    
                if(err){ console.log('error:',err),  scope.setState({currentData:[]});}
                var newData = scope.processData(data)
                scope.setState({
                    currentData:newData,
                    direction:Object.keys(newData)[0],
                    loading:false
                });
                
            })
        }

    },

   

    processData:function(data){
        var dirs ={}


        data.forEach(function(d){
            if(!dirs[d.dir] ){dirs[d.dir] = {} }
            dirs[d.dir][d.dow+'_'+d.hour] = {over:d["f1_"],total:d["f0_"] }
        })
        //{"dow":"1","hour":"0","f0_":"906","dir":"3","f1_":"91"},
        //{"dow":"1","hour":"0","f0_":"737","dir":"7","f1_":"20"},


        return dirs;
    },

    heatOver:function(e){
        var scope = this,
            dayStrings = ['0','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            day = e.target.classList[1].split('_')[1],
            hour = e.target.classList[2].split('_')[1],
            data = scope.state.currentData[scope.state.direction][day+'_'+hour],
            ampm =  hour<12 ? 'am': 'pm',
            displayHour = hour%12 === 0 ? 12 : hour%12;

        d3.select("#nytg-tooltip").style('top',(e.screenY-120)+"px").style('left',e.screenX+"px").style('display','block').style('position','fixed')
        d3.select("#nytg-tooltip .nytg-department").text('Station '+this.props.station)
        d3.select("#nytg-tooltip .nytg-name").html(
            dayStrings[day]+' - '+displayHour+':00'+ ampm +'<br>'+
            '<table style="width:100%;">'+
            '<tr><td style="text-align:left"># Violations:</td><td style="text-align:right"><strong>'+data.over.toLocaleString()+'</strong></td></tr>'+
            '<tr><td style="text-align:left"># Tractor Trailers:</td><td  style="text-align:right"><strong>'+data.total.toLocaleString()+'</strong></td></tr>'+
            '<tr><td style="text-align:left">% violations:</td><td style="text-align:right"><strong>'+((data.over/data.total)*100).toFixed(2)+'%</strong></td></tr></table>'
            
        )   
    },

    heatMove:function(e){
        d3.select("#nytg-tooltip").style('top',(e.screenY-120)+"px").style('left',e.screenX+"px").style('display','block')        
    },

    heatOut:function(e){

        d3.select("#nytg-tooltip").style('display','none')
    },

    drawGraph:function(){
        if(!this.state.direction || !this.state.currentData[this.state.direction]) return;
        var scope = this,
            days = d3.range(1,8),
            hours = d3.range(0,24),
            dayStrings = ['0','Su','M','T','W','Th','F','Sa'];


        colorScale.domain( 
            Object.keys(scope.state.currentData[scope.state.direction])
                .map(function(key){ 

                    return scope.state.display === 'total' ?  scope.state.currentData[scope.state.direction][key].over : (+scope.state.currentData[scope.state.direction][key].over/+scope.state.currentData[scope.state.direction][key].total)*100
                }) 
        )
        console.log(colorScale(50))

        var rows = days.map(function(day){

            var cols = hours.map(function(hour){
                var data = scope.state.display === 'total' ?  scope.state.currentData[scope.state.direction][day+'_'+hour].over : (+scope.state.currentData[scope.state.direction][day+'_'+hour].over/+scope.state.currentData[scope.state.direction][day+'_'+hour].total)*100
                return (
                    <td 
                        onMouseOver={scope.heatOver} 
                        onMouseMove={scope.heatMove} 
                        onMouseOut={scope.heatOut} 
                        className={'heatcell day_'+day+' hour_'+hour} style={{ opacity: 0.9, backgroundColor:colorScale(data || 0 ) }}>
                       <div className='heatcell' style={{width:'100%',height:'100%'}} />
                      
                    </td>
                )
            })

            return (
                <tr>
                    <td>{dayStrings[day]}</td>
                    {cols}
                </tr>
            )
        })
        console.log('quantiles',colorScale.range())
        var legend = colorScale.quantiles().map(function(d){

            return(
                <div style={{display:'inline-block',width:'16.5%',color:invertColor(colorScale(d)),fontSize:10,backgroundColor:colorScale(d)}}>
                    <span> {'≥'} {d.toLocaleString('en-US',{maximumFractionDigits:0})} {scope.state.display === 'percent' ? "%" : ''}</span>
                </div>
            )
        })
        return (
            <div>
               
                <table className='table'>
                    <thead style={{fontSize:8}}>
                        <th ></th>
                        <th colSpan={2}>0-2am</th>
                        <th colSpan={2}>2-4am</th>
                        <th colSpan={2}>4-6am</th>
                        <th colSpan={2}>6-8am</th>
                        <th colSpan={2}>8-10am</th>
                        <th colSpan={2}>10-12pm</th>
                        <th colSpan={2}>12-2pm</th>
                        <th colSpan={2}>2-4pm</th>
                        <th colSpan={2}>4-6pm</th>
                        <th colSpan={2}>6-7pm</th>
                        <th colSpan={2}>8-10pm</th>
                        <th colSpan={2}>10-12am</th>
                    </thead>

                    <tbody>
                        {rows}
                    </tbody>
                </table>
                 <div style={{paddingBottom:15,width:'100%'}}>
                   
                    {legend}
                </div>
                
            </div>

        )
           
    },
    
    setDirection:function(dir){
        this.setState({direction:dir})
    },
    setDisplay:function(val){
        this.setState({display:val})
    },

    shouldComponentUpdate:function(nextProps,nextState){
        if(this.state.loading !== nextState.loading || nextProps.selectedState !== this.props.selectedState || this.props.agency !== nextProps.agency  || nextProps.station !== this.props.station){
            //console.log('update?',this.state.loading !== nextState.loading,zthis.state.loading !== nextState.loading)
            return true;
        }
        return true;
    },
 
    render: function() {
        var scope = this;
       
        
        //console.log('adtGraph',this._processData())
        return (
           
            <section className="widget" style={{ background:'none'}}>
                <div  className='row'>
                    <div className='col-sm-4'>
                        Direction:<br/>
                        <div className="btn-group" data-toggle="buttons">
                            <label
                                style={{color:'#333'}}
                                onClick={this.setDirection.bind(null,Object.keys(this.state.currentData)[0])} 
                                className={Object.keys(this.state.currentData)[0] === this.state.direction ? "btn  active" : 'btn '}>
                                <input type="radio" /> {directionCodes[Object.keys(this.state.currentData)[0]]}
                            </label>
                            <label
                                style={{color:'#333'}}
                                onClick={this.setDirection.bind(null,Object.keys(this.state.currentData)[1])}  
                                className={Object.keys(this.state.currentData)[1] === this.state.direction ? "btn  active" : 'btn '}>
                                <input type="radio" /> {directionCodes[Object.keys(this.state.currentData)[1]]}
                            </label>
                        </div>
                    </div>
                    <div className='col-sm-6'>
                        Display:<br/>
                        <div className="btn-group" data-toggle="buttons">
                            <label
                                style={{color:'#333'}}
                                onClick={this.setDisplay.bind(null,'total')}  
                                className={this.state.display === 'total' ? "btn  active" : 'btn '}>
                                <input type="radio" /> Total (#)
                            </label>
                            <label
                                style={{color:'#333'}}
                                onClick={this.setDisplay.bind(null,'percent')}  
                                className={this.state.display === 'percent' ? "btn  active" : 'btn '}>
                                <input type="radio" /> Percent (%)
                            </label>
                            
                        </div>
                    </div>
                </div>

                
                {this.drawGraph()}
                <ToolTip />
                <div>
                    <EnforcementCalendar 
                        selectedState = {this.props.selectedState}
                        station = {this.props.station}
                        agency = {this.props.agency}
                        direction={this.state.direction} 
                        display={this.state.display} />
                </div>
            </section>
            
        );
    }
});
function invertColor(hexTripletColor) {
    var color = hexTripletColor;
    color = color.substring(1);           // remove #
    color = parseInt(color, 16);          // convert to integer
    color = 0xFFFFFF ^ color;             // invert three bytes
    color = color.toString(16);           // convert to hex
    color = ("000000" + color).slice(-6); // pad with leading zeros
    color = "#" + color;                  // prepend #
    return color;
}
module.exports = GraphContainer; 