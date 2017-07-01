var dbsql = require('../../dbsql'),
  crypto = require('crypto');

  exports.create = function(req, res) {
    var params = req.body;

    params.password = crypto.createHash('md5').update(params.password).digest('hex');

    dbsql.mysql.getConnection(function(err, connection) {
      var valuesUser = {
        nome: params.nome,
        morada: params.morada,
        codPostal: params.codPostal,
        localidade: params.localidade,
        email: params.email,
        nif: params.nif,
        contacto: params.contacto,
        username: params.username,
        password: params.password,
        role: 4,
        isActive:0
      };
      connection.query('INSERT INTO tbl_utilizadores SET ?', valuesUser, function(error, results, fields) {
        connection.release();
        if (error) {
          return res.status(500).json({ 'result': 'nok', 'message': error });
        }
        res.status(200).json({ 'result': 'ok' });
    });
    });
  };
  /*
  exports.create = function(req, res) {
    var params = req.body;

    params.password = crypto.createHash('md5').update(params.password).digest('hex');

    dbsql.mysql.getConnection(function(err, connection) {
      var valuesUser = {
        nome: params.nome,
        morada: params.morada,
        codPostal: params.codPostal,
        localidade: params.localidade,
        email: params.email,
        nif: params.nif,
        contacto: params.contacto
      };
      connection.query('INSERT INTO tbl_utilizadores SET ?', valuesUser, function(error, results, fields) {
        if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
        connection.query('SELECT numUtilizador FROM tbl_utilizadores ORDER BY numUtilizador DESC LIMIT 1', function(error, results, fields) {
          if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
          var valuesAuth = {
            username: params.username,
            password: params.password,
            utilizador: results[0].numUtilizador
          };
          connection.query('INSERT INTO tbl_autenticacao SET ? ',valuesAuth, function(error, results, fields) {
            if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
            res.status(200).json({ 'result': 'ok' });
          });
        });
      });
    });
  };*/
/*
exports.list = function(req, res) {
  dbsql.mysql.getConnection(function(err, connection) {
    var query ='select `tbuser`.`numUtilizador` as `numutilizador`, `tbauth`.`username` as `username`, `tbuser`.`nome` as `nome`, ';
    query += '`tbuser`.`morada` as `morada`, `tbuser`.`codPostal` as `codPostal`, `tbuser`.`localidade` as `localidade`, `tbuser`.`email` as `email`, ';
    query +='`tbuser`.`nif` as `nif`, `tbuser`.`contacto` as `contacto`, `tbroleuser`.`nomeRole` ';
    query +='from `tbl_autenticacao` `tbauth`, `tbl_utilizadores` `tbuser`, `tbl_roles_utilizador` `tbroleuser` ';
    query +='WHERE `tbauth`.`utilizador` = `tbuser`.`numUtilizador` and `tbauth`.`role` = `tbroleuser`.`idRole`';
    connection.query(query, function(error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error});
      res.status(200).json({ 'result': 'ok', 'data': results[0] });

      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'User could not be found' });
      } else {
        delete results[0].password;
        res.status(200).json({ 'result': 'ok', 'data': results[0] });
      }

    });
  });
};
*/
exports.list = function(req, res) {
  dbsql.mysql.getConnection(function(err, connection) {

    connection.query('SELECT au.username,ut.numUtilizador,ut.nome,ut.morada,ut.codPostal,ut.localidade,ut.email,ut.nif,ut.contacto,ro.nomeRole FROM ((tbl_utilizadores ut INNER JOIN tbl_autenticacao au ON ut.numUtilizador=au.utilizador) INNER JOIN tbl_roles_utilizador ro ON au.role = ro.idRole)', function(error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'data': results });

    });
  });
};

exports.listrole = function(req, res) {
  dbsql.mysql.getConnection(function(err, connection) {

    connection.query('select * from tbl_roles_utilizador;', function(error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'data': results });

    });
  });
};

exports.info = function(req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function(err, connection) {

    connection.query('CALL gestrepair.infouser(?)', id, function(error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });

      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'User could not be found' });
      } else {
        delete results[0].password;
        res.status(200).json({ 'result': 'ok', 'data': results[0] });
      }
    });
  });
};

exports.update = function(req, res) {
  var params = req.body;
    var id = req.users.numUtilizador;
  dbsql.mysql.getConnection(function(err, connection) {
    var values = {
      nome: params.nome,
      morada: params.morada,
      codPostal: params.codPostal,
      localidade: params.localidade,
      email: params.email,
      nif: params.nif,
      contacto: params.contacto
    };
    connection.query('UPDATE tbl_utilizadores SET ? WHERE numUtilizador = ?', [values,id], function(error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok' });
    });
  });
};

exports.updateUser = function(req, res) {
  var params = req.body;
    var id = req.params.id;
  dbsql.mysql.getConnection(function(err, connection) {
    var values = {
      nome: params.nome,
      morada: params.morada,
      codPostal: params.codPostal,
      localidade: params.localidade,
      email: params.email,
      nif: params.nif,
      contacto: params.contacto
    };
    connection.query('UPDATE tbl_utilizadores SET ? WHERE numUtilizador = ?', [values,id], function(error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok' });
    });
  });
};
exports.chpass = function(req, res) {
  var params = req.body;
    var id = req.users.numUtilizador;
    params.password = crypto.createHash('md5').update(params.password).digest('hex');
    dbsql.mysql.getConnection(function(err, connection) {
      var oldPassword = params.password;
      params.newPassword= crypto.createHash('md5').update(params.newPassword).digest('hex');
      params.confirmPassword= crypto.createHash('md5').update(params.confirmPassword).digest('hex');
      if (req.users.password == params.password)
      {
        if (req.users.password != params.confirmPassword)
        {
          if (params.newPassword == params.confirmPassword)
          {
            var values = {
              password: params.confirmPassword,
            };
            connection.query('UPDATE tbl_autenticacao SET ? WHERE utilizador = ? AND password = ?', [values,id,oldPassword], function(error, results, fields) {
              connection.release();
              if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
              req.users.password = params.confirmPassword;
              res.status(200).json({ 'result': 'ok' });
            });
          }
          else
          {
             res.json({'result':'error password'});
          }
        }
        else
        {
          res.json({'result':'equal password'});
        }
      }
      else {
         res.json({'result':'password invalid'});
      }
  });
};

exports.login = function(req, res) {
  res.status(200).json({ 'result': 'ok', 'data': req.users });
};
