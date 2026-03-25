const firebaseConfig = {
  apiKey: "AIzaSyA_F7jFdh4IuW2Qmq9Q8SnsfZsvdrkQaEo",
  authDomain: "f3alyh-1.firebaseapp.com",
  projectId: "f3alyh-1",
  storageBucket: "f3alyh-1.firebasestorage.app",
  messagingSenderId: "574981141668",
  appId: "1:574981141668:web:63cb41b0f3afe5f66d2231",
  measurementId: "G-4DV6Y9103Y"
};

firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();
const db = firebase.firestore();

// Game State
let currentLevelIndex = 0;
let playerName = "";
let startTime = 0;
let timerInterval = null;
let totalTimeSeconds = 0;

// DOM Elements
const screens = {
    login: document.getElementById('loginScreen'),
    game: document.getElementById('gameScreen'),
    end: document.getElementById('endScreen')
};

const ui = {
    loginForm: document.getElementById('loginForm'),
    playerNameInput: document.getElementById('playerName'),
    displayPlayerName: document.getElementById('displayPlayerName'),
    timerDisplay: document.querySelector('#timerDisplay span'),
    currentLevelNum: document.getElementById('currentLevelNum'),
    totalLevelsNum: document.getElementById('totalLevelsNum'),
    progressFill: document.getElementById('progressFill'),
    levelTitle: document.getElementById('levelTitle'),
    levelDescription: document.getElementById('levelDescription'),
    levelIcon: document.querySelector('#levelIcon i'),
    interactiveArea: document.getElementById('interactiveArea'),
    feedbackMessage: document.getElementById('feedbackMessage'),
    feedbackText: document.getElementById('feedbackText'),
    nextLevelBtn: document.getElementById('nextLevelBtn'),
    finalPlayerName: document.getElementById('finalPlayerName'),
    finalTimeDisplay: document.getElementById('finalTimeDisplay'),
    restartBtn: document.getElementById('restartBtn'),
    
    // Leaderboard
    showLeaderboardBtn: document.getElementById('showLeaderboardBtn'),
    viewLeaderboardBtn: document.getElementById('viewLeaderboardBtn'),
    leaderboardModal: document.getElementById('leaderboardModal'),
    closeLeaderboard: document.getElementById('closeLeaderboard'),
    leaderboardBody: document.getElementById('leaderboardBody'),
    leaderboardEmptyState: document.getElementById('leaderboardEmptyState')
};

// Encouraging Messages
const encouragingMessages = [
    "ممتاز! إجابة دقيقة.",
    "أحسنت صنعاً! تفكير مبدع.",
    "رائع جداً! أنت تتقدم بخطوات واثقة.",
    "إجابة موفقة! استمر على هذا المنوال.",
    "بطل! لديك حس تربوي عالي."
];

// Initialize Game
function init() {
    ui.totalLevelsNum.textContent = gameLevels.length;
    
    // Event Listeners
    ui.loginForm.addEventListener('submit', handleLogin);
    ui.nextLevelBtn.addEventListener('click', loadNextLevel);
    ui.restartBtn.addEventListener('click', restartGame);
    
    // Leaderboard Listeners
    ui.showLeaderboardBtn.addEventListener('click', () => showLeaderboard(false));
    ui.viewLeaderboardBtn.addEventListener('click', () => showLeaderboard(true));
    ui.closeLeaderboard.addEventListener('click', closeLeaderboard);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === ui.leaderboardModal) {
            closeLeaderboard();
        }
    });

    // Check if player already exists in session
    const savedName = sessionStorage.getItem('playerName');
    if (savedName) {
        ui.playerNameInput.value = savedName;
    }
}

// Navigation Functions
function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });
    screens[screenName].classList.remove('hidden');
    setTimeout(() => {
        screens[screenName].classList.add('active');
    }, 50);
}

// Start Game
function handleLogin(e) {
    e.preventDefault();
    playerName = ui.playerNameInput.value.trim();
    if (!playerName) return;
    
    sessionStorage.setItem('playerName', playerName);
    ui.displayPlayerName.textContent = playerName;
    
    currentLevelIndex = 0;
    totalTimeSeconds = 0;
    ui.timerDisplay.textContent = "00:00";
    
    showScreen('game');
    loadLevel(currentLevelIndex);
    startTimer();
}

