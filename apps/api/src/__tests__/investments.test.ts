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

  // ============================================================
  // Cross-cluster transfer: saldo awal dipertahankan (Bug Fix)
  // ============================================================
  describe('Transfer Cross-Cluster — Saldo Awal Dipertahankan', () => {
    it('transfer berulang Dompet → RDN → Dompet — saldo kumulatif benar', async () => {
      // Saldo awal: liquid = 500k (1jt - 500k topup), RDN = 500k

      // Top-up lagi 100k → liquid: 400k, RDN: 600k
      await request(app).post('/api/investments/rdn/topup').send({
        from_wallet_id: liquidWalletId,
        amount: 100000,
      });

      let liquidRes = await request(app).get(`/api/wallets/${liquidWalletId}`);
      expect(liquidRes.body.data.balance).toBe(400000);
      let rdnRes = await request(app).get(`/api/wallets/${rdnWalletId}`);
      expect(rdnRes.body.data.balance).toBe(600000);

      // Withdraw 200k → liquid: 600k, RDN: 400k
      await request(app).post('/api/investments/rdn/withdraw').send({
        to_wallet_id: liquidWalletId,
        amount: 200000,
      });

      liquidRes = await request(app).get(`/api/wallets/${liquidWalletId}`);
      expect(liquidRes.body.data.balance).toBe(600000);
      rdnRes = await request(app).get(`/api/wallets/${rdnWalletId}`);
      expect(rdnRes.body.data.balance).toBe(400000);
    });

    it('Saving → Investment transfer — saldo benar (reproduksi bug user)', async () => {
      cleanDatabase();

      // Buat Saving wallet saldo Rp 1.000.000
      const savRes = await request(app)
        .post('/api/wallets')
        .send({ name: 'Tabungan', cluster: 'savings', balance: 1000000 });
      const savingsId = savRes.body.data.id;
      expect(savRes.body.data.balance).toBe(1000000);

      // Buat Investment wallet saldo Rp 500.000
      const invRes = await request(app)
        .post('/api/wallets')
        .send({ name: 'RDN', cluster: 'investment', balance: 500000 });
      const investId = invRes.body.data.id;
      expect(invRes.body.data.balance).toBe(500000);

      // Transfer Rp 100.000 dari Saving ke Investment (via generic transfer)
      const transferRes = await request(app).post('/api/transactions').send({
        date: '2026-06-01',
        type: 'transfer',
        amount: 100000,
        wallet_id: savingsId,
        to_wallet_id: investId,
        note: 'Transfer Saving ke Investment',
      });
      expect(transferRes.status).toBe(201);

      // Verifikasi: Saving = 900.000, Investment = 600.000
      const checkSav = await request(app).get(`/api/wallets/${savingsId}`);
      expect(checkSav.body.data.balance).toBe(900000);

      const checkInv = await request(app).get(`/api/wallets/${investId}`);
      expect(checkInv.body.data.balance).toBe(600000);
    });

    it('Investment → Saving transfer — saldo benar', async () => {
      cleanDatabase();

      // Buat Investment wallet Rp 800.000
      const invRes = await request(app)
        .post('/api/wallets')
        .send({ name: 'RDN', cluster: 'investment', balance: 800000 });
      const investId = invRes.body.data.id;

      // Buat Saving wallet Rp 200.000
      const savRes = await request(app)
        .post('/api/wallets')
        .send({ name: 'Tabungan', cluster: 'savings', balance: 200000 });
      const savingsId = savRes.body.data.id;

      // Transfer Rp 300.000 dari Investment ke Saving
      const transferRes = await request(app).post('/api/transactions').send({
        date: '2026-06-01',
        type: 'transfer',
        amount: 300000,
        wallet_id: investId,
        to_wallet_id: savingsId,
        note: 'Withdraw Investment ke Saving',
      });
      expect(transferRes.status).toBe(201);

      // Investment = 800k - 300k = 500k
      const checkInv = await request(app).get(`/api/wallets/${investId}`);
      expect(checkInv.body.data.balance).toBe(500000);

      // Saving = 200k + 300k = 500k
      const checkSav = await request(app).get(`/api/wallets/${savingsId}`);
      expect(checkSav.body.data.balance).toBe(500000);
    });
  });

  // ============================================================
  // Buy/Sell dengan saldo konsisten setelah operasi berurutan
  // ============================================================
  describe('Buy/Sell — Konsistensi Saldo Setelah Operasi Berurutan', () => {
    it('topup lalu buy — saldo RDN konsisten', async () => {
      // Saldo awal: liquid = 500k, RDN = 500k (dari beforeEach)

      // Buy saham BBCA: 1 lot × Rp 100/lembar = Rp 10.000
      await request(app).post('/api/investments/buy').send({
        code: 'BBCA', name: 'Bank Central Asia', price: 100, lots: 1,
      });

      // RDN: 500k - 10k = 490k
      let rdnRes = await request(app).get(`/api/wallets/${rdnWalletId}`);
      expect(rdnRes.body.data.balance).toBe(490000);

      // Top-up 100k lagi → liquid: 400k, RDN: 590k
      await request(app).post('/api/investments/rdn/topup').send({
        from_wallet_id: liquidWalletId, amount: 100000,
      });

      rdnRes = await request(app).get(`/api/wallets/${rdnWalletId}`);
      expect(rdnRes.body.data.balance).toBe(590000);

      const liquidRes = await request(app).get(`/api/wallets/${liquidWalletId}`);
      expect(liquidRes.body.data.balance).toBe(400000);
    });

    it('buy lalu sell — saldo RDN kembali benar', async () => {
      // Buy 1 lot BBCA @ 100 → total = 10k, RDN: 500k - 10k = 490k
      const buyRes = await request(app).post('/api/investments/buy').send({
        code: 'BBCA', name: 'Bank Central Asia', price: 100, lots: 1,
      });
      const holdingId = buyRes.body.data.id;

      let rdnRes = await request(app).get(`/api/wallets/${rdnWalletId}`);
      expect(rdnRes.body.data.balance).toBe(490000);

      // Sell @ 150 → total = 15k, RDN: 490k + 15k = 505k
      await request(app).post('/api/investments/sell').send({
        holding_id: holdingId, sell_price: 150,
      });

      rdnRes = await request(app).get(`/api/wallets/${rdnWalletId}`);
      expect(rdnRes.body.data.balance).toBe(505000);
    });
  });
});
