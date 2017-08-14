var routes = require('../routes/index'),
  auth = require('./auth');

module.exports = function(app) {
  /*Users*/
  app.post('/user', routes.users.create);
  app.get('/user',auth,routes.users.list);
  app.post('/user/desk', routes.users.createDesk);
  app.get('/user/type/:id',auth,routes.users.listtype);
  app.post('/user/employer',auth, routes.users.addEmployer);
  app.put('/user/employer/:id/activity/:opt', auth, routes.users.activityEmployer);
  app.put('/user/employer/:id',auth, routes.users.updateEmployer);
  app.get('/user/employer/:id',auth, routes.users.infoEmployer);
  app.get('/user/employer/type/:id',auth, routes.users.listEmployer);
  app.get('/user/employer/type/:id/:service',auth, routes.users.listEmployerService);
  app.get('/user/:id',auth,routes.users.info);
  app.put('/user/:id', auth, routes.users.update);
  /*Vehicle*/
  app.get('/vehicle',auth,routes.vehicle.list);
  app.put('/vehicle/brand/:id',auth,routes.vehicle.updateBrand);
  app.get('/vehicle/brand/:id',auth,routes.vehicle.infoBrand);
  app.get('/vehicle/brand',auth,routes.vehicle.brand);
  app.post('/vehicle/brand',auth,routes.vehicle.createBrand);
  app.get('/vehicle/:id/user',auth,routes.vehicle.listUser);
  app.post('/vehicle/model',auth,routes.vehicle.createModel);
  app.put('/vehicle/model/:id',auth,routes.vehicle.updateModel);
  app.get('/vehicle/model/:id',auth,routes.vehicle.infoModel);
  app.get('/vehicle/:id/model',auth,routes.vehicle.model);
  app.get('/vehicle/:id/:vehicle',auth,routes.vehicle.info);
  app.get('/vehicle/fuel',auth,routes.vehicle.fuel);
  app.put('/vehicle/:id',auth,routes.vehicle.update);
  app.post('/vehicle/:id',auth,routes.vehicle.create);
  app.post('/vehicle/:id/desk',auth,routes.vehicle.createDesk);

  /*Schedule*/
  app.post('/schedule',auth, routes.schedule.create);
  app.get('/schedule',auth, routes.schedule.list);
  app.get('/schedule/disable/:id',auth,routes.schedule.updateDisable);
  app.get('/schedule/:id',auth,routes.schedule.listUser);
  app.get('/schedule/:id/:schedule',auth,routes.schedule.info);
  /*Service*/
  app.get('/service',routes.service.list);
  app.get('/service/comp',auth,routes.service.listComplete);
  app.post('/service',auth,routes.service.create);
  app.put('/service/:id',auth,routes.service.updateWithPhoto);
  app.put('/service/:id/without',auth,routes.service.updateWithoutPhoto);
  app.get('/service/img/:id',routes.service.getImg);
  app.get('/service/:id',routes.service.info);
  /*Repair*/
  app.get('/repair',auth,routes.repair.list);
  app.get('/repair/:id',auth,routes.repair.listUser);
  app.get('/repair/:id/:repair',auth,routes.repair.info);
  /*Budget*/
  app.get('/budget',auth,routes.budget.list);
  app.get('/budget/:id',auth,routes.budget.listUser);
  app.get('/budget/:id/:budget',auth,routes.budget.info);
  /*Auth*/
  app.post('/login',auth, routes.users.login);

  app.post('/user/:email/active', routes.users.activeUser);
  app.get('/user/:email/active/:token', routes.users.activeUserToken);

  app.post('/user/:email/recovery', routes.users.recoverUser);
  app.put('/user/:email/recovery/:token', routes.users.recoverUserToken);

  app.put('/chpass/:id', auth, routes.users.chpass);

};
