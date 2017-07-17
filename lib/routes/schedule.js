var dbsql = require('../../dbsql'),
  crypto = require('crypto');

  exports.create = function(req, res) {
    var params = req.body;

    dbsql.mysql.getConnection(function(err, connection) {
      var values = {
        service: params.service,
        vehicle: params.vehicle,
        date: params.date
      };
      connection.query('INSERT INTO tbl_schedule SET ?', values, function(error, results, fields) {
        connection.release();
        if (error) {
          return res.status(500).json({ 'result': 'nok', 'message': error });
        }
        res.status(200).json({ 'result': 'ok' });
    });
    });
  };
