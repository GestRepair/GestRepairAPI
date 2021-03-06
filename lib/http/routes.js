var routes = require('../routes/index'),
  auth = require('./auth');

module.exports = function (app) {
  /**
   * Users
   */
  app.post('/user', routes.users.create);
  app.get('/user', auth, routes.users.list);
  app.post('/user/desk', routes.users.createDesk);
  app.get('/user/type/:id', auth, routes.users.listtype);
  app.post('/user/employer', auth, routes.users.addEmployer);
  app.put('/user/employer/:id/activity/:opt', auth, routes.users.activityEmployer);
  app.put('/user/employer/:id', auth, routes.users.updateEmployer);
  app.get('/user/employer/:id', auth, routes.users.infoEmployerByUser);
  app.get('/user/employer/type/:id', auth, routes.users.listEmployer);
  app.get('/user/employer/type/:id/:service', auth, routes.users.listEmployerService);
  app.get('/user/employer/service/:id', auth, routes.users.listServiceEmployer);
  app.get('/user/:id', auth, routes.users.info);
  app.put('/user/:id', auth, routes.users.update);
  app.get('/employer/:id', auth, routes.users.infoEmployer);
  /**
   * Vehicle
   */
  app.get('/vehicle', auth, routes.vehicle.list);
  app.post('/vehicle/exists', auth, routes.vehicle.ifVehcleExists);
  app.post('/vehicle/exists/user', auth, routes.vehicle.ifVehcleExistsOwner);
  app.post('/vehicle/exists/user/:id', auth, routes.vehicle.ifVehcleExistsOwnerUser);
  app.post('/vehicle/exists/nuser', auth, routes.vehicle.ifVehcleExistsWithoutOwner);
  app.post('/vehicle/exists/:id', auth, routes.vehicle.addVehicle);
  app.put('/vehicle/exists/:id', auth, routes.vehicle.upVehicle);
  app.put('/vehicle/brand/:id', auth, routes.vehicle.updateBrand);
  app.get('/vehicle/brand/:id', auth, routes.vehicle.infoBrand);
  app.get('/vehicle/brand', auth, routes.vehicle.brand);
  app.post('/vehicle/brand', auth, routes.vehicle.createBrand);
  app.put('/vehicle/disable/desktop', auth, routes.vehicle.disDeskVehicle);
  app.put('/vehicle/disable', auth, routes.vehicle.disVehicle);
  app.put('/vehicle/fuel/:id', auth, routes.vehicle.updateFuel);
  app.get('/vehicle/fuel/:id', auth, routes.vehicle.infoFuel);
  app.put('/vehicle/model/:id', auth, routes.vehicle.updateModel);
  app.get('/vehicle/model/:id', auth, routes.vehicle.infoModel);
  app.get('/vehicle/:id/user', auth, routes.vehicle.listUser);
  app.post('/vehicle/model', auth, routes.vehicle.createModel);
  app.get('/vehicle/:id/model', auth, routes.vehicle.model);
  app.get('/vehicle/:id/:vehicle', auth, routes.vehicle.info);
  app.post('/vehicle/fuel', auth, routes.vehicle.createFuel);
  app.get('/vehicle/fuel', auth, routes.vehicle.fuel);
  app.put('/vehicle/:id', auth, routes.vehicle.update);
  app.post('/vehicle/:id', auth, routes.vehicle.create);
  app.get('/vehicle/:id', auth, routes.vehicle.infoDesk);
  app.post('/vehicle/:id/desk', auth, routes.vehicle.createDesk);
  /**
   * Schedule
   */
  app.post('/schedule', auth, routes.schedule.create);
  app.get('/schedule/next', auth, routes.schedule.listDayNext);
  app.get('/schedule/now', auth, routes.schedule.listDayNow);
  app.get('/schedule/previous', auth, routes.schedule.listDayPrevious);
  app.get('/schedule/days', auth, routes.schedule.listDays);
  app.get('/schedule/days/:id', auth, routes.schedule.listDaysUser);
  app.get('/schedule/now/:id', auth, routes.schedule.listDayNowUser);
  app.get('/schedule/previous/:id', auth, routes.schedule.listDayPreviousUser);
  app.get('/schedule/next/:id', auth, routes.schedule.listDayNextUser);
  app.get('/schedule', auth, routes.schedule.list);
  app.get('/schedule/disable/:id', auth, routes.schedule.updateDisable);
  app.get('/schedule/info/:id', auth, routes.schedule.infoDesk);
  app.get('/schedule/:id', auth, routes.schedule.listUser);
  app.get('/schedule/:id/:schedule', auth, routes.schedule.info);
  /**
   * Service
   */
  app.get('/service/parts/:id', auth ,routes.parts.listPartService);
  app.get('/service/comp', auth, routes.service.listComplete);
  app.post('/service', auth, routes.service.create);
  app.put('/service/:id', auth, routes.service.updateWithPhoto);
  app.put('/service/:id/without', auth, routes.service.updateWithoutPhoto);
  app.get('/service/img/:id', routes.service.getImg);
  app.get('/service/desk/:id', auth,routes.service.infoDesk);
  app.get('/service/:id', routes.service.info);
  app.get('/service', routes.service.list);
  /**
   * Repair
   */
  app.get('/repair/employer/:id/:service', auth, routes.repair.listEmployerNotRepair);
  app.get('/repair/service/:id', auth, routes.repair.listServiceNotRepair);
  app.get('/repair/parts/:id', auth, routes.repair.listParts);
  app.get('/repair/states/complete', auth, routes.repair.listStatesComplete);
  app.get('/repair/states/:id', auth, routes.repair.listByState);
  app.get('/repair/states', auth, routes.repair.listStates);
  app.get('/repair/user/:id', auth, routes.repair.listUser);
  app.get('/repair/user/:id/:repair', auth, routes.repair.infoUser);
  app.post('/repair/employer', auth, routes.repair.addEmployer);
  app.get('/repair/employer/:id', auth, routes.repair.listEmployer);
  app.get('/repair/:id', auth, routes.repair.info);
  app.post('/repair', auth, routes.repair.create);
  app.post('/repair/parts/:id', auth, routes.repair.addPart);
  app.put('/repair/:id', auth, routes.repair.update);
  app.get('/repair', auth, routes.repair.list);
  /**
   * Budget
   */
  app.get('/budget/service/not/:id', auth, routes.budget.listServiceWith);
  app.put('/budget/:id/aprove', auth, routes.budget.updateState);
  app.get('/budget/service/:id', auth, routes.budget.listService);
  app.get('/budget/info/:id', auth, routes.budget.info);
  app.get('/budget/state/complete', auth, routes.budget.listStateComplete);
  app.get('/budget/state/:id', auth, routes.budget.listToState);
  app.get('/budget/state', auth, routes.budget.listState);
  app.get('/budget/:id/:budget', auth, routes.budget.infoUser);
  app.get('/budget/:id', auth, routes.budget.listUser);
  app.put('/budget/:id', auth, routes.budget.update);
  app.post('/budget/part', auth, routes.budget.addService);
  app.post('/budget', auth, routes.budget.create);
  app.get('/budget', auth, routes.budget.list);
  /**
   * Parts
   */
  app.get('/parts/service/zero/:id', auth, routes.parts.listServiceZero);
  app.get('/parts/service/not/:id', auth, routes.parts.listPartNotService);
  app.get('/parts/service/whith', auth, routes.parts.listServiceWithPart);
  app.post('/parts/service/:id', auth, routes.parts.addService);
  app.get('/parts/service/:id', auth, routes.parts.listService);
  app.put('/parts/amount/:id', auth, routes.parts.addAmount);
  app.put('/parts/price/:id', auth, routes.parts.editPrice);
  app.get('/parts/:id', auth, routes.parts.info);
  app.put('/parts/:id', auth, routes.parts.edit);
  app.get('/parts', auth, routes.parts.list);
  app.post('/parts', auth, routes.parts.add);
  /**
   * Auth
   */
  app.post('/login', auth, routes.users.login);

  app.post('/user/:email/active', routes.users.activeUser);
  app.get('/user/:email/active/:token', routes.users.activeUserToken);

  app.post('/user/:email/recovery', routes.users.recoverUser);
  app.put('/user/:email/recovery/:token', routes.users.recoverUserToken);

  app.put('/chpass/:id', auth, routes.users.chpass);
};
