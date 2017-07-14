var dbsql = require('../../dbsql'),
  crypto = require('crypto');
  exports.list = function(req, res) {
    dbsql.mysql.getConnection(function(err, connection) {

      connection.query('SELECT * FROM tbl_service', function(error, results, fields) {
        connection.release();

        if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
        res.status(200).json({ 'result': 'ok', 'data': results });

      });
    });
  };
  exports.info = function(req, res) {
    var id = req.params.id;
    dbsql.mysql.getConnection(function(err, connection) {

      connection.query('SELECT * FROM tbl_service WHERE idService =?', id, function(error, results, fields) {
        connection.release();

        if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
        if (results < 1 ) {
          res.status(404).json({ 'result': 'nok', 'message': 'Serviço não encontrado' });
        } else {
          res.status(200).json({ 'result': 'ok', 'data': results[0] });
        }
      });
    });
  };
