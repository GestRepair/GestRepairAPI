var dbsql = require('../../dbsql'),
  crypto = require('crypto');
/***************Verify If exists vehicle**********************/
exports.ifVehcleExists = function (req, res) {
  var params = req.body;
  var vehicle = params.vehicle;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT IF(EXISTS(select * from tbl_vehicle where registration=?),true,false) AS bool;', [vehicle], function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok','message':'Erro a verificar viatura', 'error': error });
      res.status(200).json({ 'result': 'ok', 'message':'Sucesso', 'data': results[0] });
    });
  });
};
exports.ifVehcleExistsOwner = function (req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT IF(exists(SELECT * FROM tbl_vehicle v, tbl_user_vehicle uv where v.idVehicle = uv.vehicle and v.registration = ? and uv.isActive = 1),true,false) as bool;', [params.vehicle], function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok','message':'Erro a verificar viatura', 'error': error });
      res.status(200).json({ 'result': 'ok', 'message':'Sucesso', 'data': results[0] });
    });
  });
};
exports.ifVehcleExistsOwnerUser = function (req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT IF(exists(SELECT * FROM tbl_vehicle v, tbl_user_vehicle uv where v.idVehicle = uv.vehicle and v.registration = ? and uv.user = ? and uv.isActive = 1),true,false) as bool;', [params.vehicle, req.params.id], function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok','message':'Erro a verificar viatura', 'error': error });
      res.status(200).json({ 'result': 'ok', 'message':'Sucesso', 'data': results[0] });
    });
  });
};
exports.ifVehcleExistsWithoutOwner = function (req, res) {
  var params = req.body;
  var vehicle = params.vehicle;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT IF(exists(SELECT * FROM tbl_vehicle v, tbl_user_vehicle uv where v.idVehicle = uv.vehicle and v.registration= ? and uv.isActive = 0),true,false) as bool;', [vehicle], function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok','message':'Erro a verificar viatura', 'error': error });
      res.status(200).json({ 'result': 'ok', 'message':'Sucesso', 'data': results[0] });
    });
  });
};
exports.addVehicle = function (req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function (err, connection) {
    var x = connection.query('SELECT idVehicle FROM tbl_vehicle Where registration = ?', params.vehicle, function (error, results, fields) {
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a adicionar viatura', 'error': error });
      var val = {
        vehicle: results[0].idVehicle,
        user: req.params.id
      };
      connection.query('INSERT INTO tbl_user_vehicle SET ? ', val, function (error, results, fields) {
        if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message':'Erro ao adicionar viatura','error': error }); }
        res.status(200).json({ 'result': 'ok','message':'Viatura adicionada com sucesso'});
      });
    });
  });
};
exports.upVehicle = function (req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT idVehicle FROM tbl_vehicle Where registration = ?', params.vehicle, function (error, results, fields) {
      if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Erro a adicionar viatura', 'error': error });}
      var val = {
        isActive:1
      };
      connection.query('update tbl_user_vehicle SET ? where user = ? and vehicle = ?',[val,req.params.id,results[0].idVehicle], function (error, results, fields) {
        connection.release();
        if (error) { return res.status(500).json({ 'result': 'nok', 'message':'Erro ao adicionar viatura','error': error }); }
        res.status(200).json({ 'result': 'ok','message':'Viatura adicionada com sucesso'});
      });
    });
  });
};
exports.disDeskVehicle = function (req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('select e.user,e.vehicle From tbl_vehicle v, (SELECT user, vehicle FROM gestrepair.tbl_user_vehicle where isActive = 1) e where e.vehicle = v.idVehicle and v.registration = ?;', params.vehicle, function (error, results, fields) {
      if (error) {connection.release(); return res.status(500).json({ 'result': 'nok', 'message': 'Erro a adicionar viatura', 'error': error });}
      connection.query('update tbl_user_vehicle SET isActive = 0 where user = ? and vehicle = ?',[results[0].user,results[0].vehicle], function (error, results, fields) {
        connection.release();
        if (error) { return res.status(500).json({ 'result': 'nok', 'message':'Erro ao adicionar viatura','error': error }); }
        res.status(200).json({ 'result': 'ok','message':'Viatura desassociada com sucesso'});
      });
    });
  });
};
exports.disVehicle = function (req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function (err, connection) {
      connection.query('update tbl_user_vehicle SET isActive = 0 where user = ? and vehicle = ?',[params.user,params.vehicle], function (error, results, fields) {
        connection.release();
        if (error) { return res.status(500).json({ 'result': 'nok', 'message':'Erro ao adicionar viatura','error': error }); }
        res.status(200).json({ 'result': 'ok','message':'Viatura desassociada com sucesso'});
      });
  });
};
/****Usar transaction****/
exports.create = function (req, res) {
  var params = req.body;
  dbsql.mysql.getConnection(function (err, connection) {
    var values = {
      model: params.model,
      registration: params.registration,
      fuel: params.fuel,
      date: params.date
    };
    connection.query('INSERT INTO tbl_vehicle SET  ?', values, function (error, results, fields) {
      if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
      connection.query('SELECT idVehicle FROM tbl_vehicle Where registration = ?', params.registration, function (error, results, fields) {
        if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Erro a adicionar viatura', 'error': error });
        var val = {
          vehicle: results[0].idVehicle,
          user: req.params.id
        };
        connection.query('INSERT INTO tbl_user_vehicle SET ? ', val, function (error, results, fields) {
          if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message':'Erro ao adicionar viatura','error': error }); }
          res.status(200).json({ 'result': 'ok','message':'Viatura adicionada com sucesso'});
        });
      });
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
      if (error) { return res.status(500).json({ 'result': 'nok','message':'Erro a criar marca', 'error': error }); }
      res.status(200).json({ 'result': 'ok','message':'Marca adicionada com sucesso' });
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
      if (error) { return res.status(500).json({ 'result': 'nok','message':'Erro a criar modelo', 'error': error}); }
      res.status(200).json({ 'result': 'ok','message':'Modelo adicionada com sucesso' });
    });
  });
};

