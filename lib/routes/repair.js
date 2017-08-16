var dbsql = require('../../dbsql'),
  crypto = require('crypto');

  exports.infoUser = function(req, res) {
    var id = req.params.id;
    var repair = req.params.repair;
    dbsql.mysql.getConnection(function(err, connection) {
      connection.query('SELECT r.idRepair, s.nameService as service,v.registration, r.description, r.price, sr.nameState, r.startDate, r.finishDate, r.information, em.employer, pr.part as part FROM tbl_part_repair pr,tbl_repair r, tbl_vehicle v, tbl_state_repair sr,tbl_user_vehicle uv,tbl_service s, (SELECT er.repair,u.`name` as employer, e.service FROM tbl_employer_repair er,tbl_user u,tbl_employer e where e.idEmployer = er.employer and e.`user`=u.idUser) em where em.`repair` = r.idRepair and em.service=s.idService and r.vehicle = v.idVehicle and uv.vehicle=r.vehicle and r.state = sr.idstate and pr.`repair`=r.idRepair and uv.`user` = ? and r.idRepair = ?;', [id,repair], function(error, results, fields) {
            if (error)
            {
              return res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a executar a query.', 'error' : error });
            }
            connection.query('select p.`idPart`, p.`namePart` as part from tbl_part_repair pr,tbl_part p where pr.part = p.idPart and pr.`repair` = ?', repair, function(error, results1, fields) {
            if (error)
            {
              return res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a executar a query.', 'error' : error });
            }
            if(results.length < 1 || results1.length < 1)
            {
              res.status(404).json({ 'result': 'nok', 'message': 'Não foi possível encontrar candidaturas' });
            }
            else {
              results[0].part = results1;
              res.status(200).json({ 'result': 'ok', 'data': results[0] });
            }
          });
        });
      });
    };

    exports.list = function(req, res) {
      dbsql.mysql.getConnection(function(err, connection) {
        connection.query('SELECT r.idRepair,v.registration as vehicle,r.description,r.price,s.nameService as service ,st.nameState as state,r.startDate,r.finishDate,r.information, u.`name` as employer FROM tbl_repair r, tbl_vehicle v, tbl_service s, tbl_state_repair st, tbl_employer_repair er, tbl_employer e, tbl_user u WHERE v.idVehicle = r.vehicle AND e.service = s.idService AND r.state= st.idstate AND er.`repair` =r.idRepair AND e.idEmployer = er.employer AND u.idUser = e.`user`;', function(error, results, fields) {
          connection.release();
          if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
          res.status(200).json({ 'result': 'ok', 'data': results });
        });
      });
    };


exports.listUser = function(req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function(err, connection) {
    connection.query('SELECT r.idRepair,v.registration as vehicle,r.description,r.price,s.nameService as service ,st.nameState as state,r.startDate,r.finishDate,r.information, u.`name` FROM tbl_repair r, tbl_vehicle v, tbl_service s, tbl_state_repair st, tbl_employer_repair er, tbl_employer e, tbl_user u, tbl_user_vehicle uv WHERE v.idVehicle = r.vehicle AND e.service = s.idService AND r.state= st.idstate AND er.`repair` =r.idRepair AND e.idEmployer = er.employer  AND u.idUser = e.`user` AND v.idVehicle = uv.vehicle AND uv.`user` = ?;', id, function(error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'data': results });

    });
  });
};
exports.info = function(req, res) {
  var id = req.params.id;
  var repair = req.params.repair;
  dbsql.mysql.getConnection(function(err, connection) {
    connection.query('SELECT r.idRepair, s.nameService as service,v.registration, r.description, r.price, sr.nameState, r.startDate, r.finishDate, r.information, em.employer, pr.part as part FROM tbl_part_repair pr,tbl_repair r, tbl_vehicle v, tbl_state_repair sr,tbl_user_vehicle uv,tbl_service s, (SELECT er.repair,e.service ,u.`name` as employer FROM tbl_employer_repair er,tbl_user u,tbl_employer e where e.idEmployer = er.employer and e.`user`=u.idUser) em  where em.`repair` = r.idRepair and em.service = idService and r.vehicle = v.idVehicle and uv.vehicle=r.vehicle and r.state = sr.idstate and pr.`repair`=r.idRepair and uv.`user` = ? and r.idRepair = ?;', [id,repair], function(error, results, fields) {
          if (error)
          {
            return res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a executar a query.', 'error' : error });
          }
          connection.query('select p.`idPart`, p.`namePart` as part from tbl_part_repair pr,tbl_part p where pr.part = p.idPart and pr.`repair` = ?', repair, function(error, results1, fields) {
          if (error)
          {
            return res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a executar a query.', 'error' : error });
          }
          if(results.length < 1 || results1.length < 1)
          {
            res.status(404).json({ 'result': 'nok', 'message': 'Não foi possível encontrar candidaturas' });
          }
          else {
            results[0].part = results1;
            res.status(200).json({ 'result': 'ok', 'data': results[0] });
          }
        });
      });
    });
  };
/**
*DESKTOP VERSION
*
**/
exports.listStates = function(req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function(err, connection) {
    connection.query('SELECT * FROM tbl_state_repair;', id, function(error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'data': results });

    });
  });
};
exports.create = function(req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function(err, connection) {
    var valuesRepair = {
      vehicle: params.vehicle,
      description: params.description
    };
    connection.query('INSERT INTO tbl_repair SET ?', valuesRepair, function(error, result, fields) {
      if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
      connection.query('SELECT idRepair FROM tbl_repair ORDER BY idRepair DESC LIMIT 1', function(error, resul, fields) {
        if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
        var valuesEmpRep = {
          employer: params.employer,
          repair: resul[0].idRepair
        };
        connection.query('INSERT INTO tbl_employer_repair SET ? ',valuesEmpRep, function(error, results, fields) {
          if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
          res.status(200).json({ 'result': 'ok' });
        });
      });
    });
  });
};
