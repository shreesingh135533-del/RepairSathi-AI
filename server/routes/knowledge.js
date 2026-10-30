const express = require('express');
const router = express.Router();
const { get, all } = require('../db');

// GET /api/categories - List all categories with article counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await all(`
      SELECT c.*, COUNT(kb.id) as article_count
      FROM categories c
      LEFT JOIN knowledge_base kb ON c.slug = kb.category_slug
      GROUP BY c.id
      ORDER BY c.display_order ASC
    `);
    res.json({ categories });
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

// GET /api/knowledge-base - Search & browse articles
router.get('/knowledge-base', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM knowledge_base WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category_slug = ?';
      params.push(category);
    }

    if (search && search.trim() !== '') {
      query += ' AND (problem_title LIKE ? OR symptoms LIKE ? OR keywords LIKE ? OR device_name LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY created_at DESC';

    const articles = await all(query, params);

    // Format json fields
    const formatted = articles.map(art => {
      let steps = [];
      let tools = [];
      try { steps = JSON.parse(art.troubleshooting_steps); } catch { steps = [art.troubleshooting_steps]; }
      try { tools = JSON.parse(art.tools_required); } catch { tools = [art.tools_required]; }
      return {
        ...art,
        troubleshooting_steps: steps,
        tools_required: tools
      };
    });

    res.json({ articles: formatted });
  } catch (error) {
    console.error('Fetch knowledge base error:', error);
    res.status(500).json({ error: 'Failed to retrieve knowledge base articles' });
  }
});

// GET /api/knowledge-base/:id
router.get('/knowledge-base/:id', async (req, res) => {
  try {
    const article = await get('SELECT * FROM knowledge_base WHERE id = ?', [req.params.id]);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    let steps = [];
    let tools = [];
    try { steps = JSON.parse(article.troubleshooting_steps); } catch { steps = [article.troubleshooting_steps]; }
    try { tools = JSON.parse(article.tools_required); } catch { tools = [article.tools_required]; }

    res.json({
      article: {
        ...article,
        troubleshooting_steps: steps,
        tools_required: tools
      }
    });
  } catch (error) {
    console.error('Fetch article error:', error);
    res.status(500).json({ error: 'Failed to retrieve article details' });
  }
});

module.exports = router;
