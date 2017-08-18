var dbsql = require('../../dbsql'),
    async = require('async');

exports.list = function (req, res) {
    dbsql.mysql.getConnection(function (err, connection) {
        connection.query('SELECT * FROM tbl_part;', function (error, results, fields) {
            connection.release();
            if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
            res.status(200).json({ 'result': 'ok', 'data': results });
        });
    });
};
exports.listService = function (req, res) {
    var id = req.params.id;
    dbsql.mysql.getConnection(function (err, connection) {
        connection.query('SELECT p.idPart, p.namePart, p.description, p.amount, p.price, p.isActive FROM tbl_part p, tbl_part_service ps WHERE p.idPart = ps.part And ps.service = ? ;', id, function (error, results, fields) {
            connection.release();
            if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
            res.status(200).json({ 'result': 'ok', 'data': results });
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
                        res.status(200).json({ 'result': 'ok' });
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
            res.status(200).json({ 'result': 'ok', 'data': result[0] });

        });
    });
};
exports.edit = function (req, res) {
    var id = req.params.id;
    var params = req.body;
    dbsql.mysql.getConnection(function (err, connection) {
        if (params.description == "n/d") {
            params.description = null;
        }
        if (params.price == "0") {
            params.price = null;
        }
        var values = {
            namePart: params.namePart,
            description: params.description,
            amount: params.amount,
            price: params.price
        };
        connection.query('UPDATE tbl_part SET ? WHERE idPart = ?', [values, id], function (error, results, fields) {
            if (error) {
                connection.release(); return res.status(500).json({ 'result': 'nok', 'message': error });
            } else {
                res.status(200).json({ 'result': 'ok' });
            }
        });
    });
};