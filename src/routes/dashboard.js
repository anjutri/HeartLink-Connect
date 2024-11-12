const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const KindnessPost = require('../models/KindnessPost');

// Get dashboard stats
router.get('/stats', auth, async (req, res) => {
    try {
        const totalActs = await KindnessPost.countDocuments();
        const activeRequests = await KindnessPost.countDocuments({ status: 'OPEN' });
        const completedActs = await KindnessPost.countDocuments({ status: 'COMPLETED' });

        // Get activity data for the last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();

        const activityData = await Promise.all(last7Days.map(async date => {
            const startOfDay = new Date(date);
            const endOfDay = new Date(date);
            endOfDay.setDate(endOfDay.getDate() + 1);

            const newActs = await KindnessPost.countDocuments({
                createdAt: { $gte: startOfDay, $lt: endOfDay }
            });

            const completedOnDay = await KindnessPost.countDocuments({
                status: 'COMPLETED',
                updatedAt: { $gte: startOfDay, $lt: endOfDay }
            });

            return { date, newActs, completedActs: completedOnDay };
        }));

        // Get category distribution
        const categoryData = await KindnessPost.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        res.json({
            totalActs,
            activeRequests,
            completedActs,
            activityData: {
                labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
                newActs: activityData.map(d => d.newActs),
                completedActs: activityData.map(d => d.completedActs)
            },
            categoryData: categoryData.map(cat => ({
                label: cat._id,
                value: cat.count
            }))
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

module.exports = router; 