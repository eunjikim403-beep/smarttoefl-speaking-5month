const practiceSets = [
  {
    title: "Listen and Repeat 1",
    mode: "Listen and Repeat",
    topic: "Hotel check-in and services",
    scenario: "You are listening to instructions at a hotel. Listen to each sentence and repeat it clearly.",
    instruction: "Listen to each sentence and repeat what the speaker says.",
    note: "Directions를 먼저 들은 뒤, 1-7번 문장을 하나씩 듣고 따라 말하세요.",
    responseSeconds: 12,
    directionAudio: "audio/practice-test-3-listen-repeat/directions.ogg",
    items: [
      {
        label: "Sentence 1",
        audio: "audio/practice-test-3-listen-repeat/sentence-1.ogg",
        text: "Welcome. Let's get started and check you in.",
      },
      {
        label: "Sentence 2",
        audio: "audio/practice-test-3-listen-repeat/sentence-2.ogg",
        text: "There is a reception desk over here for you.",
      },
      {
        label: "Sentence 3",
        audio: "audio/practice-test-3-listen-repeat/sentence-3.ogg",
        text: "The elevators are located just off the main lobby.",
      },
      {
        label: "Sentence 4",
        audio: "audio/practice-test-3-listen-repeat/sentence-4.ogg",
        text: "Our hotel lounge is available for relaxation.",
      },
      {
        label: "Sentence 5",
        audio: "audio/practice-test-3-listen-repeat/sentence-5.ogg",
        text: "If needed, we can store your bags in the luggage storage room.",
      },
      {
        label: "Sentence 6",
        audio: "audio/practice-test-3-listen-repeat/sentence-6.ogg",
        text: "Our amenities and services are listed on the notice boards throughout the building.",
      },
      {
        label: "Sentence 7",
        audio: "audio/practice-test-3-listen-repeat/sentence-7.ogg",
        text: "To avoid being charged a late departure fee, be sure to check out of your room on time.",
      },
    ],
  },
  {
    title: "Take an Interview 1",
    mode: "Take an Interview",
    topic: "Social media",
    scenario: "You are participating in a research study about how people use social media.",
    instruction: "Listen to each interview question and speak for up to 45 seconds.",
    note: "Directions를 먼저 들은 뒤, 1-4번 인터뷰 질문에 각각 답변하세요.",
    responseSeconds: 45,
    directionAudio: "audio/practice-test-3-interview/directions.mp3",
    items: [
      {
        label: "Interview Question 1",
        audio: "audio/practice-test-3-interview/question-1.mp3",
        text: "Thank you for participating in this study. Today, I'd like to ask you some questions about how you use social media. First, if you were to choose a social media platform to use most regularly, which one would you choose and why?",
      },
      {
        label: "Interview Question 2",
        audio: "audio/practice-test-3-interview/question-2.mp3",
        text: "Interesting. Do you think social media is more beneficial for younger people or older people? Why?",
      },
      {
        label: "Interview Question 3",
        audio: "audio/practice-test-3-interview/question-3.mp3",
        text: "Interesting. Some people believe that social media can help people stay connected, while others think it can lead to feelings of isolation. What are your thoughts on this? Do you agree or disagree? Why?",
      },
      {
        label: "Interview Question 4",
        audio: "audio/practice-test-3-interview/question-4.mp3",
        text: "Good points. Finally, looking to the future, do you think social media use will continue to grow? Or will people start to limit their usage? What factors do you think will most affect future usage of social media? Explain your thoughts.",
      },
    ],
  },
];

