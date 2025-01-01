import express from 'express';
import { createStripePaymentIntent, createTransaction, listTransactions } from '../controllers/transactionController';

const router = express.Router();


router.post("/stripe/payment-intent", createStripePaymentIntent)
router.post("/", createTransaction)
router.get("/", listTransactions)

export default router;