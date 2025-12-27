import { getActivityLogs } from '../services/logService.js';

export const getLogs = async (req, res) => {
  try {
    const { category, action, limit, skip } = req.query;
    const result = await getActivityLogs({ category, action, limit, skip });

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
