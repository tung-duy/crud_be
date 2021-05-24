const {
  roleController,
  userController,
  customerController
} = require("../api/controllers");

function router(app) {
  app.get("/users", userController.userList);
  app.post("/users", userController.signUp);
  app.put("/users", userController.userUpdate);
  app.delete("/users/:id", userController.userDelete);

  app.get("/roles", roleController.getRolles);
  app.post("/roles", roleController.addRole);

  app.get("/", (req, res, next) => {
    userController.index(req, res, next);
  }),
    app.post("/add-user", (req, res, next) => {
      userController.addUser(req, res, next);
    }),
    app.get("/get-data-customer", (req, res, next) => {
      customerController.getAllCustomer(req, res, next);
    }),
    app.post("/add-customer", (req, res, next) => {
      customerController.addCustomer(req, res, next);
    }),
    app.delete("/delete-customer", (req, res, next) => {
      customerController.deleteCustomer(req, res, next);
    });
}

module.exports = router;
