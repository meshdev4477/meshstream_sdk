# Meshstream SDK
目前版本為2.1.8


1. Dashboard申請帳號
2. 建立會議兩種形式
3. 會議參數
4. 與會員系統的整合
5. 紀錄
6. SDK Sample
7. Apidoc

* Dashboard申請帳號
  * email
    * 寄信至 : service@meshub.io
    * 必填資訊：公司名稱 email 帳號 姓名
  * change password


* 建立會議兩種形式
  * 立即會議（介面操作，無API）
![立即會議](./asset/立即會議.png)
  * 建立專案預約會議
![預約會議01](./asset/預約會議01.png)
![預約會議02](./asset/預約會議02.png)
  
* 會議參數
  * 個人參數
  * 會議室參數
     * 整合會員系統
     * 介面
     * 推播
![參數](./asset/會議室參數.png)

* Web SDK
  * 直接使用
  透過呼叫Web SDK API 可直接進行操作
    * Step 1: Login : 請參照 apidoc Auth.Login
    * Step 2: Create Project : 請參照 apidoc Project.Create
    * Step 3: Create Room : 請參照 apidoc Room.Create
    * Step 4: Get URL : 請參照 apidoc Room.RoomUrl.Get
    * Step 5: Open URL with Browser : 透過Browseru以及取得的RoomUrl 開啟Meeting Room 
  
  * 以iframe嵌入
  
    可透過iframe 嵌入 Room.RoomUrl 取得的網址，或者是透過Room.Query Room option中的ＵＲＬ，來開啟Meeting Room



* 與會員系統的整合
  * VerifyToken , LoginUI

    在原有的會員系統上增加VerifyToken 機制以及Login UI Page，
    就能夠進行會員系統與Meshstream 的串接。
  ![參數](./apidoc/user_login_meeting_room.svg)
  * Apidoc 詳細說明

    Apidoc :使用時需要先下載(./apidoc/)，再透過瀏覽器開啟./apidoc/index.html
  * 測試時可使用Meshstream會員系統

* 紀錄(今年二月release)
  * 使用者紀錄
  * Token
  * 頻寬使用

* SDK Sample
  * [快速上手版本](./api_sample)
  請參照主流程
  ```
  async function Exec (){

  // Step 1: Login ,須先取得測試帳號
  var token = await Login(userAccount,userPassword)

  // Step 2: Create Room , 須先取得Project ID
  var roomOption = initRoomOption();
  let roomName = "Meeting Room For SDK";


  //會議時間區間為 Now, Now add one hour.
  var duration= new Object();
  var now =new Date();
  duration.begin_time=now.toISOString();
  const end_time = new Date(now);
  end_time.setHours(end_time.getHours() + 1);
  duration.end_time=end_time.toISOString();

  //客製化風格示範
  roomOption.ui.logoUrl="https://meshub.io/static/media/logo.293c4ef3.webp";
  roomOption.ui.primaryColor="#ff0000";

  
  var roomId = await CreateRoom(token,projectId,roomName,roomOption,duration)

  // Step 3: GetRoomUrl，實際流程為客戶端啟動，在這邊實作是為了整體流程展現。
  var url = await GetRoomUrl(token,roomId)

  // Step 4: Launch Room with default Browser，實際流程為客戶端啟動，在這邊實作是為了整體流程展現。
  open(url)

  // Step 5 : Launch Ｒoom with Secondary Browser，實際流程為客戶端啟動，在這邊實作是為了整體流程展現。
  //var roomUrl = "https://conference.meshstream.io/"+roomId;
  //open(roomUrl, {app: {name: 'safari'}});

} 
  ```
  * 步驟：
    * 取得帳號
      * 請先申請帳號，審核通過之後會回覆給您一組密碼。
    * 從Dashboard或API建立專案
    * 從Dashboard或API建立會議室
    * 從活動網頁開啟會議室
    * 身份驗證
    * 取得使用紀錄
* [Apidoc](./apidoc/index.html )
