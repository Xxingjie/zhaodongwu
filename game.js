const animals = {
  bee: { found: "你找到我啦！我是小蜜蜂！", sentence: "我在向日葵旁边找到了小蜜蜂。" },
  squirrel: { found: "你找到我啦！我是小松鼠！", sentence: "我在苹果树后面找到了小松鼠。" },
  rabbit: { found: "你找到我啦！我是小兔子！", sentence: "我在南瓜田旁边找到了小兔子。" }
};

let started = false;
let soundOn = true;
let found = [];

const message = document.querySelector("#message");
const startButton = document.querySelector("#startButton");
const sentenceStrip = document.querySelector("#sentenceStrip");
const sentence = document.querySelector("#sentence");
const hint = document.querySelector("#hint");
const celebration = document.querySelector("#celebration");
const progress = document.querySelector("#progress");
const hotspots = [...document.querySelectorAll(".animal-hotspot")];

function speak(text) {
  if (!soundOn || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.88;
  utterance.pitch = 1.12;
  window.speechSynthesis.speak(utterance);
}

function playVoice(fileName, fallbackText) {
  if (!soundOn) return;
  const audio = new Audio(`audio/${fileName}`);
  audio.addEventListener("error", () => speak(fallbackText), { once: true });
  audio.play().catch(() => speak(fallbackText));
}

function updateProgress() {
  progress.querySelector("b").textContent = `${found.length}/3`;
  progress.setAttribute("aria-label", `已找到 ${found.length} 只小动物`);
  [...progress.querySelectorAll("i")].forEach((dot, index) => dot.classList.toggle("done", index < found.length));
}

startButton.addEventListener("click", () => {
  started = true;
  const intro = "小朋友们，农场里的小动物都藏起来了，请你们仔细看一看，它们在哪里？";
  message.textContent = intro;
  hint.hidden = true;
  startButton.hidden = true;
  sentenceStrip.hidden = false;
  hotspots.forEach((button) => button.disabled = false);
  playVoice("01-game-intro.mp3", intro);
});

hotspots.forEach((button) => button.addEventListener("click", () => {
  const id = button.dataset.animal;
  if (!started || found.includes(id)) return;
  found.push(id);
  button.classList.add("is-found");
  button.disabled = true;
  message.textContent = animals[id].found;
  sentence.textContent = animals[id].sentence;
  updateProgress();
  const voiceFiles = { bee: "02-found-bee.mp3", squirrel: "03-found-squirrel.mp3", rabbit: "04-found-rabbit.mp3" };
  playVoice(voiceFiles[id], animals[id].found);

  if (found.length === 3) {
    const finalMessage = "你们真是善于观察的小朋友，谢谢你们找到了农场里的小帮手！";
    message.textContent = finalMessage;
    setTimeout(() => { celebration.hidden = false; playVoice("05-all-found.mp3", finalMessage); }, 550);
  }
}));

document.querySelector("#soundButton").addEventListener("click", (event) => {
  soundOn = !soundOn;
  event.currentTarget.textContent = soundOn ? "有声" : "静音";
  event.currentTarget.setAttribute("aria-label", soundOn ? "关闭语音" : "打开语音");
  if (!soundOn && "speechSynthesis" in window) window.speechSynthesis.cancel();
});

const guide = document.querySelector("#teacherGuide");
document.querySelector("#guideButton").addEventListener("click", () => guide.hidden = !guide.hidden);
document.querySelector("#closeGuide").addEventListener("click", () => guide.hidden = true);

document.querySelector("#resetButton").addEventListener("click", () => {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  started = false; found = [];
  message.textContent = "准备好了吗？一起去农场找朋友吧！";
  sentence.textContent = "我在______找到了______。";
  celebration.hidden = true; hint.hidden = false; startButton.hidden = false; sentenceStrip.hidden = true;
  hotspots.forEach((button) => { button.classList.remove("is-found"); button.disabled = true; });
  updateProgress();
});
