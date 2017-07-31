var dbsql = require('../../dbsql'),
  crypto = require('crypto');

  exports.create = function(req, res) {
    var params = req.body;

    params.password = crypto.createHash('md5').update(params.password).digest('hex');

    dbsql.mysql.getConnection(function(err, connection) {
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
      connection.query('INSERT INTO tbl_user SET ?', valuesUser, function(error, results, fields) {
        connection.release();
        if (error) {
          return res.status(500).json({ 'result': 'nok', 'message': error });
        }
        res.status(200).json({ 'result': 'ok' });
    });
    });
  };

exports.list = function(req, res) {
  dbsql.mysql.getConnection(function(err, connection) {

    connection.query('SELECT idUser, username, name,street, zipcode, city ,email ,nif ,contact, isActive, isEmployer FROM tbl_user ;', function(error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'data': results });

    });
  });
};

exports.info = function(req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function(err, connection) {

    connection.query('SELECT * FROM tbl_user where idUser =?', id, function(error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });

      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'Utilizador não Encontrado' });
      } else {
        delete results[0].password;
        res.status(200).json({ 'result': 'ok', 'data': results[0] });
      }
    });
  });
};

exports.update = function(req, res) {
  var params = req.body;
    var id = req.params.id;
  dbsql.mysql.getConnection(function(err, connection) {
    var values = {
      name: params.name,
      street: params.street,
      zipcode: params.zipcode,
      city: params.city,
      email: params.email,
      nif: params.nif,
      contact: params.contact
    };
    connection.query('UPDATE tbl_user SET ? WHERE idUser = ?', [values,id], function(error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok' });
    });
  });
};

exports.chpass = function(req, res) {
  var params = req.body;
    var id = req.params.id;
  dbsql.mysql.getConnection(function(err, connection) {
    connection.query('UPDATE tbl_user SET password = ? WHERE password = ? and idUser = ?',[crypto.createHash('md5').update(params.newPassword).digest('hex'),crypto.createHash('md5').update(params.oldPassword).digest('hex'),id], function(error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok' });
    });
  });
};

exports.login = function(req, res) {
  res.status(200).json({ 'result': 'ok', 'data': req.users });
};
exports.activeUser = function (req, res) {
  var email= req.params.email;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM tbl_user u where u.email = ? LIMIT 1', email, function (error, results) {
      if (error || results.length != 1) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Error fetching user (DB)' }); }
      else {
        var token = crypto.randomBytes(10).toString('hex');
        connection.query('UPDATE tbl_user SET token = ? WHERE email = ?', [token, results[0].email], function (error) {
          if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Error saving USER details (DB)' }); }
          else {
            connection.release();
            dbsql.email('Gest Repair\nPara Ativar a sua conta Clique no link em baixo\n'+dbsql.urlf + '/user/activated/' + results[0].email + '/' + token, results[0].email, 'Clique aqui Para Ativar a sua Conta');
            res.status(200).json({ 'result': 'ok' });
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
      if (error || results.length != 1) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Error fetching user (DB)' }); }
      else if (token && token.length > 1 && token === results[0].token) {
        delete results[0].token;
          connection.query('UPDATE tbl_user SET isActive = 1, token = NULL WHERE email = ?', results[0].email,
          function (error) {
            if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Error saving USER details (DB)' }); } else {
              connection.release();
              dbsql.email('A sua conta está ativada ', results[0].email, 'A sua conta está ativada');
              res.status(200).json({ 'result': 'ok', 'massage': 'Conta Activada.' });
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
      if (error || results.length != 1) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Error fetching user (DB)' }); }
      else {
        var token = crypto.randomBytes(10).toString('hex');
        connection.query('UPDATE tbl_user SET token = ? WHERE email = ?', [token, results[0].email], function (error) {
          if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Error saving USER details (DB)' }); }
          else {
            connection.release();
            dbsql.email('GestRepair\n Para Recuperar a Password Clique no link descrito em baixo.\n'+dbsql.urlf + '/user/recovery/' + results[0].email + '/' + token, results[0].email, 'Recuperação da Password');
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
      if (error || results.length != 1) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Error fetching user (DB)' }); }
      else if (token && token.length > 1 && token === results[0].token) {
        delete results[0].token;
        params.password = crypto.createHash('md5').update(params.password).digest('hex');
        var values = {
          password: params.password,
        };
        connection.query('UPDATE tbl_user SET ?, token = NULL WHERE email = ?', [values, results[0].email],
          function (error) {
            if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Error saving USER details (DB)' }); } else {
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
exports.listtype = function(req, res) {
  dbsql.mysql.getConnection(function(err, connection) {

    connection.query('SELECT idUser, username, name, street, zipcode, city, email, nif, contact, isActive FROM tbl_user where isEmployer = ?',req.params.id ,function(error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'data': results });

    });
  });
};

exports.addEmployer = function(req, res) {
  var params = req.body;

  dbsql.mysql.getConnection(function(err, connection) {
    var valuesEmployer = {
      user: params.user,
      service: params.service
    };
    connection.query('INSERT INTO tbl_employer SET ?', valuesEmployer, function(error, results, fields) {
      if (error) {
        connection.release();
        return res.status(500).json({ 'result': 'nok', 'message': error });
      }
        var user = params.user;
        var employer = 1;
      connection.query('UPDATE tbl_user SET isEmployer = ? where idUser = ?', [employer,user], function(error, results, fields) {
        if (error) {
          connection.release();
          return res.status(500).json({ 'result': 'nok', 'message': error });
        }
        res.status(200).json({ 'result': 'ok' });
    });
  });
  });
};
exports.infoEmployer = function(req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function(err, connection) {
    connection.query('SELECT e.idEmployer, u.`name`, s.nameService, e.isActive FROM tbl_employer e, tbl_user u, tbl_service s WHERE e.`user` = u.idUser and e.`service` = s.idService and e.`user` = ?', id, function(error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'Não é funcionário ou não encontrado' });
      } else {
        res.status(200).json({ 'result': 'ok', 'data': results[0] });
      }
    });
  });
};
