const { Op } = require('sequelize');

module.exports = function normalizeQueryFilters(filters) {
  if (filters.fromDate !== undefined && filters.toDate !== undefined) {
    filters.date = { [Op.between]: [filters.fromDate, filters.toDate] }
    delete filters.fromDate;
    delete filters.toDate;
  } else if (filters.fromDate !== undefined) {
    filters.date = { [Op.gte ]: filters.fromDate }
    delete filters.fromDate;
  } else if (filters.toDate !== undefined) {
    filters.date = { [Op.lte ]: filters.toDate }
    delete filters.toDate;
  }
  if (filters.note !== undefined) filters.note = { [Op.like]: "%" + filters.note + "%" };
  if (filters.fundID !== undefined) {
    filters[Op.or] = [{ fundID: filters.fundID }, { otherFundID: filters.fundID }]
    delete filters.fundID;
  }
}