// Timer Logic
function startTimer() {
    clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const defaultFormat = (num) => num.toString().padStart(2, '0');
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    totalTimeSeconds = elapsed;
    
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    ui.timerDisplay.textContent = `${defaultFormat(minutes)}:${defaultFormat(seconds)}`;
}

function stopTimer() {
    clearInterval(timerInterval);
}

// Level Logic Central
function loadLevel(index) {
    const level = gameLevels[index];
    
    // Update UI Header
    ui.currentLevelNum.textContent = index + 1;
    const progressPercent = ((index) / gameLevels.length) * 100;
    ui.progressFill.style.width = `${progressPercent}%`;
    
    // Update Content
    ui.levelTitle.textContent = level.title;
    ui.levelDescription.textContent = level.description;
    ui.levelIcon.className = `fas ${level.icon}`;
    
    // Reset state
    ui.interactiveArea.innerHTML = '';
    ui.feedbackMessage.classList.add('hidden');
    ui.nextLevelBtn.classList.add('hidden');
    
    // Route to specific game renderer
    switch(level.type) {
        case 'sequence': renderSequence(level); break;
        case 'matching': renderMatching(level); break;
        case 'scrambled': renderScrambled(level); break;
        case 'short-input': renderShortInput(level); break;
        case 'odd-one-out': renderOddOneOut(level); break;
        case 'categorize': renderCategorize(level); break;
        case 'number-lock': renderNumberLock(level); break;
        case 'hidden-items': renderHiddenItems(level); break;
        case 'line-connect': renderLineConnect(level); break;
        case 'memory-cards': renderMemoryCards(level); break;
        case 'true-false': renderTrueFalse(level); break;
        case 'matrix-click': renderMatrixClick(level); break;
        case 'math-puzzle': renderMathPuzzle(level); break;
    }
}

// ==========================================
// GAME MECHANIC RENDERERS
// ==========================================

// --- Utility for Generic Drag & Drop (Mobile & Desktop via Touch Punch or custom logic) ---
// For pure vanilla without heavy libraries, HTML5 drag and drop is used for desktop. 
// Note: Real mobile touch drag/drop requires custom touch handlers. We'll stick to HTML5 for now.
let draggedItem = null;

function setupDragEvents(element) {
    element.draggable = true;
    element.addEventListener('dragstart', function(e) {
        draggedItem = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
        setTimeout(() => this.style.opacity = '0.5', 0);
    });
    element.addEventListener('dragend', function() {
        this.style.opacity = '1';
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
}

function setupDropZone(element, dropCallback) {
    element.addEventListener('dragover', e => {
        e.preventDefault();
        return false;
    });
    element.addEventListener('dragenter', function() {
        this.classList.add('drag-over');
    });
    element.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });
    element.addEventListener('drop', function(e) {
        e.stopPropagation();
        this.classList.remove('drag-over');
        if (draggedItem && dropCallback) {
            dropCallback(draggedItem, this);
        }
        return false;
    });
}

// 1. SEQUENCE (Sortable List)
function renderSequence(level) {
    const listContainer = document.createElement('div');
    listContainer.className = 'val-sequence-list';
    
    const shuffledItems = [...level.items].sort(() => Math.random() - 0.5);
    
    shuffledItems.forEach(item => {
        const row = document.createElement('div');
        row.className = 'val-sequence-item';
        row.innerHTML = `<i class="fas fa-grip-lines"></i> ${item.text}`;
        row.dataset.order = item.order;
        setupDragEvents(row);
        
        setupDropZone(row, (dragged, target) => {
            if (dragged !== target) {
                // Swap HTML and dataset
                const tempHtml = dragged.innerHTML;
                const tempOrder = dragged.dataset.order;
                
                dragged.innerHTML = target.innerHTML;
                dragged.dataset.order = target.dataset.order;
                
                target.innerHTML = tempHtml;
                target.dataset.order = tempOrder;
            }
        });
        listContainer.appendChild(row);
    });
    
    const checkBtn = document.createElement('button');
    checkBtn.className = 'btn secondary-btn val-mt';
    checkBtn.textContent = 'تحقق من الترتيب';
    checkBtn.onclick = () => {
        const items = Array.from(listContainer.querySelectorAll('.val-sequence-item'));
        let isCorrect = true;
        items.forEach((item, index) => {
            if (parseInt(item.dataset.order) !== index + 1) isCorrect = false;
        });
        if (isCorrect) {
            showGameComplete(checkBtn, "ترتيب دقيق ومثالي!");
        } else {
            showFeedback("error", "الترتيب غير صحيح، تذكر أن تبدأ بالمشكلة ثم الأهداف والفرق.");
        }
    };
    
    ui.interactiveArea.appendChild(listContainer);
    ui.interactiveArea.appendChild(checkBtn);
}

