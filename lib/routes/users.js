var dbsql = require('../../dbsql'),
  crypto = require('crypto'),
  async = require('async');;

exports.create = function (req, res) {
  var params = req.body;

  params.password = crypto.createHash('md5').update(params.password).digest('hex');

  dbsql.mysql.getConnection(function (err, connection) {
    var valuesUser = {
      name: params.name,
      street: params.street,
      zipcode: params.zipcode,
      city: params.city,
      email: params.email,
      nif: params.nif,
      contact: params.contact,
      username: params.username,
      password: params.password,
    };
    connection.query('INSERT INTO tbl_user SET ?', valuesUser, function (error, results, fields) {
      connection.release();
      if (error) {
        return res.status(500).json({ 'result': 'nok', 'message': 'Erro ao criar utilizador' });
      }
      res.status(200).json({ 'result': 'ok', 'message':'Utilizador criado com sucesso'  });
    });
  });
};

exports.list = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT idUser, username, name,street, zipcode, city ,email ,nif ,contact, isActive, isEmployer FROM tbl_user ;', function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok','message':'Sucesso','data': results });
    });
  });
};

exports.info = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM tbl_user where idUser =?', id, function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });

      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'Utilizador não Encontrado' });
      } else {
        delete results[0].password;
        res.status(200).json({ 'result': 'ok','message':'Sucesso' ,'data': results[0] });
      }
    });
  });
};

exports.update = function (req, res) {
  var params = req.body;
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    var values = {
      name: params.name,
      street: params.street,
      zipcode: params.zipcode,
      city: params.city,
      email: params.email,
      nif: params.nif,
      contact: params.contact
    };
    connection.query('UPDATE tbl_user SET ? WHERE idUser = ?', [values, id], function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro ao atualizar os dados' });
      res.status(200).json({ 'result': 'ok', 'message':'Dados atualizados com sucesso' });
    });
  });
};

exports.chpass = function (req, res) {
  var params = req.body;
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('UPDATE tbl_user SET password = ? WHERE password = ? and idUser = ?', [crypto.createHash('md5').update(params.newPassword).digest('hex'), crypto.createHash('md5').update(params.oldPassword).digest('hex'), id], function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a alterar a palavra pass' });
      res.status(200).json({ 'result': 'ok','message':'Password alterada com sucesso' });
    });
  });
};

exports.login = function (req, res) {
  res.status(200).json({ 'result': 'ok','message':'Login efetuado com sucesso','data': req.users });
};
exports.activeUser = function (req, res) {
  var email = req.params.email;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM tbl_user u where u.email = ? LIMIT 1', email, function (error, results) {
      if (error || results.length != 1) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Erro a encontrar o E-mail' }); }
      else {
        var token = crypto.randomBytes(10).toString('hex');
        connection.query('UPDATE tbl_user SET token = ? WHERE email = ?', [token, results[0].email], function (error) {
          if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Erro a criar a recuperação' }); }
          else {
            connection.release();
            dbsql.email('Gest Repair\nPara Ativar a sua conta Clique no link em baixo\n' + dbsql.urlf + '/user/activated/' + results[0].email + '/' + token, results[0].email, 'Clique aqui Para Ativar a sua Conta');
            res.status(200).json({ 'result': 'ok','message':'Verifique a sua caixa de correio eletrónico' });
          }
        });
      }
    });
  });
};
exports.activeUserToken = function (req, res) {
  var email = req.params.email;
  var token = req.params.token;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT u.email, u.token FROM tbl_user u WHERE email = ? LIMIT 1', email, function (error, results) {
      if (error || results.length != 1) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Erro a encontrar o email' }); }
      else if (token && token.length > 1 && token === results[0].token) {
        delete results[0].token;
        connection.query('UPDATE tbl_user SET isActive = 1, token = NULL WHERE email = ?', results[0].email,
          function (error) {
            if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Erro a ativar o utilizador' }); } else {
              connection.release();
              dbsql.email('A sua conta está ativada ', results[0].email, 'A sua conta está ativada');
              res.status(200).json({ 'result': 'ok', 'massage': 'Conta ativada com sucesso' });
            }
          });
      }
    });
  });
};

