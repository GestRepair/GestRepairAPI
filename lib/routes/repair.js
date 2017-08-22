var dbsql = require('../../dbsql'),
  crypto = require('crypto'),
  datetime = require('node-datetime'),
  async = require('async');

exports.infoUser = function (req, res) {
  var id = req.params.id;
  var repair = req.params.repair;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT r.idRepair, s.nameService as service,v.registration, r.description, r.price, sr.nameState, r.startDate, r.finishDate, r.information, em.employer, pr.part as part FROM tbl_part_repair pr,tbl_repair r, tbl_vehicle v, tbl_state_repair sr,tbl_user_vehicle uv,tbl_service s, (SELECT er.repair,u.`name` as employer, e.service FROM tbl_employer_repair er,tbl_user u,tbl_employer e where e.idEmployer = er.employer and e.`user`=u.idUser) em where em.`repair` = r.idRepair and em.service=s.idService and r.vehicle = v.idVehicle and uv.vehicle=r.vehicle and r.state = sr.idstate and pr.`repair`=r.idRepair and uv.`user` = ? and r.idRepair = ?;', [id, repair], function (error, results, fields) {
      if (error) {
        return res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a executar a query.', 'error': error });
      }
      connection.query('select p.`idPart`, p.`namePart` as part from tbl_part_repair pr,tbl_part p where pr.part = p.idPart and pr.`repair` = ?', repair, function (error, results1, fields) {
        if (error) {
          return res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a executar a query.', 'error': error });
        }
        if (results.length < 1 || results1.length < 1) {
          res.status(404).json({ 'result': 'nok', 'message': 'Não foi possível encontrar reparações' });
        }
        else {
          results[0].part = results1;
          res.status(200).json({ 'result': 'ok','message':'Sucesso' ,'data': results[0] });
        }
      });
    });
  });
};

exports.list = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT r.idRepair,v.registration as vehicle,r.description,r.price,st.nameState as state,r.startDate,r.finishDate,r.information FROM tbl_repair r, tbl_vehicle v, tbl_state_repair st WHERE v.idVehicle = r.vehicle AND  r.state= st.idstate;', function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'message':'Sucesso' ,'data': results });
    });
  });
};

exports.listByState = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT r.idRepair,v.registration as vehicle,r.description,r.price,r.startDate,r.finishDate,r.information FROM tbl_repair r, tbl_vehicle v WHERE v.idVehicle = r.vehicle AND  r.state= ?', id,function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'message':'Sucesso' ,'data': results });
    });
  });
};

exports.listUser = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT r.idRepair,v.registration as vehicle,r.description,r.price ,st.nameState as state,r.startDate,r.finishDate,r.information FROM tbl_repair r, tbl_vehicle v, tbl_state_repair st,  tbl_user u, tbl_user_vehicle uv WHERE v.idVehicle = r.vehicle AND r.state= st.idstate AND v.idVehicle = uv.vehicle AND uv.`user` = ? group by idRepair;', id, function (error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok','message':'Sucesso' , 'data': results });

    });
  });
};

/**
*DESKTOP VERSION
*
**/
exports.listStates = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM tbl_state_repair;', function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok','message':'Sucesso' , 'data': results });

    });
  });
};

exports.info = function (req, res) {
  var id = req.params.id;
  var repair = req.params.repair;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT r.idRepair, v.registration, r.description, r.price, sr.nameState, r.startDate, r.finishDate, r.information FROM tbl_repair r, tbl_vehicle v, tbl_state_repair sr,tbl_user_vehicle uv  where r.vehicle = v.idVehicle and uv.vehicle=r.vehicle and r.state = sr.idstate and r.idRepair = ?;', id, function (error, results, fields) {
      if (error) {
        return res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a executar a query.', 'error': error });
      }
      else if (results.length < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'Não foi possível encontrar reparações' });
      }
      else {
        res.status(200).json({ 'result': 'ok','message':'Sucesso' , 'data': results[0] });
      }
    });
  });
};

exports.create = function (req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      var obj = {};
      if (params.description == "n/d") { params.description = null; }
      var values = {
        vehicle: params.vehicle,
        description: params.description
      };
      async.waterfall([
        function (callback) {
          connection.query('INSERT INTO tbl_repair SET ?', values, function (error, results) {
            if (error) callback(error);
            else callback(error, results.insertId);
          });
        },
        //Insert to relationship number of service
        function (insertId, callback) {
          obj = { employer: params.employer, repair: insertId };
          connection.query('INSERT INTO tbl_employer_repair SET ?', obj, function (err) {
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
            res.status(200).json({ 'result': 'ok', 'message': 'Funcionário adicionado à reparação com sucesso' });
          });
        }
      });
    });
  });
};

