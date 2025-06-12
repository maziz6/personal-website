const { Visitor, VisitorStats } = require('../models/Visitor');

/**
 * Track a new visitor to the site
 */
exports.trackVisitor = async (req, res) => {
  try {
    const { page, referrer, sessionId } = req.body;

    if (!page || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Page and sessionId are required'
      });
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const userAgent = req.get('User-Agent');

    const isDuplicate = await Visitor.exists({
      ipAddress,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const visitor = new Visitor({
      page,
      referrer,
      sessionId,
      ipAddress,
      userAgent
    });

    await visitor.save();

    let stats = await VisitorStats.findOne();
    if (!stats) {
      stats = new VisitorStats({ totalVisitors: 0, uniqueVisitors: 0, pageViews: 0 });
    }

    stats.pageViews += 1;
    if (!isDuplicate) stats.uniqueVisitors += 1;
    stats.totalVisitors += 1;
    stats.lastUpdated = new Date();

    await stats.save();

    res.status(201).json({
      success: true,
      message: 'Visitor tracked',
      data: {
        totalVisitors: stats.totalVisitors,
        uniqueVisitors: stats.uniqueVisitors,
        pageViews: stats.pageViews,
        isNewVisitor: !isDuplicate
      }
    });
  } catch (err) {
    console.error('[❌ Visitor Tracking Error]', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while tracking the visitor'
    });
  }
};

/**
 * Get aggregated visitor statistics
 */
exports.getVisitorStats = async (req, res) => {
  try {
    const stats = await VisitorStats.findOne();

    const defaultStats = {
      totalVisitors: 0,
      uniqueVisitors: 0,
      pageViews: 0,
      lastUpdated: null,
      recentActivity: []
    };

    if (!stats) {
      return res.json({ success: true, data: defaultStats });
    }

    const recentVisitors = await Visitor.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          visitors: { $sum: 1 },
          uniqueIPs: { $addToSet: '$ipAddress' }
        }
      },
      {
        $project: {
          date: '$_id',
          visitors: 1,
          uniqueVisitors: { $size: '$uniqueIPs' }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalVisitors: stats.totalVisitors,
        uniqueVisitors: stats.uniqueVisitors,
        pageViews: stats.pageViews,
        lastUpdated: stats.lastUpdated,
        recentActivity: recentVisitors
      }
    });
  } catch (err) {
    console.error('[❌ Fetch Stats Error]', err);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch visitor statistics'
    });
  }
};
