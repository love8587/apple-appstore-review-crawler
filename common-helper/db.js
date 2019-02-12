const knex = require('knex')

module.exports.knex = function (config) {
  return knex(config)
}