// 2. MATCHING (Terms to Definitions)
function renderMatching(level) {
    const container = document.createElement('div');
    container.className = 'val-matching-container';
    
    const termsCol = document.createElement('div');
    termsCol.className = 'val-match-terms';
    
    const defsCol = document.createElement('div');
    defsCol.className = 'val-match-defs';
    
    const terms = [...level.pairs].sort(() => Math.random() - 0.5);
    const defs = [...level.pairs].sort(() => Math.random() - 0.5);
    
    let matchedCount = 0;
    
    terms.forEach(pair => {
        const t = document.createElement('div');
        t.className = 'val-match-term';
        t.textContent = pair.term;
        t.dataset.id = pair.id;
        setupDragEvents(t);
        termsCol.appendChild(t);
    });
    
    defs.forEach(pair => {
        const d = document.createElement('div');
        d.className = 'val-match-def';
        d.innerHTML = `<span>${pair.definition}</span><div class="val-drop-slot">اسحب هنا</div>`;
        d.dataset.id = pair.id;
        
        const slot = d.querySelector('.val-drop-slot');
        setupDropZone(slot, (dragged, target) => {
            // Check if correct
            if (dragged.dataset.id === d.dataset.id) {
                target.classList.add('matched');
                target.textContent = dragged.textContent;
                dragged.style.visibility = 'hidden';
                matchedCount++;
                if (matchedCount === level.pairs.length) {
                    showGameComplete(null, "رائع! إدراك ممتاز للمفاهيم الأساسية.");
                }
            } else {
                showFeedback("error", "خطأ! حاول مطابقة المفهوم بتعريفه الدقيق.");
            }
        });
        defsCol.appendChild(d);
    });
    
    container.appendChild(termsCol);
    container.appendChild(defsCol);
    ui.interactiveArea.appendChild(container);
}

// 3. SCRAMBLED WORDS
function renderScrambled(level) {
    const container = document.createElement('div');
    const displayArea = document.createElement('div');
    displayArea.className = 'val-scrambled-display';
    
    const lettersArea = document.createElement('div');
    lettersArea.className = 'val-scrambled-pool';
    
    let currentGuess = "";
    
    level.letters.forEach(char => {
        const btn = document.createElement('button');
        btn.className = 'val-letter-btn';
        btn.textContent = char;
        btn.onclick = () => {
            btn.style.visibility = 'hidden';
            currentGuess += char;
            
            const placedBox = document.createElement('span');
            placedBox.className = 'val-placed-letter';
            placedBox.textContent = char;
            placedBox.onclick = () => {
                // Remove last letter functionality (simplified)
                if(placedBox.nextSibling === null) {
                    displayArea.removeChild(placedBox);
                    currentGuess = currentGuess.slice(0, -1);
                    btn.style.visibility = 'visible';
                }
            };
            displayArea.appendChild(placedBox);
            
            if (currentGuess.length === level.word.length) {
                if (currentGuess === level.word || currentGuess === level.word.split('').reverse().join('')) {
                     // Since arabic renders RTL, currentGuess might read reversed programmatically depending on appending logic.
                     // The safe logic is to check if current guess equals word, but often RTL strings appended LTR are reversed visually.
                     // Using array split to compare avoids UI direction issues.
                     let guessedRight = (currentGuess === level.word);
                     if(guessedRight) {
                        showGameComplete(null, "سر القيادة الفعالة هو الأثر الذي نتركه، أحسنت!");
                     } else {
                        showFeedback("error", "ترتيب الحروف غير صحيح.");
                     }
                } else {
                    showFeedback("error", "الكلمة غير صحيحة، تأكد من الترتيب.");
                }
            }
        };
        lettersArea.appendChild(btn);
    });
    
    container.appendChild(displayArea);
    container.appendChild(lettersArea);
    
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn secondary-btn val-mt';
    resetBtn.textContent = 'مسح وإعادة المحاولة';
    resetBtn.onclick = () => {
        displayArea.innerHTML = '';
        lettersArea.querySelectorAll('.val-letter-btn').forEach(b => b.style.visibility = 'visible');
        currentGuess = "";
    };
    
    ui.interactiveArea.appendChild(container);
    ui.interactiveArea.appendChild(resetBtn);
}


