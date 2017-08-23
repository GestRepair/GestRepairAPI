var dbsql = require('../../dbsql'),
    datetime = require('node-datetime'),
    async = require('async');

exports.list = function (req, res) {
    dbsql.mysql.getConnection(function (err, connection) {
        connection.query('SELECT * FROM tbl_part;', function (error, results, fields) {
            connection.release();
            if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
            res.status(200).json({ 'result': 'ok', 'message': 'Sucess', 'data': results });
        });
    });
};
exports.listServiceZero = function (req, res) {
    var id = req.params.id;
    dbsql.mysql.getConnection(function (err, connection) {
        connection.query('SELECT p.idPart, p.namePart FROM tbl_part p, tbl_part_service ps WHERE p.idPart = ps.part and p.amount > 0 And ps.service = ? ;', id, function (error, results, fields) {
            connection.release();
            if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
            res.status(200).json({ 'result': 'ok', 'message': 'Sucess', 'data': results });
        });
    });
};
exports.listService = function (req, res) {
    var id = req.params.id;
    dbsql.mysql.getConnection(function (err, connection) {
        connection.query('SELECT p.idPart, p.namePart, p.description, p.amount, p.price, p.isActive FROM tbl_part p, tbl_part_service ps WHERE p.idPart = ps.part And ps.service = ? ;', id, function (error, results, fields) {
            connection.release();
            if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
            res.status(200).json({ 'result': 'ok', 'message': 'Sucess', 'data': results });
        });
    });
};
exports.add = function (req, res) {
    var params = req.body;
    dbsql.mysql.getConnection(function (err, connection) {
        connection.beginTransaction(function (err) {
            var obj = {};
            if (params.description == "n/d") { params.description = null; }
            if (params.price == "0") { params.price = null; }
            var values = {
                namePart: params.namePart,
                description: params.description,
                amount: params.amount,
                price: params.price
            };
            async.waterfall([
                function (callback) {
                    connection.query('INSERT INTO tbl_part SET ?', values, function (error, results) {
                        if (error) callback(error);
                        else callback(error, results.insertId);
                    });
                },
                //Insert to relationship number of service
                function (insertId, callback) {
                    obj = { part: insertId, service: params.service };
                    connection.query('INSERT INTO tbl_part_service SET ?', obj, function (err) {
                        if (err) callback(err);
                        else callback(err, insertId);
                    });
                },
            ], function (err, result) {
                if (err) {
                    connection.rollback(
                        function () {
                            connection.release(); //releases mysql connection on error
                            res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a executar a query.', 'error': err });
                        });
                } else {
                    connection.commit(function (err) {
                        if (err) return connection.rollback(function () {
                            connection.release(); //releases mysql connection on error
                            res.status(500).json({ 'result': 'nok', 'message': 'Ocorreu um erro a executar a query.', 'error': err });
                        });
                        connection.release(); //releases mysql connection
                        res.status(200).json({ 'result': 'ok', 'message': 'Peça Adicionada com sucesso' });
                    });
                }
            });
        });
    });
};
exports.info = function (req, res) {
    var id = req.params.id;
    dbsql.mysql.getConnection(function (err, connection) {

        connection.query('SELECT * FROM tbl_part  Where idPart = ? limit 1;', id, function (error, result, fields) {
            if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
            res.status(200).json({ 'result': 'ok', 'message': 'Sucess', 'data': result[0] });
        });
    });
};
exports.edit = function (req, res) {
    var id = req.params.id;
    var params = req.body;
    dbsql.mysql.getConnection(function (err, connection) {
        if (params.description == "n/d") { params.description = null };
        var values = { namePart: params.namePart, description: params.description };
        connection.query('UPDATE tbl_part SET ? WHERE idPart = ?', [values, id], function (error, results, fields) {
            if (error) {
                connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error });
            } else {
                res.status(200).json({ 'result': 'ok', 'message': 'Peça Alterada com sucesso' });
            }
        });
    });
};
exports.editPrice = function (req, res) {
    var id = req.params.id;
    var params = req.body;
    dbsql.mysql.getConnection(function (err, connection) {
        if (params.description == "n/d") { params.description = null };
        var values = { price: params.price };
        connection.query('UPDATE tbl_part SET ? WHERE idPart = ?', [values, id], function (error, results, fields) {
            if (error) {
                connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error });
            } else {
                res.status(200).json({ 'result': 'ok', 'message': 'Preço Alterado com sucesso' });
            }
        });
    });
};
exports.addAmount = function (req, res) {
    var id = req.params.id;
    var params = req.body;
    dbsql.mysql.getConnection(function (err, connection) {
        connection.query('SELECT amount FROM tbl_part  Where idPart = ? limit 1;', id, function (error, result, fields) {
            if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
            var newamount = parseInt(params.amount) + parseInt(result[0].amount);
            var data = { amount: newamount }
            connection.query('UPDATE tbl_part SET ? Where idPart = ?;', [data, id], function (error, fields) {
                if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
                res.status(200).json({ 'result': 'ok', 'message': 'Quantidade Adicionada com sucesso' });
            });
        });
    });
};
exports.addService = function (req, res) {
    var id = req.params.id;
    var params = req.body;
    var data = { part: parseInt(id), service: params.service };
    dbsql.mysql.getConnection(function (err, connection) {
        connection.query('select case when part = ? and service = ? then true else false end as bool from tbl_part_service order by bool desc limit 1;', [parseInt(id), params.service], function (error, result, fields) {
            if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
            if (result[0].bool == 0) {
                connection.query('INSERT INTO tbl_part_service SET ?;', [data], function (error, fields) {
                    if (error) { connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error }); }
                    res.status(200).json({ 'result': 'ok', 'message': 'Inserido com Sucesso' });
                });
            } else {
                res.status(500).json({ 'result': 'nok', 'message': 'Já existe esse relacionamento' });
            }
        });
    });
};
exports.listPartService = function (req, res) {
    var id = req.params.id;
    dbsql.mysql.getConnection(function (err, connection) {
        connection.query('SELECT s.idService, s.nameService FROM tbl_part_service ps, tbl_service s WHERE s.idService = ps.service And ps.part = ? ;', id, function (error, results, fields) {
            connection.release();
            if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
            res.status(200).json({ 'result': 'ok', 'message': 'Sucess', 'data': results });
        });
    });
};
exports.listPartNotService = function (req, res) {
    var id = req.params.id;
    dbsql.mysql.getConnection(function (err, connection) {
        connection.query('SELECT idService, nameService from tbl_service where idService NOT IN (SELECT ps.service FROM tbl_part_service ps where part = ?) and idService <>1 and idService <>2;;', id, function (error, results, fields) {
            connection.release();
            if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
            res.status(200).json({ 'result': 'ok', 'message': 'Sucess', 'data': results });
        });
    });
};
exports.listServiceWhithPart = function (req, res) {
    dbsql.mysql.getConnection(function (err, connection) {
        connection.query('select distinct (s.idService) , s.nameService from tbl_part_service ps, tbl_service s, tbl_part p where ps.service = s.idService and ps.part = p.idPart and p.amount > 0 order by idService;', function (error, results, fields) {
            connection.release();
            if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
            res.status(200).json({ 'result': 'ok', 'message': 'Sucess', 'data': results });
        });
    });
};