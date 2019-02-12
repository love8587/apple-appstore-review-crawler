const debug = require('debug')('appsotre-review-crawler:main')
const envConfig = require('./common-helper/process').getEnvConfig()
const parseString = require('xml2js').parseString
const _ = require('lodash')
const ApiRequester = require('./common-lib/api-requester')

function getAppstoreReviewUrl (id, page) {
  if (!id || !page) {
    throw new Error('required parameter error')
  }

  return `https://itunes.apple.com/kr/rss/customerreviews/page=${page}/id=${id}/sortby=mostrecent/xml`
}

async function insertContentBox (knex, reviewEntry) {
  return new Promise((resolve, reject) => {
    if (!knex || !reviewEntry) {
      return resolve()
    }

    knex.withSchema('summer_main')
    .insert([{
      'appstore_id': reviewEntry.appstore_id || null,
      'appstore_name': reviewEntry.appstore_name || null,
      'review_title': reviewEntry.review_title || null,
      'review_content': reviewEntry.review_content || null,
      'review_rating': reviewEntry.review_rating || null,
      'review_app_version': reviewEntry.review_app_version || null,
      'review_author': reviewEntry.review_author || null,
      'review_updated_at': reviewEntry.review_updated_at || null
    }])
    .into('crawl_appstore_review')
    .then(res => {
      return resolve(res)
    })
    .catch(err => {
      return reject(err)
    })
  })
}

async function requestXml (id, page) {
  return new Promise((resolve, reject) => {
    new ApiRequester().requestApi({
      'url': getAppstoreReviewUrl(id, page),
      'method': 'GET',
      'headers': {}
    }).then(res => {
      let result = res.data.body
      return resolve(result)
    }).catch(err => {
      return reject(err)
    })
  })
}

async function parseXml (xml, option) {
  return new Promise((resolve, reject) => {
    parseString(xml, option, function (err, result) {
      if (err) {
        return reject(err)
      }

      return resolve(result)
    })
  })
}

function getContent (entryRow, key) {
  if (entryRow[key]) {
    return entryRow[key][0]
  }

  try {
    return entryRow['content'][0][key][0]
  } catch (err) {
    console.error(err)
  }

  return null
}

async function startCrawlAppstoreReview (appId, appName, start = 1, end = 100) {
  if (!appId) {
    throw new Error('required parameter error')
  }

  const knex = require('./common-helper/db').knex(envConfig.db.master)

  let totalEntryNo = 0
  let isLast = false
  for (let i = start; i < end; i++) {
    if (isLast) {
      break
    }

    console.log(`App store Review ${i} page loading ...`)
    let curXml = await requestXml(appId, i)

    let option = {
      'trim': true,
      'normalizeTags': true,
      'normalize': true,
      'strict': false
    }

    try {
      let result = await parseXml(curXml, option)

      let links = _.keyBy(result.feed.link, function (o) {
        return o.$.REL
      })

      if (links.next.$.HREF === links.last.$.HREF) {
        isLast = true
      }

      let entLastNo = result.feed.entry.length
      for (let entNo = 1; entNo < entLastNo; entNo++) {
        console.log(`.......... current entry: ${totalEntryNo++}`)

        console.log('result.feed.entry[0] ============> ', result.feed.entry[0])
        console.log('feed.entry.updated ============> ', result.feed.entry[entNo].updated[0])
        console.log('feed.entry.title ============> ', result.feed.entry[entNo].title[0])

        await insertContentBox(knex, {
          'appstore_id': appId,
          'appstore_name': appName,
          'review_title': result.feed.entry[entNo].title[0] || null,
          'review_content': result.feed.entry[entNo].content[0]['_'] || null,
          'review_rating': getContent(result.feed.entry[entNo], 'im:rating') || null,
          'review_app_version': getContent(result.feed.entry[entNo], 'im:version') || null,
          'review_author': getContent(result.feed.entry[entNo], 'author').name[0] || null,
          'review_updated_at': result.feed.entry[entNo].updated[0] || null
        })
        .then(res => {
          console.log('res ============> ', res)
        })
        .catch(err => {
          console.error(err)
        })
      }
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
}

async function convertXmlToDatabase (id, name) {
  console.log(`convertXmlToDatabase START`)
  await startCrawlAppstoreReview(id, name)
}

(async () => {
  // 스타일 닷컴: 1087277474
  // 지그재그: 976131101
  // 에이블리: 1084960428
  // 이마트몰, 티몬, 쿠팡, 위메프, 마켓컬리, 오늘의집, Unpa, 쿠차, 엣지북
  let id = '1267678661'
  let name = '핏츠'
  await convertXmlToDatabase(id, name)
  process.exit(0)
})()
