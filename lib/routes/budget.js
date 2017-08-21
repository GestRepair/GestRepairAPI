var dbsql = require('../../dbsql'),
  crypto = require('crypto'),
  datetime = require('node-datetime'),
  async = require('async');

exports.list = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {

    connection.query('Select bd.idBudget, v.registration as vehicle, bd.description, sb.nameState as state , bd.price, bd.processOpen, bd.repairTime, bd.processClose, bd.resolution from tbl_budget bd,  tbl_vehicle V, tbl_state_budget sb where v.idVehicle = bd.vehicle and sb.idState = bd.state;', function (error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'message':'Sucesso','data': results });

    });
  });
};

exports.listUser = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {

    connection.query('Select bd.idBudget, v.registration as vehicle, bd.description, sb.nameState as state , bd.price, bd.processOpen, bd.repairTime, bd.processClose, bd.resolution from tbl_budget bd,  tbl_vehicle V, tbl_state_budget sb, tbl_user_vehicle uv where  v.idVehicle = bd.vehicle and sb.idState = bd.state and uv.vehicle = bd.vehicle and uv.`user` = ?;', id, function (error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok','message':'Sucesso', 'data': results });

    });
  });
};

exports.infoUser = function (req, res) {
  var id = req.params.id;
  var budget = req.params.budget;
  dbsql.mysql.getConnection(function (err, connection) {

    connection.query('Select bd.idBudget, v.registration as vehicle, bd.description, sb.nameState as state , bd.price, bd.processOpen, bd.repairTime, bd.processClose, bd.resolution from tbl_budget bd, tbl_vehicle V, tbl_state_budget sb, tbl_user_vehicle uv where  v.idVehicle = bd.vehicle and sb.idState = bd.state and uv.vehicle = bd.vehicle and uv.`user` = ? and bd.idBudget = ?;', [id, budget], function (error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });

      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'User could not be found' });
      } else {
        res.status(200).json({ 'result': 'ok','message':'Sucesso', 'data': results[0] });
      }
    });
  });
};
/**
 * Desktop Version
 */
exports.create = function (req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      var obj = {};
      var values = {
        vehicle: parseInt(params.vehicle),
        description: params.description
      };
      async.waterfall([
        function (callback) {
          connection.query('INSERT INTO tbl_budget SET ?', values, function (error, results) {
            if (err) callback(err);
            callback(error, results.insertId);
          });
        },
        function (insertId, callback) {
          obj = { service: parseInt(params.service), budget: insertId };
          connection.query('INSERT INTO tbl_budget_service SET ?', obj, function (err) {
            if (err) callback(err);
            else callback(err, insertId);
          });
        },
      ], function (err, result) {
        if (err) {
          connection.rollback(
            function () {
              connection.release(); //releases mysql connection on error
              res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a executar a query.', 'error': err });
            });
        } else {
          connection.commit(function (err) {
            if (err) return connection.rollback(function () {
              connection.release(); //releases mysql connection on error
              res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a executar a query.', 'error': err });
            });
            connection.release(); //releases mysql connection
            res.status(200).json({ 'result': 'ok', 'message': 'Orçamento adicionado à reparação com sucesso' });
          });
        }
      });
    });
  });
};
exports.info = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('Select bd.idBudget, v.registration as vehicle, bd.description, sb.nameState as state , bd.price, bd.processOpen, bd.repairTime, bd.processClose, bd.resolution from tbl_budget bd, tbl_vehicle V, tbl_state_budget sb where  v.idVehicle = bd.vehicle and sb.idState = bd.state and bd.idBudget = ?;', [id], function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'User could not be found' });
      } else {
        res.status(200).json({ 'result': 'ok','message':'Sucesso', 'data': results[0] });
      }
    });
  });
};
exports.listState = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM gestrepair.tbl_state_budget ;',  function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'message':'Sucesso', 'data': results });
    });
  });
};
exports.update = function (req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function (err, connection) {
    var values;
    if (params.description == "n/d") { params.description = null; }
    if (params.price == "0") { params.price = null; }
    if (params.repairTime == "n/d") { params.repairTime = null; }
    if (params.resolution == "n/d") { params.resolution = null; }
    var dt = datetime.create();
    var formatted = dt.format('Y/m/d H:M:S');
    if (params.state == 3||params.state == 4) {
      values = {
        description: params.description,
        price: params.price,
        state: params.state,
        repairTime: params.repairTime,
        resolution: params.resolution,
        finishDate: formatted
      }
    } else {
      values = {
        description: params.description,
        price: params.price,
        state: params.state,
        repairTime: params.repairTime,
        resolution: params.resolution
      }
    };
    console.log(params.resolution);
    connection.query('UPDATE tbl_budget SET ? WHERE idBudget = ?', [values, req.params.id], function (error, results, fields) {
      
      if (error) {
        connection.release();
        return res.status(500).json({ 'result': 'nok', 'message': error });
      }
      if (params.state == 2) {
        connection.query('SELECT b.idBudget, u.email FROM tbl_budget b, tbl_user_vehicle uv, tbl_user u where b.vehicle = uv.vehicle and uv.`user` = u.idUser and b.idBudget = ?', req.params.id, function (error, result, fields) {
          if (error) {
            connection.release();
            return res.status(500).json({ 'result': 'nok', 'message': error });
          }
          dbsql.email('Gest Repair\nO Orçamento está concluido.\n Clique no Link para aprovar.\n link\n', result[0].email, 'Gest Repair - A seu orçamento está pronto.');
        });
      }
      res.status(200).json({ 'result': 'ok', 'message': 'Estado Atualizado' });
    });
  });
};