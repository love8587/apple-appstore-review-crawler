const yaml = require('js-yaml')
const fs = require('fs')
const envConfig = yaml.safeLoad(fs.readFileSync(`./config/service-${process.env.STAGE}.yml`, 'utf8'))
const yargs = require('yargs')

function curEnvStage () {
  return process.env.STAGE || 'dev'
}

function curConfig () {
  return envConfig
}

function argv () {
  return yargs.argv
}

module.exports = {
  getEnvConfig: curConfig,
  curConfig,
  curEnvStage,
  argv
}
