// ===== 全域變數 =====
let bgImg;              // 背景圖檔（雪地）
let walkImg;            // 角色1走路用的精靈圖檔（6張合成）
let hitImg;             // 角色1被擊中/跑步用的精靈圖檔（5張合成）
let jumpImg;            // 角色1跳躍用的精靈圖檔（4張合成）
let eatImg;             // 角色1吃東西用的精靈圖檔（3張合成）
let burgerImg;          // 角色2（漢堡）的圖檔

let walkFrames = 6;     // 走路精靈圖的總張數
let hitFrames = 5;      // hit 精靈圖的總張數
let jumpFrames = 4;     // jump 精靈圖的總張數（圖寬183/4，單張約45.75）
let eatFrames = 3;      // eat 精靈圖的總張數（圖寬94/3，單張約31.33）

let walkFrameW = 241 / 6; // 走路精靈圖單張的寬度（圖寬 241 除以 6 張）
let walkFrameH = 36;    // 走路精靈圖單張的高度
let hitFrameW = 180 / 5;  // hit 精靈圖單張的寬度（180 除以 5 張）
let hitFrameH = 38;     // hit 精靈圖單張的高度
let jumpFrameW = 183 / 4; // jump 精靈圖單張的寬度（183 除以 4 張）
let jumpFrameH = 42;    // jump 精靈圖單張的高度
let eatFrameW = 94 / 3; // eat 精靈圖單張的寬度（94 除以 3 張）
let eatFrameH = 38;     // eat 精靈圖單張的高度

let currentIndex = 0;   // 角色1目前播放到第幾張（從 0 開始）
let animationTimer = 0; // 角色1動畫計時器，用來控制換圖速度
let frameDuration = 8;  // 每張圖持續幾個畫面更新（越小越快）
let facingLeft = false; // 角色1是否面向左邊
let x;                  // 角色1在畫面上的水平位置
let y;                  // 角色1在畫面上的垂直位置
let moveSpeed = 4;      // 角色1移動的速度
let spriteScale = 4;    // 角色1放大倍率，讓角色比較容易看清楚

let isJumping = false;  // 角色1是否正在跳躍中
let spaceHandled = false; // 空白鍵是否已被處理（避免長按重複觸發）

let itemX;              // 角色2（漢堡）的水平位置
let itemY;              // 角色2（漢堡）的垂直位置
let itemW = 90;         // 角色2顯示的寬度（漢堡原圖42x45，放大約2倍多）
let itemH = 96;         // 角色2顯示的高度
let itemSpeed = 5;      // 角色2移動的速度

let isEating = false;   // 角色1是否正在吃東西（碰撞時觸發）

// ===== p5.js 初始化函式，程式啟動時執行一次 =====
function setup() {
  // 產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 載入雪地背景圖
  bgImg = loadImage('雪地.png');
  // 載入走路精靈圖檔（路徑相對於 sketch.js 所在資料夾）
  walkImg = loadImage('walk/walk ALL.png');
  // 載入 hit 精靈圖檔
  hitImg = loadImage('hit/hit ALL.png');
  // 載入 jump 精靈圖檔
  jumpImg = loadImage('jump/jump ALL.png');
  // 載入 eat 精靈圖檔
  eatImg = loadImage('eat/eat ALL.png');
  // 載入漢堡圖檔
  burgerImg = loadImage('漢堡.png');
  // 設定角色1初始位置為畫面中央偏左
  x = width / 2 - 100;
  y = height / 2;
  // 角色2初始位置在角色1右邊 200 像素
  itemX = width / 2 + 100;
  itemY = height / 2;
  // 圖片對齊方式改為中心點，方便置中與翻轉
  imageMode(CENTER);
}

