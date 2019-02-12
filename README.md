# apple-appstore-review-crawler

담당자 : Steve (백병한)

이메일 : byeonghan.baek@gmail.com

## How to find out the store ID of app
1. 구글에서 '지그재그 앱스토어' 라고 검색
2. Apple App Store 링크 클릭
3. 해당 URL 에서 ID 추출 
- 예) https://itunes.apple.com/kr/app/%EC%A7%80%EA%B7%B8%EC%9E%AC%EA%B7%B8-%EC%97%AC%EC%84%B1%EC%87%BC%ED%95%91%EB%AA%B0-%EB%AA%A8%EC%9D%8C/id976131101?mt=8
인 경우 아이디는 **976131101**

## Config

```yml
env:
  debug: '*'
  SLACK_HOST: "https://slack.com/api/chat.postMessage"
  SLACK_TOKEN: ""
  SLACK_CHANNEL: ""
  SLACK_BOT_TOKEN: ""
db:
  master:
    client: mysql
    connection:
      host: localhost
      port: 3306
      user: summer
      password: "password"
      database: main
      dateStrings: TIMESTAMP
      charset: utf8mb4_bin
    pool:
      min: 0
      max: 1
    acquireConnectionTimeout: 60000


```

## DB Scheme

```sql
create table crawl_appstore_review
(
    id int auto_increment
        primary key,
    appstore_id varchar(70) null,
    appstore_name varchar(50) null,
    review_author varchar(20) charset utf8 null,
    review_title varchar(100) charset utf8 null,
    review_content text charset utf8 null,
    review_rating int(5) null,
    review_app_version varchar(15) charset utf8 null,
    review_updated_at timestamp null,
    created_at timestamp default CURRENT_TIMESTAMP not null
)
charset=utf8mb4
```