import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, cleanDatabase } from './setup.js';

describe('Investments API — Beli/Jual Saham & RDN Protection', () => {
  let liquidWalletId: string;
  let rdnWalletId: string;

  beforeEach(async () => {
    cleanDatabase();

    // Buat dompet liquid
    const liquidRes = await request(app)
      .post('/api/wallets')
      .send({ name: 'Dompet Liquid', cluster: 'liquid' });
    liquidWalletId = liquidRes.body.data.id;

    // Buat dompet investment (RDN)
    const rdnRes = await request(app)
      .post('/api/wallets')
      .send({ name: 'RDN BCA Sekuritas', cluster: 'investment' });
    rdnWalletId = rdnRes.body.data.id;

    // Seed saldo liquid 1jt via income
    await request(app).post('/api/transactions').send({
      date: '2026-05-01',
      type: 'income',
      amount: 1000000,
      wallet_id: liquidWalletId,
    });

    // Top-up RDN 500k dari liquid
    await request(app).post('/api/investments/rdn/topup').send({
      from_wallet_id: liquidWalletId,
      amount: 500000,
    });
  });

  describe('POST /api/investments/buy', () => {
    it('beli saham sukses — saldo RDN berkurang', async () => {
      const res = await request(app).post('/api/investments/buy').send({
        code: 'BBCA',
        name: 'Bank Central Asia',
        price: 100, // Rp 100 per lembar
        lots: 1,    // 1 lot = 100 lembar → total = Rp 10.000
      });

      expect(res.status).toBe(201);
      expect(res.body.data.code).toBe('BBCA');

      // Cek saldo RDN: 500k - 10k = 490k
      const rdnRes = await request(app).get(`/api/wallets/${rdnWalletId}`);
      expect(rdnRes.body.data.balance).toBe(490000);
    });

    it('⛔ beli saham gagal — saldo RDN kurang', async () => {
      const res = await request(app).post('/api/investments/buy').send({
        code: 'BBRI',
        name: 'Bank Rakyat Indonesia',
        price: 5000,
        lots: 10, // 10 lot * 100 lembar * 5000 = 5jt (saldo cuma 500k)
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Saldo dompet tidak mencukupi');
    });

    it('⛔ beli saham gagal — harga/lot <= 0', async () => {
      const res = await request(app).post('/api/investments/buy').send({
        code: 'BBCA',
        name: 'Test',
        price: 0,
        lots: 1,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Harga dan jumlah lot harus lebih besar dari 0');
    });
  });

  describe('POST /api/investments/rdn/topup', () => {
    it('top-up RDN sukses', async () => {
      // Saldo liquid saat ini: 1jt - 500k (topup sebelumnya) = 500k
      const res = await request(app).post('/api/investments/rdn/topup').send({
        from_wallet_id: liquidWalletId,
        amount: 200000,
      });

      expect(res.status).toBe(200);

      // Cek saldo liquid: 500k - 200k = 300k
      const liquidRes = await request(app).get(`/api/wallets/${liquidWalletId}`);
      expect(liquidRes.body.data.balance).toBe(300000);

      // Cek saldo RDN: 500k + 200k = 700k
      const rdnRes = await request(app).get(`/api/wallets/${rdnWalletId}`);
      expect(rdnRes.body.data.balance).toBe(700000);
    });

    it('⛔ top-up RDN gagal — saldo sumber kurang', async () => {
      const res = await request(app).post('/api/investments/rdn/topup').send({
        from_wallet_id: liquidWalletId,
        amount: 5000000, // Saldo cuma 500k
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Saldo dompet tidak mencukupi');
    });

    it('⛔ top-up RDN gagal — nominal <= 0', async () => {
      const res = await request(app).post('/api/investments/rdn/topup').send({
        from_wallet_id: liquidWalletId,
        amount: -1,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Nominal top-up harus lebih besar dari 0');
    });
  });

  describe('POST /api/investments/rdn/withdraw', () => {
    it('withdraw RDN sukses', async () => {
      const res = await request(app).post('/api/investments/rdn/withdraw').send({
        to_wallet_id: liquidWalletId,
        amount: 100000,
      });

      expect(res.status).toBe(200);

      // Cek saldo RDN: 500k - 100k = 400k
      const rdnRes = await request(app).get(`/api/wallets/${rdnWalletId}`);
      expect(rdnRes.body.data.balance).toBe(400000);

      // Cek saldo liquid: 500k + 100k = 600k
      const liquidRes = await request(app).get(`/api/wallets/${liquidWalletId}`);
      expect(liquidRes.body.data.balance).toBe(600000);
    });

    it('⛔ withdraw RDN gagal — melebihi saldo', async () => {
      const res = await request(app).post('/api/investments/rdn/withdraw').send({
        to_wallet_id: liquidWalletId,
        amount: 10000000, // Saldo RDN cuma 500k
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Saldo dompet tidak mencukupi');
    });
  });
});
