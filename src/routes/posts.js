const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const KindnessPost = require('../models/KindnessPost');

// Get all posts
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, type, urgency, status } = req.query;
        const query = {};

        if (type) query.type = type;
        if (urgency) query.urgency = urgency;
        if (status) query.status = status;

        const posts = await KindnessPost.find(query)
            .populate('author', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await KindnessPost.countDocuments(query);

        res.json({
            posts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new post
router.post('/', auth, async (req, res) => {
    try {
        const post = new KindnessPost({
            ...req.body,
            author: req.userId
        });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get a specific post
router.get('/:id', async (req, res) => {
    try {
        const post = await KindnessPost.findById(req.params.id)
            .populate('author', 'name')
            .populate('tags', 'name');
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a post
router.put('/:id', auth, async (req, res) => {
    try {
        const post = await KindnessPost.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }

        Object.assign(post, req.body);
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await KindnessPost.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await post.remove();
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 