exports.recoverUser = function (req, res) {
  var email = req.params.email;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM tbl_user WHERE email = ? LIMIT 1', email, function (error, results) {
      if (error || results.length != 1) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Erro a encontrar o email' }); }
      else {
        var token = crypto.randomBytes(10).toString('hex');
        connection.query('UPDATE tbl_user SET token = ? WHERE email = ?', [token, results[0].email], function (error) {
          if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Erro a criar a recuperação' }); }
          else {
            connection.release();
            dbsql.email('GestRepair\n Para Recuperar a Password Clique no link descrito em baixo.\n' + dbsql.urlf + '/user/recovery/' + results[0].email + '/' + token, results[0].email, 'Recuperação da Password');
            res.status(200).json({ 'result': 'ok' });
          }
        });
      }
    });
  });
};

exports.recoverUserToken = function (req, res) {
  var params = req.body;
  var email = req.params.email;
  var token = req.params.token;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT email, token FROM tbl_user WHERE email = ? LIMIT 1', email, function (error, results) {
      if (error || results.length != 1) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Erro a encontrar o email' }); }
      else if (token && token.length > 1 && token === results[0].token) {
        delete results[0].token;
        params.password = crypto.createHash('md5').update(params.password).digest('hex');
        var values = {
          password: params.password,
        };
        connection.query('UPDATE tbl_user SET ?, token = NULL WHERE email = ?', [values, results[0].email],
          function (error) {
            if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Erro na recuperação' }); } else {
              connection.release();
              dbsql.email('GestRepair\nA sua password foi alterada com sucesso', results[0].email, 'GestRepair - Nova password');
              res.status(200).json({ 'result': 'ok', 'massage': 'A password foi alterada com sucesso' });
            }
          });
      }
    });
  });
};
/**************APP DESKTOP***********************/
exports.createDesk = function (req, res) {
  var params = req.body;
  var pass = crypto.randomBytes(5).toString('hex');
  var passwd = crypto.createHash('md5').update(pass).digest('hex');
  dbsql.mysql.getConnection(function (err, connection) {
    var valuesUser = {
      name: params.name,
      street: params.street,
      zipcode: params.zipcode,
      city: params.city,
      email: params.email,
      nif: params.nif,
      contact: params.contact,
      username: params.username,
      password: passwd,
      isActive: 1
    };
    connection.query('INSERT INTO tbl_user SET ?', valuesUser, function (error, results, fields) {
      connection.release();
      if (error) {
        return res.status(500).json({ 'result': 'nok', 'message': 'Erro a criar utilizador' });
      }
      dbsql.email('GestRepair\nA sua password é ' + pass + ' ', params.email, 'GestRepair - Envio de Password');
      res.status(200).json({ 'result': 'ok', 'message': 'Utilizador criado com sucesso'});
    });
  });
};
exports.listtype = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT idUser, username, name, street, zipcode, city, email, nif, contact, isActive FROM tbl_user where isEmployer = ?', req.params.id, function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message':'Erro a listar utilizadores' });
      res.status(200).json({ 'result': 'ok', 'data': results, 'message': 'Sucesso' });
    });
  });
};

