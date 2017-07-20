var dbsql = require('../../dbsql'),
  crypto = require('crypto');

exports.listUser = function(req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function(err, connection) {

    connection.query('Select bd.idBudget,s.nameService as service, v.registration as vehicle, bd.description, sb.nameState as state , bd.price, bd.processOpen, bd.repairTime, bd.processClose, bd.resolution from tbl_budget bd, tbl_service s, tbl_vehicle V, tbl_state_budget sb, tbl_user_vehicle uv where s.idService = bd.service and v.idVehicle = bd.vehicle and sb.idState = bd.state and uv.vehicle = bd.vehicle and uv.`user` = ?;',id, function(error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'data': results });

    });
  });
};

exports.info = function(req, res) {
  var id = req.params.id;
  var budget = req.params.budget;
  dbsql.mysql.getConnection(function(err, connection) {

    connection.query('Select bd.idBudget,s.nameService as service, v.registration as vehicle, bd.description, sb.nameState as state , bd.price, bd.processOpen, bd.repairTime, bd.processClose, bd.resolution from tbl_budget bd, tbl_service s, tbl_vehicle V, tbl_state_budget sb, tbl_user_vehicle uv where s.idService = bd.service and v.idVehicle = bd.vehicle and sb.idState = bd.state and uv.vehicle = bd.vehicle and uv.`user` = ? and bd.idBudget = ?;', [id,budget], function(error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });

      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'User could not be found' });
      } else {
        res.status(200).json({ 'result': 'ok', 'data': results[0] });
      }
    });
  });
};