const els = {
  sectionLabel: document.querySelector("#sectionLabel"),
  setLabel: document.querySelector("#setLabel"),
  promptTitle: document.querySelector("#promptTitle"),
  promptText: document.querySelector("#promptText"),
  modeLabel: document.querySelector("#modeLabel"),
  progress: document.querySelector("#progress"),
  status: document.querySelector("#status"),
  topMenu: document.querySelector("#topMenu"),
  topPrev: document.querySelector("#topPrev"),
  topNext: document.querySelector("#topNext"),
  practiceMenu: document.querySelector("#practiceMenu"),
  startScreen: document.querySelector("#startScreen"),
  practiceScreen: document.querySelector("#practiceScreen"),
  questionScreen: document.querySelector("#questionScreen"),
  finishScreen: document.querySelector("#finishScreen"),
  questionNo: document.querySelector("#questionNo"),
  instruction: document.querySelector("#instruction"),
  audioNote: document.querySelector("#audioNote"),
  audioPlayer: document.querySelector("#audioPlayer"),
  phaseLabel: document.querySelector("#phaseLabel"),
  largeTimer: document.querySelector("#largeTimer"),
  barFill: document.querySelector("#barFill"),
  directionBtn: document.querySelector("#directionBtn"),
  listenBtn: document.querySelector("#listenBtn"),
  recordBtn: document.querySelector("#recordBtn"),
  questionBtn: document.querySelector("#questionBtn"),
  itemList: document.querySelector("#itemList"),
  recordingBox: document.querySelector("#recordingBox"),
  recordingList: document.querySelector("#recordingList"),
  questionTitle: document.querySelector("#questionTitle"),
  questionList: document.querySelector("#questionList"),
  backToPractice: document.querySelector("#backToPractice"),
  finishList: document.querySelector("#finishList"),
  restartBtn: document.querySelector("#restartBtn"),
};

let currentIndex = 0;
let activeItem = 1;
let mediaRecorder = null;
let stream = null;
let chunks = [];
let timerId = null;
let remaining = 45;
let recordings = [];

function currentSet() {
  return practiceSets[currentIndex];
}

function show(view) {
  els.startScreen.classList.toggle("show", view === "start");
  els.practiceScreen.classList.toggle("hide", view !== "practice");
  els.questionScreen.classList.toggle("show", view === "questions");
  els.finishScreen.classList.toggle("show", view === "finish");
  els.topPrev.disabled = view === "start";
  els.topNext.textContent = view === "finish" ? "Menu" : "Next";
}

function renderMenu() {
  els.practiceMenu.innerHTML = "";
  if (practiceSets.length === 0) {
    els.practiceMenu.innerHTML = '<p class="empty">아직 추가된 문제가 없습니다.</p>';
    return;
  }
  practiceSets.forEach((set, index) => {
    const button = document.createElement("button");
    button.className = "menu-button";
    button.type = "button";
    button.innerHTML = `<strong>${set.title}</strong><span>${set.topic}</span>`;
    button.addEventListener("click", () => startPractice(index));
    els.practiceMenu.append(button);
  });
}

function renderPractice() {
  const set = currentSet();
  const total = practiceSets.length;
  els.sectionLabel.textContent = set.mode;
  els.setLabel.textContent = set.title;
  els.promptTitle.textContent = set.title;
  els.promptText.innerHTML = `<p>${set.scenario}</p>`;
  els.modeLabel.textContent = set.mode;
  els.progress.textContent = `${currentIndex + 1} / ${total}`;
  els.status.textContent = `${set.responseSeconds} sec`;
  els.questionNo.textContent = set.title;
  els.instruction.textContent = set.instruction;
  els.audioNote.textContent = set.note;
  els.directionBtn.disabled = !set.directionAudio;
  els.phaseLabel.textContent = "Ready";
  els.largeTimer.textContent = "--:--";
  els.barFill.style.width = "0%";
  activeItem = 1;
  recordings = Array.from({ length: set.items.length }, () => null);
  renderItems();
  renderRecordings();
  playItem(1, false);
}

function renderItems() {
  const set = currentSet();
  els.itemList.innerHTML = "";
  set.items.forEach((item, index) => {
    const itemNo = index + 1;
    const row = document.createElement("div");
    row.className = `item-row${itemNo === activeItem ? " active" : ""}`;
    const label = document.createElement("strong");
    label.textContent = item.label;
    const button = document.createElement("button");
    button.className = "action secondary";
    button.type = "button";
    button.textContent = `${itemNo}번 듣기`;
    button.addEventListener("click", () => playItem(itemNo, true));
    row.append(label, button);
    els.itemList.append(row);
  });
}

