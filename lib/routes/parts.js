var dbsql = require('../../dbsql');

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
        connection.query('SELECT p.idPart, p.namePart, p.description, p.amount, p.price, p.isActive FROM tbl_part p, tbl_part_service ps WHERE p.idPart = ps.part And ps.service = ? ;',id, function (error, results, fields) {
            connection.release();
            if (error) return res.status(500).json({ 'result': 'nok', 'message': error });
            res.status(200).json({ 'result': 'ok', 'data': results });
        });
    });
};