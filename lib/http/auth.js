var basicAuth = require('basic-auth'),
  dbsql = require('../../dbsql'),
  crypto = require('crypto');

module.exports = function(req, res, next) {
  var login = basicAuth(req);

  if (!login || !login.name || !login.pass) return res.status(401).json({ 'result': 'nok', 'message': 'access denied' });
  //console.log(login.name);
  dbsql.mysql.getConnection(function(err, connection) {

    connection.query('select tu.numUtilizador, tu.username, tu.password, tu.nome, tu.morada,tu.codPostal, tu.localidade, tu.email, tu.nif, tu.contacto, tr.nomeRole from tbl_utilizadores tu, tbl_roles_utilizador tr WHERE tu.role = tr.idRole and tu.username =  ? ', login.name, function(error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });

      if (results.length > 0) {
        if (results[0].password === crypto.createHash('md5').update(login.pass).digest('hex')) {
          req.users = results[0];
          return next();
        }
      }

      return res.status(401).json({ 'result': 'nok', 'message': 'access denied' });
    });
  });

};
