var basicAuth = require('basic-auth'),
  dbsql = require('../../dbsql'),
  crypto = require('crypto');

module.exports = function(req, res, next) {
  var login = basicAuth(req);

  if (!login || !login.name || !login.pass) return res.status(401).json({ 'result': 'nok', 'message': 'access denied' });
  //console.log(login.name);
  dbsql.mysql.getConnection(function(err, connection) {

    connection.query('select tbuser.numUtilizador as numUtilizador, tbauth.username as username, tbauth.password as password, tbuser.nome as nome, tbuser.morada as morada, tbuser.codPostal as codPostal, tbuser.localidade as localidade, tbuser.email as email, tbuser.nif as nif, tbuser.contacto as contacto, tbroleuser.nomeRole as nomeRole from tbl_autenticacao tbauth, tbl_utilizadores tbuser, tbl_roles_utilizador tbroleuser WHERE tbauth.utilizador = tbuser.numUtilizador and tbauth.role = tbroleuser.idRole and tbauth.username = ? ', login.name, function(error, results, fields) {
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
