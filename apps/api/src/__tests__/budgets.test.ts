import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, cleanDatabase } from './setup.js';

describe('Budgets API — Toggle & Auto-Transaction', () => {
  let walletId: string;

  beforeEach(async () => {
    cleanDatabase();

    // Buat dompet liquid dengan saldo (via income)
    const walletRes = await request(app)
      .post('/api/wallets')
      .send({ name: 'Dompet Tagihan', cluster: 'liquid' });
    walletId = walletRes.body.data.id;

    // Seed saldo 500k
    await request(app).post('/api/transactions').send({
      date: '2026-05-01',
      type: 'income',
      amount: 500000,
      wallet_id: walletId,
    });
  });

  describe('POST /api/budgets', () => {
    it('membuat budget tagihan baru', async () => {
      const res = await request(app).post('/api/budgets').send({
        name: 'Internet',
        type: 'wajib',
        estimate: 200000,
        period: '2026-05',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Internet');
      expect(res.body.data.type).toBe('wajib');
    });
  });

  describe('PATCH /api/budgets/:id/toggle', () => {
    it('toggle checklist — saldo cukup: membuat transaksi otomatis', async () => {
      // Buat budget
      const budgetRes = await request(app).post('/api/budgets').send({
        name: 'Listrik',
        type: 'wajib',
        estimate: 200000,
        period: '2026-05',
      });
      const budgetId = budgetRes.body.data.id;

      // Toggle ON (mark as done)
      const toggleRes = await request(app)
        .patch(`/api/budgets/${budgetId}/toggle`)
        .send({ wallet_id: walletId });

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.data.is_done).toBe(1);

      // Cek saldo: 500k - 200k = 300k
      const walletRes = await request(app).get(`/api/wallets/${walletId}`);
      expect(walletRes.body.data.balance).toBe(300000);
    });

    it('⛔ toggle checklist gagal — saldo kurang', async () => {
      // Buat budget dengan estimate lebih dari saldo
      const budgetRes = await request(app).post('/api/budgets').send({
        name: 'Kos Mahal',
        type: 'wajib',
        estimate: 1000000,
        period: '2026-05',
      });
      const budgetId = budgetRes.body.data.id;

      // Toggle — harus gagal
      const toggleRes = await request(app)
        .patch(`/api/budgets/${budgetId}/toggle`)
        .send({ wallet_id: walletId });

      expect(toggleRes.status).toBe(400);
      expect(toggleRes.body.message).toBe('Saldo dompet tidak mencukupi');
    });

    it('un-toggle checklist — mengembalikan saldo', async () => {
      // Buat dan toggle ON
      const budgetRes = await request(app).post('/api/budgets').send({
        name: 'Netflix',
        type: 'langganan',
        estimate: 100000,
        period: '2026-05',
      });
      const budgetId = budgetRes.body.data.id;

      await request(app)
        .patch(`/api/budgets/${budgetId}/toggle`)
        .send({ wallet_id: walletId });

      // Saldo sekarang: 500k - 100k = 400k
      let walletRes = await request(app).get(`/api/wallets/${walletId}`);
      expect(walletRes.body.data.balance).toBe(400000);

      // Toggle OFF (un-mark as done)
      const untoggleRes = await request(app)
        .patch(`/api/budgets/${budgetId}/toggle`)
        .send({});

      expect(untoggleRes.status).toBe(200);
      expect(untoggleRes.body.data.is_done).toBe(0);

      // Saldo dikembalikan: 400k + 100k = 500k
      walletRes = await request(app).get(`/api/wallets/${walletId}`);
      expect(walletRes.body.data.balance).toBe(500000);
    });
  });
});
