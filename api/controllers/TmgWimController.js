/**
 * AgencyController
 * 
 * @description :: Server-side logic for managing agencies
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var googleapis = require('googleapis');
	fs = require('fs'),
	d3 = require('d3'),
    colorbrewer = require('colorbrewer'),
    colorRange = colorbrewer.RdYlBu[5].reverse(),
	jwt = new googleapis.auth.JWT(
		'424930963222-s59k4k5usekp20guokt0e605i06psh0d@developer.gserviceaccount.com', 
		'availwim.pem', 
		'3d161a58ac3237c1a1f24fbdf6323385213f6afc', 
		['https://www.googleapis.com/auth/bigquery']
	);
	jwt.authorize();	

var bigQuery = googleapis.bigquery('v2');
var wimTonsByDayFilter = require('../../assets/react/utils/dataFilters/wimTonsByDayFilter'),
	tonFilters = {};

var newTMG = {'ncdotData':true};

function getClassStations(database){

	var sql = 'SELECT state_fips,station_id FROM [tmasWIM12.'+database+'Class] group by state_fips,station_id';
	BQuery(sql,function(data){
		console.log('get data',data.rows);
	});

}

module.exports = {
	
	axleDistro: function(req,res){
		var fips = req.param('fips'),
			station = req.param('stationId'),
			database = req.param('database'),
			timescale = req.param('monthly') ? ',month' : '',
			mult = database in newTMG ? '1' : '220.462',
			spaceMult = '3.93701',
			minSpace = 36, maxSpace = 60;


		var where = 'where state_fips = \'' + fips + '\' and station_id = \'' + station + '\' ';
		var sql =  'select a.weight, a.total as singe_count, b.total as tandem_count, c.total as tri_count, d.total as quad_count from '
			sql += generateQuery(1,'a')
			sql += ' join '
			sql += generateQuery(2,'b')
			sql += ' on a.weight = b.weight join'
			sql += generateQuery(3,'c')
			sql += ' on a.weight = c.weight join'
			sql += generateQuery(4,'d')
			sql += ' on a.weight = d.weight'

		BQuery(sql,function(data){		
			var fullData = data.rows.map(function(row,index){
				var outrow = {}
				data.schema.fields.forEach(function(field,i){
					outrow[field.name] = row.f[i].v;
				});
				return outrow;
			});
			var output = {}
				fullData.forEach(function(d){

				})

			res.json(fullData);
		});


		function generateQuery(numAxles, nameAs){
			var output = ' (SELECT CASE '
			for(var i=1;i<=13-numAxles;i++){
				output += ' WHEN'
				var axles = []
				for(var j=0;j <numAxles;j++){
					' (axle'+(i+j)+'sp * ' + spaceMult + ' > '+ minSpace +' and axle'+(i+j)+'sp * '+spaceMult+' < '+maxSpace+') and' +
					axles.push('axle'+(i+j))
				}
				var curAxle = (numAxles+(i-1))
				output += ' not (axle'+curAxle+'sp * ' + spaceMult + ' > '+ minSpace +' and axle'+curAxle+'sp * '+spaceMult+' < '+maxSpace+') '
		    	output += ' THEN ('+axles.join(' + ')+') '
			}
			output += ' END as weight, count(1) as total from [tmasWIM12.'+database+']' + where
			output += ' group by weight) as '+ nameAs
			return output
		}

	},

	TonageNew:function(req,res){
		var fips = req.param('fips'),
			database = req.param('database'),
			timescale = req.param('monthly') ? ',month' : '',
			mult = database in newTMG ? '1' : '220.462';
		var filters = req.param('filters') || {}
		var whereClass = filters.class ? ' and class = '+ filters.class + ' ' : ''
		var whereYear = filters.year ? ' and year = '+ filters.year + ' ' : ''

		var sql = 	'SELECT'+
					'(SUM(case when ((total_weight*'+mult+')-19539) >= 0 and class = 4 then total_weight else 0 end) + '+
					'SUM(case when ((total_weight*'+mult+')-31464) >= 0 and class = 5 then total_weight else 0 end) + '+
					'SUM(case when ((total_weight*'+mult+')-39739) >= 0 and class = 6 then total_weight else 0 end) + '+
					'SUM(case when ((total_weight*'+mult+')-37000) >= 0 and class = 7 then total_weight else 0 end) + '+
					'SUM(case when ((total_weight*'+mult+')-40000) >= 0 and class = 8 then total_weight else 0 end) + '+
					'SUM(case when ((total_weight*'+mult+')-51935) >= 0 and class = 9 then total_weight else 0 end) + '+
					'SUM(case when ((total_weight*'+mult+')-31000) >= 0 and class = 10 then total_weight else 0 end) + '+
					'SUM(case when ((total_weight*'+mult+')-40000) >= 0 and class = 11 then total_weight else 0 end) + '+
					'SUM(case when ((total_weight*'+mult+')-40000) >= 0 and class = 12 then total_weight else 0 end) + '+
					'SUM(case when ((total_weight*'+mult+')-40000) >= 0 and class = 13 then total_weight else 0 end)) / '+
					'count(DISTINCT concat(STRING(year),"-",STRING(month),"-",STRING(day)))  as value, '+
					'station_id as label '+ 
					timescale + 
	 			' FROM [tmasWIM12.'+database+'] where state_fips = "'+fips+'" and year < 16 '+whereClass+' '+whereYear+
	 			' group by label '+timescale

	 	console.log('------------------------------------------------')
		console.log('TonageNew')
		console.log('------------------------------------------------')
		console.log(sql)
		console.log('------------------------------------------------')
		BQuery(sql,function(data){
				
			var fullData = data.rows.map(function(row,index){
				var outrow = {}
				
				data.schema.fields.forEach(function(field,i){
					outrow[field.name] = row.f[i].v;
					if(field.name === 'station_id' &&  row.f[i].v.length < 6 ){
						outrow[field.name] = fixStationId(row.f[i].v);
					}
				});
				return outrow;
			});
			console.log('tonnage new sending', filters, fullData.length)
			res.json(fullData);
		});
	
	},


	getEnforcementCalendarData:function(req,res){
		var fips = req.param('fips'),
			station = req.param('stationId'),
			database = req.param('database'),
			threshold = req.param('threshold') || 90000,
			filters = req.param('filters') || {},
			mult = database in newTMG ? '1' : '220.462';

		var sql = 'select '+
 		' dir,year as y,month as m,day as d,count(1) as t, SUM(CASE WHEN total_weight*'+mult+' >= '+threshold+' THEN 1 ELSE 0 END) as o '+
 		' from [tmasWIM12.'+database+'] '+
 		' where class >= 8 and station_id = "'+station+'" and state_fips="'+fips+'"'+
 		' group by dir,y,m,d order by dir,y,m,d'

 		console.log('------------------------------------------------')
		console.log('getEnforcementCalendarData')
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

	getVolumeCalendarData:function(req,res){
		var fips = req.param('fips'),
			station = req.param('stationId'),
			database = req.param('database'),
			threshold = req.param('threshold') || 90000,
			filters = req.param('filters') || {},
			type = req.param('type') || '',
			mult = database in newTMG ? '1' : '220.462';

		var total = type === 'Class' ? 'sum(total_vol) as t' :'count(1) as t'

		var sql = 'select '+
 		' 1 as dir,year as y,month as m,day as d,'+ total +
 		' from [tmasWIM12.' + database + type +'] '+
 		' where  station_id = "'+station+'" and state_fips="'+fips+'"'+
 		' group by dir,y,m,d order by dir,y,m,d'

 		console.log('------------------------------------------------')
		console.log('getVolumeCalendarData')
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


	getEnforcementHeatData:function(req,res){
		var fips = req.param('fips'),
			station = req.param('stationId'),
			database = req.param('database'),
			type = req.param('type') || 'total',
			threshold = req.param('threshold') || 90000,
			filters = req.param('filters') || {},
			mult = database in newTMG ? '1' : '220.462';

			var query = 'total_weight*'+mult+' >= '+threshold;
			if(type === 'axle'){
				query = ''
				for(var i = 1; i < 13;i++){
					query += " axle"+i+" *"+mult+" >= "+threshold+" or";
				}
				query += " axle13 *"+mult+" >= "+threshold
			}

		var sql = 'select DAYOFWEEK(TIMESTAMP(concat(STRING(year),"-",STRING(month),"-",STRING(day)))) as dow,'+
 		' hour,count(1), dir, SUM(CASE WHEN '+query+' THEN 1 ELSE 0 END) '+
 		' from [tmasWIM12.'+database+'] '+
 		' where class >= 8 and station_id = "'+station+'" and state_fips="'+fips+'"'+
 		' group by dow,hour,dir order by dow,hour,dir'

 		console.log('------------------------------------------------')
		console.log('getEnforcementHeatData')
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

	getEnforcementDashData:function(req,res){
		var fips = req.param('fips'),
			database = req.param('database'),
			threshold = req.param('threshold') || 90000,
			type = req.param('type') || 'total'
			filters = req.param('filters') || {},
			mult = database in newTMG ? '1' : '220.462';

			console.log(database,newTMG,database in newTMG,mult);

			var query = "a.total_weight*"+mult+" >= "+threshold;
			if(type === 'axle'){
				query = ''
				for(var i = 1; i < 13;i++){
					query += " a.axle"+i+" *"+mult+" >= "+threshold+" or";
				}
				query += " a.axle13 *"+mult+" >= "+threshold
			}

		var sql = "select station_id,"+
			"       SUM(CASE WHEN "+query+" and a.class > 8 THEN 1 ELSE 0 END) as overTT,"+
			"       SUM(CASE WHEN "+query+" and a.class <= 8 THEN 1 ELSE 0 END) as oversingle,"+
			"       SUM(CASE WHEN a.class >= 8 THEN 1 ELSE 0 END) as TT,"+
			"       SUM(CASE WHEN a.class < 8 THEN 1 ELSE 0 END) as single,"+
			"       month,"+
			"       year"+
			"  from [tmasWIM12."+database+"] as a"+
			"  where state_fips = '"+fips+"'"+
			"	group by station_id,year,month, order by station_id,year,month";

		console.log('getEnforcementDashData')
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

	getWimStationData:function(req,res){

 		console.log('getWimStationData');
 		console.log('++++++++++++++++++++++++++++++++++++++++++++')
 		if(typeof req.param('stationId') == 'undefined'){
 			res.send('{status:"error",message:"station_id required"}',500);
 			return;
 		}
 		if(typeof req.param('fips') == 'undefined'){
 			res.send('{status:"error",message:"state code required"}',500);
 			return;	
 		}

 		var station_id = req.param('stationId'),
 			filters = req.param('filters'),
 			state = req.param('fips'),
 			database = req.param('database'),
 			depth = generateDepth();

 		var select = {
 			1: 'year',
 			2: 'month',
 			3: 'day',
 			4: 'hour'
 		};

 		var sql = generateSQL();
 		BQuery(sql,function(data){
 			var fullData = data.rows.map(function(row,index){
				var outrow = {}
				
				data.schema.fields.forEach(function(field,i){
					outrow[field.name] = row.f[i].v;
				});
				return outrow;
			});
			res.json(fullData);
 		})

 		function generateDepth(){
 			if(filters.year && filters.month){
 				return [filters.year,filters.month]
 			}else if(filters.year){
 				return [filters.year]
 			}
 			return [0]
 		}

 		function generateSQL() {

 			var sql	= "SELECT " + select[depth.length] + ", class, total_weight AS weight, count(*) AS amount "
 				+ "FROM [tmasWIM12."+database+"] "
 				+ "WHERE station_id = '"+station_id+"' "
 				+ "and state_fips ='"+state+"' "
 				+ addPredicates()
 				+ "GROUP BY " + select[depth.length] + ", class, weight "
 				+ "ORDER BY " + select[depth.length] + ";";
 			console.log(sql)
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



	TonageMonthGraph:function(req,res){
		var fips = req.param('fips'),
			database = req.param('database'),
			filters = req.param('filters') || {};

		getFilter(database,fips,function(cFilter){
			
			if(cFilter.initialized()){

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
	 				cFilter.getDimension('dir').filter(filters.dir)	 				
	 			}

				

				var output = cFilter.getGroup('ADT').top(Infinity);
				output = output.map(function(d){
					return {
						label: d.key,
						value: d.value.avg
					}
				});
				res.json(output)

			}else {
				
				res.json({loading:true})
			
			}
			
		})

	},

	Tonage: function(req,res) {
 		if(typeof req.param('fips') == 'undefined'){
 			res.send('{status:"error",message:"state FIPS required"}',500);
 			return;
 		}
 	
 		var stationId = req.param('stationId'),
 			fips = req.param('fips'),
 			database = req.param('database');
 	
 		TonageData(fips,database,function(data){
	 		res.json(data);
	 	});
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

function TonageData(fips,database,cb){
		//console.log('getTonageInfoQuery')
		if(!fips){
			return {status:"error",message:"state FIPS required"}
		}
		
		fileCache.checkCache({datasource:database,type:'stateTonnage',typeId:fips},function(data){
			if(data){
				console.log('cache sucess');
				console.time('send cache');
				cb(data);
				console.timeEnd('send cache');
			}else{
			var mult = database in newTMG ? '1' : '220.462';
	 		var sql = 'SELECT '+
	 			//' SUM(case when total_weight*220.462 <= '+empty_truck_tonage+' then total_weight else 0 end) as empty_vius,'+
	 			'SUM(case when ((total_weight*'+mult+')-19539) >= 0 and class = 4 then total_weight else 0 end) as c4 ,'+
	 			'SUM(case when ((total_weight*'+mult+')-31464) >= 0 and class = 5 then total_weight else 0 end) c5,'+
	 			'SUM(case when ((total_weight*'+mult+')-39739) >= 0 and class = 6 then total_weight else 0 end) c6,'+
	 			'SUM(case when ((total_weight*'+mult+')-37000) >= 0 and class = 7 then total_weight else 0 end) c7,'+
	 			'SUM(case when ((total_weight*'+mult+')-40000) >= 0 and class = 8 then total_weight else 0 end) c8,'+
	 			'SUM(case when ((total_weight*'+mult+')-51935) >= 0 and class = 9 then total_weight else 0 end) c9,'+
	 			'SUM(case when ((total_weight*'+mult+')-31000) >= 0 and class = 10 then total_weight else 0 end) c10,'+
	 			'SUM(case when ((total_weight*'+mult+')-40000) >= 0 and class = 11 then total_weight else 0 end) c11,'+
	 			'SUM(case when ((total_weight*'+mult+')-40000) >= 0 and class = 12 then total_weight else 0 end) c12,'+
	 			'SUM(case when ((total_weight*'+mult+')-40000) >= 0 and class = 13 then total_weight else 0 end) c13,'+
	 			'station_id, '+
	 			' dir,year,month,day, '+
	 			' FROM [tmasWIM12.'+database+'] where state_fips = "'+fips+'" where year < 16'+
	 			' group by station_id,dir,year,month,day'

	 		console.time('getTonageInfoQuery')
	 		console.log("gettonnageinfo ",sql)
			BQuery(sql,function(data){
				console.timeEnd('getTonageInfoQuery')
				var fullData = data.rows.map(function(row,index){
					var outrow = {}
					
					data.schema.fields.forEach(function(field,i){
						outrow[field.name] = row.f[i].v;
					});
					outrow['single_day'] = outrow.station_id +'-'+ outrow.year+'-'+outrow.month+'-'+outrow.day
					return outrow;
				});
				fileCache.addData({datasource:database,type:'stateTonnage',typeId:fips},fullData);
				cb(fullData);
			})
		}
	})
}

function getFilter(database,fips,cb){
	var cFilter = null
	if( tonFilters[database] && tonFilters[database][fips] ){
		cFilter =  tonFilters[database][fips];
		cb(cFilter)
	}else{
		if(!tonFilters[database]){ tonFilters[database] = {} }
		tonFilters[database][fips] = new wimTonsByDayFilter();
		
		TonageData(fips,database,function(data){
			tonFilters[database][fips].init(data)
			cFilter = tonFilters[database][fips];
			cb(cFilter)
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
	    	//console.log(response.rows.length,response.totalRows)
	    	
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


function fixStationId(id){
	
	if(id.length === 6){
		return id
	}else if(id.length === 5){
		return '0'+id;
	}else if(id.length === 4){
		return '00'+id;
	}else if(id.length === 3){
		return '000'+id;
	}else if(id.length === 2){
		return '0000'+id;
	}else if(id.length === 1){
		return '000000'+id;
	}

}