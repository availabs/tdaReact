'use strict';

var React = require('react'),
   
    // -- Utils
    stnCardMeta = require('../../utils/data/stnCardMeta');


var StationInfo = React.createClass({
	
    
    renderTable:function(){
        if(!this.props.stationInfo){
            return (
                <span />
            )
        }
        return (
            <table className="table" style={{'marginTop': '-10px'}}>
                        <tr>
                            <td>Route</td>
                            <td>{stnCardMeta.posted_route_sign_abbr[this.props.stationInfo.posted_route_sign]+'-'+ parseInt(this.props.stationInfo.posted_sign_route_num)}</td>
                        </tr>
                        <tr>
                            <td>Type</td>
                            <td>{this.props.method_of_truck_weighing > 0 ? 'WIM+Class' :'Class'}</td>
                        </tr>
                        <tr>
                            <td>Functional Class</td>
                            <td>{this.props.stationInfo.func_class_code}</td>
                        </tr>
                        <tr>
                            <td>Lanes</td>
                            <td>{this.props.stationInfo.num_lanes_direc_indicated*2}</td>
                        </tr>
                        <tr>
                            <td>Sensor Type</td>
                            <td>{stnCardMeta.type_of_sensor[this.props.stationInfo.type_of_sensor]}</td>
                        </tr>
                        <tr>
                            <td> Class Algorithm</td>
                            <td>{stnCardMeta.alg_for_vehicle_class[this.props.stationInfo.alg_for_vehicle_class]}</td>
                        </tr>
                         <tr>
                            <td> Primary Purpose</td>
                            <td>{stnCardMeta.primary_purpose[this.props.stationInfo.primary_purpose]}</td>
                        </tr>
                        
                    </table>

        )
    },
    render:function(){
      	var scope = this;
    	var svgStyle = {
          height: '100%',
          width: '100%'
        },
        
        titleStyle = {
            'left': '114.5px',
            'top': '84px'
        };
        //console.log('stationInfo',this.props.stationInfo)
        // <div className="visits">15866<br/> visits </div>
    	return(
    		<section className="widget large">
                <div className="body">
                   {this.renderTable()}
                </div>
            </section>	
    	)
    },

  
});

module.exports = StationInfo;