import express from 'express'
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransactionStatus,
  deleteTransaction,
} from '../controllers/transactionController.js'

const router = express.Router()

router.post('/', createTransaction)
router.get('/', getAllTransactions)
router.get('/:id', getTransactionById)
router.put('/:id', updateTransactionStatus)
router.delete('/:id', deleteTransaction)

export default router