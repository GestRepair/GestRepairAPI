var dbsql = require('../../dbsql'),
  crypto = require('crypto'),
  multer = require('multer'),
  mime = require('mime'),
  fs = require('fs'),
  path = require('path'),
  async = require('async');


/** Photo upload folder destination definiton
 * definiton of photo name randomNumber + Date Now
 */
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, dbsql.photoPath);
  },
  filename: function (req, file, callback) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      callback(null, "service_" + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});

exports.list = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT s.idService, s.nameService, s.priceService, s.description, s.photo FROM tbl_employer e, tbl_service s where s.idService = e.service and s.idService != 1 and s.idService !=2 and e.isActive = 1 group by s.idService;', function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a listar os serviços.', 'error': error });
      else {
        if (results.length >= 1) {
          res.status(200).json({ 'result': 'ok', 'message': 'Sucesso', 'data': results });
        } else {
          return res.status(404).json({ 'result': 'nok', 'message': 'Não existe dados.', 'error': error });
        }
      }
    });
  });
}
exports.listComplete = function (req, res) {
  dbsql.mysql.getConnection(function (err, connection) {
    connection.query('SELECT * FROM tbl_service', function (error, results, fields) {
      connection.release();
      if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a mostrar a lista de serviços.', 'error': error });
      else {
        if (results.length >= 1) {
          res.status(200).json({ 'result': 'ok', 'message': 'Sucesso', 'data': results });
        } else {
          return res.status(404).json({ 'result': 'nok', 'message': 'Não existe dados', 'error': error });
        }
      }
    });
  });
}
exports.info = function (req, res) {
  var defaultPhoto = dbsql.photoPath + "/" + dbsql.defaultPhoto;
  try {
    dbsql.mysql.getConnection(function (err, connection) {
      connection.query('SELECT s.idService, s.nameService, s.priceService, s.description, s.photo FROM tbl_employer e, tbl_service s where s.idService = e.service and s.idService != 1 and s.idService !=2 and e.isActive = 1 and idService = ? group by s.idService;', parseInt(req.params.id), function (error, results) {
        connection.release();
        if (error) res.sendFile(defaultPhoto);
        else {
          var photo = defaultPhoto;
          if (results.length >= 1) {
            photo = dbsql.photoPath + "/" + results[0].photo;
            if (!fs.existsSync(photo)) photo = defaultPhoto;
            results[0].photo = dbsql.url + "/service/img/" + parseInt(req.params.id);
            res.status(200).json({ 'result': 'ok', 'message': 'Sucesso', 'data': results[0] });
          }else{
            res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a mostrar o serviço.', 'error': error });
          }
        }
      });
    });
  } catch (e) {
    res.status(400).json({ 'result': 'nok', 'message': 'Erro a obter imagem' });
  }
};
exports.infoDesk = function (req, res) {
  var defaultPhoto = dbsql.photoPath + "/" + dbsql.defaultPhoto;
  try {
    dbsql.mysql.getConnection(function (err, connection) {
      connection.query('SELECT * FROM tbl_service WHERE idService =?', parseInt(req.params.id), function (error, results) {
        connection.release();
        if (error) res.sendFile(defaultPhoto);
        else {
          var photo = defaultPhoto;
          if (results.length >= 1) {
            photo = dbsql.photoPath + "/" + results[0].photo;
            if (!fs.existsSync(photo)) photo = defaultPhoto;
            results[0].photo = dbsql.url + "/service/img/" + parseInt(req.params.id);
          }

          res.status(200).json({ 'result': 'ok','message': 'Sucesso', 'data': results[0] });
        }
      });
    });
  } catch (e) {
    res.status(400).json({ 'result': 'nok', 'message': 'Erro a obter imagem' });
  }
};
exports.getImg = function (req, res) {
  var defaultPhoto = dbsql.photoPath + "/" + dbsql.defaultPhoto;
  try {
    dbsql.mysql.getConnection(function (err, connection) {
      connection.query('SELECT * FROM tbl_service WHERE idService != 1 and idService !=2 and idService =?', parseInt(req.params.id), function (error, results) {
        connection.release();
        if (error) res.sendFile(defaultPhoto);
        else {
          var photo = defaultPhoto;
          if (results.length >= 1) {
            photo = dbsql.photoPath + "/" + results[0].photo;
            if (!fs.existsSync(photo)) photo = defaultPhoto;
          }
          res.sendFile(photo);
        }
      });
    });
  } catch (e) {
    res.status(400).json({ 'result': 'nok', 'message': 'Erro a obter imagem' });
  }
};
var upload = multer({ storage: storage }).single('photo');

exports.create = function (req, res) {
  upload(req, res, function (err) {
    if (err) return res.status(500).json({ 'result': 'nok', 'message': err });
    else {
      dbsql.mysql.getConnection(function (err, connection) {
        var insertservice = {
          nameService: req.body.nameService,
          priceService: req.body.priceService,
          description: req.body.description,
          photo: req.file.filename
        }
        connection.query('Insert into tbl_service SET ?', insertservice, function (error, results) {
          connection.release();
          if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a inserir serviço.', 'error': error });
          res.status(200).json({ 'result': 'ok' , 'message': 'Serviço adicionado com sucesso'});
        });
      });
    }
  });
};

exports.updateWithPhoto = function (req, res) {
  var id = req.params.id;
  upload(req, res, function (err) {
    if (err) return res.status(500).json({ 'result': 'nok', 'message': err });
    else {
      dbsql.mysql.getConnection(function (err, connection) {
        var service = {
          nameService: req.body.nameService,
          priceService: req.body.priceService,
          description: req.body.description,
          photo: req.file.filename
        }
        connection.query('UPDATE tbl_service SET ? where idService = ?', [service,id], function (error, results) {
          connection.release();
          if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a atualizar o serviço', 'error': error });
          res.status(200).json({ 'result': 'ok', 'message': 'Serviço modificado com sucesso' });
        });
      });
    }
  });
};
exports.updateWithoutPhoto = function (req, res) {
  var id = req.params.id;
    dbsql.mysql.getConnection(function (err, connection) {
        var service = {
          nameService: req.body.nameService,
          priceService: req.body.priceService,
          description: req.body.description,
        }
        connection.query('UPDATE tbl_service SET ? where idService = ?', [service,id], function (error, results) {
          connection.release();
          if (error) return res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a atualizar o serviço', 'error': error });
          res.status(200).json({ 'result': 'ok', 'message': 'Serviço modificado com sucesso' });
        });
      });
};
