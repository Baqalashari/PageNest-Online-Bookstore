const request = require('supertest');
const app = require('../server/server');

describe('Sprint 2 Catalog Verification Tests', () => {
  it('Should reject unauthenticated requests to admin endpoints', async () => {
    const res = await request(app).get('/api/v1/admin/products');
    expect(res.statusCode).toEqual(401);
  });

  it('Should prevent duplicate product slug creation', async () => {
    const res = await request(app)
      .post('/api/v1/admin/products')
      .set('Authorization', 'Bearer valid_admin_jwt')
      .send({
        name: 'Clean Code Duplicate',
        slug: 'clean-code',
        category_id: 1
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.code).toEqual('DUPLICATE_SLUG');
  });

  it('Should prevent negative stock assignment on SKUs', async () => {
    const res = await request(app)
      .post('/api/v1/admin/products/1/skus')
      .set('Authorization', 'Bearer valid_admin_jwt')
      .send({
        variant_id: 1,
        sku_code: 'TEST-SKU-NEG',
        price: 19.99,
        stock_quantity: -5
      });
    expect(res.statusCode).toEqual(400);
  });
});
