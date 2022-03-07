streaming sdk interface
===

# User story
## 直播主
- [ ] 發起直播
	- 預先安排 (在預約時間到之前，直播主可啟動開始直播)
	- 立即
- [ ] 選擇視訊來源
	- camera
  - 串流軟體，例如 obs、vMix
- [ ] 可以與他人共同直播 / 拉人互動?
- [ ] 禁止某人使用 chatroom (先前論壇直播有提這個需求)
--- 


<br/>

# Interface - methods (以 web page 前端的角度)

- import sdk 
```javascript=
const {
  StreamingSdk
} = meshstreamSdk
```

<!-- - init device (mediasoup)
```javascript=
const meshDevice = new MeshDevice();
meshDevice.initDevice();
```
 -->
- init streaming sdk

```javascript=
const streamingSdk = new StreamingSdk({ peerId, serverUrl })
```

- publish
```javascript=
// type: RTC | RTSP | RTMP，如果是 RTSP & RTMP，需給 url
const { success, error } = await streamingSdk.publish({ streamName, mediaStream });
```

- unpublish 直播
```javascript=
const { success, error } = await streamingSdk.unpublish({ streamName })
```

- subscribe 直播
```javascript=
const { success, error, mediaStream } = await streamingSdk.subscribe({ streamName })
```

- unsubscribe 直播
```javascript=
const { success, error } = await streamingSdk.unsubscribe({ streamName })
```

---


# interface - socket
```javascript==
// 當有新的 producer 產生時，後端會 broadcast event 給所有人
streamingSdk.on('publishingStream',({ streamName }) => {

})
```

- streamEnded
```javascript==
// 當 producer 關閉或者 produce 的人斷線，後端會 broadcast event 給所有人
streamingSdk.on('streamEnded',({ streamName }) => {

})
```