const { Op } = require('sequelize');

module.exports = function normalizeQueryFilters(filters) {
  if (filters.fromDate !== undefined && filters.toDate !== undefined) setDateRange(filters);
  else if (filters.fromDate !== undefined) setDateFrom(filters);
  else if (filters.toDate !== undefined) setDateTo(filters);
  if (filters.note !== undefined) useLikeOperator(filters);
  if (filters.fundID !== undefined) setBothFundsFilter(filters);
  console.log(filters);
}

function setDateRange(filters) {
  filters.date = { [Op.between]: [filters.fromDate, filters.toDate] }
  delete filters.fromDate;
  delete filters.toDate;
}

function setDateFrom(filters) {
  filters.date = { [Op.gte ]: filters.fromDate }
  delete filters.fromDate;
}

function setDateTo(filters) {
  filters.date = { [Op.lte ]: filters.toDate }
  delete filters.toDate;
}

function useLikeOperator(filters) {
  filters.note = { [Op.like]: "%" + filters.note + "%" };
}

function setBothFundsFilter(filters) {
  filters[Op.or] = [{ fundID: filters.fundID }, { otherFundID: filters.fundID }]
  delete filters.fundID;
}