function playItem(itemNo, shouldPlay) {
  const set = currentSet();
  activeItem = itemNo;
  renderItems();
  els.listenBtn.textContent = `${itemNo}번 듣기`;
  els.audioPlayer.src = set.items[itemNo - 1].audio;
  els.audioPlayer.load();
  if (shouldPlay) els.audioPlayer.play();
}

function playDirections() {
  const set = currentSet();
  if (!set.directionAudio) return;
  els.audioPlayer.src = set.directionAudio;
  els.audioPlayer.load();
  els.audioPlayer.play();
}

function renderRecordings() {
  const saved = recordings
    .map((recording, index) => ({ recording, index }))
    .filter((item) => item.recording);
  els.recordingBox.classList.toggle("hidden", saved.length === 0);
  els.recordingList.innerHTML = "";
  saved.forEach(({ recording, index }) => {
    const row = document.createElement("div");
    row.className = "recording-item";
    const label = document.createElement("strong");
    label.textContent = `${index + 1}번`;
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = recording.url;
    row.append(label, audio);
    els.recordingList.append(row);
  });
}

async function ensureMic() {
  if (stream) return stream;
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return stream;
}

async function toggleRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    stopTimer();
    return;
  }

  try {
    const mic = await ensureMic();
    const itemIndex = activeItem - 1;
    chunks = [];
    mediaRecorder = new MediaRecorder(mic);
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      if (recordings[itemIndex]?.url) URL.revokeObjectURL(recordings[itemIndex].url);
      recordings[itemIndex] = { blob, url: URL.createObjectURL(blob) };
      els.recordBtn.textContent = "녹음 시작";
      renderRecordings();
    };
    mediaRecorder.start();
    els.recordBtn.textContent = "녹음 종료";
    startTimer();
  } catch (error) {
    alert("마이크 권한을 허용해야 녹음할 수 있습니다.");
  }
}

function startTimer() {
  const set = currentSet();
  remaining = set.responseSeconds;
  els.phaseLabel.textContent = "Recording";
  tick();
  timerId = setInterval(() => {
    remaining -= 1;
    tick();
    if (remaining <= 0 && mediaRecorder?.state === "recording") {
      mediaRecorder.stop();
      stopTimer();
    }
  }, 1000);
}

function tick() {
  const total = currentSet()?.responseSeconds || 45;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  els.largeTimer.textContent = `${mm}:${ss}`;
  els.status.textContent = `${mm}:${ss}`;
  els.barFill.style.width = `${Math.max(0, (remaining / total) * 100)}%`;
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
  els.phaseLabel.textContent = "Saved";
}

function showQuestions() {
  const set = currentSet();
  els.questionTitle.textContent = `${set.title} Questions`;
  els.questionList.innerHTML = set.items.map((item) => `<li>${item.text}</li>`).join("");
  show("questions");
}

function finishPractice() {
  const set = currentSet();
  els.finishList.innerHTML = "";
  els.promptTitle.textContent = "Finished";
  els.promptText.innerHTML = `<p>${set.title} practice is complete.</p>`;
  show("finish");
}

function startPractice(index) {
  currentIndex = index;
  show("practice");
  renderPractice();
}

function showStart() {
  els.sectionLabel.textContent = "Ready";
  els.setLabel.textContent = "Start";
  els.promptTitle.textContent = "Smart TOEFL Speaking";
  els.promptText.innerHTML = "";
  els.progress.textContent = "Before start";
  els.status.textContent = "Ready";
  show("start");
}

els.topMenu.onclick = showStart;
els.restartBtn.onclick = showStart;
els.topPrev.onclick = () => {
  if (currentIndex > 0) startPractice(currentIndex - 1);
};
els.topNext.onclick = () => {
  if (els.startScreen.classList.contains("show") && practiceSets.length) startPractice(0);
  else if (els.finishScreen.classList.contains("show")) showStart();
  else if (currentIndex < practiceSets.length - 1) startPractice(currentIndex + 1);
  else finishPractice();
};
els.listenBtn.onclick = () => playItem(activeItem, true);
els.directionBtn.onclick = playDirections;
els.recordBtn.onclick = toggleRecording;
els.questionBtn.onclick = showQuestions;
els.backToPractice.onclick = () => show("practice");

renderMenu();
showStart();
