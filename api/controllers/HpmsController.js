/**
 * HpmsController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    // This controller method requests and returns geographic and general data
    // for the specified state and an optional road type.
    

    getStateData: function(req, res) {
        var state = req.param('state');

        var sql = 'SELECT '+ 
            'f_system_v, '+
            'route_numb, '+
            'count(1) as numSegments, '+
            'sum(aadt_vn) as totalAADT, '+
            'avg(aadt_vn) as avgAADT, '+
            'sum(aadt_vn * shape_leng*52.80) as VDT, '+
            'sum(shape_leng*52.80) as totalLength '+
          'FROM '+state+' '+
          'group by f_system_v,route_numb '+
          'order by f_system_v,route_numb  asc ';

        Hpms.query(sql, {}, function(error, data) {
            if (error) {
                res.send({status:500, message:error},500);
                return console.log(error);
            }
            res.send(data.rows);
        })
    },

    

      /**
       * Overrides for the settings in `config/controllers.js`
       * (specific to HpmsController)
       */
    _config: {}

  
};
