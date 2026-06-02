import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, cleanDatabase } from './setup.js';

describe('Categories API', () => {
  beforeEach(() => {
    cleanDatabase();
  });

  describe('POST /api/categories', () => {
    it('membuat kategori baru dengan sukses', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'Makanan', type: 'expense', icon: 'restaurant' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Makanan');
      expect(res.body.data.type).toBe('expense');
    });

    it('menolak kategori tanpa nama atau tipe', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ icon: 'restaurant' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('menolak tipe kategori invalid', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'Investasi', type: 'invalid_type' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('menerima logo dengan ukuran <= 5 MB dan format valid', async () => {
      const smallBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'Makanan Halal', type: 'expense', logo_path: smallBase64 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.logo_path).toBe(smallBase64);
    });

    it('menolak logo dengan ukuran > 5 MB', async () => {
      const largeBase64 = 'data:image/png;base64,' + 'A'.repeat(7 * 1024 * 1024);
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'Makanan Mewah', type: 'expense', logo_path: largeBase64 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Ukuran file melebihi batas maksimum 5 MB.');
    });

    it('menolak logo dengan format tidak valid', async () => {
      const invalidFormatBase64 = 'data:application/pdf;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'Dokumen', type: 'expense', logo_path: invalidFormatBase64 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Format gambar tidak didukung. Gunakan PNG, JPG, JPEG, atau SVG.');
    });
  });

  describe('GET /api/categories', () => {
    it('mendapatkan daftar kategori', async () => {
      await request(app).post('/api/categories').send({ name: 'Gaji', type: 'income' });
      await request(app).post('/api/categories').send({ name: 'Belanja', type: 'expense' });

      const res = await request(app).get('/api/categories');

      expect(res.status).toBe(200);
      expect(res.body.data.all).toHaveLength(2);
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('mengupdate nama kategori', async () => {
      const createRes = await request(app)
        .post('/api/categories')
        .send({ name: 'Lama', type: 'expense' });

      const catId = createRes.body.data.id;

      const updateRes = await request(app)
        .put(`/api/categories/${catId}`)
        .send({ name: 'Baru' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.name).toBe('Baru');
    });

    it('menolak update logo > 5 MB', async () => {
      const createRes = await request(app)
        .post('/api/categories')
        .send({ name: 'Lama', type: 'expense' });

      const catId = createRes.body.data.id;
      const largeBase64 = 'data:image/png;base64,' + 'A'.repeat(7 * 1024 * 1024);

      const updateRes = await request(app)
        .put(`/api/categories/${catId}`)
        .send({ logo_path: largeBase64 });

      expect(updateRes.status).toBe(400);
      expect(updateRes.body.success).toBe(false);
      expect(updateRes.body.message).toBe('Ukuran file melebihi batas maksimum 5 MB.');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('menghapus kategori', async () => {
      const createRes = await request(app)
        .post('/api/categories')
        .send({ name: 'Hapus', type: 'expense' });

      const catId = createRes.body.data.id;

      const deleteRes = await request(app).delete(`/api/categories/${catId}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      const getRes = await request(app).get(`/api/categories/${catId}`);
      expect(getRes.status).toBe(404);
    });
  });
});