// 4. SHORT INPUT
function renderShortInput(level) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'val-text-input';
    input.placeholder = "اكتب المهارة هنا...";
    
    const checkBtn = document.createElement('button');
    checkBtn.className = 'btn secondary-btn val-mt';
    checkBtn.textContent = 'تأكيد الإجابة';
    
    checkBtn.onclick = () => {
        const val = input.value.trim();
        if (val === level.answer || level.altAnswers.includes(val)) {
            showGameComplete(checkBtn, "إجابة دقيقة! التواصل الفعال هو المفتاح.");
            input.disabled = true;
        } else {
            showFeedback("error", "ليست هذه المهارة المقصودة. ابحث عن مهارة تبادل الأحاديث والإنصات.");
        }
    };
    
    ui.interactiveArea.appendChild(input);
    ui.interactiveArea.appendChild(checkBtn);
}

// 5. ODD ONE OUT
function renderOddOneOut(level) {
    const grid = document.createElement('div');
    grid.className = 'val-grid';
    
    const options = [...level.options].sort(() => Math.random() - 0.5);
    
    options.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'val-card-btn';
        card.textContent = opt.text;
        card.onclick = () => {
            if (opt.isOdd) {
                card.classList.add('correct');
                showGameComplete(null, "صحيح! هذا العنصر لا يمت للتربية اللامنهجية بصلة.");
                grid.style.pointerEvents = 'none';
            } else {
                card.classList.add('wrong');
                showFeedback("error", "هذا العنصر يعتبر أساسياً في التربية اللامنهجية. ابحث عن العنصر الأكاديمي.");
                setTimeout(() => card.classList.remove('wrong'), 2000);
            }
        };
        grid.appendChild(card);
    });
    
    ui.interactiveArea.appendChild(grid);
}

// 6. CATEGORIZE
function renderCategorize(level) {
    const container = document.createElement('div');
    container.className = 'val-category-wrap';
    
    const itemsPool = document.createElement('div');
    itemsPool.className = 'val-items-pool';
    
    const bucketsContainer = document.createElement('div');
    bucketsContainer.className = 'val-buckets-wrap';
    
    let sortedCount = 0;
    
    level.categories.forEach(cat => {
        const bucket = document.createElement('div');
        bucket.className = 'val-bucket';
        bucket.style.borderColor = cat.color;
        bucket.innerHTML = `<h3 style="color:${cat.color}">${cat.name}</h3><div class="val-bucket-dropArea"></div>`;
        
        setupDropZone(bucket.querySelector('.val-bucket-dropArea'), (dragged, target) => {
            if (dragged.dataset.catId === cat.id) {
                target.appendChild(dragged);
                dragged.draggable = false;
                dragged.style.cursor = 'default';
                sortedCount++;
                if (sortedCount === level.items.length) {
                    showGameComplete(null, "تصنيف رائع ومبني على أسس واضحة!");
                }
            } else {
                showFeedback("error", "هذا النشاط لا ينتمي لهذا التصنيف.");
            }
        });
        bucketsContainer.appendChild(bucket);
    });
    
    const items = [...level.items].sort(() => Math.random() - 0.5);
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'val-draggable-card';
        div.textContent = item.text;
        div.dataset.catId = item.category === "cat1" ? "cat1" : "cat2"; // using ids
        setupDragEvents(div);
        itemsPool.appendChild(div);
    });
    
    container.appendChild(itemsPool);
    container.appendChild(bucketsContainer);
    ui.interactiveArea.appendChild(container);
}