exports.update = function (req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function (err, connection) {
    var values;
    if (params.description == "n/d") { params.description = null; }
    if (params.price == "0") { params.price = null; }
    if (params.information == "n/d") { params.information = null; }
    var dt = datetime.create();
    var formatted = dt.format('Y/m/d H:M:S');
    if (params.state == 4) {
      values = {
        description: params.description,
        price: params.price,
        state: params.state,
        information: params.information,
        finishDate: formatted
      }
    } else {
      values = {
        description: params.description,
        price: params.price,
        state: params.state,
        information: params.information
      }
    };
    connection.query('UPDATE tbl_repair SET  ? WHERE idRepair = ?', [values, req.params.id], function (error, results, fields) {
      if (error) {
        connection.release();
        return res.status(500).json({ 'result': 'nok', 'message': error });
      }
      if (params.state == 3) {
        connection.query('SELECT r.idRepair, u.email FROM tbl_repair r, tbl_user_vehicle uv, tbl_user u where r.vehicle = uv.vehicle and uv.`user` = u.idUser and idRepair = ?', req.params.id, function (error, result, fields) {
          if (error) {
            connection.release();
            return res.status(500).json({ 'result': 'nok', 'message': error });
          }
          dbsql.email('Gest Repair\nA Sua viatura está pronta. Poderá dirigir-se à Oficina.\n', result[0].email, 'Gest Repair - A sua viatura está pronta.');
        });
      }
      res.status(200).json({ 'result': 'ok', 'message': 'Estado Atualizado' });
    });
  });
};
/**
 * Employer
 */
exports.listEmployer = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT e.idEmployer ,u.name, s.nameService FROM tbl_employer_repair er, tbl_employer e, tbl_user u, tbl_service s WHERE er.employer = e.idEmployer and e.`user` = u.idUser and e.service = s.idService and er.repair = ?;', id, function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'message': 'Sucesso', 'data': results });
    });
  });
};


exports.addEmployer = function (req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('select case when employer = ? and `repair` = ? then true else false end as bool from tbl_employer_repair order by bool desc limit 1;', [params.employer, params.repair], function (error, result, fields) {
      if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
      if (result[0].bool == 0) {
        var values = {
          employer: params.employer,
          repair: params.repair
        };
        connection.query('INSERT INTO tbl_employer_repair SET ?;', [values], function (error, fields) {
          if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
          res.status(200).json({ 'result': 'ok', 'message': 'Funcionário adicionado com sucesso' });
        });
      } else {
        res.status(500).json({ 'result': 'nok', 'message': 'Relação já existente' });
      }
    });
  });
};
/**
 * Parts
 */
exports.listParts = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT p.idPart, p.namePart FROM tbl_part_repair pr, tbl_part p where p.idPart = pr.part  and pr.repair = ? order by p.namePart;', id, function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'message': 'Sucesso', 'data': results });
    });
  });
};
exports.addPart = function (req, res) {
  var id = req.params.id;
  var params = req.body;
  var data = { repair: parseInt(id), part: params.part };
  dbsql.mysql.getConnection(function (err, connection) {
    async.waterfall([
      function (callback) {
        connection.query('SELECT amount FROM tbl_part WHERE idPart = ?', params.part, function (error, results) {
          callback(null, error, results);
        });
      },
      function (error, results, callback) {
        var resul = results;
        if (parseInt(results[0].amount) > 0) {
          connection.query('INSERT INTO tbl_part_repair SET ?', data, function (error) {
            callback(null, error, resul);
          });
        } else {
          return res.status(500).json({ 'result': 'nok', 'message': 'Já não existe mais peças', 'error': error });
          callback(null, error, resul);
        }
      },
      function (error, results, callback) {
        if (parseInt(results[0].amount) > 0) {
          var am = parseInt(results[0].amount) - 1;
          connection.query('UPDATE tbl_part SET amount = ? WHERE idPart = ?', [am, params.part], function (error) {
            callback(error);
          });
        } else {
          return res.status(500).json({ 'result': 'nok', 'message': 'Já não existe mais peças', 'error': error });
          callback(error);
        }
      }
    ], function (error) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a executar a query.', 'error': error });
      res.status(200).json({ 'result': 'ok', 'message': 'Inserido com Sucesso' });
    });
  });
};

exports.listEmployerNotRepair = function (req, res) {
  var id = req.params.id;
  var service = req.params.service;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT e.idEmployer, u.name, e.service FROM tbl_employer e, tbl_user u where u.idUser = e.user and e.idEmployer NOT IN (SELECT employer from tbl_employer_repair where repair = ?) and e.service <> 1 and e.service <> 2 and e.service = ?;', [id,service], function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'message': 'Sucesso', 'data': results });
    });
  });
};
exports.listServiceNotRepair = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT Distinct e.service, s.nameService FROM tbl_employer e, tbl_user u, tbl_service s where u.idUser = e.user and e.idEmployer NOT IN (SELECT employer from tbl_employer_repair where repair = ?) and s.idService = e.service and e.service <> 1 and e.service <> 2 ;', id, function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'message': 'Sucesso', 'data': results });
    });
  });
};
