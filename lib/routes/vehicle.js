var dbsql = require('../../dbsql'),
  crypto = require('crypto');
  exports.list = function(req, res) {
    dbsql.mysql.getConnection(function(err, connection) {

      connection.query('SELECT uv.numUser, ve.idVehicle,ve.registration, ve.nameBrand, ve.nameModel , ve.horsepower, ve.displacement, ve.kilometers, ve.nameFuel, ve.fronttiresize, ve.reartiresize, ve.date FROM tbl_utilizadores_veiculos uv,(SELECT v.idVehicle, b.nameBrand, m.nameModel, v.registration , v.horsepower, v.displacement, v.kilometers,f.nameFuel, v.fronttiresize, v.reartiresize, v.date FROM tbl_vehicle v, tbl_brand b,tbl_model m, tbl_fuel f Where v.model = m.idModel AND v.fuel= f.idFuel AND b.idBrand = m.brand) ve where uv.numVei = ve.idVehicle;', function(error, results, fields) {
        connection.release();

        if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
        res.status(200).json({ 'result': 'ok', 'data': results });

      });
    });
  };
  exports.listUser = function(req, res) {
    var id = req.params.id;
    dbsql.mysql.getConnection(function(err, connection) {

      connection.query('SELECT uv.numUser, ve.idVehicle,ve.registration, ve.nameBrand, ve.nameModel , ve.horsepower, ve.displacement, ve.kilometers, ve.nameFuel, ve.fronttiresize, ve.reartiresize, ve.date FROM tbl_utilizadores_veiculos uv,(SELECT v.idVehicle, b.nameBrand, m.nameModel, v.registration , v.horsepower, v.displacement, v.kilometers,f.nameFuel, v.fronttiresize, v.reartiresize, v.date FROM tbl_vehicle v, tbl_brand b,tbl_model m, tbl_fuel f Where v.model = m.idModel AND v.fuel= f.idFuel AND b.idBrand = m.brand) ve where uv.numVei = ve.idVehicle AND uv.numUser = ? ;', id, function(error, results, fields) {
        connection.release();

        if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
        res.status(200).json({ 'result': 'ok', 'data': results });

      });
    });
  };
  exports.info = function(req, res) {
    var id = req.params.id;
    var vehicle = req.params.vehicle;
    dbsql.mysql.getConnection(function(err, connection) {

      connection.query('SELECT uv.numUser, ve.idVehicle,ve.registration, ve.nameBrand, ve.nameModel , ve.horsepower, ve.displacement, ve.kilometers, ve.nameFuel, ve.fronttiresize, ve.reartiresize, ve.date FROM tbl_utilizadores_veiculos uv,(SELECT v.idVehicle, b.nameBrand, m.nameModel, v.registration , v.horsepower, v.displacement, v.kilometers,f.nameFuel, v.fronttiresize, v.reartiresize, v.date FROM tbl_vehicle v, tbl_brand b,tbl_model m, tbl_fuel f Where v.model = m.idModel AND v.fuel= f.idFuel AND b.idBrand = m.brand) ve where uv.numVei = ve.idVehicle AND uv.numUser = ? AND ve.idVehicle =?', [id,vehicle], function(error, results, fields) {
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
