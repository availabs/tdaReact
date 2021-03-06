/**
 * AgencyController
 *
 * @description :: Server-side logic for managing agencies
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var googleapis = require('googleapis');
var fs = require('fs');    
var jwt = new googleapis.auth.JWT(
		'424930963222-s59k4k5usekp20guokt0e605i06psh0d@developer.gserviceaccount.com', 
		'availwim.pem', 
		'3d161a58ac3237c1a1f24fbdf6323385213f6afc', 
		['https://www.googleapis.com/auth/bigquery']
	);
jwt.authorize();	
var bigQuery = googleapis.bigquery('v2');
var StationByHourFilter = require('../../assets/react/utils/dataFilters/classByHourFilter'),
	StateByClassFilter = require('../../assets/react/utils/dataFilters/classStateByMonthFilter'),
	stateFilters = {},	
	stationFilters = {};

var	d3 = require('d3'),
	colorbrewer = require('colorbrewer'),
    colorRange = colorbrewer.RdYlBu[5],
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange);

function getClassStations(database){

	var sql = 'SELECT state_fips,station_id FROM [tmasWIM12.'+database+'Class] group by state_fips,station_id';
	BQuery(sql,function(data){
		console.log('get data',data.rows);
	});

}

module.exports = {
	

	getClassTableData:function(req,res){
		var fips = req.param('fips'),
			database = req.param('database'),
			filters = req.param('filters') || {};

		var sql = "select"+
			'  station_id, month,  year,'+
			'  sum(total_vol) as ct,sum(class1) as c1, sum(class2) as c2,'+
			'  sum(class3) as c3, sum(class4) as c4, sum(class5) as c5, sum(class6) as c6, '+
			'  sum(class7) as c7, sum(class8) as c8, sum(class9) as c9, sum(class10) as c10, '+
			'  sum(class11) as c11, sum(class12) as c12, sum(class13) as c13,'+
			'  count(DISTINCT concat(STRING(year),"-",STRING(month),"-",STRING(day))) as days'+
			"  from [tmasWIM12."+database+"Class] as a"+
			"  where state_fips = '"+fips+"'"+
			"  group by station_id,year,month, order by station_id,year,month";

		console.log('getClassTableData')
		console.log('------------------------------------------------')
		console.log(sql)
		console.log('------------------------------------------------')
		
		BQuery(sql,function(data){
				
			var fullData = data.rows.map(function(row,index){
				var outrow = {}
				
				data.schema.fields.forEach(function(field,i){
					outrow[field.name] = row.f[i].v;
				});
				return outrow;
			});

			res.json(fullData);
		});
	},

	getClassStationData: function(req, res) {
 		if(typeof req.param('id') == 'undefined'){
 			res.send('{status:"error",message:"station_id required"}',500);
 			return;
 		}
 		if(typeof req.param('state_code') == 'undefined'){
 			res.send('{status:"error",message:"state fips required"}',500);
 			return;
 		}
 		var station_id = req.param('id'),
 			depth = req.param('depth'),
 			state = req.param('state_code'),
 			database = req.param('database')+'Class';

 		var select = {
 			1: 'year',
 			2: 'month',
 			3: 'day',
 			4: 'hour'
 		};

 		var SQL = generateSQL();

 		//console.time('getClassStationData Query');
 		//console.log("getclassstationData ",SQL)
 		var request = bigQuery.jobs.query({
	    	kind: "bigquery#queryRequest",
	    	projectId: 'avail-wim',
	    	timeoutMs: '10000',
	    	resource: {query:SQL,projectId:'avail-wim'},
	    	auth: jwt
	    },

		function(err, response) {
      		if (err) console.log('Error:',err);
      		
      		//console.timeEnd('getClassStationData Query');

      		res.json(response)
	    });

		function generateSQL() {
 			var sql	= "SELECT " + select[depth.length] + ", sum(total_vol) AS amount, "
 				+ addClasses()
 				+ "FROM [tmasWIM12."+database+"] "
 				+ "WHERE station_id = '"+station_id+"' "
 				+ "and state_fips ='"+state+"' "
 				+ addPredicates()
 				+ "GROUP BY " + select[depth.length] + " "
 				+ "ORDER BY " + select[depth.length] + ";";

			return sql;
		}
		function addClasses() {
			var classes = '';

			for (var i = 1; i < 14; i++) {
				classes += 'sum(class'+i+') AS class'+i+', '
			}
			return classes;
		}
 		function addPredicates() {
 			var preds = '';
 			for (var i = 1; i < depth.length; i++) {
 				preds += 'AND ' + select[i] + ' = ' + depth[i] + ' ';
 			}
 			return preds;
 		}
 	},

 	
 	getWimStationData:function(req,res){

 		//console.log('getWimStationData');
 		if(typeof req.param('id') == 'undefined'){
 			res.send('{status:"error",message:"station_id required"}',500);
 			return;
 		}
 		if(typeof req.param('state_code') == 'undefined'){
 			res.send('{status:"error",message:"state code required"}',500);
 			return;	
 		}
 		var station_id = req.param('id'),
 			depth = req.param('depth'),
 			state = req.param('state_code'),
 			database = req.param('database');

 		var select = {
 			1: 'year',
 			2: 'month',
 			3: 'day',
 			4: 'hour'
 		};

 		var SQL = generateSQL();
 		//console.time('getWimStationDataQuery')
 		//console.log("wimstation ",SQL)
 		BQuery(SQL,
		function(response) {
      		//console.timeEnd('getWimStationDataQuery')
      		//console.time('getWimStationDataSend')
      		//console.log(response)
      		res.json(response)
      		//console.timeEnd('getWimStationDataSend')
	    });
 		function generateSQL() {
 			var sql	= "SELECT " + select[depth.length] + ", class, total_weight AS weight, count(*) AS amount, "
 				+ "0 as maxAxle "
 				+ "FROM [tmasWIM12."+database+"] "
 				+ "WHERE station_id = '"+station_id+"' "
 				+ "and state_fips ='"+state+"' "
 				+ addPredicates()
 				+ "GROUP BY " + select[depth.length] + ", class, weight, maxAxle "
 				+ "ORDER BY " + select[depth.length] + ";";
 			console.log('wimgraph weight')
 			console.log('--------------------------')
 			console.log(sql)
 			console.log('--------------------------')
 			
 			return sql;
 		}
 		function addPredicates() {
 			var preds = '';
 			for (var i = 1; i < depth.length; i++) {
 				preds += 'AND ' + select[i] + ' = ' + depth[i] + ' ';
 			}
 			return preds;
 		}
	},

	datasetOverviewByFile:function(req,res){
		var database = req.param('database'),
			dataType = req.param('dataType');

		var dataClass = dataType === 'class' ? 'Class' :'';

		var sql = 	'SELECT source_file, count(distinct state_fips) as numStates, count(distinct station_id) as numStations, count(1) as numRecords '+
					'from [tmasWIM12.'+database+dataClass+'] '+ 
					'group by source_file '+
					'order by source_file';
					
		console.log('datasetOverviewbyFile --- ',sql);
		BQuery(sql,function(data){

			var fullData = data.rows.map(function(row,index){
				var outrow = {}
				data.schema.fields.forEach(function(field,i){

					outrow[field.name] = row.f[i].v;
					
				});
				return outrow;
			});
			res.json(fullData);
		});
	},

	datasetOverview:function(req,res){
		var database = req.param('database'),
			dataType = req.param('dataType');

		var dataClass = dataType === 'class' ? 'Class' :'';

		var sql = 	'SELECT state_fips,station_id,year '+
					'from [tmasWIM12.'+database+dataClass+'] where year < 2017  '+ 
					'group by state_fips,station_id,year '+
					'order by state_fips,station_id,year;';
					
		console.log('datasetOverview --- ',sql);
		BQuery(sql,function(data){

			var fullData = data.rows.map(function(row,index){
				var outrow = {}
				data.schema.fields.forEach(function(field,i){

					outrow[field.name] = row.f[i].v;
					if(field.name === 'year' && row.f[i].v >= 2000){
						outrow[field.name] = row.f[i].v-2000;
					}
					
				});
				return outrow;
			});
			res.json(fullData);
		});

	},
	
	
	datasetOverviewDay:function(req,res){
		var database = req.param('database'),
			dataType = req.param('dataType');

			var dataClass = dataType === 'class' ? 'Class' :'';

			var sql = 	'SELECT year,month,day,count(distinct CONCAT(state_fips,station_id)) '+
						'from [tmasWIM12.'+database+dataClass+']  where year < 2016 '+ 
						'group by year,month,day '+
						'order by year,month,day;';
			
			console.log('datasetOverviewDay --- ',sql);
			BQuery(sql,function(data){

					var fullData = data.rows.map(function(row,index){
						var outrow = {}
						data.schema.fields.forEach(function(field,i){
							outrow[field.name] = row.f[i].v;
							if(field.name === 'year' && row.f[i].v >= 2000){
								outrow[field.name] = row.f[i].v-2000;
							}
							
						});
						return outrow;
					});
					res.json(fullData);
			});

	},

	getClassByMonthFilters:function(req,res){
		var database = req.param('database'),
			fips = req.param('fips');

		getStateFilter(database,fips,function(cFilter){
			if(cFilter.initialized()){

				var classByMonth = {},
        		months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

				//years
				//months
				//dirs
				//classes

	            var orderedYears =  cFilter.getGroup('year').top(Infinity).map(function(year){
	                return {key:year.key, name:_parseYear(year.key)};
	            }).sort(function(a,b){
	                return b.name-a.name;
	            })

	            var orderedMonths = cFilter.getGroup('month')
	            .top(Infinity)
	            .filter(function(d){
	                return +d.key < 13;
	            })
	            .sort(function(a,b){
	                return +b.key-+a.key
	            })

	            var orderedDirs =  cFilter.getGroup('dir').top(Infinity).map(function(dir){
	                return {key:dir.key, name:dir.key};
	            }).sort(function(a,b){
	                return b.name-a.name;
	            })

	            var orderedClasses = cFilter.getGroup('class')
	            .top(Infinity)
	            .sort(function(a,b){
	                return +b.key-+a.key
	            })


	            classByMonth["orderedYears"] = orderedYears;
	            classByMonth["orderedMonths"] = orderedMonths;
	            classByMonth["orderedDirs"] = orderedDirs;
	            classByMonth["orderedClasses"] = orderedClasses;

	            res.json(classByMonth);
			}else{
	    		console.log('filters')
	    		res.json({loading:true});
			}
		})
	},


	
	//----------------------------------------------------------------
	// Single Station Routes
	//-----------------------------------------------------------------
	byHour:function(req,res){
		var database = req.param('database'),
 			station = req.param('stationId'),
 			fips = req.param('fips')
 			output = {};

 		getStationByHour(database,fips,station,function(data){
 			res.json(data);
 		})
 		
	},

	getStateAADT:function(req,res){
		var database = req.param('database'),
 			fips = req.param('fips'),
 			filters = req.param('filters') || {};
	
		getStateFilter(database,fips,function(cFilter){
			if(cFilter.initialized()){


				//apply filters
				cFilter.getDimension('year').filter(null);
	 			cFilter.getDimension('month').filter(null);
	 			cFilter.getDimension('dir').filter(null);
	 		
	 			if(filters.year){
	 				cFilter.getDimension('year').filter(filters.year)
	 			}
	 			if(filters.month){
	 				cFilter.getDimension('month').filter(filters.month)
	 			}
	 			if(filters.dir){
	 				cFilter.getDimension('dir').filter(filters.dir)	 				
	 			}
	 			if(filters.class){
	 				cFilter.getDimension('class').filter(filters.class)	 				
	 			}


	 			var data = cFilter.getGroups()
                                .ADT.order(function(p){return p.classAvg.reduce( function(a,b){ return a+b}) })
                                .top(Infinity)
                                .filter(function(p){ 
                                    var value = p.value.classAvg.reduce( function(a,b){ return a+b});
                                    return !isNaN(value) && value > 0;
                                })
                                .sort(function(a,b){
                                    return b.value.classAvg.reduce( function(a,b){ return a+b})-a.value.classAvg.reduce( function(a,b){ return a+b});
                                }).map(function (ADT){
                                    return {
                                        "label":ADT.key,
                                        "value":ADT.value.classAvg.reduce( function(a,b){ return a+b})
                                    }
                                })

                AdtScale.domain(data.map(function(ADT){
                    return ADT.value;
                }));

                var output = data.map(function(d){
                    d.color = AdtScale(d.value)
                    return d
                }).sort(function(a,b){
                    return b.value - a.value
                })


				//get appropriate data
				//res.json that data
				res.json(output);
			}else{
	    		console.log('getStateAADT still loading',fips)
	    		res.json({loading:true});
			}


		})
	},
	getStateMADT:function(req,res){
		var database = req.param('database'),
			graphType = req.param('graphType'),
 			fips = req.param('fips'),
 			filters = req.param('filters') || {};

 		getStateFilter(database,fips,function(cFilter){
			if(cFilter.initialized()){
				//apply filters
				cFilter.getDimension('year').filter(null);
	 			cFilter.getDimension('month').filter(null);
	 			cFilter.getDimension('dir').filter(null);
	 			cFilter.getDimension('class').filter(null);
	 		
	 			if(filters.year){
	 				cFilter.getDimension('year').filter(filters.year)
	 			}
	 			if(filters.month){
	 				cFilter.getDimension('month').filter(filters.month)
	 			}
	 			if(filters.dir){
	 				cFilter.getDimension('dir').filter(filters.dir)	 				
	 			}
	 			if(filters.class){
	 				cFilter.getDimension('class').filter(filters.class)	 				
	 			}

		        var stationADT = cFilter.getGroups()
		            .ADT.order(function(p){return p.avg})
		            .top(Infinity)

		        var data = cFilter.getGroups()
		                .ADT.order(function(p){return p.avg || 0})
		                .top(Infinity)
		                .filter(function(p){ 
		                    return p.value.avg && !isNaN(p.value.avg);
		                })
		                .map(function(p,i){
		                    if(p.value.monthAvg.length > 12){
		                        p.value.monthAvg =  p.value.monthAvg.filter(function(d,i){
		                            return i < 12 && !isNaN(d);
		                        })
		                    }
		                    return p.value.monthAvg.reduce(function(a,b){ return a+b})
		                });

		        AdtScale.domain(stationADT.map(function(ADT){
		            return ADT.value.avg;
		        }));

  				var testing = cFilter.getGroups()
                            .ADT.order(function(p){return p.avg})
                            .top(Infinity)
                            .filter(function(d){ 
                                return d.value.avg  
                            })
                            .map(function (ADT){
                                return {
                                    "key":(ADT.key),
                                    "values":ADT.value.monthAvg.map(function(d,i){ 
                                        var value = d.reduce(function(a,b){ return a+b}) || 0;
                                        if(graphType === 'season'){
                                            value = value / ADT.value.classAvg.reduce( function(a,b){ return a+b})
                                        }
                                        if(value === Infinity){
                                            value = 0
                                        }
                                        return {month:i,y:+value}
                                    }),
                                    "color":AdtScale(ADT.value.avg || 0)
                                }
                            }) 

                res.json(testing)

			}
			else{
	    		console.log('getStateMADT still loading',fips)
	    		res.json({loading:true});				
			}
		})			



	},

	classPie:function(req,res){

		var database = req.param('database'),
 			station = req.param('stationId'),
 			fips = req.param('fips'),
 			filters = req.param('filters') || {},
 			output = [],
 			classGrouping = 'classGroup',
 			$lime = "#8CBF26",
		    $red = "#e5603b",
		    $redDark = "#d04f4f",
		    $blue = "#6a8da7",
		    $green = "#56bc76",
		    $orange = "#eac85e",
		    $pink = "#E671B8",
		    $purple = "#A700AE",
		    $brown = "#A05000",
		    $teal = "#4ab0ce",
		    $gray = "#666",
		    $white = "#fff",
		    $textColor = $gray,
		    COLOR_VALUES = [$green, $teal, $redDark,  $blue, $red, $orange  ];


 		getStationFilter(database,fips,station,function(cFilter){
 			
 			if(cFilter.initialized()){
 				cFilter.getDimension('year').filter(null);
	 			cFilter.getDimension('month').filter(null);

	 			cFilter.getDimension('class').filter(null)
	 		
	 			if(filters.year){
	 				cFilter.getDimension('year').filter(filters.year)
	 			}
	 			if(filters.month){
	 				cFilter.getDimension('month').filter(filters.month)
	 			}
 				if(filters.class){
	 				cFilter.getDimension('class').filter(filters.class)	 				
	 			}
		
				var classGrouping = 'classSum';//'classGroup' 
	 			var output = cFilter.getGroup(classGrouping).top(Infinity).map(function(vclass,i){
               
		                return {
		                    key:vclass.key,
		                    color:COLOR_VALUES[i%6],
		                    value: vclass.value
		                }
		            
		            })
	 				// .sort(function(a,b){
		    //             return a.key.split(' ')[0] - b.key.split(' ')[0];
		    //         });
		        res.json(output) 
	        }else{
	    		console.log('classPie - still loading',fips,station)
	    		res.json({loading:true});
			}
	    });
	    
	},
	AvgHour:function(req,res){
		var database = req.param('database'),
 			station = req.param('stationId'),
 			fips = req.param('fips'),
 			filters = req.param('filters') || {},
 			output = [],
 			classGrouping = 'classGroup';

 		getStationFilter(database,fips,station,function(cFilter){
 			
 			if(cFilter.initialized()){

	 			cFilter.getDimension('year').filter(null);
	 			cFilter.getDimension('month').filter(null);
	 		
	 			if(filters.year){
	 				cFilter.getDimension('year').filter(filters.year)
	 			}
	 			if(filters.month){
	 				cFilter.getDimension('month').filter(filters.month)
	 			}
 			
		
				var classGrouping = 'classGroup' 
	        
	            
	            var dailyTraffic = cFilter.getGroup(classGrouping).top(Infinity).map(function(vclass,i){
	                cFilter.getDimension(classGrouping).filter(vclass.key);
	                return cFilter.getGroup('dir').top(Infinity).map(function(dir,i){
	                    cFilter.getDimension('dir').filter(dir.key);
	                    var mult = 1;
	                    if(i > 0){
	                        mult = -1;
	                    }
	                    return {
	                        key:vclass.key,
	                        values: cFilter.getGroup('average_hourly_traffic').top(Infinity).map(function(time){
	                            return {
	                                key:time.key,
	                                value:time.value.avg*mult
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
	                    return a.key - b.key;
	                });
	                
	                return dirSet[0];
	            }).sort(function(a,b){
	                return a.key.split(' ')[0] - b.key.split(' ')[0];
	            });
	           
	           	console.log('avgHour Sending Data',fips,station)
	            res.json(dailyTraffic);
	        }else{
	    		console.log('avghour - still loading',fips,station)
	    		res.json({loading:true});
			}
	    });
	    
	},

	CountByTime:function(req,res){
		var database = req.param('database'),
 			station = req.param('stationId'),
 			fips = req.param('fips'),
 			filters = req.param('filters') || {},
 			output = [],
 			classGrouping = 'classGroup';
 		//console.log('1 - get filter')
 		getStationFilter(database,fips,station,function(cFilter){
 			
 			if(cFilter.initialized()){
	 			cFilter.getDimension('year').filter(null);
	 			cFilter.getDimension('month').filter(null);
	 		

	 			if(filters.year){
	 				cFilter.getDimension('year').filter(filters.year)
	 			}
	 			if(filters.month){
	 				cFilter.getDimension('month').filter(filters.month)
	 			}
 			
 			

	 			var dailyTraffic = cFilter.getGroup(classGrouping).top(Infinity).map(function(vclass,i){
	                cFilter.getDimension(classGrouping).filter(vclass.key);
	                return cFilter.getGroup('dir').top(Infinity).map(function(dir,i){
	                    cFilter.getDimension('dir').filter(dir.key);
	                    var mult = 1;
	                    if(i > 0){
	                        mult = -1;
	                    }
	                    return {
	                        key:vclass.key,
	                        values: cFilter.getGroup('average_daily_traffic').top(Infinity).map(function(time){
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
	                dirSet[0].values.sort(function(a,b){
	                    return b.key - a.key;
	                });
	                
	                return dirSet[0];
	            }).sort(function(a,b){
	                return a.key.split(' ')[0] - b.key.split(' ')[0];
	            });
	           
	            if(!filters.month){
	                      
	                dailyTraffic = dailyTraffic.map(function(d){
	                    var sums = {}
	                    d.values.forEach(function(v){
	                        var split = v.key.split('_'),
	                            year=split[0],
	                            month = split[1],
	                            day = split[2],
	                            dir = v.value < 0 ? 'one' : 'two',
	                            sumKey = year+"_"+dir,
	                            valKey = year;

	                        if(filters.year){
	                            sumKey = year+'_'+month+"_"+dir,
	                            valKey = month;
	                        }  
	                      
	                        if( !sums[sumKey] ){
	                            sums[sumKey] ={key:valKey,sum:0,count:0}
	                        }

	                        if(v.value > 0 || v.value < 0){
	                            sums[sumKey].sum+= v.value || 0;
	                            sums[sumKey].count++;
	                        }
	                        

	                    })
	                    d.values = Object.keys(sums).map(function(key){
	                        sums[key].value = Math.round(sums[key].sum/sums[key].count) || 0;
	                        
	                        return sums[key];
	                    }).sort(function(a,b){
	                        return +a.key - +b.key
	                    })
	               
	                    return d;
	                })
	            }else{
	                dailyTraffic = dailyTraffic.map(function(d){
	                    d.values = d.values.filter(function(v){
	                        var split = v.key.split('_');
	                        v.key = split[2]
	                        return  split[1] == filters.month
	                    }).sort(function(a,b){
	                        return +a.key - +b.key
	                    })
	                    return d;
	                })
	            }
	            output =  dailyTraffic
	            console.log('cbh - sending data',fips,station)
	 			res.json(output)
 			}else{
 				console.log('cbh - still loading',fips,station)
 				res.json({loading:true})
 			}
		})
	},



	//----------------------------------------------------------------
	// Statewide Routes
	//-----------------------------------------------------------------
	byMonth:function(req,res){
		var database = req.param('database'),
 			fips = req.param('fips'),
 			output = {};

 		fileCache.checkCache({datasource:database,type:'classByMonth',typeId:fips},function(data){
 			//console.log('find cache',data);
 			if(data){
 				console.log('cache sucess');
 				console.time('send cache');
 				res.send(data)
 				console.timeEnd('send cache');
 			}else{
			    var sql = 'SELECT '+ 
				  'station_id,dir,year,month,count(distinct day) as numDays,'+
				  'sum(total_vol),sum(class1),sum(class2),'+
				  'sum(class3),sum(class4),sum(class5),sum(class6),'+
				  'sum(class7),sum(class8),sum(class9),sum(class10),sum(class11),sum(class12),sum(class13) '+
				  "FROM [tmasWIM12."+database+"Class] where state_fips = '"+fips+"' "+
				  'group by station_id,dir,year,month '+
				  'order by station_id,dir,year,month'
				
				BQuery(sql,function(data){

					var fullData = data.rows.map(function(row,index){
						var outrow = {}
						
						data.schema.fields.forEach(function(field,i){
							outrow[field.name] = row.f[i].v;
						});
						return outrow;
					});
					console.time('send Data');
					res.json(fullData);
					console.timeEnd('send Data');
					console.log('caching');
					fileCache.addData({datasource:database,type:'classByMonth',typeId:fips},fullData);
				});

			}
 	
		})
	},

	byDay:function(req,res){
 		var database = req.param('database'),
 			fips = req.param('fips'),
 			output = {};
 		
 		fileCache.checkCache({datasource:database,type:'classByDay',typeId:fips},function(data){
 			//console.log('find cache',data);
 			if(data){
 				console.log('cache sucess');
 				console.time('send cache');
 				res.send(data)
 				console.timeEnd('send cache');
 			}else{
			    var sql = 'SELECT station_id,dir,year,month,day,'
		    			+'sum(total_vol),sum(class1),sum(class2),'
		    			+'sum(class3),sum(class4),sum(class5),sum(class6),'
		    			+'sum(class7),sum(class8),sum(class9),sum(class10),'
		    			+'sum(class11),sum(class12),sum(class13) '
		    			+"FROM [tmasWIM12."+database+"Class] where state_fips = '"+fips+"' "
		    			+'group by station_id,dir,year,month,day'
						'order by station_id,dir,year,month,day';
				
				BQuery(sql,function(data){

					var fullData = data.rows.map(function(row,index){
						var outrow = {}
						
						data.schema.fields.forEach(function(field,i){
							outrow[field.name] = row.f[i].v;
						});
						outrow['single_day'] = outrow.station_id +'-'+ outrow.year+'-'+outrow.month+'-'+outrow.day
						return outrow;
					});
					console.time('send Data');
					res.json(fullData);
					console.timeEnd('send Data');
					console.log('caching');
					fileCache.addData({datasource:database,type:'classByDay',typeId:fips},fullData);
				});

			}
 	
		})
 	},

};

function getStateByMonth(database,fips,cb){

	var output = {};

		fileCache.checkCache({datasource:database,type:'classByMonth',typeId:fips},function(data){
			//console.log('find cache',data);
			if(data){
				console.log('cache sucess');
				console.time('send cache');
				cb(data)
				console.timeEnd('send cache');
			}else{
		    var sql = 'SELECT '+ 
			  'station_id,dir,year,month,count(distinct day) as numDays,'+
			  'sum(total_vol),sum(class1),sum(class2),'+
			  'sum(class3),sum(class4),sum(class5),sum(class6),'+
			  'sum(class7),sum(class8),sum(class9),sum(class10),sum(class11),sum(class12),sum(class13) '+
			  "FROM [tmasWIM12."+database+"Class] where state_fips = '"+fips+"' "+
			  'group by station_id,dir,year,month '+
			  'order by station_id,dir,year,month'
			
			BQuery(sql,function(data){

				var fullData = data.rows.map(function(row,index){
					var outrow = {}
					
					data.schema.fields.forEach(function(field,i){
						outrow[field.name] = row.f[i].v;
					});
					return outrow;
				});
				cb(fullData);
				fileCache.addData({datasource:database,type:'classByMonth',typeId:fips},fullData);
			});

		}
	
	})
}


function getStationByHour(database,fips,station,cb){

	fileCache.checkCache({datasource:database,type:'stationClassByHour',typeId:fips+station},function(data){
 			console.log('find cache',data.length);
			if(data){
				console.log('cache sucess');
				console.time('send cache');
				cb(data);
				
				console.timeEnd('send cache');
			}else{
		    var sql = 'SELECT '+ 
			  'station_id,dir,year,month,day,hour, '+
			  'sum(total_vol),sum(class1),sum(class2),'+
			  'sum(class3),sum(class4),sum(class5),sum(class6),'+
			  'sum(class7),sum(class8),sum(class9),sum(class10),sum(class11),sum(class12),sum(class13) '+
			  "FROM [tmasWIM12."+database+"Class] where state_fips = '"+fips+"' and station_id = '"+station+"' "+
			  'group by station_id,dir,year,month,day,hour '+
			  'order by station_id,dir,year,month,day,hour ';
			
			console.log('by hour',sql)
			BQuery(sql,function(data){

				var fullData = data.rows.map(function(row,index){
					var outrow = {}
					
					data.schema.fields.forEach(function(field,i){
						outrow[field.name] = row.f[i].v;
					});
					return outrow;
				});
				cb(fullData);
				fileCache.addData({datasource:database,type:'stationClassByHour',typeId:fips+station},fullData);
			});

		}
	
	});
}

function getStateFilter(database,fips,cb){
	if( stateFilters[database]&& stateFilters[database][fips] ){
		cb(stateFilters[database][fips])
	}else{
		if(!stateFilters[database]){ stateFilters[database] = {} }
		stateFilters[database][fips] = new StateByClassFilter();
		getStateByMonth(database,fips,function(data){
			console.log('New state Filter',fips,data.length)
			stateFilters[database][fips].init(data);
			cb(stateFilters[database][fips])
		})	
	}

}

function getStationFilter(database,fips,station,cb){
	if( stationFilters[database] && stationFilters[database][fips+''+station] ){
		console.log('cached filter',fips+''+station)
		cb( stationFilters[database][fips+''+station]);
	}else{
		if(!stationFilters[database]){ stationFilters[database] = {} }
		stationFilters[database][fips+''+station] = new StationByHourFilter();
		
		getStationByHour(database,fips,station,function(data){
			console.log('New Filter',fips+''+station,data.length)
			stationFilters[database][fips+''+station].init(data)
			//cFilter = ;
			cb(stationFilters[database][fips+''+station])
		})
	}
}


function BQuery(sql,cb){

	var output = {};
	console.time('TmgClassController - byDay - query');
    
	var request = bigQuery.jobs.query({
    	kind: "bigquery#queryRequest",
    	projectId: 'avail-wim',
    	timeoutMs: '10000',
    	resource: {query:sql,projectId:'avail-wim'},
    	auth: jwt
    },
    function(err, response) {
  		if (err) console.log('Error:',err);
  		console.timeEnd('TmgClassController - byDay - query');
    	if(response && response.rows){
	    	console.log(response.rows.length,response.totalRows)
	    	
      		output = response;
			

			if(output.rows.length < output.totalRows){
					
				getMoreRows(output.jobReference.jobId,output.rows.length)
			
			}else{
	
				console.log('finished');
	
				cb(output);
			}

			//getMoreRows(response.jobReference.jobId,output.length)

			function getMoreRows(jobid,startLine){

				console.log('get more rows',jobid,startLine);
				
				var params = {jobId:jobid,projectId:'avail-wim',startLine:startLine,auth: jwt};
				bigQuery.jobs.getQueryResults(params,function(err,data){

					if(err){
						console.log('get more rows error',err);
					}

					console.log('get more rows/data returned');
					if(typeof data.rows == 'undefined'){
						console.log('error probably',data);
					}
					
					//console.log(data);
					console.log('data2',data.rows.length,data.pageToken,data.jobReference);
					data.rows.forEach(function(data){
						output.rows.push(data);
					});

					if(output.rows.length < output.totalRows){
					
						getMoreRows(jobid,output.rows.length)
					
					}else{
						cb(output);
					}

				});
			}

      	}else{
      		cb({rows:[],schema:[]})
      	}
  		
    });
}


function _parseYear(year){
    if(!year){
        return 'All'
    }

    var yearName = '';
    year = year.toString();
    if(year.length === 1){
            yearName = '200'+year;
    }else  if(year.length === 2){
        yearName = '20'+year;
    }else if(year.length === 4){
        if(parseInt(year.substr(2,2)) > 50){
            yearName = '19'+year.substr(2,2)
        }else{
            yearName = year;
        }
    }
    return parseInt(yearName);
}


var fileCache = {
	
	cache : {},

	checkCache : function(request,callback){
		console.log('------------checkCache----'+request.datasource+'---'+request.type+request.typeId+'----------------')
		var file = __dirname.substring(0,__dirname.length-15) + 'assets/cache/'+request.datasource+'/'+request.type+request.typeId+'.json';
		
		//console.log(file,callback);
		console.time('file Read')
		fs.readFile(file, 'utf8', function (err, data) {
		  if (err) {
		    console.log('Error: ' + err);
		    return callback(false);
		  }
		 		 
		  console.timeEnd('file Read');
		  data = JSON.parse(data);
		  return callback(data);
		
		});

	},

	addData : function(request,data){
		var dir = __dirname.substring(0,__dirname.length-15) + 'assets/cache/'+request.datasource+'/';

		ensureExists(dir, 0744, function(err) {
		    if (err){
		    	console.log('ensure exists error')
		    } // handle folder creation error
		    var file = dir+request.type+request.typeId+'.json';
		    
		    fs.writeFile(file,JSON.stringify(data), function(err) {
			    if(err) {
			        console.log('file write error',err);
			    } else {
			        console.log("The file was saved!",file);
			    }
			});
		
		});

	}


};

function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}