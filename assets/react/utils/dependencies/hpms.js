(function() {
    function hpms_map(HPMS_URL, TILE_STACHE_URL) {
        var hpms = {};

        hpms.active = true;
        hpms.requests = [];
        hpms.name = 'hpms_map';
        hpms.updating = false;

        var map,
            layerCache = LayerCache(10),
            AADTvalues = [],
            renderedTypes = 1;

        var activeStates = [];

        var popup,
            floater,
            legend;

        var TYPES_PER_ZOOM = {
            4:1,
            5:1,
            6:1,
            7:1,
            8:2,
            9:2,
            10:3,
            11:3,
            12:4,
            13:4,
            14:7,
            15:7,
            16:7,
            17:7
        };

        var strokeWidth = d3.scale.ordinal()
                .domain([1,2,3,4,5,6,7])
                .range([5,4,3,2,2,2,2]),
            stroke = d3.scale.quantile()
                .range(["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8",
                        "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"]);

        var format = d3.format('>,.0f');

        var mouseoverSelection = null;

        var clickedRoute = null;

        hpms.init = function(m) {
            map = m;

            popup = avlmenu.Popup()
                .position('bottom-right')
                .init(d3.select(map.id));

            d3.select(map.id)
                .on('click', function() {
                    if (d3.event.defaultPrevented) return;
                    clickedRoute = null;
                    popup.visible(false)();
                    d3.selectAll('.station-point').style('display', 'block');
                })

            floater = avlmenu.Popup()
                .position('floater')
                .init(d3.select(map.id));

            legend = d3.select(map.id)
                .append('div')
                .attr('id', 'hpms-map-legend-container');

            legend
                .append('div')
                .attr('id', 'hpms-map-legend');

            function mapZoomWatch(zoom) {
                var types = TYPES_PER_ZOOM[zoom];
                if (types != renderedTypes) {
                    renderedTypes = types;
                    if (activeStates.length) {
                        calcStrokeDomain();
                    }
                }
            }
        }

        hpms.updateActiveStates = function(datum, newState) {
            if (datum == "none") {
                return;
            }

            if (newState) {
                activeStates.push(datum);
                addState(datum);
            }
            else {
                esc.arrayRemove(activeStates, datum);
                removeState(datum);
            }
        }

        function addState(datum) {
            calcStrokeDomain(function() {
                if (activeStates.length > 1) {
                    colorPaths();
                }
                map.addLayer(layerCache.add(datum));
            });

            if (activeStates.length == 1) {
                transition(legend, { opacity: 1 });
            }
        }

        function removeState(datum) {
            map.removeLayer(layerCache.remove(datum));

            if (activeStates.length) {
                calcStrokeDomain(colorPaths);
            }
            else {
                transition(legend, { opacity: 0 });
            }
        }

        function transition(selection, style, duration) {
            selection
                .transition()
                .duration(duration || 500)
                .style(style);
        }

        function floaterText(data) {
            var table = [];

            if (data.properties.route) {
                if (checkMajorInterstate(data.properties)) {
                    table.push(['Interstate ' + data.properties.route]);
                }
                else if (data.properties.type == 1) {
                    table.push(['Highway ' + data.properties.route]);
                }
                else {
                    table.push(['Route ' + data.properties.route]);
                }
                table[0].tableHeader = true;
                table[0].span = 2;
            }

            table.push(['AADT', format(data.properties.aadt)], ['Type', data.properties.type]);
            
            return [table];
        }

        function calcStrokeDomain(cb) {
            var callback = arguments.length;

            d3.json(HPMS_URL+"hpms/aadt")
                .post(JSON.stringify({states: activeStates, types: renderedTypes}), function(error, data) {
                    stroke.domain(data);

                    if (callback) {
                        cb();
                    }

                    generateLabels();
                })
        }

        function colorPaths(filter) {
            d3.selectAll('.avl-tile')
                .selectAll('path')
                .transition().duration(500)
                .style('stroke', function(d) { return stroke(d.properties.aadt); })
        }

        function generateLabels() {
            var labels = d3.select('#hpms-map-legend')
                .selectAll('div')
                .data(stroke.range());

            labels.enter().append('div')
                .attr('class', 'hpms-map-legend-label');

            labels
                .style('background-color', function(d) { return d; })
                .text(function(d) {
                    return format(stroke.invertExtent(d)[0]);
                })

            var colorRange = stroke.range(),
                color = colorRange[colorRange.length-1];

            var lastLabel = d3.select('#hpms-map-legend')
                .selectAll('.last-label')
                .data([color]);

            lastLabel.enter().append('div')
                .attr('class', 'hpms-map-legend-label last-label');

            lastLabel
                .text(format(stroke.invertExtent(color)[1]))
                .style('background-color', color);
        }

        function checkMajorInterstate(props) {
            // only check interstate type 1s with a route number of the form:
            // x0 or x5...where x is a numeric digit
            return +props.type === 1 && (+props.route%5) === 0 && 100-(+props.route) > 0;
        }

        function showRouteData(r) {
            d3.event.stopPropagation();

            if (r.properties.route) {
                var clicked,
                    url;

                if (checkMajorInterstate(r.properties)) {
                    clicked = 'route-'+r.properties.route+'-'+r.properties.type;
                }
                else {
                    clicked = 'route-'+r.properties.route+'-'+r.properties.type+'-'+r.properties.state;
                }

                if (clicked == clickedRoute) {
                    clickedRoute = null;
                    popup.visible(false)();
                    d3.selectAll('.station-point').style('display', 'block');
                    return;
                }
                clickedRoute = clicked;

                wimstates2.selectCorridor(r);

                url = HPMS_URL+'hpms/'+r.properties.route;

                if (checkMajorInterstate(r.properties)) {
                    url += '/average_interstate_data';
                }
                else {
                    url += '/'+r.properties.type+
                           '/'+r.properties.state+
                           '/average_intrastate_data';
                }

                d3.json(url, function(error, data) {
                    data.segments = format(data.segments);
                    data.aadt = format(data.aadt);
                    data.states = data.states
                        .map(function(d) { return esc.fips2state(d, true); })
                        .join(', ');

                    var table = [];

                    if (checkMajorInterstate(data)) {
                        table.push(['Interstate ' + data.route]);
                    }
                    else if (data.type == 1) {
                        table.push(['Highway ' + data.route]);
                    }
                    else {
                        table.push(['Route ' + data.route]);
                    }
                    table[0].tableHeader = true;
                    table[0].span = 2;

                    table.push(
                        ['AADT', data.aadt], ['Type', data.type],
                        ['Segments', data.segments],
                        ['States', data.states]
                    );

                    popup.data([table])
                        .visible(true)();
                })
            }
        }

        function drawTile(group, json, tilePath) {
            group.selectAll("path")
                .data(json.features.sort(function(a, b) {
                    return a.properties.aadt - b.properties.aadt;
                }))
                .enter().append("path")
                .attr('class', function(d) {
                    if (d.properties.route) {
                        if (checkMajorInterstate(d.properties)) {
                            return 'avl-path '+'route-'+d.properties.route+'-'+d.properties.type;
                        }
                        return 'avl-path '+'route-'+d.properties.route+'-'+d.properties.type+'-'+d.properties.state;
                    }
                    return 'avl-path';
                })
                .style('stroke-width', function(d) { return strokeWidth(d.properties.type); })
                .style('stroke', function(d) { return stroke(d.properties.aadt); })
                .attr("d", tilePath)
                .on('mouseover', function(d) {
                    if (d.properties.route) {
                        if (checkMajorInterstate(d.properties)) {
                            mouseoverSelection = d3.selectAll('.route-'+d.properties.route+'-'+d.properties.type)
                                .style('stroke-width', 10);
                        }
                        else {
                            mouseoverSelection = d3.selectAll('.route-'+d.properties.route+'-'+d.properties.type+'-'+d.properties.state)
                                .style('stroke-width', 10);
                        }
                    }
                    else {
                        mouseoverSelection = null;
                    }
                    floater
                        .data(floaterText(d))
                        .visible(true)();
                })
                .on('mouseout', function(d) {
                    if (mouseoverSelection !== null) {
                        mouseoverSelection
                            .style('stroke-width', function(d) { return strokeWidth(d.properties.type); })
                        mouseoverSelection = null;
                    }
                    floater.visible(false)();
                })
                .on('click.hpms', showRouteData)
                //.on('click.wim', wimstates2.selectCorridor)
                .each(function(d) {
                    if (d.properties.route) {
                        if (checkMajorInterstate(d.properties)) {
                            d.WIMid = 'route-'+d.properties.route+'-'+d.properties.type;
                        }
                        else {
                            d.WIMid = 'route-'+d.properties.route+'-'+d.properties.type+'-'+d.properties.state;
                        }
                    }
                    d.centroid = d3.geo.centroid(d);
                });
        }

        function LayerCache(maxSize) {
            var layerList = [],
                listIndex = 0,
                layerCache = {};

            var cache = {};

            cache.add = function(id) {
                if (!(id in layerCache)) {
                    layerList[listIndex] = id;
                    layerCache[id] = newLayer(id);
                    listIndex = (listIndex+1)%maxSize;
                }
                return layerCache[id];
            }
            cache.remove = function(id) {
                var layer = layerCache[id];
                if (!(id in layerList)) {
                    delete layerCache[id];
                }
                return layer;
            }

            function newLayer(id) {
                var url = TILE_STACHE_URL + id + "/{z}/{x}/{y}.json",
                    layer = avlmap.VectorLayer({ url: url, id: 'vector-layer-'+id, name: formatName(id) });

                layer.drawTile = drawTile;

                return layer;
            }

            formatName = function(name) {
                var regex = /(\d+)/;
                name = name.replace(regex, '');

                regex = /(new|south|west|north|rhode)/;
                name = name.replace(regex, '$1' + ' ');

                return esc.capitalizeAll(name);
            }

            return cache;
        }

        return hpms;
    }

    this.hpms_map_maker = hpms_map;
})()

module.exports = hpms_map_maker;