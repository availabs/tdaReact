'use strict';

var React = require('react'),
   
    // -- Utils
    stnCardMeta = require('../../utils/data/stnCardMeta');


var StationInfo = React.createClass({
	
     processData:function() {
        var scope = this,
            classGrouping = 'classGroup';

        if(scope.props.stationData.initialized()){
            
            var dailyTraffic = scope.props.stationData.getGroup(classGrouping).top(Infinity).map(function(vclass,i){
                scope.props.stationData.getDimension(classGrouping).filter(vclass.key);
                return scope.props.stationData.getGroup('dir').top(Infinity).map(function(dir,i){
                    scope.props.stationData.getDimension('dir').filter(dir.key);
                    var mult = 1;
                    if(i > 0){
                        mult = -1;
                    }
                    return {
                        key:vclass.key,
                        values: scope.props.stationData.getGroup('average_daily_traffic').top(Infinity).map(function(time){
                            return {
                                key:time.key,
                                value:time.value*mult
                            }
                        })
                    }
                })
            }).map(function(dirSet,i){
                if(dirSet[1]){
                    dirSet[1].values.forEach(function(d){
                        dirSet[0].values.push(d);
                    })
                }
                //dirSet[0].color = colorRange[i];
                dirSet[0].values.sort(function(a,b){
                    return b.key - a.key;
                });
                // if(scope.props.filters.year){
                //     dirSet[0].values = dirSet[0].values.filter(function(d){ return d.key == scope.props.filters.year; })
                // }
                return dirSet[0];
            }).sort(function(a,b){
                return a.key.split(' ')[0] - b.key.split(' ')[0];
            });


            return dailyTraffic;
        }
        return [{key:'none',values:[]}]
        
    },
    render:function(){
      	var scope = this;
    	console.log('Station Info',this.processData(),this.props.stationData)
        // <div className="visits">15866<br/> visits </div>
    	return(
    		<section className="widget large">
                <div className="body">
                   <table className="table" style={{'marginTop': '-10px'}}>
                        
                        
                        
                    </table>
                </div>
            </section>	
    	)
    },

  
});

module.exports = StationInfo;