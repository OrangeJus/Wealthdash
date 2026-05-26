import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, cleanDatabase } from './setup.js';

describe('Savings API — Deposit & Proteksi Saldo', () => {
  let liquidWalletId: string;
  let savingsWalletId: string;

  beforeEach(async () => {
    cleanDatabase();

    // Buat dompet liquid
    const liquidRes = await request(app)
      .post('/api/wallets')
      .send({ name: 'Dompet Liquid', cluster: 'liquid' });
    liquidWalletId = liquidRes.body.data.id;

    // Buat dompet savings
    const savingsRes = await request(app)
      .post('/api/wallets')
      .send({ name: 'Dompet Tabungan', cluster: 'savings' });
    savingsWalletId = savingsRes.body.data.id;

    // Seed saldo liquid: 500k via income
    await request(app).post('/api/transactions').send({
      date: '2026-05-01',
      type: 'income',
      amount: 500000,
      wallet_id: liquidWalletId,
    });
  });

  describe('POST /api/savings/targets', () => {
    it('membuat target tabungan baru', async () => {
      const res = await request(app).post('/api/savings/targets').send({
        name: 'Dana Darurat',
        monthly_amount: 250000,
      });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Dana Darurat');
      expect(res.body.data.monthly_amount).toBe(250000);
    });

    it('⛔ menolak target dengan monthly_amount <= 0', async () => {
      const res = await request(app).post('/api/savings/targets').send({
        name: 'Target Invalid',
        monthly_amount: 0,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/savings/deposit', () => {
    it('deposit sukses — saldo dompet sumber berkurang', async () => {
      // Buat target dulu
      const targetRes = await request(app).post('/api/savings/targets').send({
        name: 'Dana Darurat',
        monthly_amount: 250000,
      });
      const targetId = targetRes.body.data.id;

      const res = await request(app).post('/api/savings/deposit').send({
        target_id: targetId,
        wallet_id: liquidWalletId,
        amount: 200000,
        type: 'routine',
        period: '2026-05',
      });

      expect(res.status).toBe(201);

      // Cek saldo liquid: 500k - 200k = 300k
      const liquidRes = await request(app).get(`/api/wallets/${liquidWalletId}`);
      expect(liquidRes.body.data.balance).toBe(300000);

      // Cek saldo tabungan: 0 + 200k = 200k
      const savingsRes = await request(app).get(`/api/wallets/${savingsWalletId}`);
      expect(savingsRes.body.data.balance).toBe(200000);
    });

    it('⛔ deposit gagal — saldo kurang', async () => {
      const targetRes = await request(app).post('/api/savings/targets').send({
        name: 'Dana Darurat',
        monthly_amount: 250000,
      });
      const targetId = targetRes.body.data.id;

      const res = await request(app).post('/api/savings/deposit').send({
        target_id: targetId,
        wallet_id: liquidWalletId,
        amount: 1000000, // Saldo cuma 500k
        type: 'routine',
        period: '2026-05',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Saldo dompet tidak mencukupi');

      // Saldo tidak berubah
      const liquidRes = await request(app).get(`/api/wallets/${liquidWalletId}`);
      expect(liquidRes.body.data.balance).toBe(500000);
    });
  });
});
