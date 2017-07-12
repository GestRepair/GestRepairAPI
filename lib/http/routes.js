var routes = require('../routes/index'),
  auth = require('./auth');

module.exports = function(app) {
  /*Users*/
  app.post('/user', routes.users.create);
  app.get('/user',auth,routes.users.list);
  app.get('/user/:id',auth,routes.users.info);
  app.get('/user/role',auth,routes.users.listrole);
  app.put('/user/:id', auth, routes.users.update);

  /*Vehicle*/
  app.get('/vehicle',auth,routes.vehicle.list);
  app.get('/vehicle/:id/user',auth,routes.vehicle.listUser);
  app.get('/vehicle/:id',auth,routes.vehicle.info);

  /*Service*/
  app.get('/service',routes.service.list);
  app.get('/service/:id',routes.service.info);

  app.post('/login',auth, routes.users.login);

  app.put('/chpass', auth, routes.users.chpass);

};
