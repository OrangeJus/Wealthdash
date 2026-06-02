import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, cleanDatabase } from './setup.js';

describe('Wallets API', () => {
  beforeEach(() => {
    cleanDatabase();
  });

  describe('POST /api/wallets', () => {
    it('membuat dompet baru dengan sukses', async () => {
      const res = await request(app)
        .post('/api/wallets')
        .send({ name: 'GoPay', cluster: 'liquid', balance: 100000 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('GoPay');
      expect(res.body.data.cluster).toBe('liquid');
      expect(res.body.data.balance).toBe(100000);
    });

    it('menolak dompet tanpa nama', async () => {
      const res = await request(app)
        .post('/api/wallets')
        .send({ cluster: 'liquid' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('menolak cluster invalid', async () => {
      const res = await request(app)
        .post('/api/wallets')
        .send({ name: 'Test', cluster: 'unknown' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('menerima logo dengan ukuran <= 5 MB dan format valid', async () => {
      const smallBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const res = await request(app)
        .post('/api/wallets')
        .send({ name: 'GoPay Valid Logo', cluster: 'liquid', logo_path: smallBase64 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.logo_path).toBe(smallBase64);
    });

    it('menolak logo dengan ukuran > 5 MB', async () => {
      const largeBase64 = 'data:image/png;base64,' + 'A'.repeat(7 * 1024 * 1024);
      const res = await request(app)
        .post('/api/wallets')
        .send({ name: 'GoPay Large Logo', cluster: 'liquid', logo_path: largeBase64 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Ukuran file melebihi batas maksimum 5 MB.');
    });

    it('menolak logo dengan format tidak valid', async () => {
      const invalidFormatBase64 = 'data:application/pdf;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const res = await request(app)
        .post('/api/wallets')
        .send({ name: 'GoPay Invalid Format', cluster: 'liquid', logo_path: invalidFormatBase64 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Format gambar tidak didukung. Gunakan PNG, JPG, JPEG, atau SVG.');
    });
  });

  describe('GET /api/wallets', () => {
    it('mendapatkan daftar dompet', async () => {
      // Buat 2 dompet
      await request(app).post('/api/wallets').send({ name: 'Dompet A', cluster: 'liquid' });
      await request(app).post('/api/wallets').send({ name: 'Dompet B', cluster: 'savings' });

      const res = await request(app).get('/api/wallets');

      expect(res.status).toBe(200);
      expect(res.body.data.wallets).toHaveLength(2);
    });
  });

  describe('PUT /api/wallets/:id', () => {
    it('mengupdate nama dompet', async () => {
      const createRes = await request(app)
        .post('/api/wallets')
        .send({ name: 'Nama Lama', cluster: 'liquid' });

      const walletId = createRes.body.data.id;

      const updateRes = await request(app)
        .put(`/api/wallets/${walletId}`)
        .send({ name: 'Nama Baru' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.name).toBe('Nama Baru');
    });
  });

  describe('DELETE /api/wallets/:id', () => {
    it('menolak hapus dompet yang punya transaksi', async () => {
      // Buat dompet dengan saldo
      const walletRes = await request(app)
        .post('/api/wallets')
        .send({ name: 'Dompet Hapus', cluster: 'liquid', balance: 500000 });
      const walletId = walletRes.body.data.id;

      // Buat kategori untuk transaksi
      const catRes = await request(app)
        .post('/api/categories')
        .send({ name: 'Gaji', type: 'income' });
      const catId = catRes.body.data.id;

      // Buat transaksi di dompet ini
      await request(app).post('/api/transactions').send({
        date: '2026-05-26',
        type: 'income',
        amount: 100000,
        category_id: catId,
        wallet_id: walletId,
      });

      // Coba hapus — harus ditolak
      const deleteRes = await request(app).delete(`/api/wallets/${walletId}`);
      expect(deleteRes.status).toBe(409);
      expect(deleteRes.body.success).toBe(false);
    });
  });
});
