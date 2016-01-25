'use strict';

var React = require('react'),
    Navigation = require('react-router').Navigation,
    equal = require('deep-equal'),
    
    // -- Stores
    StationStore = require('../../stores/StationStore'),
    StateWideStore = require('../../stores/StatewideStore'),

    // -- Components

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
    colorRange = ["#313695", "#4575b4", "#74add1", "#fdae61", "#f46d43", "#d73027", "#a50026"],//colorbrewer.RdYlBu[5].reverse(),
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
            filters:{
                "year":this.props.filters.year,
                "month":this.props.filters.month,
                "class":this.props.filters.class,
                "dir":this.props.filters.dir,
                "stations":this.props.filters.stations
            }
            
        };
    },
    
    componentWillReceiveProps:function(nextProps){

        var scope = this;
        if( ['class', 'wim'].indexOf(nextProps.activeView) >= 0 ){
            console.log('update map colors', scope.props.mapData)
            this.state.stations.features.forEach(function(d){
                d3.select('.station_'+d.properties.station_id)
                    .attr('fill', nextProps.mapData[d.properties.station_id] ? nextProps.mapData[d.properties.station_id] :  AdtScale(0))
                //console.log(d.properties.station_id,AdtScale(d.properties.ADT))
            })
        }
        if(nextProps.activeView === 'wim' || nextProps.activeView === 'enforcement'){
            d3.selectAll('.type_Class').style('display','none')
        }else{
             d3.selectAll('.type_Class').style('display','block')
        }
        if(nextProps.activeView !== this.props.activeView){
            //console.log('new view')
            
            
            console.log(nextProps.activeView , 'dash')
            if(nextProps.activeView === 'dash' || nextProps.activeView === 'enforcement'){
                
                console.log('new dash')
                d3.selectAll('.type_Class')
                    .attr('fill','rgb(5, 112, 176)')
                    // .arrt('r',function(d){
                    //     d.prop
                    // })

                d3.selectAll('.type_WIM')
                    .attr('fill','rgb(35, 139, 69)')
                        
               
            }

        
        }
        if(nextProps.selectedState !== this.state.selectedState){

            this.setState({selectedState:nextProps.selectedState});
        
        }

        if(nextProps.selectedStation !== this.props.selectedStation){
            d3.selectAll('.selected_station').classed('selected_station',false)
            d3.selectAll('.station_'+nextProps.selectedStation).classed('selected_station',true)
        }
        
        // console.log('selectedState',nextProps.selectedState,this.props.selectedState ,nextProps.selectedState !== this.props.selectedState );
        // console.log('agency',nextProps.agency,this.props.agency ,nextProps.agency !== this.props.agency );
        console.log('activeView',nextProps.activeView,this.props.activeView ,nextProps.activeView !== this.props.activeView );
        //console.log('----------------------------')
         if(nextProps.activeView !== this.props.activeView ){
            if(nextProps.activeView === 'hpms' && this.state.selectedState){
                this._loadHPMS();
            }else if(this.props.activeView){
                if(map && map.hasLayer(vectorLayer)){
                    map.removeLayer(vectorLayer);
                }
            }
        }

        if( nextProps.selectedState !== this.props.selectedState || nextProps.agency !== this.props.agency ){ 
            console.log('loading data',nextProps.selectedState,nextProps.agency);
            this._loadData(nextProps.selectedState,nextProps.agency)
        }

       
    },
    
    componentDidMount: function() {

        StationStore.addStationListener(this._onStationsLoad);
        console.log('component did mount',this.props.selectedState,this.props.agency)
        

        var scope = this;

        //var height = this.props.height
        var mapDiv = document.getElementById('map');
        mapDiv.setAttribute("style","height:"+this.props.height+"px");
        
        var key = 'erickrans.4f9126ad',//am3081.kml65fk1,
            mapquestOSM = L.tileLayer("http://{s}.tiles.mapbox.com/v3/"+key+"/{z}/{x}/{y}.png",{name:"mapquestOSM"}),
            tContours = L.tileLayer("https://{s}.tiles.mapbox.com/v3/aj.um7z9lus/{z}/{x}/{y}.png",{name:"tContours"}),
            streetMap = L.tileLayer("https://{s}.tiles.mapbox.com/v3/am3081.nb3amb93/{z}/{x}/{y}.png",{name:"streetMap"}),
            aImagery = L.tileLayer("http://{s}.tiles.mapbox.com/v3/am3081.h0pml9h7/{z}/{x}/{y}.png",{name:"aImagery"}), //+ http://{s}.tiles.mapbox.com/v3/am3081.h0pml9h7/{z}/{x}/{y}.png              
            aImageTerr = L.tileLayer("https://{s}.tiles.mapbox.com/v3/matt.hd0b27jd/{z}/{x}/{y}.png",{name:"aImageTerr"});   

        var baseMaps = {
            "Dark Map" : mapquestOSM,
            "Light Map": streetMap,
            "Light Terrain (with streets)": tContours,
            "Dark Terrain (only terrain)" : aImageTerr,
            "Dark Terrain (with streets)" : aImagery,
            
        }

        L.Icon.Default.imagePath= '/bower_components/leaflet/dist/images';

        map = L.map("map", {
          center: [39.8282, -98.5795],
          zoom: 4,
          layers: [streetMap],
          baseLayers: [baseMaps],
          zoomControl: true,
          attributionControl:false
        });


        L.control.layers(baseMaps).addTo(map);

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
        StationStore.removeStationListener(this._onStationsLoad);
        //StateWideStore.removeChangeListener(this._newData);
    },


    _loadData:function(fips,agency){
        var scope = this;
        if(fips && agency){
            var url = '/tmgClass/stateAADT/'+fips+'?database='+agency;
            console.log('the url',url)
            d3.json(url)
                .post(JSON.stringify({filters:scope.props.filters}),function(err,data){
                if(err){console.log('map data error',err)}
                if(data.loading){
                        //console.log('reloading')
                        setTimeout(function(){ scope._loadData(fips) }, 2000);
                        
                }else{
                    
                    scope._newData(data);
                }
            })
        }

    },

    _onStationsLoad:function(){
        if(this.state.selectedState){
            
            var newState = this.state;
            newState.stations.features = StationStore.getStateStations(this.state.selectedState);

            var bounds= d3.geo.bounds(newState.stations);
            map.fitBounds([bounds[1].reverse(),bounds[0].reverse()]);
            this._loadData(this.props.selectedState,this.props.agency);

        }

    },

    _newData:function(stationADT){
        var scope = this;
  
        var stationData = {};

        stationADT
            .forEach(function (ADT){
                stationData[ADT.label] = ADT.value;
            })

        AdtScale.domain(stationADT.map(function(ADT){
            return ADT.value;
        }));

                

        var newStations = scope.state.stations;
        newStations.features = scope.state.stations.features.map(function(station){
            station.properties.ADT = stationData[station.properties.station_id] || 0;
            return station;
        });
        console.log('update stations ',newStations)
        scope._updateStations(newStations);
            

        
    },
    componentWillUpdate: function(nextProps, nextState){
        console.log('map update',this.state.selectedState, nextState.selectedState, nextProps.activeView)

        if(nextProps.activeView === 'hpms'){
            this._loadHPMS()
        }
    },
    //----------------------------------------------------------------------------------------------------------------
    // Render Components
    //----------------------------------------------------------------------------------------------------------------
    render: function() {
        d3.select('.geo-'+this.state.selectedState)
            .attr('fill','none')
            .classed('active_geo',true);

        if(this.props.selectedStation){
            console.log('.station_'+this.props.selectedStation)
            d3.selectAll('.station_'+this.props.selectedStation).classed('selected_station',true)
        }

        return (
            <div id="map">
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
            
            //console.log('what the map',map)
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
            //scope._loadHPMS();
            
        }

    },
    //---------------------------------------------------------------------------------------------------------------
    //Station Visualizationing
    //---------------------------------------------------------------------------------------------------------------
    _updateStations : function(stationsGeo){
        var scope = this;
        console.log('update stations')
        if(map.hasLayer(stationLayer)){
            map.removeLayer(stationLayer)
        }

        stationLayer = L.geoJson(stationsGeo, {
            pointToLayer: function (d, latlng) {
                //console.log('w/c',d.properties.station_id,d.properties.method_of_truck_weighing)
                var type = d.properties.method_of_truck_weighing > 0 ? 'WIM' :'Class';
                var options = {
                   
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8,
                    stroke:false,
                    className:'station station_'+d.properties.station_id+' '+
                    'route_'+parseInt(d.properties.posted_sign_route_num)+' '+
                    'type_'+type
                };

                //console.log('test', scope.props.activeView)
                    // AdtScale.range([0,3,4,5,6,7,8,9])
                    // AdtScale.range(colorRange);                
                    // options.fillColor = AdtScale(d.properties.ADT || 0);

                    AdtScale.range([0,3,4,5,6,7,8,9])
                    if(!d.properties.ADT){
                        options.radius = 0
                    }else{
                        options.radius = AdtScale(d.properties.ADT || 0) === 0 ? 0 : type === 'WIM' ? 6 : 5
                    }
                    AdtScale.range(colorRange);                
                    options.fillColor =  type === 'WIM' ? 'rgb(35, 139, 69)' : 'rgb(5, 112, 176)';

                

                return L.circleMarker(latlng, options);
            },
            onEachFeature: function (feature, layer) {
                
                layer.on({
                    click: function(e){
                       console.log('sclick',feature.properties.station_id,feature.properties.state_fips)
                       ClientActionsCreator.setSelectedStation(feature.properties.station_id,feature.properties.state_fips);
                       var d = e.target.feature;
                      
                       //d3.selectAll('.selected_station').classed('selected_station',false)
                    


                        d3.select('.ToolTip').style({display:'none'});
                    },
                    
                    dblclick: function(e){
                        //console.log('dbl click',feature.properties.station_id);
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
        
        //console.log('.station_'+d.properties.station_id,d3.selectAll('.station_'+d.properties.station_id).classed('selected_station'))
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
    _loadHPMS:function(){
        console.log('load hpms',this.state.selectedState)
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
                right: 0-((+e.originalEvent.clientX+5)) +'px',
                display:'block',
                'z-index':999999
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

        var d3Vector= {
            style: style
        };
        vectorLayer = new L.TileLayer.Vector(url, options, vectorOptions); 
        //map._initPathRoot();
        //vectorLayer = new L.TileLayer.d3_topoJSON(url, d3Vector)

        // add as base to switch with radio instead of checkbox
        //console.log('add to map', vectorLayer)
        vectorLayer.addTo(map);
            
    }
});

module.exports = StateWideMap;