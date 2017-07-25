var routes = require('../routes/index'),
  auth = require('./auth');

module.exports = function(app) {
  /*Users*/
  app.post('/user', routes.users.create);
  app.get('/user',auth,routes.users.list);
  app.get('/user/role',auth,routes.users.listrole);
  app.get('/user/type/:id',auth,routes.users.listtype);
  app.post('/user/employer', routes.users.addEmployer);
  app.get('/user/:id',auth,routes.users.info);
  app.put('/user/:id', auth, routes.users.update);

  /*Vehicle*/
  app.get('/vehicle',auth,routes.vehicle.list);
  app.get('/vehicle/:id/user',auth,routes.vehicle.listUser);
  app.get('/vehicle/:id/model',auth,routes.vehicle.model);
  app.get('/vehicle/:id/:vehicle',auth,routes.vehicle.info);
  app.get('/vehicle/brand',auth,routes.vehicle.brand);
  app.get('/vehicle/fuel',auth,routes.vehicle.fuel);
  app.post('/vehicle/:id',auth,routes.vehicle.create);

  /*Schedule*/
  app.post('/schedule',auth, routes.schedule.create);
  app.get('/schedule/disable/:id',auth,routes.schedule.updateDisable);
  app.get('/schedule/:id',auth,routes.schedule.listUser);
  app.get('/schedule/:id/:schedule',auth,routes.schedule.info);
  /*Service*/
  app.get('/service',routes.service.list);
  app.post('/service',auth,routes.service.createUser);
  app.get('/service/:id',routes.service.info);
  /*Repair*/
  app.get('/repair/:id',auth,routes.repair.listUser);
  app.get('/repair/:id/:repair',auth,routes.repair.info);

  /*Budget*/
  app.get('/budget/:id',auth,routes.budget.listUser);
  app.get('/budget/:id/:budget',auth,routes.budget.info);

  app.post('/login',auth, routes.users.login);

  app.post('/user/:email/active', routes.users.activeUser);
  app.get('/user/:email/active/:token', routes.users.activeUserToken);

  app.post('/user/:email/recovery', routes.users.recoverUser);
  app.put('/user/:email/recovery/:token', routes.users.recoverUserToken);


  app.put('/chpass/:id', auth, routes.users.chpass);

};