exports.addEmployer = function (req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      var values = {
        user: params.user,
        service: params.service
      };
      dbsql.mysql.getConnection(function (err, connection) {
        async.waterfall([
          function (callback) {
            connection.query('INSERT INTO tbl_employer SET ?', values, function (error) {
              callback(null, error);
            });
          },
          function (error, callback) {
            var user = params.user;
            var employer = 1;
            connection.query('UPDATE tbl_user SET isEmployer = ? where idUser = ?', [employer, user], function (error) {
              callback(error);
            });
          }
        ], function (err) {
          if (err) {
            connection.rollback(
              function () {
                connection.release(); //releases mysql connection on error
                res.status(500).json({ 'result': 'nok', 'message': 'Erro a adicionar utilizador.', 'error': err });
              });
          } else {
            connection.commit(function (err) {
              if (err) return connection.rollback(function () {
                connection.release(); //releases mysql connection on error
                res.status(500).json({ 'result': 'nok', 'message': 'Erro a adicionar utilizador.', 'error': err });
              });
              connection.release(); //releases mysql connection
              res.status(200).json({ 'result': 'ok', 'message': 'Funcionário adicionado com sucesso' });
            });
          }
        });
      });
    });
  });
};
exports.updateEmployer = function (req, res) {
  var params = req.body;
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    var values = {
      service: params.service,
    };
    connection.query('UPDATE tbl_employer SET ? WHERE idEmployer = ?', [values, id], function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok' });
    });
  });
};
exports.listEmployer = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    var id = req.params.id;
    connection.query('select e.idEmployer,e.`user`, u.name,s.nameService as service  from tbl_employer e, tbl_user u,tbl_service s where u.idUser = e.user and s.idService = e.service and e.isActive = ?;', id, function (error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a listar funcionários' });
      res.status(200).json({ 'result': 'ok', 'data': results, 'message':'sucesso' });

    });
  });
};
exports.listEmployerService = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    var id = req.params.id, service = req.params.service;
    connection.query('select e.idEmployer,e.`user`, u.name from tbl_employer e, tbl_user u where u.idUser = e.user and e.isActive = ? and e.service = ?;', [id, service], function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a listar funcionários por serviço' });
      res.status(200).json({ 'result': 'ok', 'data': results,'message':'Sucesso' });

    });
  });
};
exports.infoEmployerByUser = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT e.idEmployer, u.`name` ,s.nameService, e.service, e.isActive FROM tbl_employer e, tbl_user u, tbl_service s WHERE e.`user` = u.idUser and e.`service` = s.idService and e.`user` = ?', id, function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a listar funcionários por utilizador' });
      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'Não é funcionário ou não encontrado' });
      } else {
        res.status(200).json({ 'result': 'ok', 'data': results[0],'message':'Sucesso' });
      }
    });
  });
};
exports.infoEmployer = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT e.idEmployer, u.`name` ,s.nameService, e.service, e.isActive FROM tbl_employer e, tbl_user u, tbl_service s WHERE e.`user` = u.idUser and e.`service` = s.idService and e.idEmployer = ?', id, function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a listar a informação do funcionário' + id });
      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'Não é funcionário ou não encontrado' });
      } else {
        res.status(200).json({ 'result': 'ok', 'data': results[0] ,'message':'Sucesso' });
      }
    });
  });
};

exports.activityEmployer = function (req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      var id = req.params.id;
      var opt = req.params.opt;
      dbsql.mysql.getConnection(function (err, connection) {
        async.waterfall([
          function (callback) {
            connection.query('UPDATE tbl_employer SET isActive=? where idEmployer=?;', [opt, id], function (error) {
              callback(null, error);
            });
          },
          function (error,callback) {
            connection.query('SELECT user FROM tbl_employer where idEmployer=?;', [id], function (error,result) {
              callback(null,error,result);
            });
          },
          function (error,result,callback) {
            connection.query('UPDATE tbl_user SET isEmployer = ? where idUser = ?;', [opt, result[0].user], function (error) {
              callback(error);
            });
          }
        ], function (err) {
          if (err) {
            connection.rollback(
              function () {
                connection.release(); //releases mysql connection on error
                res.status(500).json({ 'result': 'nok', 'message': 'Erro na alteração do funcionário.', 'error': err });
              });
          } else {
            connection.commit(function (err) {
              if (err) return connection.rollback(function () {
                connection.release(); //releases mysql connection on error
                res.status(500).json({ 'result': 'nok', 'message': 'Erro na alteração do funcionário.', 'error': err });
              });
              connection.release(); //releases mysql connection
              res.status(200).json({ 'result': 'ok', 'message': 'Alteração ao Funcionário efectuada com sucesso' });
            });
          }
        });
      });
    });
  });
};
