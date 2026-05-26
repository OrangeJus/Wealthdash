import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, cleanDatabase } from './setup.js';

describe('Transactions API — Proteksi Saldo & Akurasi Kalkulasi', () => {
  let walletId: string;
  let walletBId: string;
  let categoryId: string;

  beforeEach(async () => {
    cleanDatabase();

    // Buat dompet A dengan saldo awal (via income transaction)
    const walletRes = await request(app)
      .post('/api/wallets')
      .send({ name: 'Dompet Utama', cluster: 'liquid' });
    walletId = walletRes.body.data.id;

    // Buat dompet B
    const walletBRes = await request(app)
      .post('/api/wallets')
      .send({ name: 'Dompet B', cluster: 'liquid' });
    walletBId = walletBRes.body.data.id;

    // Buat kategori
    const catRes = await request(app)
      .post('/api/categories')
      .send({ name: 'Makanan', type: 'expense' });
    categoryId = catRes.body.data.id;

    // Seed saldo: income Rp 500.000 ke Dompet Utama
    await request(app).post('/api/transactions').send({
      date: '2026-05-01',
      type: 'income',
      amount: 500000,
      wallet_id: walletId,
    });
  });

  describe('POST /api/transactions — Income', () => {
    it('membuat transaksi pemasukan dan saldo bertambah', async () => {
      const res = await request(app).post('/api/transactions').send({
        date: '2026-05-26',
        type: 'income',
        amount: 200000,
        wallet_id: walletId,
      });

      expect(res.status).toBe(201);

      // Cek saldo: 500k + 200k = 700k
      const walletRes = await request(app).get(`/api/wallets/${walletId}`);
      expect(walletRes.body.data.balance).toBe(700000);
    });
  });

  describe('POST /api/transactions — Expense', () => {
    it('membuat transaksi pengeluaran dan saldo berkurang', async () => {
      const res = await request(app).post('/api/transactions').send({
        date: '2026-05-26',
        type: 'expense',
        amount: 100000,
        category_id: categoryId,
        wallet_id: walletId,
      });

      expect(res.status).toBe(201);

      // Cek saldo: 500k - 100k = 400k
      const walletRes = await request(app).get(`/api/wallets/${walletId}`);
      expect(walletRes.body.data.balance).toBe(400000);
    });

    it('⛔ menolak pengeluaran melebihi saldo (proteksi saldo minus)', async () => {
      const res = await request(app).post('/api/transactions').send({
        date: '2026-05-26',
        type: 'expense',
        amount: 1000000, // Saldo cuma 500k
        category_id: categoryId,
        wallet_id: walletId,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Saldo dompet tidak mencukupi');

      // Pastikan saldo tidak berubah
      const walletRes = await request(app).get(`/api/wallets/${walletId}`);
      expect(walletRes.body.data.balance).toBe(500000);
    });
  });

  describe('POST /api/transactions — Transfer', () => {
    it('transfer antar dompet sukses', async () => {
      const res = await request(app).post('/api/transactions').send({
        date: '2026-05-26',
        type: 'transfer',
        amount: 100000,
        wallet_id: walletId,
        to_wallet_id: walletBId,
      });

      expect(res.status).toBe(201);

      // Dompet A: 500k - 100k = 400k
      const walletARes = await request(app).get(`/api/wallets/${walletId}`);
      expect(walletARes.body.data.balance).toBe(400000);

      // Dompet B: 0 + 100k = 100k
      const walletBRes = await request(app).get(`/api/wallets/${walletBId}`);
      expect(walletBRes.body.data.balance).toBe(100000);
    });

    it('⛔ transfer gagal jika saldo kurang', async () => {
      const res = await request(app).post('/api/transactions').send({
        date: '2026-05-26',
        type: 'transfer',
        amount: 1000000,
        wallet_id: walletId,
        to_wallet_id: walletBId,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Saldo dompet tidak mencukupi');
    });

    it('⛔ transfer ke dompet yang sama ditolak', async () => {
      const res = await request(app).post('/api/transactions').send({
        date: '2026-05-26',
        type: 'transfer',
        amount: 50000,
        wallet_id: walletId,
        to_wallet_id: walletId,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('same wallet');
    });
  });

  describe('Akurasi Kalkulasi Multi-Transaksi', () => {
    it('saldo akhir tepat setelah beberapa transaksi berurutan', async () => {
      // Saldo awal: 500.000 (dari beforeEach)

      // Expense 100k → saldo: 400k
      await request(app).post('/api/transactions').send({
        date: '2026-05-26', type: 'expense', amount: 100000,
        category_id: categoryId, wallet_id: walletId,
      });

      // Expense 150k → saldo: 250k
      await request(app).post('/api/transactions').send({
        date: '2026-05-26', type: 'expense', amount: 150000,
        category_id: categoryId, wallet_id: walletId,
      });

      // Income 50k → saldo: 300k
      await request(app).post('/api/transactions').send({
        date: '2026-05-26', type: 'income', amount: 50000,
        wallet_id: walletId,
      });

      const walletRes = await request(app).get(`/api/wallets/${walletId}`);
      expect(walletRes.body.data.balance).toBe(300000);
    });
  });
});
