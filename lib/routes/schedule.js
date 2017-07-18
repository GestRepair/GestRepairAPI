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
  exports.info = function(req, res) {
    var id = req.params.id;
    var schedule = req.params.schedule;
    dbsql.mysql.getConnection(function(err, connection) {

      connection.query('SELECT s.idSchedule, v.registration as vehicle, se.nameService as service,s.date FROM `tbl_user_vehicle` uv, `tbl_vehicle` v, `tbl_schedule` s ,`tbl_service` se WHERE uv.vehicle = v.idVehicle and v.idVehicle = s.vehicle and s.service = se.idService and s.isActive = 1 and uv.`user` = ? and s.idSchedule = ?;', [id,schedule], function(error, results, fields) {
        connection.release();

        if (error) return res.status(500).json({ 'result': 'nok', 'message': error });

        if (results < 1) {
          res.status(404).json({ 'result': 'nok', 'message': 'Agendamento não Encontrado' });
        } else {
          delete results[0].password;
          res.status(200).json({ 'result': 'ok', 'data': results[0] });
        }
      });
    });
  };
  exports.listUser = function(req, res) {
    var id = req.params.id;
    dbsql.mysql.getConnection(function(err, connection) {

      connection.query('SELECT s.idSchedule, v.registration as vehicle, se.nameService as service,s.date FROM `tbl_user_vehicle` uv, `tbl_vehicle` v, `tbl_schedule` s ,`tbl_service` se WHERE uv.vehicle = v.idVehicle and v.idVehicle = s.vehicle and s.service = se.idService and s.isActive = 1 and uv.`user` = ?;',id, function(error, results, fields) {
        connection.release();

        if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
        res.status(200).json({ 'result': 'ok', 'data': results });

      });
    });
  };
