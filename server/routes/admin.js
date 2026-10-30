const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const { run, get, all } = require('../db');
const { authenticateToken, requireAdmin } = require('./auth');

// All admin routes require admin authentication
router.use(authenticateToken, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = (await get('SELECT COUNT(*) as count FROM users')).count;
    const totalQueries = (await get('SELECT COUNT(*) as count FROM conversations')).count;
    const totalMessages = (await get('SELECT COUNT(*) as count FROM messages')).count;
    const totalKbArticles = (await get('SELECT COUNT(*) as count FROM knowledge_base')).count;
    const totalFeedback = (await get('SELECT COUNT(*) as count FROM feedback')).count;
    const incorrectReports = (await get('SELECT COUNT(*) as count FROM feedback WHERE is_incorrect_report = 1')).count;

    const avgRatingRow = await get('SELECT AVG(rating) as avg_rating FROM feedback WHERE rating > 0');
    const avgRating = avgRatingRow && avgRatingRow.avg_rating ? parseFloat(avgRatingRow.avg_rating).toFixed(1) : '4.8';

    // Queries categorized by device category
    const categoryStats = await all(`
      SELECT c.name as category_name, c.slug, COUNT(conv.id) as query_count
      FROM categories c
      LEFT JOIN conversations conv ON c.slug = conv.category_slug
      GROUP BY c.id
      ORDER BY query_count DESC
    `);

    // Recent activity queries
    const recentQueries = await all(`
      SELECT conv.id, conv.title, conv.category_slug, conv.device_name, conv.created_at, u.name as user_name
      FROM conversations conv
      LEFT JOIN users u ON conv.user_id = u.id
      ORDER BY conv.created_at DESC
      LIMIT 10
    `);

    // AI Status
    const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
    const aiConfigured = Boolean(apiKey && apiKey !== 'YOUR_GEMINI_API_KEY' && apiKey.trim() !== '');

    res.json({
      stats: {
        totalUsers,
        totalQueries,
        totalMessages,
        totalKbArticles,
        totalFeedback,
        incorrectReports,
        avgRating,
        aiConfigured,
        aiModel: aiConfigured ? 'Gemini 1.5 Flash (Cloud API)' : 'RepairSathi Smart Knowledge Engine (Safe Local Mode)'
      },
      categoryStats,
      recentQueries
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve admin statistics' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await all('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (req.user.id === req.params.id && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot demote your own admin account' });
    }

    await run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: `User role updated to ${role}` });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }

    await run('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /api/admin/feedback
router.get('/feedback', async (req, res) => {
  try {
    const feedbackList = await all(`
      SELECT f.*, u.name as user_name, u.email as user_email, c.title as conversation_title
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      LEFT JOIN conversations c ON f.conversation_id = c.id
      ORDER BY f.created_at DESC
    `);
    res.json({ feedback: feedbackList });
  } catch (error) {
    console.error('Fetch feedback error:', error);
    res.status(500).json({ error: 'Failed to retrieve user feedback' });
  }
});

// Knowledge Base Admin CRUD
// POST /api/admin/knowledge-base
router.post('/knowledge-base', async (req, res) => {
  try {
    const {
      category_slug, device_name, problem_title, keywords, symptoms,
      possible_causes, troubleshooting_steps, tools_required, difficulty,
      estimated_cost_range, safety_warning, professional_recommended
    } = req.body;

    if (!category_slug || !problem_title || !troubleshooting_steps) {
      return res.status(400).json({ error: 'Category, problem title and troubleshooting steps are required' });
    }

    const id = randomUUID();
    await run(
      `INSERT INTO knowledge_base (
        id, category_slug, device_name, problem_title, keywords, symptoms,
        possible_causes, troubleshooting_steps, tools_required, difficulty,
        estimated_cost_range, safety_warning, professional_recommended
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, category_slug, device_name || 'Generic Device', problem_title,
        keywords || '', symptoms || '', possible_causes || '',
        Array.isArray(troubleshooting_steps) ? JSON.stringify(troubleshooting_steps) : troubleshooting_steps,
        Array.isArray(tools_required) ? JSON.stringify(tools_required) : tools_required,
        difficulty || 'Moderate', estimated_cost_range || '₹300 - ₹1,200',
        safety_warning || '', professional_recommended ? 1 : 0
      ]
    );

    res.status(201).json({ message: 'Knowledge base article added', id });
  } catch (error) {
    console.error('Add KB article error:', error);
    res.status(500).json({ error: 'Failed to add article' });
  }
});

// DELETE /api/admin/knowledge-base/:id
router.delete('/knowledge-base/:id', async (req, res) => {
  try {
    await run('DELETE FROM knowledge_base WHERE id = ?', [req.params.id]);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete KB article error:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

module.exports = router;