// 7. NUMBER LOCK
function renderNumberLock(level) {
    const lockContainer = document.createElement('div');
    lockContainer.className = 'val-lock-container';
    
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'val-lock-inputs';
    
    const inputs = [];
    for(let i=0; i<3; i++) {
        const inp = document.createElement('input');
        inp.type = 'number';
        inp.min = 0;
        inp.max = 9;
        inp.className = 'val-lock-digit';
        inputs.push(inp);
        inputWrapper.appendChild(inp);
        
        inp.addEventListener('input', () => {
             if (inp.value.length > 1) inp.value = inp.value.slice(-1); // keep single digit
             if (inp.value !== "" && i < 2) inputs[i+1].focus(); // auto advance
        });
    }
    
    const unlockBtn = document.createElement('button');
    unlockBtn.className = 'btn primary-btn val-mt';
    unlockBtn.innerHTML = '<i class="fas fa-unlock"></i> افتح القفل';
    unlockBtn.onclick = () => {
        const code = inputs.map(i => i.value).join('');
        if (code === level.passcode) {
            lockContainer.classList.add('unlocked');
            showGameComplete(unlockBtn, "تم فك الشيفرة والتخطيط بشكل صحيح! 4 لجان، 4 قادة، 3 أعضاء.");
            inputs.forEach(i => i.disabled = true);
        } else {
            showFeedback("error", "الرقم السري خاطئ. ركز في معطيات اللغز (عدد اللجان، عدد القادة، عدد الأعضاء).");
            inputs.forEach(i => i.value = '');
            inputs[0].focus();
        }
    };
    
    lockContainer.appendChild(inputWrapper);
    lockContainer.appendChild(unlockBtn);
    ui.interactiveArea.appendChild(lockContainer);
}

// 8. HIDDEN ITEMS CLICKER
function renderHiddenItems(level) {
    const container = document.createElement('div');
    container.className = 'val-hidden-container';
    
    let foundCount = 0;
    
    const items = [...level.items].sort(() => Math.random() - 0.5);
    items.forEach(item => {
        const floatItem = document.createElement('div');
        floatItem.className = 'val-floating-word';
        floatItem.textContent = item.text;
        
        // Randomize initial positions loosely
        floatItem.style.top = `${Math.random() * 70 + 10}%`;
        floatItem.style.left = `${Math.random() * 70 + 10}%`;
        
        floatItem.onclick = () => {
            if (item.isCorrect) {
                if (!floatItem.classList.contains('found')) {
                    floatItem.classList.add('found');
                    foundCount++;
                    if (foundCount === level.correctCount) {
                        showGameComplete(null, "أحسنت! هذه المهارات هي العصب الأساسي للعمل الشبابي.");
                        container.style.pointerEvents = 'none';
                    }
                }
            } else {
                floatItem.classList.add('wrong-shake');
                showFeedback("error", "هذه مهارة صلبة (أكاديمية)، ابحث عن المهارات الناعمة.");
                setTimeout(() => floatItem.classList.remove('wrong-shake'), 800);
            }
        };
        container.appendChild(floatItem);
    });
    
    ui.interactiveArea.appendChild(container);
}

