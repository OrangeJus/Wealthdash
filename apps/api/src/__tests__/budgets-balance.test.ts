import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, cleanDatabase } from './setup.js';
import db from '../db/connection.js';

describe('Budgets API — Recalculate & Balance Audit Tests', () => {
  let walletId: string;

  beforeEach(async () => {
    cleanDatabase();

    // Create a wallet
    const walletRes = await request(app)
      .post('/api/wallets')
      .send({ name: 'Dompet Utama', cluster: 'liquid' });
    walletId = walletRes.body.data.id;

    // Seed opening balance of 175,000 via income transaction
    await request(app).post('/api/transactions').send({
      date: '2026-06-01',
      type: 'income',
      amount: 175000,
      wallet_id: walletId,
      note: 'Saldo Awal'
    });
  });

  it('Verifikasi: Toggle budget dan buat expense normal (Verifikasi tidak terjadi desync/reset saldo)', async () => {
    // 1. Buat budget item estimate 12k
    const budgetRes = await request(app).post('/api/budgets').send({
      name: 'Makan Siang',
      type: 'wajib',
      estimate: 12000,
      period: '2026-06',
    });
    const budgetId = budgetRes.body.data.id;

    // 2. Toggle budget ON (checklist)
    const toggleRes = await request(app)
      .patch(`/api/budgets/${budgetId}/toggle`)
      .send({ wallet_id: walletId });

    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.data.is_done).toBe(1);

    // Saldo harus berkurang menjadi 163,000 (175k - 12k)
    let walletRes = await request(app).get(`/api/wallets/${walletId}`);
    expect(walletRes.body.data.balance).toBe(163000);

    // 3. Catat expense normal lain sebesar 10k
    // Ini akan memicu recalculateWalletBalance secara otomatis
    const txRes = await request(app).post('/api/transactions').send({
      date: '2026-06-01',
      type: 'expense',
      amount: 10000,
      wallet_id: walletId,
      note: 'Beli Jajan'
    });
    expect(txRes.status).toBe(201);

    // Saldo harus menjadi 153,000 (163k - 10k)
    // Di bawah bug lama, ini akan reset/overwrite saldo karena toggle budget tidak memakai transaksi terintegrasi
    // atau dihitung ulang secara tidak tepat.
    walletRes = await request(app).get(`/api/wallets/${walletId}`);
    expect(walletRes.body.data.balance).toBe(153000);
  });

  it('Verifikasi: Toggle lalu Un-toggle budget mengembalikan saldo dengan tepat', async () => {
    const budgetRes = await request(app).post('/api/budgets').send({
      name: 'Listrik',
      type: 'wajib',
      estimate: 25000,
      period: '2026-06',
    });
    const budgetId = budgetRes.body.data.id;

    // Toggle ON
    await request(app)
      .patch(`/api/budgets/${budgetId}/toggle`)
      .send({ wallet_id: walletId });

    let walletRes = await request(app).get(`/api/wallets/${walletId}`);
    expect(walletRes.body.data.balance).toBe(150000); // 175k - 25k

    // Toggle OFF (un-checklist)
    const untoggleRes = await request(app)
      .patch(`/api/budgets/${budgetId}/toggle`)
      .send({});
    expect(untoggleRes.status).toBe(200);
    expect(untoggleRes.body.data.is_done).toBe(0);

    // Saldo harus kembali ke 175k
    walletRes = await request(app).get(`/api/wallets/${walletId}`);
    expect(walletRes.body.data.balance).toBe(175000);
  });

  it('Verifikasi: Menghapus budget item yang telah di-toggle mengembalikan saldo dengan tepat (refund)', async () => {
    const budgetRes = await request(app).post('/api/budgets').send({
      name: 'Internet',
      type: 'langganan',
      estimate: 50000,
      period: '2026-06',
    });
    const budgetId = budgetRes.body.data.id;

    // Toggle ON
    await request(app)
      .patch(`/api/budgets/${budgetId}/toggle`)
      .send({ wallet_id: walletId });

    let walletRes = await request(app).get(`/api/wallets/${walletId}`);
    expect(walletRes.body.data.balance).toBe(125000); // 175k - 50k

    // Hapus budget item
    const deleteRes = await request(app).delete(`/api/budgets/${budgetId}`);
    expect(deleteRes.status).toBe(200);

    // Saldo harus kembali ke 175k (ter-refund)
    walletRes = await request(app).get(`/api/wallets/${walletId}`);
    expect(walletRes.body.data.balance).toBe(175000);
  });
});
