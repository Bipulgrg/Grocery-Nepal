const Order = require('../models/Order');
const Recipe = require('../models/Recipe');

// Get monthly order statistics
const getMonthlyOrderStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          orders: "$count"
        }
      },
      {
        $sort: { month: 1 }
      }
    ]);

    // Convert month numbers to names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedStats = monthlyStats.map(stat => ({
      name: monthNames[stat.month - 1],
      orders: stat.orders
    }));

    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching monthly order stats:', error);
    res.status(500).json({ message: 'Error fetching monthly order statistics' });
  }
};

// Get recipe category statistics
const getRecipeCategoryStats = async (req, res) => {
  try {
    const categoryStats = await Recipe.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: "$count"
        }
      }
    ]);

    res.json(categoryStats);
  } catch (error) {
    console.error('Error fetching recipe category stats:', error);
    res.status(500).json({ message: 'Error fetching recipe category statistics' });
  }
};

module.exports = {
  getMonthlyOrderStats,
  getRecipeCategoryStats
}; 