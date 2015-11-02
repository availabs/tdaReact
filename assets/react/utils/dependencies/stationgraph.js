(function() {
	var wimgraph = {
		version: "0.1.0"
	};

	function _WIMGrapher(id) {
		var self = this,

		// Stores data retrieved from backend after being formatted.
		// The data is kept as an array of objects. Each object
		// corresponds to a time and contains another array
		// of all data for that time. Each object has two keys:
		// the first is the time scale with a time value
		// such as... year: 12 for data from year 2012
		// the seconds key is data that contains an array
		// of all data for trucks from that time. The array is
		// in non-reduced format and contains objects with data for
		// truck weight, truck class, and the amount of trucks
			formattedData = [],
			weightDistributionData = {},
			//stationID,			// current station being viewed
			//stationType,		// type of current station
			clicked = true,		// used to keep track of when users click on graph

		// variable to keep track of class types present in current data set
			classValues = [],
		// variable to keep track of weight classes in current data set
			weightValues = [],

			_formatData,
		
			classType = ''					//Used to keep track of page type(class/wim)

			route = ['url','station',''],	// URL to retrieve graph data from
			

		// depth is an array object that is treated as a stack.
		// Ss users delve deeper into graph times, the year, month, or
		// day being viewed is pushed onto depth. The stack is initialized
		// to the root of the data.
			depth = [0],
		// used to determine which time is currently being viewed,
		// the key corresponds to the length of depth
			TIMES = {
				1: 'year',
				2: 'month',
				3: 'day',
				4: 'hour'
			},
		// used to keep track of which time is currently being displayed,
		// year, month, day, or hour
			time = null,

		// this is used to track currently viewed class type
			groupBy = 'class',
		// this is used to keep track of which attribute to reduce
			reduceBy = (groupBy === 'class' ? 'weight' : 'class');

		

		// initialize graph div
		console.log('id',id,d3.select(id) )
		var graphDIV = d3.select(id).append('div')
			.attr('id', 'graphDIV'),
		// initialize measurements
			navBarWidth = 70,

			margin = {top: 10, right: 10, bottom: 25, left: 80},
			width = parseInt(graphDIV.style('width'))-navBarWidth-margin.right,
			height = parseInt(graphDIV.style('height')),

			wdth = width - margin.left - margin.right,
		    hght = height - margin.top - margin.bottom,

		// create popup div
			popup = d3.select(id).append('div')
				.attr('class', 'graph-popup');
			

		


		if(classType !== 'class'){	
			// initialize wdgraph div
			var wdgraphDIV = d3.select("#wimSpectra").append('div')
				.attr('id', 'wdgraphDIV'),
			// initialize wdmeasurements
				wdnavBarWidth = 70,

				wdmargin = {top: 10, right: 10, bottom: 25, left: 80},
				wdwidth = parseInt(graphDIV.style('width'))-wdnavBarWidth-wdmargin.right,
				wdheight = parseInt(graphDIV.style('height')),

				wdwdth = wdwidth - wdmargin.left - wdmargin.right,
			    wdhght = wdheight - wdmargin.top - wdmargin.bottom;

			// create wdpopup div
				wdpopup = d3.select("#wimSpectra").append('div')
					.attr('class', 'graph-popup');
				// console.log(wdwidth,wdhght,parseInt(wdgraphDIV.style('width')),wdgraphDIV.style('width'),wdgraphDIV)
		}

		function _showPopup(json, DOMel) {
			var html = '';
			for (var key in json) {
				html += '<b>'+key+'</b>: '+json[key]+'<br>';
			}
			// remove the final <br> added
			html = html.replace(/<br>$/i, '');

			popup.style('display', 'block')
				.html(html)
			wdpopup.style('display', 'block')
				.html(html)

			_movePopup(DOMel);
		}
		function _movePopup(DOMel) {
			var xPos, yPos;

			// if ("offsetX" in d3.event) { //Top part here seems to cause a problem in IE.
			// 	console.log("X")
			//     xPos = d3.event.offsetX;
			//     yPos = d3.event.offsetY;
			// } else {
			// 	console.log("Y")
			    xPos = d3.event.layerX;
			    yPos = d3.event.layerY;
			//}
			//xPos += 40;
			yPos += 35;
			//console.log(xPos,yPos)
			if (xPos+parseInt(popup.style('width')) > parseInt(graphDIV.style('width'))) {
				popup.style('right', xPos + 'px')
					.style('left', (parseInt(graphDIV.style('width'))-parseInt(popup.style('width')))+'px')
					.style('top', yPos + 'px')
			} else {
				popup.style('left', xPos + 'px')
					.style('right', '0px')
					.style('top', yPos + 'px')
			}
			if (xPos+parseInt(wdpopup.style('width')) > parseInt(wdgraphDIV.style('width'))) {
				wdpopup.style('right', xPos + 'px')
					.style('left', (parseInt(wdgraphDIV.style('width'))-parseInt(wdpopup.style('width')))+'px')
					.style('top', (yPos-20) + 'px')
			} else {
				wdpopup.style('left', xPos + 'px')
					.style('right', '0px')
					.style('top', (yPos-20) + 'px')
			}
		}
		function _hidePopup() {
			popup.style('display', 'none')
			wdpopup.style('display', 'none')
		}

		// initialize class and weight SVG
		var	cwSVG = graphDIV.append('svg')
				.attr('width', width + 'px')
				.attr('height', height + 'px'),
		// create cwSVG group. this is used to draw class/weight bars
			cwGraphSVG = cwSVG.append('g')
				.attr("transform", "translate("+margin.left+", "+margin.top+")");

		// initialize weight distribution SVG
		var wdSVG = wdgraphDIV.append('svg')
				.attr('width', wdwidth + 'px')
				.attr('height', wdheight + 'px')
			wdGraphSVG = wdSVG.append('g')
				.attr("transform", "translate("+wdmargin.left+", "+wdmargin.top+")");

	    // initialize x scale and axis
	    var Xscale = d3.scale.ordinal()
	    	.rangePoints([0, wdth]);
	    var Xaxis = d3.svg.axis()
	    		.scale(Xscale)
	    		.orient('bottom');
	    cwGraphSVG.append('g')
	    	.attr('class', 'x-axis')
	        .attr('transform', 'translate(0, '+(height - margin.top - margin.bottom)+')');

	    // initialize weight distribution x scale and axis
	    var wdXscale = d3.scale.ordinal()
	    	.rangePoints([0, wdwdth]);

	    var wdXaxis = d3.svg.axis()
	    		.scale(wdXscale)
	    		.orient('bottom');

	    wdGraphSVG.append('g')
	    	.attr('class', 'x-axis')
	        .attr('transform', 'translate(0, '+(wdheight - wdmargin.top - wdmargin.bottom)+')');

	    // initialize y scale and axis
	   	var Yscale = d3.scale.linear()
	   		.rangeRound([hght, 0])
	   		.clamp(true);

	    var Yaxis = d3.svg.axis()
	    		.scale(Yscale)
	    		.orient('left');

	    cwGraphSVG.append('g')
	    	.attr('class', 'y-axis'),

	    wdGraphSVG.append('g')
	    	.attr('class', 'y-axis');

		// initialize nav bar div
			navBar = graphDIV.append('div')
				.attr('class', 'navBar')
				.style('right', margin.right +'px')
				.style('top', margin.top+'px')
				.style('width', navBarWidth+'px');

		// initialize nav bar div for load spectra
			wdnavBar = wdgraphDIV.append('div')
				.attr('class', 'navBar')
				.style('right', margin.right +'px')
				.style('top', margin.top+'px')
				.style('width', navBarWidth+'px');

	    // create weight and class toggle buttons
	    var togglesDiv = graphDIV.append('div')
	    	.attr('class', 'navBar')
			.style('right', margin.right +'px')
			.style('bottom', margin.top+'px')
			.style('width', navBarWidth+'px');

		var classToggle = togglesDiv.append('a')
			.text('Class')
			.classed('inactive', function() {
				return reduceBy === 'class';
			})
			.classed('active', function() {
				return groupBy === 'class';
			})
			.on('click', _toggle)

		var weightToggle = togglesDiv.append('a')
			.text('Weight')
			.classed('inactive', function() {
				return reduceBy === 'weight';
			})
			.classed('active', function() {
				return groupBy === 'weight';
			})
			.on('click', _toggle)

		// function to control weight and class toggles
		function _toggle() {
			var self = d3.select(this),
				active = self.classed('active'),
				deactivated = self.classed('deactivated');

			if (!active && !clicked && !deactivated) {
				clicked = true;

				togglesDiv.selectAll('a')
					.classed('active', false)
					.classed('inactive', true)
				self.classed('active', true)
					.classed('inactive', false)

				groupBy = self.text().toLowerCase();
				reduceBy = (self.text().toLowerCase() === 'class' ? 'weight' : 'class');
				_drawGraph();
			}
		}
		// create class and weight scales

		// this scales maps classes to array index
		var classScale = d3.scale.ordinal()
			.domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
			.range([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
		// this scale maps weights to weight scales
		// weight class 0 corressponds to weights [0, 20,000),
		// weight class 1 corresponds to weights [20,000, 40,000)
		// ...
		// weight class 6 corresponds to weights 120,000 and above
		var bandSize = 20000,
			maxWeight = 120000,
			numBands = (maxWeight+bandSize) / bandSize;

		var range = [];

		for (var i = 0; i < numBands; i++) {
			range.push(i);
		}

		var	weightScale = d3.scale.quantize()
			.domain([0, maxWeight+bandSize])
			.range(range),

			_CONVERT = 220.462;  // multiplier to convert tenths of metric tons to pounds

		var WDbandSize = 1000;
			WDmaxWeight = 140000;
			WDnumBands = (WDmaxWeight+WDbandSize) / WDbandSize,
			WDrange = [];

		//var wd2weight = bandSize / WDbandSize;

		for (var i = 0; i < WDnumBands; i++) {
			WDrange.push(i);
		}

		// initialize weight distribution scale
		var wdScale = d3.scale.quantize()
			.domain([0, WDmaxWeight+WDbandSize])
			.range(WDrange);

		// used to color class and weight legends
		var _LEGEND_COLORS = {
			class: ["#08306b", "#08519c", "#2171b5", "#4292c6", "#6baed6", "#9ecae1","#ddffff","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"],
			weight: ["#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#a63603"]
		}
		var _FILTERS = {
		// data filters for various classes. False indicates filter is inactive.
		// indexes [0, 12] correspond to classes [2, 14]
			class: [false,false,false,false,false,false,false,false,false,false,false,false,false],
		// data filters for the weight classes
		// indexes [0, 6] directly correspond to weight classes [0, 6]
			weight: [false,false,false,false,false,false,false],
			weightDistribution: [false,false,false,false,false,false,false]
		}

		// create legends
		var legendDIV = d3.select(id).append('div')
			.attr('id', 'legendDIV');
		// class legend
		var classLegend = legendDIV.append('div')
			.attr('class', 'legend');
		// weight legend
		var weightLegend = legendDIV.append('div')
			.attr('class', 'legend')
			.style('text-align', 'left')
			.style('top', '45px');

		// create legends for load spectra
		var wdlegendDIV = d3.select("#wimSpectra").append('div')
			.attr('id', 'legendDIV');
		// class legend
		var wdclassLegend = wdlegendDIV.append('div')
			.attr('class', 'legend');
		// weight legend
		var wdweightLegend = wdlegendDIV.append('div')
			.attr('class', 'legend')
			.style('text-align', 'left')
			.style('top', '45px');

		// this function creates the labels for the legend parameter
		// values is an array of data the data contains
		// 		labels for data not included in values are not created
		// attr is the weight or class label
		function _createLegendLabels(legend, values, attr) {
			values.sort(function(a, b) { return a-b; });

			var labels = legend.selectAll('a').data(values);

			labels.exit().remove();

			labels.enter().append('a')
				.attr('class', attr+'-label')
				.on('click', function(d) {
					clicked = true;
					var self = d3.select(this)
					self.classed('inactive', !self.classed('inactive'));
					_FILTERS[attr][d] = self.classed('inactive');
					

					if (self.classed('inactive')) {
						self.style('background', null)
					} else {
						self.style('background', function(d) {
							return _LEGEND_COLORS[attr][d];
						})
					}

					_drawGraph();
					_drawWDGraph();
				})
				.on('mouseover', function(d) {
					d3.selectAll('.'+attr + d)
						.style('opacity', 1.0)
						.attr('fill', '#d73027')
				})
				.on('mouseout', function(d) {
					d3.selectAll('.'+attr + d)
						.style('opacity', 0.75)
						.attr('fill', function() { return _LEGEND_COLORS[attr][d]; })
				});

			labels.classed('inactive', function(d) {
					return _FILTERS[attr][d]
				})
				.style('background', function(d) {
					if (d3.select(this).classed('inactive')) {
						return null;
					}
					return _LEGEND_COLORS[attr][d];
				})
				.text(function(d, i) {
					var text;
					if (attr === 'weight') {
						 if (d < weightScale.range().length-1) {
							text = (d*20).toString() +'-'+((d+1)*20) +'k lbs.';
						 } else {
						 	text = (d*20).toString()+'k+ lbs.';
						 }
					} else {
						text = ''+classScale.domain()[d];
					}
					return text;
				})

			// legend.style('width', function() {
			// 		var w = parseInt(d3.select('.'+attr+'-label').style('width'));
			// 		if(w < 100){
			// 			return ((61.3) * values.length) + 'px';
			// 		}
			// 		else{
			// 			return ((117.3) * values.length) + 'px';	
			// 		}
			// 	})
			// 	.style('background-color', '#000');
		}


		// create loading indicator
		var loader = graphDIV.append('div')
			.attr('id', 'loader')
			.text('Loading...\nPlease wait')

		// this function retrieves the requested data from the back end API
		function _getData() {
			console.log("getData",{'database': 'allWim', 'depth': depth,'id':route[1],'state_code':route[2]});
			loader.style('display', 'inline')
			d3.json(route[0]).post(JSON.stringify({'database': 'allWim', 'depth': depth,'id':route[1],'state_code':route[2]}), function(error, data) {
            	if (error) {
            		console.log(error);
            		return;
            	}
            	time = TIMES[depth.length];

            	_formatData(data);
            	//console.timeEnd("getData");
            	// console.log(depth)

            	//Below is what draws graphs for the first time?

            	_drawGraph();
	            _drawWDGraph();
            });
		}

		function _formatClassData(data) {
			classValues = [];
			weightValues = [];

			// array index for time data
			var	timeIndex = 0,
				schema = [];

			for (var i in data.schema.fields) {
				schema.push(data.schema.fields[i].name)
			}

			formattedData = [];

			for (var i in data.rows) {
				var obj = {};
				obj[time] = +data.rows[i].f[schema.indexOf(time)].v;
				obj.data = [];
				obj.total = +data.rows[i].f[schema.indexOf('amount')].v;

				for (var j = 1; j < 14; j++) {
					var dataObj = {};
					dataObj.class = classScale(j);
					dataObj.amount = +data.rows[i].f[schema.indexOf('class'+j)].v;
					dataObj.weight = 0;

					if (dataObj.amount > 0) {
						_pushUnique(classValues, dataObj.class);
					}

					obj.data.push(dataObj);
				}

				formattedData.push(obj);
			}
			
			_createLegendLabels(classLegend, classValues, 'class')
			_createLegendLabels(wdclassLegend, classValues, 'class')
		}

		// this function formats the data returned from Google big query
		// into a more usable form. The formatted data is stored in the
		// formattedData object variable.
		function _formatWIMData(data) {
			classValues = [];
			weightValues = [];

			for (var weight in weightScale.range()) {
				_FILTERS.weightDistribution[weight] = true;
			}

			// array index for time data
			var	timeIndex = 0,
			// get the names of attributes
				schema = [];

			for (var i in data.schema.fields) {
				schema.push(data.schema.fields[i].name)
			}
			// clear data arrays
			formattedData = [];
			_clearWeightDistributionData();

			// initialize variables
			var obj = null,
				currentTimeIndex = null,
				i = 0;

			while (i < data.rows.length) {
				if (+data.rows[i].f[timeIndex].v === currentTimeIndex) {
					// create a new data object for current time index
					var dataObj = {};
					for (var j = 1; j < schema.length; j++) {
						dataObj[schema[j]] = +data.rows[i].f[j].v;
					}

					_populateWeightDistributionData(dataObj);

					_FILTERS.weightDistribution[weightScale(dataObj.weight*_CONVERT)] = false;

					dataObj.class = classScale(dataObj.class);
					_pushUnique(classValues, dataObj.class);
					dataObj.weight = weightScale(dataObj.weight*_CONVERT);
					_pushUnique(weightValues, dataObj.weight);

					obj.data.push(dataObj);

					i++;
				} else {
					// create new time index object
					obj = {};
					obj[time] = +data.rows[i].f[timeIndex].v;
					currentTimeIndex = +data.rows[i].f[timeIndex].v;
					obj.data = [];
					formattedData.push(obj);
				}
			}

			_createLegendLabels(classLegend, classValues, 'class')
			_createLegendLabels(weightLegend, weightValues, 'weight')
			_createLegendLabels(wdclassLegend, classValues, 'class')
			_createLegendLabels(wdweightLegend, weightValues, 'weight')


			return;

			// populates weightDistributionData object with new, empty data objects
			function _clearWeightDistributionData() {
				for (var i in wdScale.range()) {
					weightDistributionData[i] = _newWDobj();
				}
			}
			// creates a new weight distribution data object
			function _newWDobj() {
				var obj = {};
				for (var i in classScale.range()) {
					obj[i] = 0;
				}
				return obj;
			}
			function _populateWeightDistributionData(data) {
				var index = wdScale(data.weight*_CONVERT),
					cls = classScale(data.class);

				weightDistributionData[index][cls] += data.amount;
			}
		} // end _formatWIMData

		function _pushUnique(list, value) {
			if (list.indexOf(value) === -1) {
				list.push(value);
			}
		}
		// attr must be the key to a sortable attribute of data.
		// sorts in increasing order by default.
		// if order is -1 then sorts in decreasing order
		function _sortBy(data, attr, order) {
			order = order || 1;
			return data.sort(function(a, b) {
				return order*(a[attr] - b[attr]);
			})
		}
		// this function converts a weight distribution class to a weight class
		function _WD2Weight(i) {
			var maxIndex = d3.max(weightScale.range());

			return Math.min(Math.floor(i / (bandSize/WDbandSize)), maxIndex)
		}
		function _filterWeightDistributionData() {
			filtered = [];

			var obj = null,
				current = null;

			for (var wdIndex in weightDistributionData) {
				current = weightDistributionData[wdIndex];

				obj = {};
				obj.weight = wdIndex;
				obj.amount = 0;
				obj.extent = wdScale.invertExtent(+wdIndex);

				if (_FILTERS.weight[_WD2Weight(wdIndex)] ||
					_FILTERS.weightDistribution[_WD2Weight(wdIndex)]) {
					continue;
				}

				filtered.push(obj);

				for (var j in current) {
					if (!_FILTERS.class[j]) {
						obj.amount += current[j];
					}
				}
			}

			return filtered;
		}
		function _drawWDGraph() {
			
			var data = _sortBy(_filterWeightDistributionData(), 'weight'),
				Ymax = d3.max(data, function(d) {return d.amount; });
		   	var barWidth = Math.min((wdth-(data.length+1)*2) / data.length, 75),
		   		space = wdth - (barWidth * data.length),
		   		gap = space / (data.length+1);

		   	var padding = (2*gap + barWidth) / (gap + barWidth);

		    wdXscale.domain([])
		    	.rangePoints([0, wdth], padding);

		   	Yscale.domain([0, Ymax]);
		   	

		   	var bars = wdGraphSVG.selectAll('rect').data(data);
		   	bars.enter().append('rect')
		   		.attr('y', hght)
		   		.attr('x', function(d, i) { return (i*(barWidth + gap) + gap); })
		    	.attr('height', 0)
				.style('opacity', 0.75)
		        .attr('fill', function(d) {
		        	return _LEGEND_COLORS.weight[_WD2Weight(d.weight)];
		        })
		        .on('mouseover', function(d) {
		        	d3.select(this).attr('fill', '#d73027');
		        	
		        	var formatter = d3.format('<,'),
		        		json = {
		        			Amount: formatter(d.amount),
		        		};
		        	if (d.extent[0] === WDmaxWeight) {
		        		json.Extent = formatter(d.extent[0])+'+';
		        	} else {
		        		json.Extent = formatter(d.extent[0])+'-'+formatter(d.extent[1]);
		        	}
		        	_showPopup(json, this);
		        })
		        .on('mousemove', function() { _movePopup(this); })
		        .on('mouseout', function(d) {
		        	d3.select(this).attr('fill', function(d) {
		        		return _LEGEND_COLORS.weight[_WD2Weight(d.weight)];
		        	})
		        	_hidePopup();
		        });

		   	bars.transition()
		   		.duration(500)
		   		.attr('class', null)
		   		.attr('class', function(d) {
		   			return 'weight'+_WD2Weight(d.weight);
		   		})
		   		.attr('y', function(d) { return Yscale(d.amount); })
		   		.attr('x', function(d, i) { return (i*(barWidth + gap) + gap); })
		    	.attr('height', function(d) { return hght - Yscale(d.amount); })
		        .attr('width', barWidth)
		        .attr('fill', function(d) {
		        	return _LEGEND_COLORS.weight[_WD2Weight(d.weight)];
		        });

		   	bars.exit()
		   		.transition()
		   		.duration(500)
		   		.attr('y', hght)
		    	.attr('height', 0)
				.attr('fill', '#f00')
		   		.remove();

		    wdGraphSVG.select('.x-axis').call(wdXaxis)
		    wdGraphSVG.select('.y-axis').call(Yaxis);


		}
		// reduces formatted data, eliminating attr and grouping by keeper.
		// this function also keeps track of min and max time values, max
		// number of trucks, and all of the times with data. This data is
		// required to set the domains of the x and y scales.
		function _reduceData(attr, keeper) {
			var data = {
					Xmin: formattedData[0][time],
					Xmax: formattedData[0][time],
					Ymax: 0,
					ticks: []
				},
				reduced = [],
				obj,
				objData;

			for (var i in formattedData) {
				obj = {};
				obj[time] = formattedData[i][time];
				if (obj[time] > data.Xmax) {
					data.Xmax = obj[time];
				} else if (obj[time] < data.Xmin) {
					data.Xmin = obj[time];
				}
				data.ticks.push(obj[time]);

				objData = _reduce(formattedData[i].data, attr, keeper)
				obj.data = objData.data;
				data.Ymax = (objData.total > data.Ymax ? objData.total : data.Ymax);
				reduced.push(obj);
			}
			data.data = reduced;

			return data;
		}

		// reduces the data on trucks, eliminating attr and summing
		// truck amounts into keeper
		function _reduce(data, attr, keeper) {
			var dataObj = {
					total: 0
				}
				reducedData = [],
				obj = null,
				cur = null;

			data = _sortBy(data, keeper);

			for (var i in data) {
				// apply any filters to the data
				if (_FILTERS.class[data[i].class] || _FILTERS.weight[data[i].weight])
					continue;

				if (data[i][keeper] === cur) {
					obj.amount += data[i].amount;
					dataObj.total += data[i].amount;
				} else {
					obj = {};
						
					reducedData.push(obj);

					if (keeper == 'weight') {
						obj.extent = weightScale.invertExtent(data[i][keeper]);
					}

					cur = data[i][keeper];

					obj.amount = data[i].amount;
					obj[keeper] = data[i][keeper];
					dataObj.total += obj.amount;
				}
			}
			dataObj.data = reducedData;

			return dataObj;
		}
		// this function draws the graph. it begins by reducing
		/// the data by current toggle and applying any filters.
		function _drawGraph() {
			var dataObj = _reduceData(reduceBy, groupBy),
				data = dataObj.data,
				Ymax = dataObj.Ymax,
				ticks = dataObj.ticks;

		   	var barWidth = Math.min((wdth-(data.length+1)*2) / data.length, 75),
		   		space = wdth - (barWidth * data.length),
		   		gap = space / (data.length+1);

		   	var padding = (2*gap + barWidth) / (gap + barWidth);

		    //Below is where volume table is created.
		   	$('#wimgraphTable').html('')
		   	var timeRow = ""
		   	for(x = 0;x<data.length;x++){
		   		if(time === "year"){
		   			timeRow = timeRow+"<th style='color:#fff'>"+(2000+data[x][time])+"</th>"
		   			ticks[x] = ticks[x]+2000
		   		}
		   		else if(time === "month"){
		   			timeRow = timeRow+"<th style='color:#fff'>"+monthCheck(data[x][time]-1)+"</th>"
		   			ticks[x] = monthCheck(ticks[x]-1)
		   		}
		   		else{
		   			timeRow = timeRow+"<th style='color:#fff'>"+data[x][time]+"</th>"
		   		}
		   	}
		   	var zero = true
		   	var htmlCode = '<table id="seasonal_Table" class="table table-hover"><thead style="background:#618fb0;""><tr   ><th style="color:#fff">'+groupBy+'/'+time+'</th>'+timeRow+'</tr></th></thead>'
			if(groupBy === "class"){   	
			   	for(k = 0;k<13;k++){
					htmlCode = htmlCode + '<tr><th>Class '+(k+1)+'</th>'
					for(l = 0;l<data.length;l++){
						for(m = 0;m<data[l]["data"].length;m++){
							if(data[l]["data"][m].class == k){
								htmlCode = htmlCode + '<th>'+Math.floor(data[l]["data"][m].amount)+'</th>'
								m = data[l]["data"].length
								zero = false
							}
						}
						if(zero){
							htmlCode = htmlCode + '<th>0</th>'
						}
						zero = true
					}
					htmlCode = htmlCode + '</tr>'
				}
			}
			else{
				for(k = 0;k<7;k++){
					htmlCode = htmlCode + '<tr><th>'+weightRange(k)+'</th>'
					for(l = 0;l<data.length;l++){
						for(m = 0;m<data[l]["data"].length;m++){
							if(data[l]["data"][m].weight == k){
								htmlCode = htmlCode + '<th>'+Math.floor(data[l]["data"][m].amount)+'</th>'
								m = data[l]["data"].length
								zero = false
							}
						}
						if(zero){
							htmlCode = htmlCode + '<th>0</th>'
						}
						zero = true
					}
					htmlCode = htmlCode + '</tr>'
				}	
			}
			htmlCode = htmlCode + '</table>'
			$('#wimgraphTable').append(htmlCode)
			//End wim table creation

			Xscale.domain(ticks)
		    	.rangePoints([0, wdth], padding);

		   	Yscale.domain([0, Ymax]);
		   
			var stacks = cwGraphSVG.selectAll('.stack')
				.data(data);

			stacks.transition()
				.duration(500)
				.attr('transform', function(d, i) {
					return 'translate(' + (i*(barWidth + gap) + gap) + ', 0)';
				})
				.attr('class', 'stack')

			stacks.enter().append('g')
				.attr('transform', function(d, i) {
					return 'translate(' + (i*(barWidth + gap) + gap) + ', 0)';
				})
				.attr('class', 'stack')

			stacks.exit()
		    	.each(function() {
		    		d3.select(this).selectAll('rect')
		    			.transition()
		    			.duration(500)
						.attr('y', hght +'px')
						.attr('height', 0)
						.attr('opacity', 0.0)
				    	.remove()
		    	})
		    	.transition()
		    	.duration(500)
		    	.remove()

		    stacks.on('click', function(d) {
					if (!clicked && depth.length < 4) {
						clicked = true;
						depth.push(d[time]);
						_getData();
					}
					d3.event.stopPropagation();
				})
		    	.on('mouseover', function(d) {
		        	d3.select(this).selectAll('rect')
				        .style('opacity', 1.0)
		        })
		        .on('mouseout', function(d) {
		        	d3.select(this).selectAll('rect')
				        .style('opacity', 0.75)
		        })

			var bars = stacks.selectAll('rect')
				.data(function(d) { return _generateStacks(d.data); })

			bars.enter().append('rect')
				.attr('y', hght +'px')
				.attr('height', 0)
				.attr('stroke-width', 0)
				.style('opacity', 0.75)
		        .attr('fill', function(d) { return _LEGEND_COLORS[groupBy][d[groupBy]]; })
		        .on('mouseover', function(d) {
		        	var bar = d3.select(this)
		        		.attr('fill', '#d73027');

		        	var formatter = d3.format('<,'),
		        		json = {
		        			Amount: formatter(d.amount),
		        		};
		        	if ('class' in d) {
		        		json.Class = classScale.domain()[d.class];
		        	} else {
			        	if (d.extent[0] === maxWeight) {
			        		json.Extent = formatter(d.extent[0])+'+';
			        	} else {
			        		json.Extent = formatter(d.extent[0])+'-'+formatter(d.extent[1]);
			        	}
		        	}
		        	_showPopup(json, this);
		        })
		        .on('mousemove', function() { _movePopup(this); })
		        .on('mouseout', function(d) {
		        	d3.select(this).attr('fill', function(d) {
		        		return _LEGEND_COLORS[groupBy][d[groupBy]];
		        	})
		        	_hidePopup();
		        });

		    bars.transition()
		    	.duration(500)
		    	.attr('y', function(d) { return Yscale(d.amount)-d.float; })
		    	.attr('height', function(d) { return hght - Yscale(d.amount); })
		        .attr('width', barWidth)
		        .attr('fill', function(d) { return _LEGEND_COLORS[groupBy][d[groupBy]]; })
		        .attr('class', null)
		        .attr('class', function(d) { return groupBy+d[groupBy]; });

			bars.exit()
		    	.transition()
		    	.duration(500)
				.attr('y', hght +'px')
				.attr('height', 0)
				.attr('fill', '#f00')
		    	.remove();

		    Xaxis.tickValues(ticks);

		    var transition = cwGraphSVG.transition().duration(500);

		    transition.select('.x-axis').call(Xaxis)
		    transition.select('.y-axis').call(Yaxis);

		    _drawNavigator();

		    clicked = false;

			loader.style('display', 'none')

		    function _generateStacks(data) {
		    	var f = 0;
		    	data = _sortBy(data, 'amount', -1);

		    	for (var i in data) {
		    		data[i].float = f;
		    		f += hght - Yscale(data[i].amount);
		    	}

		    	return data;
		    }
		}
		_NAV_COLORS = {
			class: ["#2171b5", "#6baed6", "#bdd7e7", "#eff3ff"],
			weight: ["#d94701","#fd8d3c","#fdbe85","#feedde"]
		}
		var navButtons;
		var wdnavButtons;

		function _drawNavigator() {
			navButtons = navBar.selectAll('a')
				.data(depth);

			navButtons.enter().append('a')
				.text(_getNavBarText)
				.on('click', _clicked);

			navButtons.exit().remove();

			navButtons.style('background-color', function(d, i) {
					return _NAV_COLORS[groupBy][i];
				});
			wdnavButtons = wdnavBar.selectAll('a')
				.data(depth);

			wdnavButtons.enter().append('a')
				.text(_getNavBarText)
				.on('click', _clicked);

			wdnavButtons.exit().remove();

			wdnavButtons.style('background-color', function(d, i) {
					return _NAV_COLORS[groupBy][i];
				});
		}

		var _MONTHS = {
			1: 'Jan.',
			2: 'Feb.',
			3: 'Mar.',
			4: 'Apr.',
			5: 'May',
			6: 'June',
			7: 'July',
			8: 'Aug.',
			9: 'Sep.',
			10: 'Oct.',
			11: 'Nov.',
			12: 'Dec.'
		}
		function _clicked(d, i) {
			if (!clicked && i+1 < depth.length) {
				clicked = true;
				while (depth.length-1 > i) {
					depth.pop();
				}
				_getData();
			}
		}
		function _getNavBarText(d, i) {
			switch(i) {
				case 0:
					return 'Root'
				case 1:
					return _getYear(d);
				case 2:
					return _MONTHS[d];
				case 3:
					return _getSuffix(d);
			}
		}
		function _getYear(d) {
			if (/^\d$/.test(d.toString())) {
				return '200' + d;
			} else {
				return '20' + d;
			}
		}
		function _getSuffix(d) {
			if (/[^1]1$|^1$/.test(d))
				return d+'st';
			if (/[^1]2$|^2$/.test(d))
				return d+'nd';
			if (/[^1]3$|^3$/.test(d))
				return d+'rd';

			return d+'th';
		}

		self.drawGraph = function(station, type, state) {
			//stationID = station;
			//stationType = type;
			console.log('draw Graph',station,type,state)
			route[0] = '/station/'+type;
			route[1] = station
			route[2] = state
			classType = type

			if (type == 'class') {
				// weightDistButton.classed('active', false)
				// 	.classed('inactive', false)
				// 	.classed('deactivated', true);

				weightToggle.classed('active', false)
					.classed('inactive', false)
					.classed('deactivated', true);

				_formatData = _formatClassData;
			}
			else if (type == 'wim') {
				_formatData = _formatWIMData;
			}

			_getData();
		}
	}

	wimgraph.grapher = function(id) {
		return new _WIMGrapher(id);
	}

	function weightRange(index){
		if(index == 0){
			return "0-20k lbs."
		}
		else if(index == 1){
			return "20-40k lbs."
		}
		else if(index == 2){
			return "40-60k lbs."
		}
		else if(index == 3){
			return "60-80k lbs."
		}
		else if(index == 4){
			return "80-100k lbs."
		}
		else if(index == 5){
			return "100-120k lbs."
		}
		else{
			return "120k+ lbs."
		}

	}

	function monthCheck(date){
			if(date == 0){
				return "January"
			}
			else if(date == 1){
				return "February"
			}
			else if(date == 2){
				return "March"
			}
			else if(date == 3){
				return "April"
			}
			else if(date == 4){
				return "May"
			}
			else if(date == 5){
				return "June"
			}
			else if(date == 6){
				return "July"
			}
			else if(date == 7){
				return "August"
			}
			else if(date == 8){
				return "September"
			}
			else if(date == 9){
				return "October"
			}
			else if(date == 10){
				return "November"
			}
			else if(date == 11){
				return "December"
			}
		}

	this.wimgraph = wimgraph;
})()

module.exports = wimgraph;