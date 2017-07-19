var dbsql = require('../../dbsql'),
  crypto = require('crypto');

  exports.info = function(req, res) {
    var id = req.params.id;
    var repair = req.params.repair;
    dbsql.mysql.getConnection(function(err, connection) {
      // Get the project info
      connection.query('SELECT r.idRepair, s.nameService as service,v.registration, r.description, r.price, sr.nameState, r.startDate, r.finishDate, r.information, em.employer, pr.part as part FROM tbl_part_repair pr,tbl_repair r, tbl_vehicle v, tbl_state_repair sr,tbl_user_vehicle uv,tbl_service s, (SELECT er.repair,u.`name` as employer FROM tbl_employer_repair er,tbl_user u,tbl_employer e where e.idEmployer = er.employer and e.`user`=u.idUser) em where em.`repair` = r.idRepair and r.service=s.idService and r.vehicle = v.idVehicle and uv.vehicle=r.vehicle and r.state = sr.idstate and pr.`repair`=r.idRepair and uv.`user` = ? and r.idRepair = ?;', [id,repair], function(error, results, fields) {
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


exports.listUser = function(req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function(err, connection) {

    connection.query('SELECT r.idRepair, s.nameService as service,v.registration, r.description, r.price, sr.nameState, r.startDate, r.finishDate, r.information, em.employer, pr.part as part FROM tbl_part_repair pr,tbl_repair r, tbl_vehicle v, tbl_state_repair sr,tbl_user_vehicle uv,tbl_service s, (SELECT er.repair,u.`name` as employer FROM tbl_employer_repair er,tbl_user u,tbl_employer e where e.idEmployer = er.employer and e.`user`=u.idUser) em where em.`repair` = r.idRepair and r.service=s.idService and r.vehicle = v.idVehicle and uv.vehicle=r.vehicle and r.state = sr.idstate and pr.`repair`=r.idRepair and uv.`user` = ? group by idRepair;', id, function(error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'data': results });

    });
  });
};