// ===== p5.js 主迴圈，每秒約執行 60 次 =====
function draw() {
  // 每個畫面先用背景圖填滿全螢幕（背景在最下層，先畫）
  image(bgImg, width / 2, height / 2, windowWidth, windowHeight);

  // ===== 角色2（漢堡）：判斷滑鼠按鍵 =====
  if (mouseIsPressed) {
    if (mouseButton === LEFT) {
      // 按滑鼠左鍵：漢堡往左移動
      itemX -= itemSpeed;
    } else if (mouseButton === RIGHT) {
      // 按滑鼠右鍵：漢堡往右移動
      itemX += itemSpeed;
    }
  }

  // ===== 角色1：判斷碰撞（矩形範圍重疊就吃東西）=====
  // 角色1的碰撞範圍：以中心點往外算半寬半高
  let p1Left = x - walkFrameW * spriteScale / 2;
  let p1Right = x + walkFrameW * spriteScale / 2;
  let p1Top = y - walkFrameH * spriteScale / 2;
  let p1Bottom = y + walkFrameH * spriteScale / 2;
  // 角色2的碰撞範圍
  let dLeft = itemX - itemW / 2;
  let dRight = itemX + itemW / 2;
  let dTop = itemY - itemH / 2;
  let dBottom = itemY + itemH / 2;
  // 兩個矩形有重疊就代表碰在一起
  let touching = p1Right > dLeft && p1Left < dRight && p1Bottom > dTop && p1Top < dBottom;
  // 碰在一起時角色1進入吃東西狀態
  isEating = touching;

  // ===== 角色1：判斷鍵盤輸入與狀態 =====
  if (keyIsDown(LEFT_ARROW) && !isJumping) {
    // 設定角色面向左邊
    facingLeft = true;
    // 角色往左移動
    x -= moveSpeed;
    // 使用 hit 動畫（共 5 張）
    animate(hitFrames);
  } else if (keyIsDown(RIGHT_ARROW) && !isJumping) {
    // 按右鍵：角色面向右邊
    facingLeft = false;
    // 角色往右移動
    x += moveSpeed;
    // 使用走路動畫（共 6 張）
    animate(walkFrames);
  } else if (!isJumping) {
    // 沒按任何方向鍵：角色站著不動（只顯示第 1 張）
    currentIndex = 0;
  }

  // ===== 角色1：跳躍處理 =====
  if (isJumping) {
    // 跳躍中播放 jump 動畫（共 4 張），跳完整輪後結束跳躍
    animationTimer++;
    if (animationTimer >= frameDuration) {
      animationTimer = 0; // 歸零計時器
      currentIndex = (currentIndex + 1) % jumpFrames; // 循環播放 jump 的 4 張
      // 播完一輪（回到第 0 張）就結束跳躍
      if (currentIndex === 0) {
        isJumping = false;
      }
    }
  } else if (keyIsPressed && keyCode === 32 && !spaceHandled) {
    // 按下空白鍵（keyCode 32）就開始跳躍
    isJumping = true;
    currentIndex = 0; // 從第 1 張開始播
    animationTimer = 0;
    spaceHandled = true; // 標記已處理，避免長按重複觸發
  }
  // 放開空白鍵後重置旗標，允許下次再跳
  if (!keyIsPressed) {
    spaceHandled = false;
  }

  // ===== 角色1：繪製 =====
  if (isJumping) {
    // ===== 跳躍：使用 jump 精靈圖 =====
    drawSprite(jumpImg, jumpFrameW, jumpFrameH, facingLeft);
  } else if (isEating) {
    // ===== 吃東西：使用 eat 精靈圖 =====
    animate(eatFrames); // 循環播放 eat 的 3 張
    drawSprite(eatImg, eatFrameW, eatFrameH, facingLeft);
  } else if (facingLeft) {
    // ===== 往左跑：使用 hit 精靈圖 =====
    drawSprite(hitImg, hitFrameW, hitFrameH, facingLeft);
  } else {
    // ===== 站立/往右跑：使用走路精靈圖 =====
    drawSprite(walkImg, walkFrameW, walkFrameH, facingLeft);
  }

  // ===== 角色2（漢堡）：繪製 =====
  // 畫出漢堡（原圖已是方正尺寸，直接以中心對齊畫出）
  image(burgerImg, itemX, itemY, itemW, itemH);
}

// ===== 畫角色1的共用函式：畫出指定精靈圖的當前單格 =====
function drawSprite(img, frameW, frameH, flip) {
  push(); // 儲存目前的畫布狀態
  translate(x, y); // 把座標原點移到角色位置
  if (flip) {
    scale(-spriteScale, spriteScale); // 水平翻轉並放大
  } else {
    scale(spriteScale, spriteScale); // 放大角色
  }
  // 計算目前的單格起點座標
  let sx = currentIndex * frameW;
  // 從精靈圖上裁切單格並畫在畫布上（以中心點對齊）
  image(img, 0, 0, frameW, frameH, sx, 0, frameW, frameH);
  pop(); // 還原畫布狀態
}

// ===== 動畫播放函式：傳入總張數，循環推進 currentIndex =====
function animate(totalFrames) {
  // 更新動畫計時器
  animationTimer++;
  // 計時器到達設定值時就換下一張圖
  if (animationTimer >= frameDuration) {
    animationTimer = 0; // 歸零計時器
    currentIndex = (currentIndex + 1) % totalFrames; // 循環播放
  }
}

// ===== 視窗大小改變時，重新設定畫布為全螢幕 =====
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 讓角色保持在畫面中央
  y = height / 2;
  itemY = height / 2;
}