// 9. LINE CONNECT
function renderLineConnect(level) {
    const container = document.createElement('div');
    container.className = 'val-line-container';
    
    // SVG overlay for drawing lines
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.className = 'val-lines-svg';
    
    const rightCol = document.createElement('div');
    rightCol.className = 'val-line-col';
    
    const leftCol = document.createElement('div');
    leftCol.className = 'val-line-col';
    
    const rightItems = [...level.pairs].sort(() => Math.random() - 0.5);
    const leftItems = [...level.pairs].sort(() => Math.random() - 0.5);
    
    let selectedRight = null;
    let matches = 0;
    
    rightItems.forEach(pair => {
        const btn = document.createElement('button');
        btn.className = 'val-line-node right-node';
        btn.textContent = pair.right;
        btn.dataset.id = pair.id;
        btn.onclick = () => {
            if (btn.classList.contains('matched')) return;
            document.querySelectorAll('.right-node').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedRight = btn;
        };
        rightCol.appendChild(btn);
    });
    
    leftItems.forEach(pair => {
        const btn = document.createElement('button');
        btn.className = 'val-line-node left-node';
        btn.textContent = pair.left;
        btn.dataset.id = pair.id;
        btn.onclick = () => {
            if (btn.classList.contains('matched')) return;
            if (!selectedRight) {
                showFeedback("error", "اختر النشاط من القائمة اليمنى أولاً لتوصيله.");
                return;
            }
            if (selectedRight.dataset.id === btn.dataset.id) {
                // Match
                selectedRight.classList.remove('selected');
                selectedRight.classList.add('matched');
                btn.classList.add('matched');
                
                drawLine(selectedRight, btn, svg, container);
                
                selectedRight = null;
                matches++;
                if (matches === level.pairs.length) {
                    showGameComplete(null, "تم ربط جميع الأنشطة بالمهارات الصحيحة بنجاح!");
                }
            } else {
                showFeedback("error", "الربط غير صحيح! حاول مرة أخرى.");
                selectedRight.classList.remove('selected');
                selectedRight = null;
            }
        };
        leftCol.appendChild(btn);
    });
    
    container.appendChild(svg);
    container.appendChild(rightCol);
    container.appendChild(leftCol);
    ui.interactiveArea.appendChild(container);
    
    // Re-draw lines on window resize
    window.addEventListener('resize', () => {
        if (!document.contains(container)) return;
        svg.innerHTML = '';
        const matchedRights = container.querySelectorAll('.right-node.matched');
        matchedRights.forEach(r => {
            const l = container.querySelector(`.left-node.matched[data-id="${r.dataset.id}"]`);
            if (l) drawLine(r, l, svg, container);
        });
    });
}

function drawLine(el1, el2, svg, container) {
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const x1 = rect1.left - containerRect.left + (rect1.width / 2);
    const y1 = rect1.top - containerRect.top + (rect1.height / 2);
    const x2 = rect2.left - containerRect.left + (rect2.width / 2);
    const y2 = rect2.top - containerRect.top + (rect2.height / 2);
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', 'var(--success)');
    line.setAttribute('stroke-width', '4');
    line.setAttribute('stroke-linecap', 'round');
    
    svg.appendChild(line);
}

// 10. MEMORY CARDS
function renderMemoryCards(level) {
    const grid = document.createElement('div');
    grid.className = 'val-memory-grid';
    
    let cardsData = [];
    level.pairs.forEach(p => {
        cardsData.push({ matchId: p.pairId, icon: p.icon1, title: p.text1 });
        cardsData.push({ matchId: p.pairId, icon: p.icon2, title: p.text2 });
    });
    cardsData.sort(() => Math.random() - 0.5); // shuffle
    
    let firstCard = null;
    let lockBoard = false;
    let matches = 0;
    
    cardsData.forEach(data => {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'val-memory-card';
        cardContainer.dataset.id = data.matchId;
        
        const front = document.createElement('div');
        front.className = 'val-memory-front';
        front.innerHTML = `<i class="fas fa-question"></i>`;
        
        const back = document.createElement('div');
        back.className = 'val-memory-back';
        back.innerHTML = `<i class="fas ${data.icon}"></i><p>${data.title}</p>`;
        
        cardContainer.appendChild(front);
        cardContainer.appendChild(back);
        
        cardContainer.onclick = () => {
            if (lockBoard) return;
            if (cardContainer === firstCard) return;
            if (cardContainer.classList.contains('flipped')) return;
            
            cardContainer.classList.add('flipped');
            
            if (!firstCard) {
                firstCard = cardContainer;
                return;
            }
            
            if (firstCard.dataset.id === cardContainer.dataset.id) {
                // Match
                firstCard = null;
                matches++;
                if (matches === level.pairs.length) {
                    setTimeout(() => showGameComplete(null, "ذاكرة ممتازة! ربط المفاهيم يشكل أساساً لنجاح الأنشطة."), 400);
                }
            } else {
                // No match
                lockBoard = true;
                setTimeout(() => {
                    firstCard.classList.remove('flipped');
                    cardContainer.classList.remove('flipped');
                    firstCard = null;
                    lockBoard = false;
                }, 1000);
            }
        };
        grid.appendChild(cardContainer);
    });
    
    ui.interactiveArea.appendChild(grid);
}

