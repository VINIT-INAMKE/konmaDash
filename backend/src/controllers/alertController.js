import { getAllAlerts, getLowStockSkus, getLowRawIngredients } from '../services/alertService.js';

export const getAlerts = async (req, res) => {
  try {
    const alerts = await getAllAlerts();
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getLowStock = async (req, res) => {
  try {
    const lowStock = await getLowStockSkus();
    res.json({ success: true, data: lowStock });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getLowRaw = async (req, res) => {
  try {
    const lowRaw = await getLowRawIngredients();
    res.json({ success: true, data: lowRaw });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
