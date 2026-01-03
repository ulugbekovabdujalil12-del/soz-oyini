// O'zbek tilidagi so'zlar ro'yxati
const words = [
    "olma", "anor", "uzum", "gilos", "shaftoli", "qovun", "tarvuz", "banan",
    "kitob", "daftar", "qalam", "ruchka", "stol", "stul", "eshik", "deraza",
    "mashina", "samolyot", "poyezd", "avtobus", "velosiped", "mototsikl",
    "uy", "bog", "daryo", "tog", "dengiz", "osmon", "quyosh", "oy",
    "yulduz", "bulut", "yomgir", "qor", "shamol", "olov", "suv", "tuproq",
    "daraxt", "gul", "barg", "meva", "sabzi", "piyoz", "kartoshka", "pomidor",
    "mushuk", "it", "qush", "baliq", "ot", "sigir", "qoy", "echki",
    "ona", "ota", "aka", "opa", "singil", "uka", "buvi", "bobo",
    "salom", "xayr", "rahmat", "kechirasiz", "marhamat", "albatta",
    "sevgi", "dostlik", "baxt", "hayot", "vatan", "millat", "til",
    "kuch", "bilim", "aql", "yurak", "qol", "bosh", "oyoq", "koz",
    "quloq", "burun", "ogiz", "tish", "til", "soch", "barmoq",
    "rang", "oq", "qora", "qizil", "yashil", "sariq", "kok", "pushti",
    "katta", "kichik", "uzun", "qisqa", "baland", "past", "keng", "tor",
    "tez", "sekin", "yangi", "eski", "issiq", "sovuq", "yaxshi", "yomon", "Muhammad", "Amir", "Imron", "Abdujalil"
];

// O'yin holati
let score = 0;
let record = parseInt(localStorage.getItem('wordGameRecord')) || 0;
let gameTime = 0;
let gameInterval = null;
let wordFallInterval = null;
let isGameRunning = false;
let fallingWords = [];
let wordSpeed = 1;
let spawnRate = 2500;
let nextWordId = 1; // Har bir so'z uchun unikal ID

// DOM elementlari
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const wordInput = document.getElementById('word-input');
const wordsContainer = document.getElementById('words-container');
const scoreDisplay = document.getElementById('score');
const recordDisplay = document.getElementById('record');
const timerDisplay = document.getElementById('timer');
const bestRecordDisplay = document.getElementById('best-record');
const finalScoreDisplay = document.getElementById('final-score');
const finalTimeDisplay = document.getElementById('final-time');
const newRecordDisplay = document.getElementById('new-record');

// Rekordni ko'rsatish
bestRecordDisplay.textContent = record;
recordDisplay.textContent = record;

// O'yinni boshlash
function startGame() {
    score = 0;
    gameTime = 0;
    fallingWords = [];
    wordSpeed = 1;
    spawnRate = 2500;
    isGameRunning = true;
    nextWordId = 1;

    scoreDisplay.textContent = score;
    timerDisplay.textContent = '0s';
    wordsContainer.innerHTML = '';
    wordInput.value = '';

    startScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    wordInput.focus();

    // Vaqtni hisoblash
    gameInterval = setInterval(() => {
        gameTime++;
        timerDisplay.textContent = gameTime + 's';

        // Har 15 sekundda qiyinchilikni oshiramiz (sekinroq tezlashishi uchun)
        if (gameTime % 10 === 0) {
            // So'zlarning tushish tezligi (wordSpeed) oshadi
            wordSpeed += 0.08;

            // Yangi so'z chiqish tezligi (spawnRate) kamayadi (tezlashadi)
            if (spawnRate > 900) {
                spawnRate -= 150;
                clearInterval(wordFallInterval);
                wordFallInterval = setInterval(spawnWord, spawnRate);
            }
        }
    }, 1000);

    // So'zlarni tushirish
    spawnWord();
    wordFallInterval = setInterval(spawnWord, spawnRate);

    // So'zlarni harakatlantirish
    requestAnimationFrame(updateWords);
}