// 11. TRUE FALSE
function renderTrueFalse(level) {
    const container = document.createElement('div');
    container.className = 'val-tf-container';
    
    let currentQ = 0;
    const card = document.createElement('div');
    card.className = 'val-tf-card';
    card.textContent = level.questions[currentQ].text;
    
    const actions = document.createElement('div');
    actions.className = 'val-tf-actions';
    
    const btnTrue = document.createElement('button');
    btnTrue.className = 'val-tf-btn true';
    btnTrue.innerHTML = '<i class="fas fa-check"></i> صح';
    
    const btnFalse = document.createElement('button');
    btnFalse.className = 'val-tf-btn false';
    btnFalse.innerHTML = '<i class="fas fa-times"></i> خطأ';
    
    const checkAns = (isTrueClicked) => {
        if (level.questions[currentQ].isTrue === isTrueClicked) {
            currentQ++;
            if (currentQ < level.questions.length) {
                card.textContent = level.questions[currentQ].text;
                showFeedback("success", "إجابة صحيحة! استمر.");
                setTimeout(() => ui.feedbackMessage.classList.add('hidden'), 1000);
            } else {
                showGameComplete(null, "مدهش! لديك معرفة رائعة بأسس العمل اللامنهجي.");
                btnTrue.disabled = true; btnFalse.disabled = true;
            }
        } else {
            showFeedback("error", "إجابة خاطئة. حاول التفكير في المعنى الأعمق للمقولة.");
        }
    };
    
    btnTrue.onclick = () => checkAns(true);
    btnFalse.onclick = () => checkAns(false);
    
    actions.appendChild(btnTrue);
    actions.appendChild(btnFalse);
    container.appendChild(card);
    container.appendChild(actions);
    ui.interactiveArea.appendChild(container);
}

// 12. MATRIX CLICK
function renderMatrixClick(level) {
    const grid = document.createElement('div');
    grid.className = 'val-matrix';
    
    level.quadrants.forEach(q => {
        const quad = document.createElement('div');
        quad.className = 'val-matrix-quad';
        quad.textContent = q.name;
        quad.onclick = () => {
            if (q.id === level.correctId) {
                quad.style.background = 'var(--success)';
                quad.style.color = 'white';
                quad.style.borderColor = 'var(--success)';
                showGameComplete(null, "صحيح! التركيز على الاستراتيجية والتخطيط يمنع الأزمات ويحقق التطور.");
                grid.style.pointerEvents = 'none';
            } else {
                quad.style.animation = 'shake 0.5s';
                quad.style.background = 'var(--danger)';
                quad.style.color = 'white';
                showFeedback("error", "هذا المربع يختلف. نحن نبحث عن التخطيط والأمور المهمة التي لا تتطلب استجابة طارئة.");
                setTimeout(() => { quad.style.animation = ''; quad.style.background = 'white'; quad.style.color = ''; }, 1000);
            }
        };
        grid.appendChild(quad);
    });
    
    ui.interactiveArea.appendChild(grid);
}

// 13. MATH PUZZLE
function renderMathPuzzle(level) {
    const container = document.createElement('div');
    container.className = 'val-math-container';
    
    const eq = document.createElement('div');
    eq.className = 'val-equation';
    eq.textContent = level.equation;
    
    const opts = document.createElement('div');
    opts.className = 'val-puzzle-opts';
    
    const shuffled = [...level.options].sort(() => Math.random() - 0.5);
    shuffled.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'val-puzzle-btn';
        btn.textContent = opt;
        btn.onclick = () => {
            if (opt === level.correctOption) {
                btn.style.background = 'var(--success)';
                btn.style.color = 'white';
                btn.style.borderColor = 'var(--success)';
                eq.textContent = level.equation.replace('؟', opt);
                showGameComplete(null, "تفكير عبقري! هذه هي المعادلة الحقيقية للتربية اللامنهجية.");
                opts.style.pointerEvents = 'none';
            } else {
                btn.style.animation = 'shake 0.5s';
                btn.style.background = 'var(--danger)';
                btn.style.color = 'white';
                showFeedback("error", "النتيجة غير صحيحة. ركز على أن (المبادرة والرؤية) دائماً تعطي نتائج إيجابية عظيمة.");
                setTimeout(() => { btn.style.animation = ''; btn.style.background = 'white'; btn.style.color = ''; }, 1000);
            }
        };
        opts.appendChild(btn);
    });
    
    container.appendChild(eq);
    container.appendChild(opts);
    ui.interactiveArea.appendChild(container);
}

// ==========================================
// CORE HELPERS
// ==========================================

