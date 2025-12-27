process.env.USE_IN_MEMORY_DB = process.env.USE_IN_MEMORY_DB || 'true';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
process.env.AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || 'test-bucket';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../app');
const { connectDB, disconnectDB } = require('../src/config/db');

describe('Creator flows (e2e)', () => {
  let token;
  let seriesId;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('register and login as creator', async () => {
    const email = `creator+${Date.now()}@test.com`;
    const password = 'pass1234';

    const registerRes = await request(app)
      .post('/auth/register')
      .send({ email, password, role: 'creator' })
      .expect(200);

    expect(registerRes.body?.data?.token).toBeTruthy();
    token = registerRes.body.data.token;
  });

  test('create/list series and episodes', async () => {
    const createSeriesRes = await request(app)
      .post('/creator/series')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Series', description: 'Desc', tags: ['test'] })
      .expect(201);

    seriesId = createSeriesRes.body.data._id;
    expect(seriesId).toBeTruthy();

    const listSeriesRes = await request(app)
      .get('/creator/series')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(listSeriesRes.body.data)).toBe(true);

    const createEpisodeRes = await request(app)
      .post(`/creator/series/${seriesId}/episodes`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Ep1', order: 1 })
      .expect(201);

    expect(createEpisodeRes.body.data.title).toBe('Ep1');

    const listEpisodesRes = await request(app)
      .get(`/creator/series/${seriesId}/episodes`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(listEpisodesRes.body.data)).toBe(true);
    expect(listEpisodesRes.body.data[0].title).toBe('Ep1');
  });
});

