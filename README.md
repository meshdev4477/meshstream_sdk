streaming sdk interface
===

### 2022-03-17 updates
- methods
	-	startRecording
	- finishRecording
- eventListeners
	-	startRecording
	- finishRecording

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
```javascript
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

```javascript
const streamingSdk = new StreamingSdk({ peerId, serverUrl })
```

- createEvent
```javascript
const { success, eventId } = await streamingSdk.createEvent({ title, description, startedAt });
```

- joinEvent
```javascript
await streamingSdk.joinEvent({ eventId });
```
	<p.s.> Instead of returning values, join() triggers one of the eventListeners below:

	(1) join failed: `joinEvent:error`

	(2) join successfully: `joinInfo`

- leave
```
await streamingSdk.leave();
```

- checkStatusByStreamName
```javascript
// isPublished: boolean
const { isPublished } = await streamingSdk.checkStatusByStreamName({ streamName })
```

- publish
```javascript
// type: rtc | file | rtmp | rtsp
// 若 type 為 rtc 以外的，必須填入 options.url
const { success, error } = await streamingSdk.publish({ type, options, streamName, mediaStream });
```

- unpublish 直播
```javascript
const { success, error } = await streamingSdk.unpublish({ streamName })
```

- subscribe 直播
```javascript
const { success, error, mediaStream } = await streamingSdk.subscribe({ streamName })
```

- unsubscribe 直播
```javascript
const { success, error } = await streamingSdk.unsubscribe({ streamName })
```

- record stream
```javascript
const { success, error } = await streamingSdk.startRecording({ streamName })
```

- finish recording stream
```javascript
const { success, error, downloadLink } = await streamingSdk.finishRecording({ streamName, isDownload = true })
// isDownload 為 boolean，表示是否要產生錄影檔（預設為 true，若 false 則等同於放棄錄影）
```
---


# interface - socket
```javascript
// 當有新的 producer 產生時，後端會 broadcast event 給所有人
streamingSdk.on('publishingStream',({ streamName }) => {

})
```

```javascript
// when joining an event fails
streamingSdk.on('joinEvent:error',({ error }) => {
	/*
		possible error messages:
			1. Cannot join because your device does not support webrtc!!
			2. You've already joined an eventId: {eventId}
			3. eventId not found
	*/
})
```

```javascript
// when joining an event successfully
streamingSdk.on('joinInfo',(joinInfo) => {
	/*
		the example value of the joinInfo variable :
			{
				"eventId": "2372893123",
				"title": "1234",
				"description": "1234",
				"startedAt": "2022-03-09T07:58:52.681Z",
				"peerInfo": {
						"peerId": "au1k4bzb"
				}
			}
	*/
})
```

- streamEnded
```javascript
// 當 producer 關閉或者 produce 的人斷線，後端會 broadcast event 給所有人
streamingSdk.on('streamEnded',({ streamName }) => {

})
```

- startRecording
```javascript
// 當某個 stream 被 record 時，後端會 broadcast event 給所有人
streamingSdk.on('startRecording',() => {

})
```
- finishRecording

```javascript
// 當某個 stream 的 recording 結束時，後端會 broadcast event 給所有人
streamingSdk.on('finishRecording',() => {

})
```