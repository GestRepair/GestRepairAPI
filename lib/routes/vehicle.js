var dbsql = require('../../dbsql'),
  crypto = require('crypto');
  exports.list = function(req, res) {
    dbsql.mysql.getConnection(function(err, connection) {

      connection.query('SELECT uv.numUser, ve.idVeiculo,ve.matricula, ve.marca, ve.modeloVeiculo , ve.potencia, ve.cilindrada, ve.quilometros, ve.Combustivel, ve.medpneusfrente, ve.medidaspneusatras, ve.ano FROM tbl_utilizadores_veiculos uv,(SELECT v.idVeiculo, ma.marca, mo.modeloVeiculo, v.matricula , v.potencia, v.cilindrada, v.quilometros,c.Combustivel, v.medpneusfrente, v.medidaspneusatras, v.ano FROM tbl_veiculo v, tbl_marcaveiculo ma,tbl_modeloveiculo mo, tbl_combustivel c Where  v.modelo = mo.idModelo AND v.combustivel= c.idCombustivel AND ma.idMarca = mo.marca) ve where uv.numVei = ve.idVeiculo;', function(error, results, fields) {
        connection.release();

        if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
        res.status(200).json({ 'result': 'ok', 'data': results });

      });
    });
  };
  exports.listUser = function(req, res) {
    var id = req.params.id;
    dbsql.mysql.getConnection(function(err, connection) {

      connection.query('SELECT uv.numUser, ve.idVeiculo,ve.matricula, ve.marca, ve.modeloVeiculo , ve.potencia, ve.cilindrada, ve.quilometros, ve.Combustivel, ve.medpneusfrente, ve.medidaspneusatras, ve.ano FROM tbl_utilizadores_veiculos uv,(SELECT v.idVeiculo, ma.marca, mo.modeloVeiculo, v.matricula , v.potencia, v.cilindrada, v.quilometros,c.Combustivel, v.medpneusfrente, v.medidaspneusatras, v.ano FROM tbl_veiculo v, tbl_marcaveiculo ma,tbl_modeloveiculo mo, tbl_combustivel c Where  v.modelo = mo.idModelo AND v.combustivel= c.idCombustivel AND ma.idMarca = mo.marca) ve where uv.numVei = ve.idVeiculo AND uv.numUser = ? ;', id, function(error, results, fields) {
        connection.release();

        if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
        res.status(200).json({ 'result': 'ok', 'data': results });

      });
    });
  };
  exports.info = function(req, res) {
    var id = req.params.id;
    dbsql.mysql.getConnection(function(err, connection) {

      connection.query('SELECT v.idVeiculo, ma.marca, mo.modeloVeiculo, v.matricula , v.potencia, v.cilindrada, v.quilometros,c.Combustivel, v.medpneusfrente, v.medidaspneusatras, v.ano FROM tbl_veiculo v, tbl_marcaveiculo ma,tbl_modeloveiculo mo, tbl_combustivel c Where  v.modelo = mo.idModelo AND v.combustivel= c.idCombustivel AND ma.idMarca = mo.marca AND v.idVeiculo =?', id, function(error, results, fields) {
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
