import ActivityLog from '../models/ActivityLog.js';

/**
 * Log an activity in the system
 * @param {String} action - The action type (from ActivityLog enum)
 * @param {String} category - The category (from ActivityLog enum)
 * @param {String} description - Human-readable description
 * @param {Object} details - Additional details about the action
 * @param {String} performedBy - Who performed the action
 * @param {Object} metadata - Additional metadata
 */
export const logActivity = async (action, category, description, details = {}, performedBy = 'System', metadata = {}) => {
  try {
    const log = new ActivityLog({
      action,
      category,
      description,
      details,
      performedBy,
      metadata
    });
    await log.save();
    return log;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to prevent logging failures from breaking operations
    return null;
  }
};

/**
 * Get activity logs with optional filters
 * @param {Object} filters - Filter options (category, action, limit, skip)
 */
export const getActivityLogs = async (filters = {}) => {
  try {
    const { category, action, limit = 100, skip = 0 } = filters;

    const query = {};
    if (category) query.category = category;
    if (action) query.action = action;

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await ActivityLog.countDocuments(query);

    return {
      success: true,
      data: logs,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete old logs (cleanup utility)
 * @param {Number} daysToKeep - Number of days to keep logs
 */
export const cleanupOldLogs = async (daysToKeep = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await ActivityLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    return {
      success: true,
      deletedCount: result.deletedCount
    };
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
