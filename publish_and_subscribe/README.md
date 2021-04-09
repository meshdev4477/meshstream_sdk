# meshstream 直播 sdk

## 前置設定
- 引用 sdk 以及其相依套件
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.1/socket.io.js"></script>
<script type="text/javascript" src="client_sdk/client/dist/index.js"></script>
```
- 取得帳號密碼, `[API_URL]`, `[DASHBOARD_URL]` ( 從 meshub 取得 )
- 登入後取得 `[ authorization token ]`
  - 前往登入頁面 （ `[DASHBOARD_URL]`/login ）

    ![](https://i.imgur.com/DSpTrQb.png)

  - 登入成功後點選右上方的 stats 選項，頁面會顯示你的 token，將其複製下來

    ![](https://i.imgur.com/x4vWtqt.png)

- 將 `[ authorization token ]`, `[ API_URL ]` 貼至以下的 function 內

```javascript
async function getSdkConfig(operation, stream){
    const result =  await fetch('[API_URL]', {
        method: "POST",
        body: JSON.stringify({
          operation: operation,
          stream: stream
        }),
        headers: new Headers({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer [authorization token]'
        })
    });

    return result.json();
}
```

## demo code 的執行方式

- cd ./publish_and_subscribe

- run local server ( ex: `php -S localhost:9527` )


## sdk 使用方式

1. 將 stream, operation 帶入 `getSdkConfig(stream, operation)` 並執行該 function，取得其回傳的 sdkConfig

參數格式:

| 參數 | 型別 | 必填 | 說明 |
|  ----  | ----  | ---- | ---- | 
| stream | string | required | stream 的名稱 |
| operation | boolean | required | publish 為 true，subscribe 為 false |


==> 回傳值: 

> getSdkConfig 會根據自己的 ip 位置，在 meshub 的直播網絡中，選擇距離自己最近的 streaming server

- 若為 publish
```json
{
  "config": {
    "stream": "...",
    "token": "...",
    "url": "...",
    "worker": "...",
  } 
}
```
- 若為 subscribe:
```json
{
  "config": {
    "origin": {
      "token": "...",
      "url": "...",
      "worker": "..."
    },
    "stream": "...",
    "token": "...",
    "url": "...",
    "worker": "...",
  } 
}
```

2. 新增一個 ConferenceApi 物件

- 若為 publish
```javascript
const conferenceApi = new ConferenceApi({
  ['audio', 'video'],
  url: sdkConfig.config.url,
  worker: sdkConfig.config.worker,
  stream: sdkConfig.config.stream,
  token: sdkConfig.config.token
});
```

- 若為 subscribe
```javascript
const conferenceApi = new ConferenceApi({
  ['audio', 'video'],
  origin: sdkConfig.config.origin,
  url: sdkConfig.config.url,
  worker: sdkConfig.config.worker,
  stream: sdkConfig.config.stream,
  token: sdkConfig.config.token
});
```

3. 根據原本新增的 conferenceApi，執行 publish 或者 subscribe 

- 若 conferenceApi 為 publish
```javascript
await conferenceApi.publish();
```

- 若 conferenceApi 為 subscribe
```javascript
const mediastream = await conferenceApi.subscribe(); // 取得 remote 的 mediastream
```

4. 取得 audio 和 video 的 stats ( publish 或 subscribe 都有 )

```javascript
conferenceApi.on('getstats', (result) => {
  if(result.kind == 'video'){
    /*...*/
  }

  if(result.kind == 'audio'){
    /*...*/
  }
})
```

5. 取得 remote 的 track ( **只有在 safari 瀏覽器做 subscribe 的時候需要用到** )

```javascript
conferenceApi
  .on('addtrack', (track) => {
    //...
  })
  .on('removetrack', (track) => {
    // ...
  });
```

6. unsubscribe (for subscribe 的 conferenceApi 物件)

```javascript
await conferenceApi.close()
```