// Yangi so'z yaratish
function spawnWord() {
    if (!isGameRunning) return;

    const word = words[Math.floor(Math.random() * words.length)];
    const wordElement = document.createElement('div');
    const wordId = nextWordId++;

    wordElement.className = 'word';
    wordElement.textContent = word;
    wordElement.dataset.id = wordId; // ID ni DOM elementga ham yozib qo'yamiz

    // Tasodifiy joy (ekran kengligiga qarab)
    const maxX = wordsContainer.offsetWidth - 150;
    const randomX = Math.max(20, Math.random() * maxX);

    wordElement.style.left = randomX + 'px';
    wordElement.style.top = '-60px';

    wordsContainer.appendChild(wordElement);

    fallingWords.push({
        id: wordId,
        element: wordElement,
        text: word,
        y: -60,
        speed: wordSpeed + Math.random() * 0.5,
        isMatched: false // Yangi flag
    });
}

// So'zlarni yangilash
function updateWords() {
    if (!isGameRunning) return;

    const fieldHeight = wordsContainer.offsetHeight;

    // Massivni iterate qilamiz
    for (let i = 0; i < fallingWords.length; i++) {
        const wordObj = fallingWords[i];

        // Agar so'z topilgan bo'lsa, uni harakatlantirmaymiz (u animatsiya bilan yo'qolyapti)
        if (wordObj.isMatched) continue;

        // Global tezlikni hisobga olamiz
        wordObj.y += wordObj.speed * (wordSpeed / 1); // Boshlang'ich tezlik 1 bo'lgani uchun nisbat ishlatamiz
        wordObj.element.style.top = wordObj.y + 'px';

        // So'z pastga yetib bordi - o'yin tugadi
        if (wordObj.y > fieldHeight - 50) {
            endGame();
            return;
        }
    }

    requestAnimationFrame(updateWords);
}

// So'z tekshirish
function checkWord() {
    const inputWord = wordInput.value.toLowerCase().trim();
    if (!inputWord) return;

    // Faqat hali topilmagan so'zlar orasidan qidiramiz
    const matchedIndex = fallingWords.findIndex(obj =>
        !obj.isMatched && obj.text.toLowerCase() === inputWord
    );

    if (matchedIndex !== -1) {
        // So'z topildi!
        score++;
        scoreDisplay.textContent = score;

        const matchedWordObj = fallingWords[matchedIndex];
        matchedWordObj.isMatched = true; // Belgilab qo'yamiz
        matchedWordObj.element.classList.add('matched');

        // Massivdan hozircha O'CHIRMAYMIZ, matched flagi true bo'ldi.
        // 500ms dan keyin massivdan ham, DOM dan ham tozalaymiz.

        setTimeout(() => {
            // DOM dan o'chirish
            if (matchedWordObj.element && matchedWordObj.element.parentNode) {
                matchedWordObj.element.remove();
            }

            // Massivdan ID orqali aniq o'chirish
            const indexToRemove = fallingWords.findIndex(w => w.id === matchedWordObj.id);
            if (indexToRemove !== -1) {
                fallingWords.splice(indexToRemove, 1);
            }
        }, 500);

        wordInput.value = '';
    }
}

// O'yinni tugatish
function endGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    clearInterval(wordFallInterval);

    // Yangi rekord tekshirish
    let isNewRecord = false;
    if (score > record) {
        record = score;
        localStorage.setItem('wordGameRecord', record);
        isNewRecord = true;
        bestRecordDisplay.textContent = record;
        recordDisplay.textContent = record;
    }

    // Natijalarni ko'rsatish
    finalScoreDisplay.textContent = score + ' so\'z';
    finalTimeDisplay.textContent = gameTime + ' sekund';

    if (isNewRecord) {
        newRecordDisplay.classList.remove('hidden');
    } else {
        newRecordDisplay.classList.add('hidden');
    }

    gameScreen.classList.add('hidden');
    gameoverScreen.classList.remove('hidden');
}

// Event listener'lar
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

wordInput.addEventListener('input', checkWord);

// Enter bosilganda ham tekshirish
wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkWord();
    }
});

// Sahifa yuklanganda recordni yangilash
document.addEventListener('DOMContentLoaded', () => {
    recordDisplay.textContent = record;
});
