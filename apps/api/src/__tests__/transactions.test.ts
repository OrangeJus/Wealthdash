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

  describe('Transfer Antar Dompet dengan Saldo Awal (Bug Fix)', () => {
    it('transfer dari dompet B ke A — saldo awal dipertahankan', async () => {
      // Reproduksi kasus bug user:
      // Dompet A: Rp 200.000, Dompet B: Rp 300.000
      // Transfer Rp 50.000 dari B → A
      // Expected: A = 250.000, B = 250.000
      cleanDatabase();

      // Buat Dompet A dengan saldo awal Rp 200.000
      const walletARes = await request(app)
        .post('/api/wallets')
        .send({ name: 'Dompet A', cluster: 'liquid', balance: 200000 });
      const dompetA = walletARes.body.data.id;
      expect(walletARes.body.data.balance).toBe(200000);

      // Buat Dompet B dengan saldo awal Rp 300.000
      const walletBRes = await request(app)
        .post('/api/wallets')
        .send({ name: 'Dompet B', cluster: 'liquid', balance: 300000 });
      const dompetB = walletBRes.body.data.id;
      expect(walletBRes.body.data.balance).toBe(300000);

      // Transfer Rp 50.000 dari Dompet B ke Dompet A
      const transferRes = await request(app).post('/api/transactions').send({
        date: '2026-06-01',
        type: 'transfer',
        amount: 50000,
        wallet_id: dompetB,
        to_wallet_id: dompetA,
        note: 'Transfer test B ke A',
      });
      expect(transferRes.status).toBe(201);

      // Verifikasi saldo: A harus 250k, B harus 250k
      const checkA = await request(app).get(`/api/wallets/${dompetA}`);
      expect(checkA.body.data.balance).toBe(250000);

      const checkB = await request(app).get(`/api/wallets/${dompetB}`);
      expect(checkB.body.data.balance).toBe(250000);
    });

    it('transfer berulang tidak menimpa saldo', async () => {
      cleanDatabase();

      // Buat Dompet A: Rp 500.000
      const wA = await request(app)
        .post('/api/wallets')
        .send({ name: 'Dompet A', cluster: 'liquid', balance: 500000 });
      const idA = wA.body.data.id;

      // Buat Dompet B: Rp 100.000
      const wB = await request(app)
        .post('/api/wallets')
        .send({ name: 'Dompet B', cluster: 'liquid', balance: 100000 });
      const idB = wB.body.data.id;

      // Transfer 1: 100k dari A → B
      await request(app).post('/api/transactions').send({
        date: '2026-06-01', type: 'transfer', amount: 100000,
        wallet_id: idA, to_wallet_id: idB,
      });

      // A: 500k - 100k = 400k, B: 100k + 100k = 200k
      let checkA = await request(app).get(`/api/wallets/${idA}`);
      expect(checkA.body.data.balance).toBe(400000);
      let checkB = await request(app).get(`/api/wallets/${idB}`);
      expect(checkB.body.data.balance).toBe(200000);

      // Transfer 2: 50k dari B → A
      await request(app).post('/api/transactions').send({
        date: '2026-06-01', type: 'transfer', amount: 50000,
        wallet_id: idB, to_wallet_id: idA,
      });

      // A: 400k + 50k = 450k, B: 200k - 50k = 150k
      checkA = await request(app).get(`/api/wallets/${idA}`);
      expect(checkA.body.data.balance).toBe(450000);
      checkB = await request(app).get(`/api/wallets/${idB}`);
      expect(checkB.body.data.balance).toBe(150000);
    });

    it('⛔ transfer ditolak jika melebihi saldo dompet sumber', async () => {
      cleanDatabase();

      const wA = await request(app)
        .post('/api/wallets')
        .send({ name: 'Dompet A', cluster: 'liquid', balance: 100000 });
      const idA = wA.body.data.id;

      const wB = await request(app)
        .post('/api/wallets')
        .send({ name: 'Dompet B', cluster: 'liquid', balance: 50000 });
      const idB = wB.body.data.id;

      // Transfer 200k dari A (saldo hanya 100k) — harus ditolak
      const res = await request(app).post('/api/transactions').send({
        date: '2026-06-01', type: 'transfer', amount: 200000,
        wallet_id: idA, to_wallet_id: idB,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Saldo dompet tidak mencukupi');

      // Saldo tidak berubah
      const checkA = await request(app).get(`/api/wallets/${idA}`);
      expect(checkA.body.data.balance).toBe(100000);
      const checkB = await request(app).get(`/api/wallets/${idB}`);
      expect(checkB.body.data.balance).toBe(50000);
    });
  });

  describe('Riwayat Transaksi Transfer', () => {
    it('transfer tercatat dalam riwayat transaksi dengan informasi lengkap', async () => {
      const transferRes = await request(app).post('/api/transactions').send({
        date: '2026-06-01',
        type: 'transfer',
        amount: 100000,
        wallet_id: walletId,
        to_wallet_id: walletBId,
        note: 'Pindah dana ke dompet B',
      });
      expect(transferRes.status).toBe(201);

      // Cek data transfer di response
      const tx = transferRes.body.data;
      expect(tx.type).toBe('transfer');
      expect(tx.amount).toBe(100000);
      expect(tx.wallet_id).toBe(walletId);
      expect(tx.to_wallet_id).toBe(walletBId);
      expect(tx.wallet_name).toBe('Dompet Utama');
      expect(tx.to_wallet_name).toBe('Dompet B');
      expect(tx.note).toBe('Pindah dana ke dompet B');
      expect(tx.date).toBe('2026-06-01');

      // Cek transfer muncul di daftar transaksi
      const listRes = await request(app).get('/api/transactions?type=transfer');
      expect(listRes.body.data.transactions.length).toBeGreaterThanOrEqual(1);

      const found = listRes.body.data.transactions.find((t: any) => t.id === tx.id);
      expect(found).toBeDefined();
      expect(found.wallet_name).toBe('Dompet Utama');
      expect(found.to_wallet_name).toBe('Dompet B');
    });
  });
});
