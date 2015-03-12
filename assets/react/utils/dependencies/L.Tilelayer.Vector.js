L = require('../../utils/dependencies/leaflet');
    

module.exports=(function() {
/*! communist 2013-05-30*/
/*!(c)2013 Calvin Metcalf @license MIT https://github.com/calvinmetcalf/communist */
/*!Includes Promiscuous (c)2013 Ruben Verborgh @license MIT https://github.com/RubenVerborgh/promiscuous*/
/*!Includes Material from setImmediate Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic Denicola @license MIT https://github.com/NobleJS/setImmediate */
"undefined"==typeof document?(self._noTransferable=!0,self.onmessage=function(e){eval(e.data)}):function(){"use strict";function moveImports(e){var n,t=e.match(/(importScripts\(.*\);)/);return n=t?t[0].replace(/importScripts\((.*\.js\')\);?/,function(e,n){return n?"importScripts("+n.split(",").map(function(e){return"'"+c.makeUrl(e.slice(1,-1))+"'"})+");\n":""})+e.replace(/(importScripts\(.*\.js\'\);?)/,"\n"):e}function getPath(){if("undefined"!=typeof SHIM_WORKER_PATH)return SHIM_WORKER_PATH;for(var e=document.getElementsByTagName("script"),n=e.length,t=0;n>t;){if(/communist(\.min)?\.js/.test(e[t].src))return e[t].src;t++}}function makeWorker(e){var n,t=moveImports(e.join(""));c.URL=c.URL||window.URL||window.webkitURL;try{n=new Worker(c.URL.createObjectURL(new Blob([t],{type:"text/javascript"})))}catch(r){c._noTransferable=!0,n=new Worker(getPath()),n.postMessage(t)}finally{return n}}function single(e,n){var t=c.deferred(),r=makeWorker(["var _self={};\n_self.fun = ",e,";\n	_self.cb=function(data,transfer){\n			!self._noTransferable?self.postMessage(data,transfer):self.postMessage(data);\n			self.close();\n		};\n		_self.result = _self.fun(",JSON.stringify(n),',_self.cb);\n		if(typeof _self.result !== "undefined"){\n			_self.cb(_self.result);\n		}']);return r.onmessage=function(e){t.resolve(e.data)},r.onerror=function(e){e.preventDefault(),t.reject(e.message)},t.promise}function mapWorker(e,n,t){var r=new Communist,a=makeWorker(["\n	var _db={};\n	_db.__close__=function(){\n		self.close();\n	};\n	var _self={};\n	_db.__fun__ = ",e,';\n	_self.cb=function(data,transfer){\n		!self._noTransferable?self.postMessage(data,transfer):self.postMessage(data);\n	};\n	self.onmessage=function(e){\n		_self.result = _db.__fun__(e.data,_self.cb);\n			if(typeof _self.result !== "undefined"){\n				_self.cb(_self.result);\n		}\n	}']);return a.onmessage=function(e){n(e.data)},a.onerror=t?t:function(){n()},r.data=function(e,n){return c._noTransferable?a.postMessage(e):a.postMessage(e,n),r},r.close=function(){return a.terminate()},r}function multiUse(e){return object({data:e})}function object(e){var n=new Communist,t=0,r=[],a=function(e){"string"!=typeof e&&e.preventDefault&&(e.preventDefault(),e=e.message),r.forEach(function(n){n&&n.reject(e)})};"initialize"in e||(e.initialize=function(){});var o="{",s=function(e){var n=function(n,t){var a=r.length;return r[a]=c.deferred(),c._noTransferable?i.postMessage([a,e,n]):i.postMessage([a,e,n],t),r[a].promise};return n};for(var u in e)0!==t?o+=",":t++,o=o+u+":"+(""+e[u]),n[u]=s(u);o+="}";var i=makeWorker(["\n	var _db="+o+';\n	self.onmessage=function(e){\n	var cb=function(data,transfer){\n		!self._noTransferable?self.postMessage([e.data[0],data],transfer):self.postMessage([e.data[0],data]);\n	};\n		var result = _db[e.data[1]](e.data[2],cb);\n			if(typeof result !== "undefined"){\n				cb(result);\n			}\n	}\n	_db.initialize()']);return i.onmessage=function(e){r[e.data[0]].resolve(e.data[1]),r[e.data[0]]=0},i.onerror=a,n._close=function(){return i.terminate(),a("closed"),c.resolve()},"close"in n||(n.close=n._close),n}function queue(e,n,t){function r(e){return function(n,t){return f(e,n,t)}}function a(e){return function(n){return c.all(n.map(function(n){return f(e,n)}))}}function o(e){return function(n){var t=this;return c.all(n.map(function(n){return f(e,n).then(t.__cb__)}))}}function s(e){return function(n){return c.all(n.map(function(n){return f(e,n[0],n[1])}))}}function u(e){return function(n){var t=this;return c.all(n.map(function(n){return f(e,n[0],n[1]).then(t.__cb__)}))}}function i(e){var n;v?(n=p.shift(),v--,d[e][n[0]](n[1],n[2]).then(function(t){i(e),n[3].resolve(t)},function(t){i(e),n[3].reject(t)})):(m++,_.push(e))}function f(e,r,a){if(t)return d[~~(Math.random()*n)][e](r,a);var o,s=c.deferred();return!v&&m?(o=_.pop(),m--,d[o][e](r,a).then(function(e){i(o),s.resolve(e)},function(e){i(o),s.reject(e)})):(v||!m)&&(v=p.push([e,r,a,s])),s.promise}var l=new Communist;l.__batchcb__=new Communist,l.__batchtcb__=new Communist,l.batch=function(e){return l.__batchcb__.__cb__=e,l.__batchcb__},l.batchTransfer=function(e){return l.__batchtcb__.__cb__=e,l.__batchtcb__};for(var d=Array(n),m=0,_=[],p=[],v=0;n>m;)d[m]=object(e),_.push(m),m++;e._close=function(){};for(var b in e)l[b]=r(b),l.batch[b]=a(b),l.__batchcb__[b]=o(b),l.batchTransfer[b]=s(b),l.__batchtcb__[b]=u(b);return"close"in l||(l.close=l._close),l}function rWorker(e,n){var t=new Communist,r="function(dat,cb){ var fun = "+e+';\n		switch(dat[0]){\n			case "data":\n				if(!this._r){\n					this._r = dat[1];\n				}else{\n					this._r = fun(this._r,dat[1]);\n				}\n				break;\n			case "get":\n				return cb(this._r);\n			case "close":\n				cb(this._r);\n				this.__close__();\n				break;\n		}\n	};',a=function(e){n(e)},o=mapWorker(r,a);return t.data=function(e,n){return c._noTransferable?o.data(["data",e]):o.data(["data",e],n),t},t.fetch=function(){return o.data(["get"]),t},t.close=function(e){e&&(n=function(){}),o.data(["close"])},t}function incrementalMapReduce(e){function n(){for(var e=0,n=u.length;n>e&&s>0&&f>0;)s--,u[e].data(i.pop()),e++,f--;return o}function t(){a.close(),u.forEach(function(e){e.close()})}var r,a,o=new Communist,s=0,u=[],i=[],f=e,l=!1,d=!1,m={map:!1,reduce:!1,data:!1},_=function(){return m.map&&m.reduce&&m.data?n():o};return o.map=function(n,r){function c(){var o,c=mapWorker(n,function(n){void 0!==typeof n&&a.data(n),s>0?(s--,o=i.pop(),r?c.data(o,[o]):c.data(o)):(f++,f===e&&(m.data=!1,d?t():l&&(l=!1,a.fetch())))});u.push(c)}if(m.map)return o;for(var p=0;e>p;)c(),p++;return m.map=!0,_()},o.reduce=function(e){return m.reduce?o:(a=rWorker(e,function(e){r&&(r.resolve(e),r=!1)}),m.reduce=!0,_())},o.data=function(e){return d?void 0:(s+=e.length,i=i.concat(e),m.data=!0,_())},o.fetch=function(n){return r||(r=c.deferred()),e>f&&!n?l=!0:a.fetch(),r.promise},o.close=function(){return r||(r=c.deferred()),e>f?d=!0:t(),r.promise},o}function nonIncrementalMapReduce(e){function n(){return a.data&&a.map&&a.reduce?r.close():t}var t=new Communist,r=incrementalMapReduce(e),a={data:!1,map:!1,reduce:!1};return t.map=function(e,t){return a.map=!0,r.map(e,t),n()},t.reduce=function(e){return a.reduce=!0,r.reduce(e),n()},t.data=function(e){return a.data=!0,r.data(e),n()},t}function c(e,n,t){return"number"!=typeof e&&"function"==typeof n?mapWorker(e,n,t):"object"!=typeof e||Array.isArray(e)?"number"!=typeof e?n?single(e,n):multiUse(e):"number"==typeof e?n?nonIncrementalMapReduce(e):incrementalMapReduce(e):void 0:"number"==typeof n?queue(e,n,t):object(e)}(function(attachTo,global){function isStringAndStartsWith(e,n){return"string"==typeof e&&e.substring(0,n.length)===n}function onGlobalMessage(e){if(e.source===global&&isStringAndStartsWith(e.data,MESSAGE_PREFIX)){var n=e.data.substring(MESSAGE_PREFIX.length);tasks.runIfPresent(n)}}var tasks=function(){function Task(e,n){this.handler=e,this.args=n}Task.prototype.run=function(){if("function"==typeof this.handler)this.handler.apply(void 0,this.args);else{var scriptSource=""+this.handler;eval(scriptSource)}};var nextHandle=1,tasksByHandle={},currentlyRunningATask=!1;return{addFromSetImmediateArguments:function(e){var n=e[0],t=Array.prototype.slice.call(e,1),r=new Task(n,t),a=nextHandle++;return tasksByHandle[a]=r,a},runIfPresent:function(e){if(currentlyRunningATask)global.setTimeout(function(){tasks.runIfPresent(e)},0);else{var n=tasksByHandle[e];if(n){currentlyRunningATask=!0;try{n.run()}finally{delete tasksByHandle[e],currentlyRunningATask=!1}}}},remove:function(e){delete tasksByHandle[e]}}}(),MESSAGE_PREFIX="com.communistjs.setImmediate"+Math.random();global.addEventListener?global.addEventListener("message",onGlobalMessage,!1):global.attachEvent("onmessage",onGlobalMessage),attachTo.setImmediate=function(){var e=tasks.addFromSetImmediateArguments(arguments);return global.postMessage(MESSAGE_PREFIX+e,"*"),e}})(c,window),function(e){function n(){var e=function(c,s,u){var i;if(c!==e)return i=n(),e.c.push({d:i,resolve:c,reject:s}),i.promise;for(var f,l,d,m=s?"resolve":"reject",_=0,p=e.c.length;p>_;_++)f=e.c[_],l=f.d,d=f[m],typeof d!==a?l[m](u):r(d,u,l);e=t(o,u,s)},o={then:function(n,t){return e(n,t)}};return e.c=[],{promise:o,resolve:function(n){e.c&&e(e,!0,n)},reject:function(n){e.c&&e(e,!1,n)}}}function t(e,t,o){return function(c,s){var u,i=o?c:s;return typeof i!==a?e:(r(i,t,u=n()),u.promise)}}function r(n,t,r){e.setImmediate(function(){var e;try{e=n(t),e&&typeof e.then===a?e.then(r.resolve,r.reject):r.resolve(e)}catch(o){r.reject(o)}})}var a="function";e.resolve=function(e){var n={};return n.then=t(n,e,!0),n},e.reject=function(e){var n={};return n.then=t(n,e,!1),n},e.deferred=n}(c),c.all=function(e){var n=c.deferred(),t=e.length,r=0,a=Array(t),o=function(e){return function(o){a[e]=o,r++,r===t&&n.resolve(a)}};return e.forEach(function(e,t){e.then(o(t),function(e){n.reject(e)})}),n.promise};var Communist=function(){};c.reducer=rWorker,c.worker=makeWorker,c.makeUrl=function(e){var n=document.createElement("link");return n.href=e,n.href},c.ajax=function(e,n,t){var r=t?"request.responseText":"JSON.parse(request.responseText)",a=n?"("+(""+n)+")("+r+",_cb)":r,o='function (url, _cb) {\n		var request = new XMLHttpRequest();\n		request.open("GET", url);\n			request.onreadystatechange = function() {\n				var _resp;\n				if (request.readyState === 4 && request.status === 200) {\n_resp = '+a+';\n					if(typeof _resp!=="undefined"){_cb(_resp);}\n					}\n			};\n			request.onerror=function(e){throw(e);}\n		request.send();\n	}';return c(o,c.makeUrl(e))},"undefined"==typeof module?window.communist=c:module.exports=c}();

//------------------TileCache
/**
 * Simple tile cache to keep tiles while zooming with overzoom
 */
L.TileCache = function() {
};

L.TileCache.prototype = {
    // cache key: tile (String: Object)
    _cache: {},

    // flag to determine switch between tile unloading (put) and loading (get) phase
    _unloading: false,

    // flag to only cache tiles when zooming, not when moving
    _zooming: false,

    onAdd: function(map) {
        this._map = map;
        
        map.on('zoomstart', this._onZoomStart, this);
        map.on('zoomend', this._onZoomEnd, this);
    },

    onRemove: function(map) {
        this._map = null;

        map.off('zoomstart', this._onZoomStart, this);
        map.off('zoomend', this._onZoomEnd, this);
    },

    _onZoomStart: function(evt) {
        this._zooming = true;
    },

    _onZoomEnd: function(evt) {
        this._zooming = false;
    },

    get: function(key, urlZoom) {
        var ckey = this._getCacheKey(key, urlZoom);
        var tile = this._cache[ckey];
        this._unloading = false;
        //console.log('cache ' + (tile ? 'hit ' : 'miss') + ': ' + ckey);
        return tile;
    },
    
    put: function(tile) {
        if (!this._zooming) return;

        if (!this._unloading) {
            // clear old entries before adding newly removed tiles after zoom or move
            this.clear();
            this._unloading = true;
        }

        var ckey = this._getCacheKeyFromTile(tile);
        if (!(ckey in this._cache)) {
            // vector layer is recreated because of feature filter
            delete tile.layer;
            this._cache[ckey] = tile;
            //console.log('cache put : ' + ckey + ' (' + Object.keys(this._cache).length + ')');
        }
    },
    
    clear: function() {
        //console.log('cache clear');
        this._cache = {};
    },

    _getCacheKeyFromTile: function(tile) {
        return this._getCacheKey(tile.key, tile.urlZoom);
    },

    _getCacheKey: function(key, urlZoom) {
        return urlZoom + ':' + key
    }
};

L.tileCache = function() {
    return new L.TileCache();
};

// dummy impl. to turn caching off
L.tileCacheNone = function() {
    return {
        onAdd: function(map) {},
        onRemove: function(map) {},
        get: function(key, urlZoom) {},
        put: function(tile) {},
        clear: function() {}
    };
};

//----------------------TileQueue------------------------------------------
L.TileQueue = function(callback) {
    this.callback = callback;
};

L.TileQueue.prototype = {

    _queue: [],
    _queueTimeout: null,
    
    add: function(aTile) {
        this._queue.push(aTile);
        if (!this._queueTimeout) {
            this._queueTimeout = setTimeout(L.bind(function(){
                var time, timeout, start = +new Date, tile;

                // handle empty elements, see remove
                do { 
                    tile = this._queue.shift();
                }
                while (!tile && this._queue.length > 0);

                if (tile) {
                    //console.log('adding ' + tile.key + ' ...');

                    this.callback(tile);

                    // pause a percentage of adding time to keep UI responsive
                    time = +new Date - start;
                    timeout = Math.floor(time * 0.3);
                    //console.log('added  ' + tile.key + ' (' + time + 'ms > ' + timeout + 'ms)');
                    this._queueTimeout = setTimeout(L.bind(arguments.callee, this), timeout);
                } else {
                    this._queueTimeout = null;
                }
            }, this), 0);
        }
    },

    remove: function(tile) {
        var key = tile.key, 
            val;
        for (var i = 0, len = this._queue.length; i < len; i++) {
            val = this._queue[i];
            if (val && val.key === key) {
                //console.log('##### delete ' + key);
                // set entry to undefined only for better performance (?) - 
                // queue consumer needs to handle empty entries!
                delete this._queue[i];
            }
        }
    },

    clear: function() {
        if (this._queueTimeout) {
            clearTimeout(this._queueTimeout);
            this._queueTimeout = null;
        }
        this._queue = [];
    }
};
//----------------------------------------------

L.AbstractWorker = L.Class.extend({
    initialize: function () {
    },

    onAdd: function (map) {
    },

    onRemove: function (map) {
    },

    process: function(tile, callback) {
        callback(tile);
    },
    
    abort: function(tile) {
    },
    
    clear: function() {
    }
});

// dummy worker (= no worker) when used directly
L.noWorker = function () {
    return new L.AbstractWorker();
};

//-------------------------------------------------------
L.CommunistWorker = L.AbstractWorker.extend({

    statics: {
        // number of web workers, not using web workers when falsy
        NUM_WORKERS: 2
    },

    initialize: function (workerFunc) {
        this.workerFunc = workerFunc;
    },

    onAdd: function (map) {
        this._workers = L.CommunistWorker.createWorkers(this.workerFunc);
    },

    onRemove: function (map) {
        if (this._workers) {
            // TODO do not close when other layers are still using the static instance
            //this._workers.close();
        }
    },

    process: function(tile, callback) {
        if (this._workers){ 
            tile._worker = this._workers.data(tile.datum).then(function(parsed) {
                if (tile._worker) {
                    tile._worker = null;
                    tile.parsed = parsed;
                    tile.datum = null;
                    callback(null, tile);
                } else {
                    // tile has been unloaded, don't continue with adding
                    //console.log('worker aborted ' + tile.key);
                }
            });
        } else {
            callback(null, tile);
        }
    },
    
    abort: function(tile) {
        if (tile._worker) {
            // TODO abort worker, would need to recreate after close
            //tile._worker.close();
            tile._worker = null;
        }
    }
});
//--------------------------------------------------------------------
L.communistWorker = function (workerFunc) {
    return new L.CommunistWorker(workerFunc);
};

L.extend(L.CommunistWorker, {
    createWorkers: function(workerFunc) {
        if ( L.CommunistWorker.NUM_WORKERS && typeof Worker === "function" && typeof communist === "function"
                && !("workers" in L.CommunistWorker)) {
            L.CommunistWorker.workers = communist({
                //data : L.TileLayer.Vector.parseData
                data : workerFunc
            }, L.CommunistWorker.NUM_WORKERS);
        }
        return L.CommunistWorker.workers;
    }
});
//---------------------------------------------------------------------
L.Request = {
    get: function (url, callback, responseType) {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (req.readyState != 4) {
                return;
            }
            var s = req.status,
                data;

            data = L.Request._getResponse(req, responseType);

            // status 0 + response check for file:// URLs
            if ((s >= 200 && s < 300) || s == 304 || (s == 0 && data)) {
                callback(null, data);
            } else {
                callback(s + ': ' + req.statusText, null);
            }
        };
        req.open('GET', url, true);
        if (responseType) {
            req.responseType = responseType;
        }
        req.send();

        return req;
    },
            
    binaryGet: function (url, callback) {
        return L.Request.get(url, callback, 'arraybuffer');
    },
            
    _getResponse: function(req, responseType) {
        var response;
        if (responseType && responseType === 'arraybuffer') {
            response = req.response;
        } else {
            response = req.responseText;
        }
        return response;
    }
};
//-------------------------------------------------------------------------
L.TileRequest = function(layer, ajax) {
    this._layer = layer;
    this._ajax = ajax;
};

L.TileRequest.prototype = {
    get: function (url, tile, done) {
        this._layer.fire('tilerequest', {tile: tile});
        tile._request = this._ajax(url, this._xhrHandler(tile, done));
    },

    // XMLHttpRequest handler; closure over the XHR object, the layer, and the tile
    _xhrHandler: function (tile, done) {
        return L.bind(function(err, data) {
            if (!err) {
                // check if request is about to be aborted, avoid rare error when aborted while parsing
                if (tile._request) {
                    tile._request = null;
                    this._layer.fire('tileresponse', {tile: tile});
                    tile.datum = data;
                    done(null, tile);
                }
            } else {
                tile.loading = false;
                tile._request = null;

                this._layer.fire('tileerror', {tile: tile});
                done(err, tile);
            }
        }, this);
    },

    abort: function(tile) {
        var req = tile._request;
        if (req) {
            tile._request = null;
            req.abort();
            this._layer.fire('tilerequestabort', {tile: tile});
        }
    }
};

L.tileRequest = function(layer, ajax) {
    return new L.TileRequest(layer, ajax);
};

//---------------------------------------------------------------------------
L.TileLayer.Vector = L.TileLayer.extend({
    options: {
        tileRequestFactory: L.tileRequest,
        ajax: L.Request.get,
        // use L.tileCacheNone to turn caching off
        tileCacheFactory: L.tileCache,
        // factory function to create the vector tile layers (defaults to L.GeoJSON)
        layerFactory: L.geoJson,
        // factory function to create a web worker for parsing/preparing tile data
        //workerFactory: L.communistWorker
        workerFactory: L.noWorker
    },

    initialize: function (url, options, vectorOptions) {
        L.TileLayer.prototype.initialize.call(this, url, options);

        this.vectorOptions = vectorOptions || {};

        this._tileRequest = this.options.tileRequestFactory(this, this.options.ajax);
        this._tileCache = this.options.tileCacheFactory();
        // reference to a standalone function that can be stringified for a web worker
        this._parseData = this.options.parseData || L.TileLayer.Vector.parseData;
        this._worker = this.options.workerFactory(this._parseData);
        this._addQueue = new L.TileQueue(L.bind(this._addTileDataInternal, this));
        
    },

    onAdd: function (map) {
        L.TileLayer.prototype.onAdd.call(this, map);

        this.on('tileunload', this._unloadTile);

        // root vector layer, contains tile vector layers as children 
        this.vectorLayer = this._createVectorLayer(); 
        map.addLayer(this.vectorLayer);

        this._worker.onAdd(map);
        this._tileCache.onAdd(map);
    },

    onRemove: function (map) {
        // unload tiles (L.TileLayer only calls _reset in onAdd)
        //this._reset();
        map.removeLayer(this.vectorLayer);

        L.TileLayer.prototype.onRemove.call(this, map);

        this.off('tileunload', this._unloadTile);

        this._worker.onRemove(map);
        this._tileCache.onRemove(map);

        this.vectorLayer = null;
    },

    _addTile: function(coords, container) {
        var cached = null;
        this._wrapCoords(coords);
        var key = this._tileCoordsToKey(coords);
        var urlZoom = this._getZoomForUrl();
        var tile = cached = this._tileCache.get(key, urlZoom);
        if (!tile) {
            tile = { key: key, urlZoom: urlZoom, datum: null, loading: true };
        } else {
            tile.loading = true;
        }

        this._tiles[key] = tile;
        this.fire('tileloadstart', {tile: tile});

        if (cached) {
            this._addTileData(tile);
        } else {
            this._loadTile(tile, coords);
        }
    },

    _loadTile: function (tile, coords) {
        var url = this.getTileUrl(coords);
        this._tileRequest.get(url, tile, L.bind(function(err, tile) {
            if (!err) {
                this._addTileData(tile);
            } else {
                this._tileLoaded();
            }
        },this));
    },

    // TODO _tileLoaded replaced by _tileReady + _visibleTilesReady, 
    // but cannot use because tile assumed to be component (L.DomUtil.addClass)?
    _tileLoaded: function () {
        this._tilesToLoad--;

        if (this._tilesToLoad === 0) {
            this.fire('load');
        }
    },

    _createVectorLayer: function() {
        return this.options.layerFactory(null, this.vectorOptions);
    },

    _createTileLayer: function() {
        return this._createVectorLayer();
    },

    _addTileData: function(tile) {
        if (!tile.parsed) {
            this._worker.process(tile, L.bind(function(tile) {
                this._addQueue.add(tile);
            },this));
        } else {
            // from cache
            this._addQueue.add(tile);
        }
    },

    _addTileDataInternal: function(tile) {
        var tileLayer = this._createTileLayer();
        if (!tile.parsed) {
            // when no worker for parsing
            tile.parsed = this._parseData(tile.datum);
            tile.datum = null;
        }
        tileLayer.addData(tile.parsed);
        tile.layer = tileLayer;
        this.vectorLayer.addLayer(tileLayer);

        tile.loading = false;
        this.fire('tileload', {tile: tile});
        this._tileLoaded();
    },

    _unloadTile: function(evt) {
        var tile = evt.tile,
            tileLayer = tile.layer;

        this._tileRequest.abort(tile);

        if (tile.loading) {
            this._addQueue.remove(tile);
            // not from cache or not loaded and parsed yet
            if (!tile.parsed) {
                this._worker.abort(tile);
            }
            this.fire('tileabort', {tile: tile});
            this._tileLoaded();
        }
        if (tileLayer && this.vectorLayer.hasLayer(tileLayer)) {
            this.vectorLayer.removeLayer(tileLayer);
        }

        if (tile.parsed) {
            this._tileCache.put(tile);
        }
    },

    _reset: function() {
        L.TileLayer.prototype._reset.apply(this, arguments);
        this._addQueue.clear();
        this._worker.clear();
    }
});

L.extend(L.TileLayer.Vector, {
    parseData: function(data) {
        return JSON.parse(data);
    }
});

//----------------------------------------------------------------
L.TileLayer.Div = L.TileLayer.extend({

    initialize: function (vectorLayer) {
        L.TileLayer.prototype.initialize.call(this, null, vectorLayer.options);

        this.vectorLayer = vectorLayer;
    },
            
    onAdd: function (map) {
        this.vectorLayer.on('tileloadstart', this._onTileLoadStart, this);
        this.vectorLayer.on('tilerequest', this._onTileRequest, this);
        this.vectorLayer.on('tileresponse', this._onTileResponse, this);
        this.vectorLayer.on('tilerequestabort', this._onTileRequestAbort, this);
        this.vectorLayer.on('tileerror', this._onTileError, this);
        this.vectorLayer.on('tileload', this._onTileLoad, this);
        this.vectorLayer.on('tileunload', this._onTileUnload, this);
        
        L.TileLayer.prototype.onAdd.apply(this, arguments);
    },
            
    onRemove: function (map) {
        L.TileLayer.prototype.onRemove.apply(this, arguments);

        this.vectorLayer.off('tileloadstart', this._onTileLoadStart, this);
        this.vectorLayer.off('tilerequest', this._onTileRequest, this);
        this.vectorLayer.off('tileresponse', this._onTileResponse, this);
        this.vectorLayer.off('tilerequestabort', this._onTileRequestAbort, this);
        this.vectorLayer.off('tileerror', this._onTileError, this);
        this.vectorLayer.off('tileload', this._onTileLoad, this);
        this.vectorLayer.off('tileunload', this._onTileUnload, this);
    },

    _onTileLoadStart: function(evt) {
        this.onTileLoadStart(evt.tile.key);
    },

    _onTileRequest: function(evt) {
        this.onTileRequest(evt.tile.key);
    },
            
    _onTileResponse: function(evt) {
        this.onTileResponse(evt.tile.key);
    },

    _onTileRequestAbort: function(evt) {
        this.onTileRequestAbort(evt.tile.key);
    },
            
    _onTileError: function(evt) {
        this.onTileError(evt.tile.key);
    },

    _onTileLoad: function(evt) {
        this.onTileLoad(evt.tile.key);
    }, 
            
    _onTileUnload: function(evt) {
        this.onTileUnload(evt.tile.key);
    },
            
    onTileLoadStart: function(key) {},
    onTileRequest: function(key) {},
    onTileResponse: function(key) {},
    onTileRequestAbort: function(key) {},
    onTileError: function(key) {},
    onTileLoad: function(key) {},
    onTileUnload: function(key) {}
});
//--------------------------------------------------------------------------------
L.TileLayer.Overzoom = {
    
    overzoomOptions: {
        // List of available server zoom levels in ascending order. Empty means all  
        // client zooms are available (default). Allows to only request tiles at certain
        // zooms and resizes tiles on the other zooms.
        serverZooms: []
    },

    // override _getTileSize to add serverZooms (when maxNativeZoom is not defined)
    _getTileSize: function() {
        var map = this._map,
            options = this.options,
            zoom = map.getZoom() + options.zoomOffset,
            zoomN = options.maxNativeZoom || this._getServerZoom(zoom);

        // increase tile size when overscaling
        //return zoomN && zoom > zoomN ?
        var tileSize = zoomN && zoom !== zoomN ?
            Math.round(map.getZoomScale(zoom) / map.getZoomScale(zoomN) * options.tileSize) :
            options.tileSize;

        //console.log('tileSize = ' + tileSize + ', zoomOffset = ' + this.options.zoomOffset + ', serverZoom = ' + zoomN + ', zoom = ' + zoom);
        return tileSize;
    },

    _getZoomForUrl: function () {
        var zoom = L.TileLayer.prototype._getZoomForUrl.call(this);
        var result = this._getServerZoom(zoom);
        //console.log('zoomForUrl = ' + result);
        return result;
    },

    // Returns the appropriate server zoom to request tiles for the current zoom level.
    // Next lower or equal server zoom to current zoom, or minimum server zoom if no lower 
    // (should be restricted by setting minZoom to avoid loading too many tiles).
    _getServerZoom: function(zoom) {
        var serverZooms = this.options.serverZooms || [],
            result = zoom;
        // expects serverZooms to be sorted ascending
        for (var i = 0, len = serverZooms.length; i < len; i++) {
            if (serverZooms[i] <= zoom) {
                result = serverZooms[i];
            } else {
                if (i === 0) {
                    // zoom < smallest serverZoom
                    result = serverZooms[0];
                }
                break;
            }
        }
        return result;
    }
};

if (typeof L.TileLayer.Vector !== 'undefined') {
    L.TileLayer.Vector.include(L.TileLayer.Overzoom);
    L.TileLayer.Vector.mergeOptions(L.TileLayer.Overzoom.overzoomOptions);
}

if (typeof L.TileLayer.Div !== 'undefined') {
    L.TileLayer.Div.include(L.TileLayer.Overzoom);
    L.TileLayer.Div.mergeOptions(L.TileLayer.Overzoom.overzoomOptions);
}
}).call(this);