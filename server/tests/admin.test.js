const app = require('../app');
const db = require('../models');

const request = require('supertest');

const server = request(app);

describe('admins', () => {
  afterAll(async () => {
    await db.sequelize.close();
  });
  describe('admins route', () => {
    afterAll(async () => {
      await db.Admin.destroy({truncate: true, cascade: true});
    });

    beforeAll(async () => {
      await db.Admin.destroy({truncate: true, cascade: true});
    });

    beforeEach(async () => {
      await db.Admin.destroy({truncate: true, cascade: true});
    });

    test('should store user data in Admin table', async (done) => {
      const res = await server
        .post(`/admins`)
        .send({email: 'bernardwittgen@hotmail.com', password: 'abcd1234'});
      expect(res.status).not.toBe(404);
      expect(res.status).toBe(201);
      expect(res.body).toEqual({message: 'Admin created but not yet approved'});
      const foundRegistration = await db.Admin.findOne({
        where: {email: 'bernardwittgen@hotmail.com'},
      });
      expect(foundRegistration).not.toBe(null);
      expect(foundRegistration.password).not.toBe('abcd1234');
      expect(foundRegistration.isAdmin).toBe(false);
      done();
    });

    test("should not accept non email email's", async (done) => {
      const res = await server
        .post(`/admins`)
        .send({email: 'bla', password: 'abcd1234'});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        errors: ['email must be a valid email'],
        message: 'Bad request',
      });
      done();
    });

    test('should not set isAdmin to true even when it is part of the request', async (done) => {
      const res = await server.post(`/admins`).send({
        email: 'bernardwittgen@hotmail.com',
        password: 'abcd1234',
        isAdmin: true,
      });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({message: 'Admin created but not yet approved'});
      const foundRegistration = await db.Admin.findOne({
        where: {email: 'bernardwittgen@hotmail.com'},
      });
      expect(foundRegistration).not.toBe(null);
      expect(foundRegistration.isAdmin).toBe(false);
      done();
    });

    test('should not set isAdmin to true even when it is part of the request', async (done) => {
      const admin = await db.Admin.create({
        email: 'bernardwittgen@hotmail.com',
        password: 'abcd1234',
      });
      const res = await server.post(`/admins`).send({
        email: 'bernardwittgen@hotmail.com',
        password: 'abcd1234',
      });
      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        message:
          'This email has already been registered, please wait to be approved',
      });
      done();
    });
  });
});