exports.list = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT u.username, v.idVehicle, b.nameBrand, m.nameModel, v.registration , v.horsepower, v.displacement, v.kilometers,f.nameFuel, v.fronttiresize, v.reartiresize, v.`date` FROM tbl_vehicle v, tbl_brand b,tbl_model m, tbl_fuel f,tbl_user_vehicle uv, tbl_user u Where v.model = m.idModel AND v.fuel= f.idFuel AND b.idBrand = m.brand AND uv.vehicle = v.idVehicle AND u.idUser = uv.`user` and uv.isActive = 1;', function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok','message':'Erro a listar viaturas', 'error': error });
      res.status(200).json({ 'result': 'ok','message':'Sucesso', 'data': results });

    });
  });
};
exports.listUser = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {

    connection.query('SELECT uv.`user`, ve.idVehicle,ve.registration, ve.nameBrand, ve.nameModel , ve.horsepower, ve.displacement, ve.kilometers, ve.nameFuel, ve.fronttiresize, ve.reartiresize, ve.date FROM tbl_user_vehicle uv,(SELECT v.idVehicle, b.nameBrand, m.nameModel, v.registration , v.horsepower, v.displacement, v.kilometers,f.nameFuel, v.fronttiresize, v.reartiresize, v.date FROM tbl_vehicle v, tbl_brand b,tbl_model m, tbl_fuel f Where v.model = m.idModel AND v.fuel= f.idFuel AND b.idBrand = m.brand) ve where uv.vehicle = ve.idVehicle AND uv.isActive = 1 and uv.`user` = ? ;', id, function (error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok','message':'Erro a listar viaturas por utilizador', 'error': error  });
      res.status(200).json({ 'result': 'ok','message':'Sucesso', 'data': results });

    });
  });
};
exports.info = function (req, res) {
  var id = req.params.id;
  var vehicle = req.params.vehicle;
  dbsql.mysql.getConnection(function (err, connection) {

    connection.query('SELECT uv.`user`, ve.idVehicle,ve.registration, ve.nameBrand, ve.nameModel , ve.horsepower, ve.displacement, ve.kilometers, ve.nameFuel, ve.fronttiresize, ve.reartiresize, ve.date FROM tbl_user_vehicle uv,(SELECT v.idVehicle, b.nameBrand, m.nameModel, v.registration , v.horsepower, v.displacement, v.kilometers,f.nameFuel, v.fronttiresize, v.reartiresize, v.date FROM tbl_vehicle v, tbl_brand b,tbl_model m, tbl_fuel f Where v.model = m.idModel AND v.fuel= f.idFuel AND b.idBrand = m.brand) ve where uv.vehicle = ve.idVehicle AND uv.`user` = ? AND ve.idVehicle =?', [id, vehicle], function (error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({ 'result': 'nok','message':'Erro a mostrar viatura', 'error': error });

      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'A viatura não consiste no registo' });
      } else {
        delete results[0].password;
        res.status(200).json({ 'result': 'ok', 'message':'Sucesso', 'data': results[0] });
      }
    });
  });
};
exports.brand = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM tbl_brand;', function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message':'Erro a listar marcas', 'error': error });
      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'Não existe marcas' });
      } else {
        delete results[0].password;
        res.status(200).json({ 'result': 'ok', 'message':'Sucesso', 'data': results });
      }
    });
  });
};
exports.model = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM tbl_model where brand = ?;', [req.params.id], function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message':'Erro a listar modelos', 'message': error });
      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'Não existe modelos' });
      } else {
        delete results[0].password;
        res.status(200).json({ 'result': 'ok', 'message':'Sucesso', 'data': results });
      }
    });
  });
};
exports.fuel = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM tbl_fuel;', function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message':'Erro a listar combustiveis', 'error': error });
      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'Não existe combustiveis' });
      } else {
        delete results[0].password;
        res.status(200).json({ 'result': 'ok', 'message':'Sucesso', 'data': results });
      }
    });
  });
};
/**
*DESKTOP VERSION
**/
/**
*CREATE VEHICLE DESKTOP VERSION
**/
//***********************subs transaction
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
        if (error) return res.status(500).json({ 'result': 'nok', 'message':'Erro ao criar viatura' ,'error': error });
        var val = {
          vehicle: results[0].idVehicle,
          user: req.params.id
        };
        connection.query('INSERT INTO tbl_user_vehicle SET ? ', val, function (error, results, fields) {
          if (error) { connection.release(); return res.status(500).json({ 'result': 'nok',  'message':'Erro ao associar viatura ao utilizador' ,'error': error }); }
          res.status(200).json({ 'result': 'ok', 'message':'Viatura criada com sucesso'});
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
      fuel: params.fuel,
      model: params.model,
      horsepower: params.horsepower,
      kilometers: params.kilometers,
      displacement: params.displacement,
      fronttiresize: params.fronttiresize,
      reartiresize: params.reartiresize,
      date: params.date
    };
    connection.query('UPDATE tbl_vehicle SET  ? WHERE idVehicle = ?', [values, req.params.id], function (error, results, fields) {
      if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message':'Erro ao editar viatura' , 'error': error}); }
      res.status(200).json({ 'result': 'ok', 'message':'Viatura editada com sucesso' });
    });
  });
};
exports.updateBrand = function (req, res) {
  var params = req.body;
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    var values = {
      nameBrand: params.nameBrand
    };
    connection.query('UPDATE tbl_brand SET  ? WHERE idBrand = ?', [values, id], function (error, results, fields) {
      if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message':'Erro ao editar a marca' , 'error': error }); }
      res.status(200).json({ 'result': 'ok', 'message':'Marca alterada com sucesso' });
    });
  });
};
exports.infoBrand = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {

    connection.query('SELECT * FROM gestrepair.tbl_brand where idBrand =?', id, function (error, results, fields) {
      connection.release();

      if (error) return res.status(500).json({  'result': 'nok', 'message':'Erro a mostrar informação da marca' , 'error': error  });

      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'Marca não encontrada' });
      } else {
        res.status(200).json({ 'result': 'ok',  'result': 'nok', 'message':'Sucesso', 'data': results[0] });
      }
    });
  });
};
exports.infoModel = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM tbl_model where idModel =?', id, function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message':'Erro a mostrar informação do modelo' , 'error': error });
      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'Modelo não encontrada' });
      } else {
        res.status(200).json({ 'result': 'ok','message':'Sucesso', 'data': results[0] });
      }
    });
  });
};
exports.updateModel = function (req, res) {
  var params = req.body;
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    var values = {
      nameModel: params.nameModel
    };
    connection.query('UPDATE tbl_model SET  ? WHERE idModel = ?', [values, id], function (error, results, fields) {
      if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message':'Erro a alterar modelo' , 'error': error  }); }
      res.status(200).json({ 'result': 'ok','message':'Modelo alterado com sucesso' });
    });
  });
};
exports.infoDesk = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT v.idVehicle, b.nameBrand, m.nameModel, v.registration , v.horsepower, v.displacement, v.kilometers,f.nameFuel, v.fronttiresize, v.reartiresize, v.date FROM tbl_vehicle v, tbl_brand b,tbl_model m, tbl_fuel f Where v.model = m.idModel AND v.fuel= f.idFuel AND b.idBrand = m.brand and v.idVehicle = ?', id, function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message':'Erro a mostrar a informação' , 'error': error });
      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'Informação não encontrada' });
      } else {
        delete results[0].password;
        res.status(200).json({ 'result': 'ok', 'message':'Sucesso', 'data': results[0] });
      }
    });
  });
};
/**
*FUEL
*
**/
exports.createFuel = function (req, res) {
  var params = req.body;

  dbsql.mysql.getConnection(function (err, connection) {
    var values = {
      nameFuel: params.nameFuel,
    };
    connection.query('INSERT INTO tbl_fuel SET  ?', values, function (error, results, fields) {
      connection.release();
      if (error) { return res.status(500).json({ 'result': 'nok', 'message':'Erro a adicionar o Combustível' , 'error': error }); }
      res.status(200).json({ 'result': 'ok', 'message':'Sucesso' });
    });
  });
};
exports.infoFuel = function (req, res) {
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM gestrepair.tbl_fuel where idFuel = ?;', id, function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message' : 'Erro a mostrar o Combustível' , 'error': error });
      if (results < 1) {
        res.status(404).json({ 'result': 'nok', 'message': 'O combustivel não existe' });
      } else {
        delete results[0].password;
        res.status(200).json({ 'result': 'ok', 'message': 'Sucesso' , 'data': results[0] });
      }
    });
  });
};
exports.updateFuel = function (req, res) {
  var params = req.body;
  var id = req.params.id;
  dbsql.mysql.getConnection(function (err, connection) {
    var values = {
      nameFuel: params.nameFuel
    };
    connection.query('UPDATE tbl_fuel SET  ? WHERE idFuel = ?', [values, id], function (error, results, fields) {
      if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
      res.status(200).json({ 'result': 'ok', 'message': 'Combustivel modificado com sucesso' });
    });
  });
};
