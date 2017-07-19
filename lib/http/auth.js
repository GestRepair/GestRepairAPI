var basicAuth = require('basic-auth'),
  dbsql = require('../../dbsql'),
  crypto = require('crypto');

module.exports = function(req, res, next) {
  var login = basicAuth(req);

  if (!login || !login.name || !login.pass) return res.status(401).json({ 'result': 'nok', 'message': 'Acesso Negado' });
  //console.log(login.name);
  dbsql.mysql.getConnection(function(err, connection) {

    connection.query('select tu.idUser, tu.username, tu.password, tu.name, tu.street,tu.zipcode, tu.city, tu.email, tu.nif, tu.contact, tr.nameRole from tbl_user tu, tbl_role tr WHERE tu.isActive =1 and tu.role = tr.idRole and tu.username =  ? ', login.name, function(error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro Interno','error_type':error });

      if (results.length > 0) {
        if (results[0].password === crypto.createHash('md5').update(login.pass).digest('hex')) {
          req.users = results[0];
          return next();
        }
      }

      return res.status(401).json({ 'result': 'nok', 'message': 'Acesso Negado' });
    });
  });

};
