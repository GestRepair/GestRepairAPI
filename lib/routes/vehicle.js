var dbsql = require('../../dbsql'),
  crypto = require('crypto');
exports.create = function (req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function (err, connection) {
    var values = {
      model: params.model,
      registration: params.registration,
      fuel: params.fuel
    };
    connection.query('INSERT INTO tbl_vehicle SET  ?', values, function (error, results, fields) {
      if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
      var x = connection.query('SELECT idVehicle FROM tbl_vehicle Where registration = ?', params.registration, function (error, results, fields) {
        if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
        var val = {
          vehicle: results[0].idVehicle,
          user: req.params.id
        };
        connection.query('INSERT INTO tbl_user_vehicle SET ? ', val, function (error, results, fields) {
          if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
          res.status(200).json({ 'result': 'ok' });
        });
      });
    });
  });
};
exports.createDesk = function (req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function (err, connection) {
    var values = {
      model: params.model,
      registration: params.registration,
      fuel: params.fuel,
      horsepower: params.horsepower,
      displacement: params.displacement,
      kilometers: params.kilometers,
      fronttiresize: params.fronttiresize,
      reartiresize: params.reartiresize,
      date: params.date
    };
    connection.query('INSERT INTO tbl_vehicle SET  ?', values, function (error, results, fields) {
      if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
      var x = connection.query('SELECT idVehicle FROM tbl_vehicle Where registration = ?', params.registration, function (error, results, fields) {
        if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
        var val = {
          vehicle: results[0].idVehicle,
          user: req.params.id
        };
        connection.query('INSERT INTO tbl_user_vehicle SET ? ', val, function (error, results, fields) {
          if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
          res.status(200).json({ 'result': 'ok' });
        });
      });
    });
  });
};
exports.update = function (req, res) {
  var params = req.body;

  dbsql.mysql.getConnection(function (err, connection) {
    var values = {
      registration: params.registration,
      horsepower: params.horsepower,
      kilometers: params.kilometers,
      displacement:params.displacement,
      fronttiresize:params.fronttiresize,
      reartiresize:params.reartiresize
    };
    connection.query('UPDATE tbl_vehicle SET  ? WHERE idVehicle = ?', [values,req.params.id], function (error, results, fields) {
      if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
          res.status(200).json({ 'result': 'ok' });
    });
  });
};
exports.createBrand = function (req, res) {
  var params = req.body;

  dbsql.mysql.getConnection(function (err, connection) {
    var values = {
      nameBrand: params.brand,
    };
    connection.query('INSERT INTO tbl_brand SET  ?', values, function (error, results, fields) {
      connection.release();
      if (error) {  return res.status(500).json({ 'result': 'nok', 'message': error }); }
          res.status(200).json({ 'result': 'ok' });
      });
    });
};
exports.createModel = function (req, res) {
  var params = req.body;

  dbsql.mysql.getConnection(function (err, connection) {
    var values = {
      brand: params.brand,
      nameModel: params.model,
    };
    connection.query('INSERT INTO tbl_model SET  ?', values, function (error, results, fields) {
      connection.release();
      if (error) {  return res.status(500).json({ 'result': 'nok', 'message': error }); }
          res.status(200).json({ 'result': 'ok' });
      });
    });
};



exports.list = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {

    connection.query('SELECT uv.`user`, ve.idVehicle,ve.registration, ve.nameBrand, ve.nameModel , ve.horsepower, ve.displacement, ve.kilometers, ve.nameFuel, ve.fronttiresize, ve.reartiresize, ve.date FROM tbl_user_vehicle uv,(SELECT v.idVehicle, b.nameBrand, m.nameModel, v.registration , v.horsepower, v.displacement, v.kilometers,f.nameFuel, v.fronttiresize, v.reartiresize, v.date FROM tbl_vehicle v, tbl_brand b,tbl_model m, tbl_fuel f Where v.model = m.idModel AND v.fuel= f.idFuel AND b.idBrand = m.brand) ve where uv.vehicle = ve.idVehicle;', function (error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'data': results });

    });
  });
};
exports.listUser = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {

    connection.query('SELECT uv.`user`, ve.idVehicle,ve.registration, ve.nameBrand, ve.nameModel , ve.horsepower, ve.displacement, ve.kilometers, ve.nameFuel, ve.fronttiresize, ve.reartiresize, ve.date FROM tbl_user_vehicle uv,(SELECT v.idVehicle, b.nameBrand, m.nameModel, v.registration , v.horsepower, v.displacement, v.kilometers,f.nameFuel, v.fronttiresize, v.reartiresize, v.date FROM tbl_vehicle v, tbl_brand b,tbl_model m, tbl_fuel f Where v.model = m.idModel AND v.fuel= f.idFuel AND b.idBrand = m.brand) ve where uv.vehicle = ve.idVehicle AND uv.`user` = ? ;', id, function (error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      res.status(200).json({ 'result': 'ok', 'data': results });

    });
  });
};
exports.info = function (req, res) {
  var id = req.params.id;
  var vehicle = req.params.vehicle;
  dbsql.mysql.getConnection(function (err, connection) {

    connection.query('SELECT uv.`user`, ve.idVehicle,ve.registration, ve.nameBrand, ve.nameModel , ve.horsepower, ve.displacement, ve.kilometers, ve.nameFuel, ve.fronttiresize, ve.reartiresize, ve.date FROM tbl_user_vehicle uv,(SELECT v.idVehicle, b.nameBrand, m.nameModel, v.registration , v.horsepower, v.displacement, v.kilometers,f.nameFuel, v.fronttiresize, v.reartiresize, v.date FROM tbl_vehicle v, tbl_brand b,tbl_model m, tbl_fuel f Where v.model = m.idModel AND v.fuel= f.idFuel AND b.idBrand = m.brand) ve where uv.vehicle = ve.idVehicle AND uv.`user` = ? AND ve.idVehicle =?', [id, vehicle], function (error, results, fields) {
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
exports.brand = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM tbl_brand;', function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'User could not be found' });
      } else {
        delete results[0].password;
        res.status(200).json({ 'result': 'ok', 'data': results });
      }
    });
  });
};
exports.model = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM tbl_model where brand = ?;', [req.params.id], function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'User could not be found' });
      } else {
        delete results[0].password;
        res.status(200).json({ 'result': 'ok', 'data': results });
      }
    });
  });
};
exports.fuel = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM tbl_fuel;', function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'User could not be found' });
      } else {
        delete results[0].password;
        res.status(200).json({ 'result': 'ok', 'data': results });
      }
    });
  });
};
