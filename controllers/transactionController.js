import Transaction from '../models/Transaction.js'
import Instructor from '../models/Instructor.js'

// ─── CREATE TRANSACTION ──────────────────────────────
// POST /api/transactions
export const createTransaction = async (req, res) => {
  try {
    const {
      user,
      course,
      instructor,
      amount,
      status,
      paymentMethod,
      transactionId,
      invoiceUrl,
    } = req.body

    if (!user || !course || !instructor || !amount) {
      return res.status(400).json({ success: false, message: 'User, course, instructor and amount are required' })
    }

    const transaction = await Transaction.create({
      user,
      course,
      instructor,
      amount,
      status: status || 'pending',
      paymentMethod: paymentMethod || 'card',
      transactionId: transactionId || null,
      invoiceUrl: invoiceUrl || null,
    })

    // Instructor totalEarnings update karo
    if (status === 'completed') {
      await Instructor.findByIdAndUpdate(instructor, {
        $inc: { totalEarnings: amount }
      })
    }

    res.status(201).json({ success: true, message: 'Transaction created successfully', transaction })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL TRANSACTIONS ────────────────────────────
// GET /api/transactions
export const getAllTransactions = async (req, res) => {
  try {
    const statusFilter = req.query.status ? { status: req.query.status } : {}
    const instructorFilter = req.query.instructor ? { instructor: req.query.instructor } : {}
    const userFilter = req.query.user ? { user: req.query.user } : {}

    const transactions = await Transaction.find({
      ...statusFilter,
      ...instructorFilter,
      ...userFilter,
    })
      .populate('user', 'firstName lastName email')
      .populate('course', 'title slug thumbnail')
      .populate('instructor', 'bio designation')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, total: transactions.length, transactions })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET TRANSACTION BY ID ───────────────────────────
// GET /api/transactions/:id
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('course', 'title slug thumbnail price')
      .populate('instructor', 'bio designation')

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' })
    }

    res.status(200).json({ success: true, transaction })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE TRANSACTION STATUS ───────────────────────
// PUT /api/transactions/:id
export const updateTransactionStatus = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' })
    }

    const { status } = req.body

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' })
    }

    // Agar completed ho raha hai toh earnings update karo
    if (status === 'completed' && transaction.status !== 'completed') {
      await Instructor.findByIdAndUpdate(transaction.instructor, {
        $inc: { totalEarnings: transaction.amount }
      })
    }

    // Agar refunded ho raha hai toh earnings kam karo
    if (status === 'refunded' && transaction.status === 'completed') {
      await Instructor.findByIdAndUpdate(transaction.instructor, {
        $inc: { totalEarnings: -transaction.amount }
      })
    }

    transaction.status = status
    await transaction.save()

    res.status(200).json({ success: true, message: 'Transaction status updated successfully', transaction })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE TRANSACTION ──────────────────────────────
// DELETE /api/transactions/:id
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' })
    }

    await transaction.deleteOne()

    res.status(200).json({ success: true, message: 'Transaction deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}