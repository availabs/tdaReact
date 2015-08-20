'use strict';

var React = require('react'),
    Navigation = require('react-router').Navigation,
    
    
    // -- Stores
    StationStore = require('../../stores/StationStore'),
    StateWideStore = require('../../stores/StatewideStore'),

    // -- Components
    ToolTip = require('../utils/ToolTip.react'),

    // -- Actions
    ClientActionsCreator = require('../../actions/ClientActionsCreator'),

    // -- Utils
    L =                 require('../../utils/dependencies/leaflet'),
    d3 =                require('d3'),
    topojson =          require('topojson'),
    colorbrewer =       require('colorbrewer'),
    leafletTileLayer =  require('../../utils/dependencies/L.Tilelayer.Vector'),
    fips2state =        require('../../utils/data/fips2state'),
    stnCardMeta =        require('../../utils/data/stnCardMeta');
    
var map = null,
    geoData = {'states':null,'congress':null,'counties':null},
    stateLayer = null,
    stationLayer = null,
    vectorLayer = null,
    colorRange = colorbrewer.RdBu[5].reverse(),
    AdtScale = d3.scale.quantile().domain([0,70000]),
    HpmsScale = d3.scale.quantile().domain([500,150000]).range(colorRange),
    hpmsData = [];

var StateWideMap = React.createClass({
    
    mixins: [Navigation],

    getDefaultProps: function() {
        return {
            height: 700
        };
    },

    getInitialState: function() {
        return {
            selectedState:null,
            stations:{
                type:"FeatureCollection",
                features: []
            },
            classByMonth : StateWideStore.getClassByMonth()
        };
    },
    
    
    
    componentDidMount: function() {

        StationStore.addChangeListener(this._onStationsLoad);
        StateWideStore.addChangeListener(this._newData);
        var scope = this;

        //var height = this.props.height
        var mapDiv = document.getElementById('map');
        mapDiv.setAttribute("style","height:"+this.props.height+"px");
        
        var key = 'erickrans.4f9126ad',//am3081.kml65fk1,
            mapquestOSM = L.tileLayer("http://{s}.tiles.mapbox.com/v3/"+key+"/{z}/{x}/{y}.png");
        
        L.Icon.Default.imagePath= '/bower_components/leaflet/dist/images';
        map = L.map("map", {
          center: [39.8282, -98.5795],
          zoom: 4,
          layers: [mapquestOSM],
          zoomControl: false,
          attributionControl:false
        });
        d3.json('/geo/states.json',function(data){
            //if data is topo, convert
            if (data.type == "Topology") {
                for(var key in data.objects){
                  data = topojson.feature(data, data.objects[key]);
                } 
            }
            
            stateLayer = L.geoJson(data, {
                style: function (feature) {
                  return {
                    stroke:false,
                    fillOpacity:0.0,
                    className:'geo-'+feature.properties.geoid
                  };
                },
                onEachFeature: function (feature, layer) {
                    hpmsData.push(feature.properties.AADT);
                    layer.on({
                        click: scope.stateClick,
                        mouseover: function(e){
                            var layer = e.target;
                            if(layer._path.className.baseVal.split(' ').indexOf('active_geo') < 0){
                                layer.setStyle({
                                    stroke:false,
                                    fillOpacity:0.3
                                });
                            }
                        },
                        mouseout: function(e){
                             var layer = e.target;
                             layer.setStyle({
                                stroke:false,
                                fillOpacity:0.0
                              });
                        }
                    });


                }
            })
            stateLayer.addTo(map);
            //hpmsMap.init(map);
        });
    },
    
    componentWillUnmount: function() {
        StationStore.removeChangeListener(this._onStationsLoad);
        StateWideStore.removeChangeListener(this._newData);
    },

    _onStationsLoad:function(){
        if(this.state.selectedState){
            var newState = this.state;
            newState.stations.features = StationStore.getStateStations(this.state.selectedState);    
        }

    },

    _newData:function(){
        var scope = this;

        this.setState({classByDay:StateWideStore.getClassByMonth()})
        if(Object.keys(this.state.classByDay.getDimensions()).length > 0){
            
            var stationData = {};

            var stationADT = scope.state.classByDay.getGroups()
                .ADT.order(function(p){return p.avg})
                .top(Infinity)
            
            stationADT
                .forEach(function (ADT){
                    stationData[ADT.key] = ADT.value.avg;
                })

            AdtScale.domain(stationADT.map(function(ADT){
                return ADT.value.avg;
            }));



            scope.state.stations.features = scope.state.stations.features.map(function(station){
                station.properties.ADT = stationData[station.properties.station_id] || 0;
                return station;
            });
            
            scope._updateStations(scope.state.stations);
            

        }
    },

    //----------------------------------------------------------------------------------------------------------------
    // Render Components
    //----------------------------------------------------------------------------------------------------------------
    render: function() {

        return (
            <div id="map">
                <ToolTip />
            </div>
        );
    },
    
    //---------------------------------------------------------------------------------------------------------------
    // Map Actions
    //---------------------------------------------------------------------------------------------------------------
    stateClick: function(e){
        //console.log(e);
        if (e.originalEvent.ctrlKey) {
            var scope = this,
                newState = this.state;

            var bounds= d3.geo.bounds(e.target.feature)
            

            map.fitBounds([bounds[1].reverse(),bounds[0].reverse()]);
            var d = e.target.feature;
            
            d3.select('.active_geo').attr('fill','#3388ff').classed('active_geo',false);
            if(d.properties.geoid){
                d3.select('.geo-'+d.properties.geoid)
                    .attr('fill','none')
                    .classed('active_geo',true);
            }
            
            newState.selectedState = d.properties.geoid;
            newState.stations.features = StationStore.getStateStations(d.properties.geoid);

            this.setState(newState);
            ClientActionsCreator.setSelectedState(newState.selectedState);
            scope._loadHPMS();
            
        }

    },
    //---------------------------------------------------------------------------------------------------------------
    //Station Visualizationing
    //---------------------------------------------------------------------------------------------------------------
    _updateStations : function(stationsGeo){
        var scope = this;
        if(map.hasLayer(stationLayer)){
            map.removeLayer(stationLayer)
        }
        
        stationLayer = L.geoJson(stationsGeo, {
            pointToLayer: function (d, latlng) {
                var options = {
                   
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8,
                    stroke:false,
                    className:'station station_'+d.properties.station_id+' '+'route_'+parseInt(d.properties.posted_sign_route_num)
                };

                AdtScale.range([0,3,4,5,6,7,8,9])
                options.radius = AdtScale(d.properties.ADT || 0);
                AdtScale.range(colorRange);                
                options.fillColor = AdtScale(d.properties.ADT || 0);

                return L.circleMarker(latlng, options);
            },
            onEachFeature: function (feature, layer) {
                
                layer.on({
                    click: function(e){
                        //console.log('station_click',e.target.feature.properties);
                       ClientActionsCreator.setSelectedStation(feature.properties.station_id,feature.properties.state_fips)
                    },
                    
                    dblclick: function(e){
                        console.log('dbl click',feature.properties.station_id);
                       //scope.transitionTo('singleStation', {stationId: feature.properties.station_id,fips:feature.properties.state_fips});
                        
                    },

                    mouseover: function(e){
                        //e.target.setStyle({stroke:true,weight:3});
                        d3.selectAll('.station_'+e.target.feature.properties.station_id).classed('highlighted-station',true);
                        var toolTip = d3.select('.ToolTip').style({
                            top:e.originalEvent.clientY+'px',
                            left:e.originalEvent.clientX+'px',
                            display:'block'
                        });

                        toolTip.select('h4')
                            .attr('class','TT_Title')
                            .html('STATION '+feature.properties.station_id);

                        toolTip.select('span')
                            .attr('class','TT_Content')
                            .html(scope._StationToolTipContent(feature.properties));
                    
                    },
                    mouseout: function(e){
                        //e.target.setStyle({stroke:false})
                        d3.selectAll('.highlighted-station').classed('highlighted-station',false);
                        d3.select('.ToolTip').style({display:'none'});
                        
                    }
                });
                // if (feature.properties) {
                //     var popupString = '<div class="popup">';
                //             for (var k in feature.properties) {
                //                 var v = feature.properties[k];
                //                 popupString += k + ': ' + v + '<br />';
                //             }
                //             popupString += '</div>';
                //     layer.bindPopup(popupString);
                // }
            }
        });
        stationLayer.addTo(map);
    },
    _StationToolTipContent:function(props){
        
        var rows = Object.keys(stnCardMeta.stationNameMap).map(function(key){
            var value = stnCardMeta[key] ?  stnCardMeta[key][props[key]] : props[key];
            var row = ''+
                '<tr>'+
                    '<td>'+stnCardMeta.stationNameMap[key]+'</td>'+
                    '<td>'+ value +'</td>'+
                '</tr>'
            return row;
        });
        var type = props.method_of_truck_weighing > 0 ? 'WIM' :'Class';
        var c =''+
            '<table class="table">'+
                '<tr>'+
                    '<td>Type</td>'+
                    '<td>'+ type +'</td>'+
                '</tr>'+
                '<tr>'+
                    '<td>Route</td>'+
                    '<td>'+ stnCardMeta.posted_route_sign_abbr[props.posted_route_sign]+'-'+ parseInt(props.posted_sign_route_num) +'</td>'+
                '</tr>'+
                rows.join(' ')+
            '</table>';

        return c;
    },
    //----------------------------------------------------------------------------------------------------------------
    // HPMS
    //----------------------------------------------------------------------------------------------------------------
    _loadHPMS:function(stateFips){
        var scope = this;
        if(map.hasLayer(vectorLayer)){
            map.removeLayer(vectorLayer);
        }
        hpmsData = [];
        var style = function(d){
            return{
                "color": HpmsScale(d.properties.aadt),
                "fillColor": "#1B1",
                "opacity": 0.8,
                "fillOpacity": 0.1,
                "cursor": 'pointer',
                "className" : 'route_'+d.properties.type+'_'+d.properties.route,
                //"stroke":true
            }
            
        };
        // style of feature when hovered
        var highlightStyle = {
            "weight": 13,
            "fillOpacity": 0.4
        };

        function mousover(e) {
            var feature = e.target.feature;
            if(feature.properties.route != '0'){
                d3.selectAll("."+e.target.options.className).attr('stroke-width','13px').style('cursor','pointer');
            }

            d3.selectAll('.station_'+e.target.feature.properties.station_id).classed('highlighted-station',true);
            var toolTip = d3.select('.ToolTip').style({
                top:+(e.originalEvent.clientY+5)+'px',
                left:+(e.originalEvent.clientX+5)+'px',
                display:'block'
            });

            toolTip.select('h4')
                .attr('class','TT_Title')
                .html(stnCardMeta.posted_route_sign_abbr[feature.properties.type]+'-'+ parseInt(feature.properties.route)+" AADT:"+feature.properties.aadt);

            toolTip.select('span')
                .attr('class','TT_Content')
                .html('');
        }

        function mousout(e) {
            //var layer = e.target;
            //layer.setStyle(style);
            d3.selectAll("."+e.target.options.className).attr('stroke-width','3px');
            d3.select('.ToolTip').style({display:'none'});            
        }

        function click(e) {
            var props = e.target.feature.properties;
            var stations = d3.selectAll('.route_'+props.route)[0].map(function(ds){
                return  ds.classList[1].split('_')[1];
            });
            //console.log('click',stations)
            ClientActionsCreator.filterStations(stations);
        }

        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: mousover,
                mouseout: mousout,
                click:click
            });

        }

        // filters out invalid (empty) geometries in Polymaps county dataset
        // to avoid exceptions in L.GeoJSON
        function filterInvalidGeometry(feature) {
            var geometry = feature.type === 'Feature' ? feature.geometry : feature;
            return geometry.type !== undefined;
        };

        var vectorOptions = {
            style: style,
            onEachFeature: onEachFeature,
            filter: filterInvalidGeometry
        };
        var state = fips2state[this.state.selectedState].name.replace(/\s/g,'').toLowerCase();
        var url = 'http://lor.availabs.org:1331/'+state+'2012/{z}/{x}/{y}.json';
        var options = {
            // remove tiles outside viewport
            unloadInvisibleTiles: true,
            // no tile loading while panning (slow with large vector tiles)
            updateWhenIdle: true,
            serverZooms: [3,4,5,6,7,8,9,10,11,12,13],
            //serverZooms: [3,5,7],
            //maxNativeZoom: 7,
            minZoom: 2
        };
        vectorLayer = new L.TileLayer.Vector(url, options, vectorOptions); 
       
            // add as base to switch with radio instead of checkbox
        vectorLayer.addTo(map);
            
    }
});

module.exports = StateWideMap;
