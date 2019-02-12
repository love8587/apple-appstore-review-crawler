const debug = require('debug')('dcode-serverless:common-lib:api-requester')
const request = require('request')

function _stdResult (message = '', data = {}) {
  return {
    'message': message,
    'data': data
  }
}

class ApiRequester {
  requestApi (apiOption) {
    return new Promise((resolve, reject) => {
      console.log('apiOption ============> ', apiOption)
      request(apiOption, function (err, response, body) {
        if (err) {
          console.error('send event validation sms to user error: ', apiOption, err)
          return reject(err)
        }

        debug('body ============> ', body)

        try {
          if (body && typeof body === 'string') {
            body = JSON.parse(body)
          }

          let code = response.statusCode || body.code
          if (!code || parseInt(code) >= 400) {
            return reject(_stdResult('[ERROR] response code >= 400', {
              'body': body,
              'response.statusCode': response.statusCode
            }))
          }

          return resolve(_stdResult('[SUCCESS] API request', {
            'body': body
          }))
        } catch (e) {
          return resolve(_stdResult('[SUCCESS] API request', {
            'body': body
          }))
        }
      })
    })
  }
}

module.exports = ApiRequester
