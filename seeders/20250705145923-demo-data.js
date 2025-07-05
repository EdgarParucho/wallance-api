'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [{ id: 'demo0|17e80a13x5dc1e726a2ae73' }], {})
    await queryInterface.bulkInsert('funds', [{
      id: 'e90780b3-a464-464b-9073-82ead2dc3dcd',
      name: 'Main',
      balance: 200,
      user_id: 'demo0|17e80a13x5dc1e726a2ae73',
      description: 'Base fund (default for credits).',
      is_default: true
    },
    {
        id: 'e90780b3-a464-464b-9073-82ead2dc3ece',
        name: 'Savings',
        balance: 1500,
        user_id: 'demo0|17e80a13x5dc1e726a2ae73',
        description: 'Mid term savings.',
        is_default: false
      }
    ], {})
    await queryInterface.bulkInsert('records', [{
      id: '9fac9d25-40cd-4741-9c0b-0eef8c8f0dab',
      user_id: 'demo0|17e80a13x5dc1e726a2ae73',
      fund_id: 'e90780b3-a464-464b-9073-82ead2dc3dcd',
      other_fund_id: null,
      date: '2025-01-01 08:14:01+00',
      type: 1,
      amount: 1000,
      note: '',
      tag: 'Salary',
      created_at: '2025-01-01 08:20:01+00',
      updated_at: '2025-01-01 08:20:01+00',
    },
    {
      id: '9fac9d25-40cd-4741-9c0b-0eef8c8f0dac',
      user_id: 'demo0|17e80a13x5dc1e726a2ae73',
      fund_id: 'e90780b3-a464-464b-9073-82ead2dc3dcd',
      other_fund_id: null,
      date: '2025-01-05 08:15:01+00',
      type: 1,
      amount: 1000,
      note: '',
      tag: 'Bonus',
      created_at: '2025-01-05 08:21:01+00',
      updated_at: '2025-01-05 08:21:01+00',
    },
    {
      id: '9fac9d25-40cd-4741-9c0b-0eef8c8f0dad',
      user_id: 'demo0|17e80a13x5dc1e726a2ae73',
      fund_id: 'e90780b3-a464-464b-9073-82ead2dc3dcd',
      other_fund_id: 'e90780b3-a464-464b-9073-82ead2dc3ece',
      date: '2025-01-06 08:15:01+00',
      type: 0,
      amount: -1500,
      note: '',
      tag: 'F2F',
      created_at: '2025-01-06 08:21:01+00',
      updated_at: '2025-01-06 08:21:01+00',
    },
    {
      id: '9fac9d25-40cd-4741-9c0b-0eef8c8f0dae',
      user_id: 'demo0|17e80a13x5dc1e726a2ae73',
      fund_id: 'e90780b3-a464-464b-9073-82ead2dc3dcd',
      other_fund_id: null,
      date: '2025-01-03 08:30:01+00',
      type: 2,
      amount: -200,
      note: 'Rent',
      tag: 'Home',
      created_at: '2025-01-03 09:30:01+00',
      updated_at: '2025-01-03 09:30:01+00',
    },
    {
      id: '9fac9d25-40cd-4741-9c0b-0eef8c8f0daf',
      user_id: 'demo0|17e80a13x5dc1e726a2ae73',
      fund_id: 'e90780b3-a464-464b-9073-82ead2dc3dcd',
      other_fund_id: null,
      date: '2025-01-02 17:30:01+00',
      type: 2,
      amount: -100,
      note: 'Groceries',
      tag: 'Home',
      created_at: '2025-03-03 08:03:01+00',
      updated_at: '2025-03-03 08:03:01+00',
    },

  ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { id: 'demo0|17e80a13x5dc1e726a2ae73' }, {});
  }

};
