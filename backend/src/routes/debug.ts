import express from 'express';
const router = express.Router();

// Endpoint temporário para debug das variáveis de ambiente MASTER
router.get('/master-env', (req, res) => {
  res.json({
    MASTER_USER: process.env.MASTER_USER || 'masterjr',
    MASTER_PASSWORD: process.env.MASTER_PASSWORD || '12091995'
  });
});

export default router;
