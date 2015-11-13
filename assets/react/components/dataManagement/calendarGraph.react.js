'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
   
    //-- Stores
    

    //-- Utils
    colorRange = colorbrewer.YlGn[8],
    DataScale = d3.scale.quantile().domain([0,70000]).range(colorRange);

var GraphContainer = React.createClass({
    
    getDefaultProps:function(){
        return {
            height: 150,
            divId: 'calChart0',
            year:2015
        }
    },
    
    componentDidMount:function(){
        this._renderGraph();
        this._updateData();
        if(this.props.domain) {
            DataScale.domain(this.props.domain)
        }
        if(this.props.range) {
            DataScale.range(this.props.range)
        }
    },

    componentWillReceiveProps:function(nextProps){
        if(!this.props.data && nextProps.data){
            //console.log('receive1',this.props.divId,Object.keys(nextProps.data).length);
            this._updateData(nextProps.data);
        }
        else if(nextProps.data && Object.keys(nextProps.data).length !== Object.keys(this.props.data).length){
            //console.log('receive2',this.props.divId,Object.keys(nextProps.data).length,Object.keys(this.props.data).length);
            this._updateData(nextProps.data);
        
        }
    },

    _updateData:function(newData){
        var scope = this;
        var showData = this.props.data
        if(newData){
            showData = newData;
        }
        //console.log('_updateData1' ,this.props.divId,   showData);

        if(showData && Object.keys(showData).length > 0 ){
            //console.log('_updateData2' ,this.props.divId,showData.length);

            var values = Object.keys(showData).map(function(key){
                return showData[key];
            })
            var min = d3.min(values),
                max = d3.max(values);

            DataScale.domain([d3.min(values),d3.max(values)]);
            
            // console.log('scale stuff',
            //     DataScale,
            //     DataScale.domain(),
            //     DataScale.range(),
            //     DataScale(d3.max(values)/2),
            //     values.length
            // );

            
            var days = d3.select('#'+this.props.divId).selectAll("svg").selectAll(".day");
            //console.log('selection',days)
            days
                .filter(function(d) { 
                    //console.log('filtering',d,d in scope.props.data)
                    return d in showData; 
                })
                .attr("fill", function(d,i) { 
                    // if(i < 10){
                    //     console.log(d,scope.props.data[d],DataScale(scope.props.data[d]),DataScale(max/2),max,max/2)
                    // }
                    return DataScale(showData[d]); 
                })
                .select("title")
                    .text(function(d) { return d + ": " + showData[d]; });
       
        }
    },

    _renderGraph: function(){
        var scope = this;
        var width = this.props.width || 400,
            cellSize = Math.floor(width/52),
            height  = cellSize * 10;
             // cell size

        var day = d3.time.format("%w"),
            week = d3.time.format("%U"),
            percent = d3.format(".1%"),
            format = d3.time.format("%Y-%m-%d");

        var color = d3.scale.quantize()
            .domain([-.05, .05])
            .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

        var svg = d3.select('#'+this.props.divId).selectAll("svg")
            .data(d3.range(this.props.year, this.props.year+1))
          .enter().append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "RdYlGn")
          .append("g")
            .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

        svg.append("text")
            .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
            .style("text-anchor", "middle")
            .text(function(d) { return d; });

        var rect = svg.selectAll(".day")
            .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
          .enter().append("rect")
            .attr("class", "day")
            .attr('fill','#fff')
            .attr('stroke','#ccc')
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function(d) { return week(d) * cellSize; })
            .attr("y", function(d) { return day(d) * cellSize; })
            .on('mouseover',function(e,y){
                
                console.log()
                if(scope.props.dayOver){
                    scope.props.dayOver(e,[d3.event.clientX,d3.event.clientY])
                }
            })
            .on('mousemove',function(e,y){
                
                if(scope.props.dayMove){
                    scope.props.dayMove([d3.event.clientX,d3.event.clientY])
                }
            })
            .on('mouseout',function(e,y){
                
                if(scope.props.dayOut){
                    scope.props.dayOut()
                }
            })
            .datum(format)
            

        // rect.append("title")
        //     .text(function(d) { return d; });

        svg.selectAll(".month")
            .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
          .enter().append("path")
            .attr("class", "month")
            .attr('fill','none')
            .attr('stroke','#000')
            .attr('stroke-width', '2px')
            .attr("d", monthPath);


        function monthPath(t0) {
          var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
              d0 = +day(t0), w0 = +week(t0),
              d1 = +day(t1), w1 = +week(t1);
          return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
              + "H" + w0 * cellSize + "V" + 7 * cellSize
              + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
              + "H" + (w1 + 1) * cellSize + "V" + 0
              + "H" + (w0 + 1) * cellSize + "Z";
        }

       
    },

    render: function() {
        var svgStyle = {
          height: this.props.height+'px',
          width: '100%'
        }
        
        
        return (
        	
            <div id={this.props.divId}>
            </div>
                
        );
    }
});

module.exports = GraphContainer;