function showGameComplete(hideBtnNode, customMsg) {
    if (hideBtnNode) hideBtnNode.classList.add('hidden');
    showFeedback("success", customMsg || getRandomMessage());
    ui.nextLevelBtn.classList.remove('hidden');
}

function showFeedback(type, message) {
    ui.feedbackMessage.className = `feedback-message ${type}`;
    ui.feedbackText.textContent = message;
}

function getRandomMessage() {
    return encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
}

function loadNextLevel() {
    currentLevelIndex++;
    if (currentLevelIndex < gameLevels.length) {
        loadLevel(currentLevelIndex);
    } else {
        endGame();
    }
}

function endGame() {
    stopTimer();
    ui.progressFill.style.width = '100%';
    
    // Save Score
    saveScoreToLeaderboard(playerName, totalTimeSeconds);
    
    // Display End Screen
    ui.finalPlayerName.textContent = playerName;
    ui.finalTimeDisplay.textContent = ui.timerDisplay.textContent;
    showScreen('end');
}

function restartGame() {
    showScreen('login');
}

// --- Leaderboard Implementation ---
async function saveScoreToLeaderboard(name, timeInSeconds) {
    try {
        await db.collection("leaderboard").add({
            name: name,
            timeSeconds: timeInSeconds,
            timestamp: Date.now()
        });
    } catch (e) {
        console.error("Firebase Error: ", e);
        // Fallback to local
        let leaderboard = JSON.parse(localStorage.getItem('eduGameLeaderboard')) || [];
        leaderboard.push({ id: Date.now().toString(), name: name, timeSeconds: timeInSeconds, timestamp: Date.now() });
        leaderboard.sort((a, b) => a.timeSeconds - b.timeSeconds);
        localStorage.setItem('eduGameLeaderboard', JSON.stringify(leaderboard.slice(0, 20)));
    }
}

function formatTimeFromSeconds(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

async function showLeaderboard(fromEndScreen = false) {
    ui.leaderboardModal.classList.remove('hidden');
    ui.leaderboardBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> جاري تحميل البيانات...</td></tr>';
    document.querySelector('.leaderboard-table').classList.remove('hidden');
    ui.leaderboardEmptyState.classList.add('hidden');
    
    let leaderboard = [];
    
    try {
        const querySnapshot = await db.collection("leaderboard").orderBy("timeSeconds").limit(20).get();
        querySnapshot.forEach((doc) => {
            leaderboard.push({ id: doc.id, ...doc.data() });
        });
    } catch (e) {
        console.error("Firebase Error: ", e);
        // Fallback to local
        leaderboard = JSON.parse(localStorage.getItem('eduGameLeaderboard')) || [];
    }
    
    ui.leaderboardBody.innerHTML = '';
    
    if (leaderboard.length === 0) {
        ui.leaderboardEmptyState.classList.remove('hidden');
        document.querySelector('.leaderboard-table').classList.add('hidden');
    } else {
        leaderboard.forEach((entry, index) => {
            const tr = document.createElement('tr');
            if (index === 0) tr.classList.add('top-1');
            
            let rankHtml = `#${index + 1}`;
            if (index === 0) rankHtml = `<i class="fas fa-medal text-gold"></i> الأول`;
            if (index === 1) rankHtml = `<i class="fas fa-medal" style="color: silver;"></i> الثاني`;
            if (index === 2) rankHtml = `<i class="fas fa-medal" style="color: #cd7f32;"></i> الثالث`;
            
            let nameHtml = entry.name;
            if (fromEndScreen && entry.name === playerName && entry.timeSeconds === totalTimeSeconds) {
                nameHtml = `<strong>${entry.name} (أنت)</strong>`;
                tr.style.background = 'rgba(67, 97, 238, 0.1)';
            }
            
            tr.innerHTML = `
                <td>${rankHtml}</td>
                <td>${nameHtml}</td>
                <td style="font-weight: bold; color: var(--danger);">${formatTimeFromSeconds(entry.timeSeconds)}</td>
            `;
            ui.leaderboardBody.appendChild(tr);
        });
    }
}

function closeLeaderboard() {
    ui.leaderboardModal.classList.add('hidden');
}

// Bootstrap
document.addEventListener('DOMContentLoaded', init);
