// 定義遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
};

const Symbols = [
  "https://cdn-icons-png.flaticon.com/512/1/1438.png", // 黑桃
  "https://cdn-icons-png.flaticon.com/512/138/138533.png", // 愛心
  "https://cdn-icons-png.flaticon.com/512/445/445061.png", // 方塊
  "https://cdn-icons-png.flaticon.com/512/105/105219.png", // 梅花
];
const view = {
  //回傳正面元素
  // 2-4-1
  getCardContent(index) {
    // 定義numbe為view.transformNumber(index / 13 )
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];

    return `
        <p>${number}</p>
        <img src="${symbol}" />
        <p>${number}</p>`;
  },

  //回傳牌背元素
  getCardElement(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];
    return `
      <div data-index="${index}" class="card back">
      </div>`;
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },
  // 傳入已經打散的陣列，去做顯示的動作
  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    console.log(indexes);
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },

  // flipCard(card)
  // flipCard(1, 2, 3, 4, 5)
  // flipCard[1, 2, 3, 4, 5]
  // 2-4-1
  flipCards(...cards) {
    // 展開陣列
    console.log(...cards);
    // 只會顯示數字
    console.log(cards);
    // 遍歷陣列，每張卡片如果是背面的話
    cards.map((card) => {
      if (card.classList.contains("back")) {
        // 移除Class背面效果
        card.classList.remove("back");
        // 翻到正面 this代表指定卡片 (數字)
        card.innerHTML = this.getCardContent(+card.dataset.index);
        return;
      }
      // 把class背面元素加回去
      card.classList.add("back");
      // 刪除正面效果
      card.innerHTML = null;
    });
  },

  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },

  renderScore(score) {
    document.querySelector(".score").textContent = `Score : ${score}`;
  },

  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} time`;
  },

  // 2-7-2 特效
  appendWrongAnimation(...cards) {
    // 變歷每一張卡片
    cards.map((card) => {
      // 增加class CSS效果
      card.classList.add("wrong");
      // 裝上監聽器
      card.addEventListener(
        "animationend",
        (event) => {
          // 動畫執行結束移除class
          card.classList.remove("wrong");
        },
        // 只執行一次  好像是為了提升電腦速度
        {
          once: true,
        }
      );
    });
  },

  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `;
    const header = document.querySelector("#header");
    header.before(div);
  },
};

// 1-3總數洗牌
const utility = {
  getRandomNumberArray(count) {
    // count = 5 => [2, 4, 0, 3, 1]
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    return number;
  },
};

// 2-4-2
const model = {
  // 判斷容器
  revealedCards: [],

  // 配對成功或失敗
  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },

  score: 0,
  triedTimes: 0,
};

// 狀態
const controller = {
  // 初始狀態
  currentState: GAME_STATE.FirstCardAwaits,

  // 1-2 渲染畫面的數量及順序
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },

  // 依照不同的遊戲狀態，做不同的行為

  dispatchCardAction(card) {
    // 2-3 判斷傳入的card class元素有包含back(表示背面)
    if (!card.classList.contains("back")) {
      return;
    }

    // 每個階段
    switch (this.currentState) {
      // 2-4階段一
      case GAME_STATE.FirstCardAwaits:
        // 2-4-1翻第一張卡
        view.flipCards(card);
        // 2-4-2將選取到的卡片加入model.revealedCards 第一張
        model.revealedCards.push(card);
        // 跳到階段二
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;
      case GAME_STATE.SecondCardAwaits:
        // 3-?? 最後增加計分效果
        view.renderTriedTimes(++model.triedTimes);

        // 2-5-1 翻第二張卡
        view.flipCards(card);
        // 2-5-2 將選取到的卡片加入model.revealedCards 第二張
        model.revealedCards.push(card);

        // 2-6下判斷
        if (model.isRevealedCardsMatched()) {
          // 配對正確的話則執行
          // 3-?? 分數增加
          view.renderScore((model.score += 10));
          // 2-6-1 指定階段為配對成功
          this.currentState = GAME_STATE.CardsMatched;
          // 2-6-2 增加背景選取效果(返灰底)
          view.pairCards(...model.revealedCards); //加效果
          // 2-6-3 清空用來判斷的容器
          model.revealedCards = [];
          // 3-?? 當總分達上限時
          if (model.score === 260) {
            console.log("showGameFinished");
            // 階段變最後階段
            this.currentState = GAME_STATE.GameFinished;
            // 顯示最終畫面，並結束function
            view.showGameFinished(); // 加在這裡
            return;
          }
          // 2-6-4 回到第一階段，繼續配對
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          // 2-7如果配對失敗的話

          // 2-7-1模式切換成配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed;
          // 2-7-2加上閃爍特效
          view.appendWrongAnimation(...model.revealedCards);
          // 2-8 設定正面停留時間
          setTimeout(this.resetCards, 1000);
        }
        break;
    }
    console.log("this.currentState", this.currentState);
    console.log(
      "revealedCards",
      model.revealedCards.map((card) => card.dataset.index)
    );
  },

  // 2-8-1
  resetCards() {
    // 顯示目前點選的卡牌陣列
    view.flipCards(...model.revealedCards);
    // 清空配對陣列。((因為配對正確的會加上class))
    model.revealedCards = [];
    // 狀態回到階段一
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
};

// 1-1呼叫頁面
controller.generateCards();

// Node List
// 2-1 卡片群組裡的每張卡片帶上監聽器
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    // view.appendWrongAnimation(card);
    // 2-2掛上翻牌事件
    controller.dispatchCardAction(card);
  });
});
