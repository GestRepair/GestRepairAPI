var dbsql = require('../../dbsql'),
  crypto = require('crypto');

exports.create = function (req, res) {
  var params = req.body;

  dbsql.mysql.getConnection(function (err, connection) {
    var values = {
      service: params.service,
      vehicle: params.vehicle,
      date: params.date
    };
    connection.query('INSERT INTO tbl_schedule SET ?', values, function (error, results, fields) {
      connection.release();
      if (error) {
        return res.status(500).json({ 'result': 'nok','message': 'Erro a inserir agendamento', 'error': error });
      }
      res.status(200).json({ 'result': 'ok', 'message':'Agendamento inserido com sucesso' });
    });
  });
};
exports.info = function (req, res) {
  var id = req.params.id;
  var schedule = req.params.schedule;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT s.idSchedule, v.registration as vehicle, se.nameService as service,s.date FROM `tbl_user_vehicle` uv, `tbl_vehicle` v, `tbl_schedule` s ,`tbl_service` se WHERE uv.vehicle = v.idVehicle and v.idVehicle = s.vehicle and s.service = se.idService and s.isActive = 1 and uv.`user` = ? and s.idSchedule = ?;', [id, schedule], function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a mostrar agendamento' ,'error': error });
      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'Agendamento não encontrado' });
      } else {
        res.status(200).json({ 'result': 'ok', 'message': 'Sucesso', 'data': results[0] });
      }
    });
  });
};
exports.listUser = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {

    connection.query('SELECT s.idSchedule, v.registration as vehicle, se.nameService as service,s.date FROM `tbl_user_vehicle` uv, `tbl_vehicle` v, `tbl_schedule` s ,`tbl_service` se WHERE uv.vehicle = v.idVehicle and v.idVehicle = s.vehicle and s.service = se.idService and s.isActive = 1 and uv.`user` = ? order by s.date desc;', id, function (error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a listar agendamentos' ,'error': error});
      res.status(200).json({ 'result': 'ok', 'message':'Sucesso', 'data': results });

    });
  });
};
exports.list = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT s.idSchedule, v.registration as vehicle, se.nameService as service,s.date, s.isActive FROM `tbl_user_vehicle` uv, `tbl_vehicle` v, `tbl_schedule` s ,`tbl_service` se WHERE uv.vehicle = v.idVehicle and v.idVehicle = s.vehicle and s.service = se.idService;', function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a listar agendamentos' ,'error': error });
      res.status(200).json({ 'result': 'ok','message':'Sucesso' ,'data': results });
    });
  });
};
exports.updateDisable = function (req, res) {
  var params = req.body;
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    var value = {
      isActive: 0
    };
    connection.query('UPDATE tbl_schedule SET ? WHERE idSchedule = ?', [value, id], function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a cancelar agendamento' ,'error': error });
      res.status(200).json({ 'result': 'ok','message':'Agendamento cancelado com sucesso' });
    });
  });
};
exports.listDayNow = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT sc.idSchedule, s.nameService as service, v.registration as vehicle, sc.date FROM tbl_schedule sc, tbl_service s, tbl_vehicle v where v.idVehicle = sc.vehicle and s.idService = sc.service and sc.date = DATE(now()) order by sc.date desc;', function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a encontrar as os agendamentos do dia de hoje' ,'error': error  });
      res.status(200).json({ 'result': 'ok', 'message': 'Sucesso', 'data': results });
    });
  });
};
exports.listDayPrevious = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT sc.idSchedule, s.nameService as service, v.registration as vehicle, sc.date FROM tbl_schedule sc, tbl_service s, tbl_vehicle v where v.idVehicle = sc.vehicle and s.idService = sc.service and sc.date < DATE(now()) order by sc.date desc;', function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a encontrar as os agendamentos do dia anterior' ,'error': error });
      res.status(200).json({ 'result': 'ok', 'message': 'Sucesso', 'data': results });
    });
  });
};
exports.listDayNext = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT sc.idSchedule, s.nameService as service, v.registration as vehicle, sc.date FROM tbl_schedule sc, tbl_service s, tbl_vehicle v where v.idVehicle = sc.vehicle and s.idService = sc.service and sc.date > DATE(now()) order by sc.date asc;', function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a encontrar as os agendamentos do dia seguinte' ,'error': error  });
      res.status(200).json({ 'result': 'ok', 'message': 'Sucesso', 'data': results });
    });
  });
};
exports.listDays = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM tbl_schedule_date;', function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a listar os dias' ,'error': error  });
      res.status(200).json({ 'result': 'ok', 'message': 'Sucesso', 'data': results });
    });
  });
};
exports.listDayNowUser = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT sc.idSchedule, s.nameService as service, v.registration as vehicle, sc.date FROM tbl_schedule sc, tbl_service s, tbl_vehicle v, tbl_user_vehicle uv where v.idVehicle = sc.vehicle and s.idService = sc.service and uv.vehicle = sc.vehicle and uv.user = ? and sc.date = DATE(now()) order by sc.date desc;', id, function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a encontrar as os agendamentos do dia de hoje' ,'error': error });
      res.status(200).json({ 'result': 'ok', 'message': 'Sucesso', 'data': results });
    });
  });
};
exports.listDayPreviousUser = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT sc.idSchedule, s.nameService as service, v.registration as vehicle, sc.date FROM tbl_schedule sc, tbl_service s, tbl_vehicle v, tbl_user_vehicle uv where v.idVehicle = sc.vehicle and s.idService = sc.service and uv.vehicle = sc.vehicle and uv.user = ? and sc.date < DATE(now()) order by sc.date desc;', id, function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a encontrar as os agendamentos do dia anterior' ,'error': error });
      res.status(200).json({ 'result': 'ok', 'message': 'Sucesso', 'data': results });
    });
  });
};
exports.listDayNextUser = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT sc.idSchedule, s.nameService as service, v.registration as vehicle, sc.date FROM tbl_schedule sc, tbl_service s, tbl_vehicle v, tbl_user_vehicle uv where v.idVehicle = sc.vehicle and s.idService = sc.service and uv.vehicle = sc.vehicle and uv.user = ? and sc.date > DATE(now()) order by sc.date asc;', id, function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a encontrar as os agendamentos do dia seguinte' ,'error': error  });
      res.status(200).json({ 'result': 'ok', 'message': 'Sucesso', 'data': results });
    });
  });
};
