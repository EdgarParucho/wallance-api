const axios = require("axios").default;

axios.create({
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
})


module.exports = axios;
