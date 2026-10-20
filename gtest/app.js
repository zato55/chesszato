const game = new Chess();
const analysisGame = new Chess();

let selectedSquare = null;
let pendingMove = null;
let isFlipped = false;
let vsBot = true;
let timerInterval = null;

let selectedTimeInSeconds = 300;
let timeIncrementInSeconds = 0;
let whiteTime = 300, blackTime = 300;
let clockStarted = false;

let stockfishWorker = null;

let isEngineThinking = false;
let discardEngineBestMove = false;
let isGameOver = false;
let isReviewing = false;

let isAnalysisMode = false;
let analysisMoveHistory = [];
let analysisMainlineHistory = [];
let analysisBranchStartIdx = null;
let analysisIdx = -1;
let pendingEvalScore = null;
let currentEvalScore = 0;
let activeEngineTurn = 'w';
let analysisSearchStopPending = false;
let queuedAnalysisFen = null;

let currentBestMove = null;
let summaryWorker = null;
let summaryAnalysisRunId = 0;
let summaryAnalysisTimeout = null;

let userColorSelection = 'w';
let actualPlayerColor = 'w';
let showLegalMoves = true;
let autoFlipPvP = false;

let moveCategoryMap = {};

const moveQualityBadges = {
    brilliant: { symbol: '‼', label: 'Harika hamle' },
    best: { symbol: '★', label: 'En iyi hamle' },
    good: { symbol: '👍', label: 'İyi hamle' },
    inaccuracy: { symbol: '?!', label: 'Hatalı hamle' },
    mistakes: { symbol: '?', label: 'Hata' },
    blunders: { symbol: '??', label: 'Büyük hata' },
    missed: { symbol: '✕', label: 'Kaçan kazanma fırsatı' }
};

let liveReviewPly = null;
const liveReviewGame = new Chess();

function getDisplayedGame() {
    if (isAnalysisMode) return analysisGame;
    if (liveReviewPly === null) return game;

    liveReviewGame.reset();
    const moves = game.history({ verbose: true });
    const visibleCount = Math.min(liveReviewPly, moves.length);
    for (let i = 0; i < visibleCount; i++) {
        const move = moves[i];
        liveReviewGame.move({ from: move.from, to: move.to, promotion: move.promotion });
    }
    return liveReviewGame;
}

function showLiveReviewPosition(ply) {
    if (isAnalysisMode) return;
    const moveCount = game.history({ verbose: true }).length;
    liveReviewPly = Math.max(0, Math.min(ply, moveCount));
    if (liveReviewPly >= moveCount) liveReviewPly = null;
    selectedSquare = null;
    renderBoard();
    updateStatus();
}

function returnToLivePosition() {
    liveReviewPly = null;
}

let playSoundsEnabled = true;
let moveSoundVolume = 1;
let kingCheckEffectEnabled = true;
let moveAudioContext = null;
let currentPieceSet = 'neo';

const pieceThemeURLs = {
    neo: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/300/',
    alpha: 'https://images.chesscomfiles.com/chess-themes/pieces/alpha/300/'
};

function getPieceSVG(key) {
    const baseUrl = pieceThemeURLs[currentPieceSet] || pieceThemeURLs.neo;
    const isWhite = key === key.toUpperCase();
    const prefix = isWhite ? 'w' : 'b';
    const pieceChar = key.toLowerCase();
    return `${baseUrl}${prefix}${pieceChar}.png`;
}

const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

const openingDatabase = [
    { moves: ['e4'], name: 'Şah Piyonu Açılışı' },
    { moves: ['d4'], name: 'Vezir Piyonu Açılışı' },
    { moves: ['c4'], name: 'İngiliz Açılışı' },
    { moves: ['Nf3'], name: 'Réti Açılışı' },
    { moves: ['e4', 'e5'], name: 'Açık Oyun' },
    { moves: ['e4', 'c5'], name: 'Sicilya Savunması' },
    { moves: ['e4', 'e6'], name: 'Fransız Savunması' },
    { moves: ['e4', 'c6'], name: 'Caro-Kann Savunması' },
    { moves: ['e4', 'd5'], name: 'İskandinav Savunması' },
    { moves: ['e4', 'Nf6'], name: 'Alekhine Savunması' },
    { moves: ['e4', 'g6'], name: 'Modern Savunma' },
    { moves: ['d4', 'd5'], name: 'Kapalı Oyun' },
    { moves: ['d4', 'Nf6'], name: 'Hint Savunması' },
    { moves: ['d4', 'f5'], name: 'Hollanda Savunması' },
    { moves: ['e4', 'e5', 'Nf3'], name: 'Şah Atı Açılışı' },
    { moves: ['e4', 'e5', 'f4'], name: 'Şah Gambiti' },
    { moves: ['d4', 'd5', 'c4'], name: 'Vezir Gambiti' },
    { moves: ['e4', 'e5', 'Nf3', 'Nc6'], name: 'Açık Oyun' },
    { moves: ['e4', 'e5', 'Nf3', 'Nf6'], name: 'Petrov Savunması' },
    { moves: ['d4', 'Nf6', 'c4', 'g6'], name: 'Hint Savunması' },
    { moves: ['d4', 'Nf6', 'c4', 'e6'], name: 'Hint Savunması' },
    { moves: ['d4', 'd5', 'c4', 'e6'], name: 'Vezir Gambiti Reddedildi' },
    { moves: ['d4', 'd5', 'c4', 'dxc4'], name: 'Vezir Gambiti Kabul Edildi' },
    { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3'], name: 'Dört At Oyunu' },
    { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'], name: 'İtalyan Açılışı (Giuoco Piano)' },
    { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7'], name: 'Şah-Hint Savunması' },
    { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'], name: 'Ruy Lopez (İspanyol)' },
    { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'], name: 'İtalyan Açılışı' }
];

// The full, CC0-licensed Lichess opening dataset is loaded before this file.
if (Array.isArray(window.zatoOpeningDatabase)) {
    for (const [eco, name, moveLine] of window.zatoOpeningDatabase) {
        openingDatabase.push({ eco, name, moves: moveLine.split(' ') });
    }
}


$(document).off('click', '#logoToggleBtn').on('click', '#logoToggleBtn', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('#mainSidebar').toggleClass('collapsed');
});

function initStockfish() {
    try {
        const workerCode = "importScripts('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');";
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        stockfishWorker = new Worker(URL.createObjectURL(blob));

        stockfishWorker.onmessage = function (event) {
            const message = event.data;
            if (typeof message !== 'string') return;
            if (analysisSearchStopPending && !message.startsWith('bestmove')) return;

            const depthMatch = message.match(/depth (\d+)/);
            const currentDepth = depthMatch ? parseInt(depthMatch[1]) : 0;

            if (message.includes('score cp')) {
                const parts = message.split(' ');
                const cpIdx = parts.indexOf('cp');
                if (cpIdx !== -1 && parts[cpIdx + 1]) {
                    let score = parseInt(parts[cpIdx + 1]);
                    const engineSide = activeEngineTurn;
                    if (engineSide === 'b') score = -score;
                    pendingEvalScore = { score: score, isMate: false };
                }
            } else if (message.includes('score mate')) {
                const parts = message.split(' ');
                const mateIdx = parts.indexOf('mate');
                if (mateIdx !== -1 && parts[mateIdx + 1]) {
                    let mateIn = parseInt(parts[mateIdx + 1]);
                    const engineSide = activeEngineTurn;
                    if (engineSide === 'b') mateIn = -mateIn;
                    pendingEvalScore = { score: mateIn, isMate: true };
                }
            }

            if ((isAnalysisMode || isReviewing) && pendingEvalScore && currentDepth >= 5) {
                updateEvalBar(pendingEvalScore.score, pendingEvalScore.isMate);
            }

            if (message.startsWith('bestmove')) {
                if (discardEngineBestMove) {
                    discardEngineBestMove = false;
                    analysisSearchStopPending = false;
                    pendingEvalScore = null;
                    isEngineThinking = false;
                    const nextFen = queuedAnalysisFen;
                    queuedAnalysisFen = null;
                    if (nextFen && (isAnalysisMode || isReviewing)) {
                        activeEngineTurn = nextFen.split(' ')[1] || 'w';
                        stockfishWorker.postMessage('position fen ' + nextFen);
                        stockfishWorker.postMessage('go depth 8');
                        isEngineThinking = true;
                    } else if (nextFen && !isGameOver && vsBot && game.turn() !== actualPlayerColor) {
                        triggerStockfishMove();
                    }
                    return;
                }
                if (analysisSearchStopPending) {
                    analysisSearchStopPending = false;
                    isEngineThinking = false;
                    pendingEvalScore = null;
                    const nextFen = queuedAnalysisFen;
                    queuedAnalysisFen = null;
                    if (nextFen && (isAnalysisMode || isReviewing)) {
                        activeEngineTurn = nextFen.split(' ')[1] || 'w';
                        stockfishWorker.postMessage('position fen ' + nextFen);
                        stockfishWorker.postMessage('go depth 8');
                        isEngineThinking = true;
                    }
                    return;
                }
                isEngineThinking = false;

                if (isAnalysisMode || isReviewing) {
                    const activeGame = isAnalysisMode ? analysisGame : game;
                    if (activeGame.in_checkmate()) {
                        const winnerIsWhite = activeGame.turn() === 'b';
                        updateEvalBar(winnerIsWhite ? 1 : -1, true, true);
                    } else if (activeGame.in_draw() || activeGame.in_stalemate() || activeGame.in_threefold_repetition()) {
                        updateEvalBar(0, false);
                    } else if (pendingEvalScore) {
                        updateEvalBar(pendingEvalScore.score, pendingEvalScore.isMate);
                    }
                    pendingEvalScore = null;
                }

                const moveStr = message.split(' ')[1];

                if (isAnalysisMode && moveStr && moveStr !== '(none)') {
                    currentBestMove = moveStr;
                    const from = moveStr.substring(0, 2);
                    const to = moveStr.substring(2, 4);
                    drawBestMoveArrow(from, to);
                    return;
                }

                if (isReviewing || isAnalysisMode) return;

                const botTurnColor = actualPlayerColor === 'w' ? 'b' : 'w';
                if (!isGameOver && moveStr && moveStr !== '(none)' && vsBot && game.turn() === botTurnColor && !game.game_over()) {
                    const from = moveStr.substring(0, 2);
                    const to = moveStr.substring(2, 4);
                    const promotion = moveStr.length > 4 ? moveStr.substring(4, 5) : 'q';

                    const moveObj = game.move({ from: from, to: to, promotion: promotion });
                    if (moveObj) returnToLivePosition();
                    if (moveObj && botTurnColor === 'w' && !clockStarted) {
                        clockStarted = true;
                        startTimer();
                    }

                    if (timeIncrementInSeconds > 0) {
                        if (botTurnColor === 'w') whiteTime += timeIncrementInSeconds;
                        else blackTime += timeIncrementInSeconds;
                        updateTimerDisplay();
                    }

                    playMoveSound(moveObj, Boolean(moveObj && moveObj.captured));
                    renderBoard();
                    updateStatus();
                }
            }
        };

        stockfishWorker.onerror = function (err) {
            console.error("Stockfish Worker Hatası:", err);
            isEngineThinking = false;
        };
    } catch (e) {
        console.error("Stockfish başlatılamadı:", e);
    }
}

function updateEvalBar(score, isMate, isCheckmate = false) {
    let scoreText, descText, percentage;

    if (isCheckmate) {
        const winner = score > 0 ? 'Beyaz' : 'Siyah';
        scoreText = 'MAT';
        descText = `Şah mat — ${winner} kazandı`;
        percentage = score > 0 ? 98 : 2;
    } else if (isMate) {
        scoreText = score > 0 ? `#M${score}` : `-M${Math.abs(score)}`;
        descText = score > 0 ? `Beyaz ${score} hamlede mat ediyor` : `Siyah ${Math.abs(score)} hamlede mat ediyor`;
        percentage = score > 0 ? 98 : 2;
    } else {
        let evalVal = (score / 100).toFixed(1);
        if (evalVal > 0) evalVal = '+' + evalVal;
        scoreText = evalVal;
        descText = formatEvalDescription(score);
        percentage = 50 + (score / 15);
        percentage = Math.max(5, Math.min(95, percentage));
    }

    $('#evalScoreText').text(scoreText);
    $('#evalDescription').text(descText);
    $('#mEvalScoreText').text(scoreText);
    $('#mEvalDescription').text(descText);
    $('#evalBarWhite').css('height', percentage + '%');
}

function formatEvalDescription(score) {
    const abs = Math.abs(score);
    const side = score > 0 ? 'Beyaz' : (score < 0 ? 'Siyah' : null);

    if (abs <= 20) return 'Eşit konum';
    if (abs <= 80) return side ? `${side} hafif üstün` : 'Eşit konum';
    if (abs <= 200) return side ? `${side} belirgin üstün` : 'Eşit konum';
    if (abs <= 500) return side ? `${side} kazanıyor` : 'Eşit konum';
    return side ? `${side} ezici üstünlük` : 'Eşit konum';
}

function showEvalLoading() {
    $('#evalBarWhite').css('height', '50%');
    $('#evalScoreText').text('...');
    $('#evalDescription').text('Hesaplanıyor...');
    $('#mEvalScoreText').text('...');
    $('#mEvalDescription').text('Hesaplanıyor...');
    pendingEvalScore = null;
}

function drawBestMoveArrow(fromSquare, toSquare) {
    clearArrow();
    const getSquareCenter = (sq) => {
        const file = sq.charCodeAt(0) - 97;
        const rank = 8 - parseInt(sq.charAt(1));
        const col = isFlipped ? 7 - file : file;
        const row = isFlipped ? 7 - rank : rank;
        return {
            x: (col + 0.5) * 12.5 + '%',
            y: (row + 0.5) * 12.5 + '%'
        };
    };

    const start = getSquareCenter(fromSquare);
    const end = getSquareCenter(toSquare);

    const svgNS = "http://www.w3.org/2000/svg";
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", start.x);
    line.setAttribute("y1", start.y);
    line.setAttribute("x2", end.x);
    line.setAttribute("y2", end.y);
    line.setAttribute("stroke", "#22c55e");
    line.setAttribute("stroke-width", "5");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("marker-end", "url(#arrowhead)");
    line.setAttribute("id", "activeBestArrow");

    document.getElementById("arrowOverlay").appendChild(line);
}

function clearArrow() {
    const oldLine = document.getElementById("activeBestArrow");
    if (oldLine) oldLine.remove();
}

function requestEngineAnalysis() {
    if (!stockfishWorker) return;
    const targetGame = isAnalysisMode ? analysisGame : game;
    const targetFen = targetGame.fen();
    pendingEvalScore = null;

    if (targetGame.in_checkmate()) {
        queuedAnalysisFen = null;
        if (isEngineThinking && !analysisSearchStopPending) {
            analysisSearchStopPending = true;
            stockfishWorker.postMessage('stop');
        }
        updateEvalBar(targetGame.turn() === 'b' ? 1 : -1, true, true);
        return;
    }

    if (isEngineThinking) {
        queuedAnalysisFen = targetFen;
        if (!analysisSearchStopPending) {
            analysisSearchStopPending = true;
            stockfishWorker.postMessage('stop');
        }
        return;
    }

    queuedAnalysisFen = null;
    activeEngineTurn = targetFen.split(' ')[1] || 'w';
    stockfishWorker.postMessage('position fen ' + targetFen);
    stockfishWorker.postMessage('go depth 8');
    isEngineThinking = true;
}

function playMoveSound(moveObj, isCapture) {
    if (!playSoundsEnabled) return;

    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        if (!moveAudioContext || moveAudioContext.state === 'closed') {
            moveAudioContext = new AudioContextClass();
        }
        const ctx = moveAudioContext;

        const playSound = () => {
            if (!playSoundsEnabled || ctx.state !== 'running') return;

            try {
                const bufferSize = Math.floor(ctx.sampleRate * 0.08);
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }

                const noise = ctx.createBufferSource();
                noise.buffer = buffer;

                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(isCapture ? 400 : 800, ctx.currentTime);

                const gain = ctx.createGain();
                gain.gain.setValueAtTime((isCapture ? 0.8 : 0.5) * moveSoundVolume, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);

                noise.onended = () => {
                    noise.disconnect();
                    filter.disconnect();
                    gain.disconnect();
                };
                noise.start();
            } catch (e) {}
        };

        if (ctx.state === 'suspended') {
            ctx.resume().then(playSound).catch(() => {});
        } else {
            playSound();
        }
    } catch (e) {}
}


function localizeOpeningName(name) {
    const exactTranslations = [
        ["Nimzowitsch Defense", "Nimzowitsch Savunması"],
        ["Sicilian Defense", "Sicilya Savunması"],
        ["French Defense", "Fransız Savunması"],
        ["Caro-Kann Defense", "Caro-Kann Savunması"],
        ["Alekhine Defense", "Alekhine Savunması"],
        ["Scandinavian Defense", "İskandinav Savunması"],
        ["Pirc Defense", "Pirc Savunması"],
        ["Modern Defense", "Modern Savunma"],
        ["Dutch Defense", "Hollanda Savunması"],
        ["King's Indian Defense", "Şah-Hint Savunması"],
        ["Queen's Indian Defense", "Vezir-Hint Savunması"],
        ["Indian Defense", "Hint Savunması"],
        ["Queen's Gambit", "Vezir Gambiti"],
        ["King's Gambit", "Şah Gambiti"],
        ["Italian Game", "İtalyan Açılışı"],
        ["English Opening", "İngiliz Açılışı"],
        ["Réti Opening", "Réti Açılışı"],
        ["Reti Opening", "Réti Açılışı"],
        ["King's Pawn Opening", "Şah Piyonu Açılışı"],
        ["Queen's Pawn Opening", "Vezir Piyonu Açılışı"],
        ["Four Knights Game", "Dört At Oyunu"],
        ["Petrov's Defense", "Petrov Savunması"],
        ["Petrov Defense", "Petrov Savunması"],
        ["Bishop's Opening", "Fil Açılışı"],
        ["Vienna Game", "Viyana Oyunu"],
        ["Ruy Lopez", "Ruy Lopez (İspanyol Açılışı)"],
        ["King's Indian", "Şah-Hint"],
        ["Queen's Indian", "Vezir-Hint"],
        ["Nimzo-Indian", "Nimzo-Hint"],
        ["Old Indian", "Eski Hint"],
        ["Bogo-Indian", "Bogo-Hint"],
        ["Grünfeld", "Grünfeld"],
        ["Queen's Gambit", "Vezir Gambiti"],
        ["King's Gambit", "Şah Gambiti"],
        ["Queen's Pawn", "Vezir Piyonu"],
        ["King's Pawn", "Şah Piyonu"],
        ["Bird Opening", "Bird Açılışı"],
        ["Réti", "Réti"],
        ["Benoni", "Benoni"],
        ["Catalan Opening", "Katalan Açılışı"],
        ["Slav Defense", "Slav Savunması"],
        ["Semi-Slav Defense", "Yarı-Slav Savunması"],
        ["King's Indian Attack", "Şah-Hint Atağı"],
        ["London System", "Londra Sistemi"],
        ["Colle System", "Colle Sistemi"],
        ["Trompowsky Attack", "Trompowsky Atağı"],
        ["Polish Opening", "Polonya Açılışı"],
        ["Scotch Game", "İskoç Oyunu"],
        ["Spanish Game", "İspanyol Oyunu"],
        ["Four Knights", "Dört At"],
        ["Three Knights", "Üç At"],
        ["Two Knights", "İki At"],
        ["Open Game", "Açık Oyun"],
        ["Closed Game", "Kapalı Oyun"]
    ];

    for (const [english, turkish] of exactTranslations) {
        if (name === english || name.startsWith(english + ":")) {
            name = turkish + name.slice(english.length);
            break;
        }
    }

    const terms = [
        [/\bCountergambit\b/g, "Karşı Gambit"],
        [/\bDefense\b/g, "Savunması"],
        [/\bDefence\b/g, "Savunması"],
        [/\bOpening\b/g, "Açılışı"],
        [/\bGambit\b/g, "Gambiti"],
        [/\bAttack\b/g, "Atağı"],
        [/\bGame\b/g, "Oyunu"],
        [/\bSystem\b/g, "Sistemi"],
        [/\bVariation\b/g, "Varyantı"],
        [/\bLine\b/g, "Hattı"],
        [/\bAccepted\b/g, "Kabul Edildi"],
        [/\bDeclined\b/g, "Reddedildi"],
        [/\bExchange\b/g, "Değişim"],
        [/\bClassical\b/g, "Klasik"],
        [/\bClassical Variation\b/g, "Klasik Varyant"],
        [/\bModern\b/g, "Modern"],
        [/\bIndian\b/g, "Hint"],
        [/\bSicilian\b/g, "Sicilya"],
        [/\bFrench\b/g, "Fransız"],
        [/\bDutch\b/g, "Hollanda"],
        [/\bEnglish\b/g, "İngiliz"],
        [/\bSpanish\b/g, "İspanyol"],
        [/\bItalian\b/g, "İtalyan"],
        [/\bScandinavian\b/g, "İskandinav"],
        [/\bVienna\b/g, "Viyana"],
        [/\bAustrian\b/g, "Avusturya"],
        [/\bHungarian\b/g, "Macar"],
        [/\bPolish\b/g, "Polonya"],
        [/\bRussian\b/g, "Rus"],
        [/\bGerman\b/g, "Alman"],
        [/\bDanish\b/g, "Danimarka"],
        [/\bDutch\b/g, "Hollanda"],
        [/\bQueen's\b/g, "Vezir"],
        [/\bKing's\b/g, "Şah"],
        [/\bPawn\b/g, "Piyonu"],
        [/\bBishop\b/g, "Fil"],
        [/\bKnight\b/g, "At"],
        [/\bRook\b/g, "Kale"],
        [/\bQueen\b/g, "Vezir"],
        [/\bKing\b/g, "Şah"],
        [/\bCenter\b/g, "Merkez"],
        [/\bCentre\b/g, "Merkez"],
        [/\bWing\b/g, "Kanat"],
        [/\bSide\b/g, "Kanat"],
        [/\bFianchetto\b/g, "Fianchetto"],
        [/\bTarrasch\b/g, "Tarrasch"],
        [/\bClassical\b/g, "Klasik"],
        [/\bSymmetrical\b/g, "Simetrik"],
        [/\bAccelerated\b/g, "Hızlandırılmış"],
        [/\bHyperaccelerated\b/g, "Aşırı Hızlandırılmış"],
        [/\bRetreat\b/g, "Geri Çekilme"],
        [/\bBlitz\b/g, "Blitz"],
        [/\bTrap\b/g, "Tuzağı"],
        [/\bGunderam\b/g, "Gunderam"]
    ];

    for (const [pattern, translated] of terms) {
        name = name.replace(pattern, translated);
    }

    return name;
}

function findOpeningForSide(historySAN, side) {
    let bestMatch = null;

    for (const opening of openingDatabase) {
        const owner = (opening.moves.length % 2 === 1) ? 'w' : 'b';
        if (owner !== side || opening.moves.length > historySAN.length) continue;

        const matches = opening.moves.every((move, index) => historySAN[index] === move);
        if (matches && (!bestMatch || opening.moves.length > bestMatch.moves.length)) {
            bestMatch = opening;
        }
    }

    return bestMatch;
}

function detectOpening(side) {
    const historySAN = getDisplayedGame().history();
    const opening = findOpeningForSide(historySAN, side);
    if (opening) return '📖 ' + localizeOpeningName(opening.name);
    if (side === 'b' && historySAN.length >= 2 && findOpeningForSide(historySAN, 'w')) return '📖 Özel savunma adı yok';
    return '📖 ...';
}

function drawChessComCapturedPieces(capturedArr, isWhiteCaptures) {
    if (!capturedArr || capturedArr.length === 0) return '';

    const order = ['p', 'n', 'b', 'r', 'q'];
    const counts = { p: 0, n: 0, b: 0, r: 0, q: 0 };

    capturedArr.forEach(p => {
        const key = p.toLowerCase();
        if (counts[key] !== undefined) counts[key]++;
    });

    let html = '';

    order.forEach(type => {
        const count = counts[type];
        if (count > 0) {
            html += `<div class="captured-group flex items-center shrink-0">`;
            for (let i = 0; i < count; i++) {
                const imgKey = isWhiteCaptures ? type : type.toUpperCase();
                const stackedClass = i > 0 ? '-ml-1.5' : '';
                html += `<img src="${getPieceSVG(imgKey)}" class="w-3.5 h-3.5 object-contain ${stackedClass}">`;
            }
            html += `</div>`;
        }
    });

    return html;
}

function updatePlayerCards() {
    const activeGame = getDisplayedGame();
    const history = activeGame.history({ verbose: true });

    let whiteCaptured = [];
    let blackCaptured = [];

    history.forEach(m => {
        if (m.captured) {
            if (m.color === 'w') {
                whiteCaptured.push(m.captured);
            } else {
                blackCaptured.push(m.captured);
            }
        }
    });

    const elo = $('#botElo').val();
    updateBotEloUI(elo);

    if (vsBot) {
        const topColor = isFlipped ? 'w' : 'b';
        const bottomColor = isFlipped ? 'b' : 'w';
        const topIsUser = actualPlayerColor === topColor;
        const bottomIsUser = actualPlayerColor === bottomColor;

        $('#topPlayerName').text(topIsUser ? 'Siz' : 'Stockfish Bot');
        $('#topPlayerElo').text(topIsUser ? '(1500)' : `(${elo})`);
        $('#bottomPlayerName').text(bottomIsUser ? 'Siz' : 'Stockfish Bot');
        $('#bottomPlayerElo').text(bottomIsUser ? '(1500)' : `(${elo})`);

        $('#topAvatar')
            .text(topColor === 'w' ? '♙' : '♟')
            .toggleClass('bg-zinc-100 text-zinc-900', topColor === 'w')
            .toggleClass('bg-zinc-900 text-white', topColor === 'b');
        $('#bottomAvatar')
            .text(bottomColor === 'w' ? '♙' : '♟')
            .toggleClass('bg-zinc-100 text-zinc-900', bottomColor === 'w')
            .toggleClass('bg-zinc-900 text-white', bottomColor === 'b');
    } else {
        const topColor = isFlipped ? 'w' : 'b';
        const bottomColor = isFlipped ? 'b' : 'w';
        $('#topPlayerName').text(isFlipped ? 'Oyuncu 1 (Beyaz)' : 'Oyuncu 2 (Siyah)');
        $('#bottomPlayerName').text(isFlipped ? 'Oyuncu 2 (Siyah)' : 'Oyuncu 1 (Beyaz)');
        $('#topPlayerElo').text('');
        $('#bottomPlayerElo').text('');
        $('#topAvatar')
            .text(topColor === 'w' ? '♙' : '♟')
            .toggleClass('bg-zinc-100 text-zinc-900', topColor === 'w')
            .toggleClass('bg-zinc-900 text-white', topColor === 'b');
        $('#bottomAvatar')
            .text(bottomColor === 'w' ? '♙' : '♟')
            .toggleClass('bg-zinc-100 text-zinc-900', bottomColor === 'w')
            .toggleClass('bg-zinc-900 text-white', bottomColor === 'b');
    }

    const openingForWhite = detectOpening('w');
    const openingForBlack = detectOpening('b');

    if (!isFlipped) {
        $('#topOpeningText').text(openingForBlack);
        $('#bottomOpeningText').text(openingForWhite);
    } else {
        $('#topOpeningText').text(openingForWhite);
        $('#bottomOpeningText').text(openingForBlack);
    }

    if (!isFlipped) {
        $('#topCapturedPieces').html(drawChessComCapturedPieces(blackCaptured, false));
        $('#bottomCapturedPieces').html(drawChessComCapturedPieces(whiteCaptured, true));
    } else {
        $('#topCapturedPieces').html(drawChessComCapturedPieces(whiteCaptured, true));
        $('#bottomCapturedPieces').html(drawChessComCapturedPieces(blackCaptured, false));
    }

    const whiteMaterial = whiteCaptured.reduce((sum, piece) => sum + (pieceValues[piece.toLowerCase()] || 0), 0);
    const blackMaterial = blackCaptured.reduce((sum, piece) => sum + (pieceValues[piece.toLowerCase()] || 0), 0);
    const materialDiff = whiteMaterial - blackMaterial;

    const topIsWhite = isFlipped;
    const topDiff = topIsWhite ? materialDiff : -materialDiff;
    const bottomDiff = -topDiff;

    $('#topMaterialDiff').text(topDiff > 0 ? `+${topDiff}` : '');
    $('#bottomMaterialDiff').text(bottomDiff > 0 ? `+${bottomDiff}` : '');
}

function updateBotEloUI(selectedElo) {
    $('.bot-level-btn').each(function() {
        const btnElo = $(this).attr('data-elo');
        if (btnElo === String(selectedElo)) {
            $(this)
                .addClass('bg-blue-600 text-white font-bold border-blue-500 shadow-lg scale-[1.02]')
                .removeClass('bg-[#09090b] text-zinc-300 border-zinc-800');
        } else {
            $(this)
                .addClass('bg-[#09090b] text-zinc-300 border-zinc-800')
                .removeClass('bg-blue-600 text-white font-bold border-blue-500 shadow-lg scale-[1.02]');
        }
    });
}

window.surrenderGame = function(position) {
    if (isGameOver) return;
    const surrenderingColor = (position === 'bottom' && !isFlipped) || (position === 'top' && isFlipped) ? 'Beyaz' : 'Siyah';
    const winner = surrenderingColor === 'Beyaz' ? 'Siyah' : 'Beyaz';

    if (confirm(`${surrenderingColor} oyuncusu oyunu terk etmek istiyor. Onaylıyor musunuz?`)) {
        if (timerInterval) clearInterval(timerInterval);
        if (stockfishWorker) stockfishWorker.postMessage('stop');
        isEngineThinking = false;
        showGameOverModal(`${winner} Kazandı!`, `${surrenderingColor} oyuncu oyunu terk etti (Surrender).`, '🏳️');
    }
};

window.offerDraw = function(position) {
    if (isGameOver) return;
    
    if (vsBot) {
        alert("Stockfish Bot: Beraberlik teklifinizi reddediyorum!");
    } else {
        const offeringPlayer = (position === 'bottom' && !isFlipped) || (position === 'top' && isFlipped) ? 'Beyaz' : 'Siyah';
        if (confirm(`${offeringPlayer} oyuncusu beraberlik teklif ediyor. Kabul ediyor musunuz?`)) {
            if (timerInterval) clearInterval(timerInterval);
            if (stockfishWorker) stockfishWorker.postMessage('stop');
            isEngineThinking = false;
            showGameOverModal('Berabere!', 'Oyuncular karşılıklı beraberlik konusunda anlaştı.', '🤝');
        }
    }
};

function renderBoard() {
    const $board = $('#board');
    $board.empty();

    const activeGame = getDisplayedGame();
    const historyVerbose = activeGame.history({ verbose: true });
    let lastMove = null;
    if (isAnalysisMode) {
        if (analysisIdx >= 0 && analysisMoveHistory[analysisIdx]) {
            lastMove = analysisMoveHistory[analysisIdx];
        }
    } else {
        if (historyVerbose.length > 0) {
            lastMove = historyVerbose[historyVerbose.length - 1];
        }
    }

    const boardState = activeGame.board();

    let inCheckSquare = null;
    if (kingCheckEffectEnabled && activeGame.in_check()) {
        const turnColor = activeGame.turn();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = boardState[r][c];
                if (p && p.type === 'k' && p.color === turnColor) {
                    const f = String.fromCharCode(97 + c);
                    const rankNum = 8 - r;
                    inCheckSquare = f + rankNum;
                    break;
                }
            }
        }
    }

    let legalSquares = {};
    if (selectedSquare && showLegalMoves && (!isGameOver || isReviewing || isAnalysisMode)) {
        const validMoves = activeGame.moves({ square: selectedSquare, verbose: true });
        validMoves.forEach(m => {
            legalSquares[m.to] = m.captured ? 'capture' : 'move';
        });
    }

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const rowIdx = isFlipped ? 7 - r : r;
            const colIdx = isFlipped ? 7 - c : c;

            const file = String.fromCharCode(97 + colIdx);
            const rank = 8 - rowIdx;
            const squareName = file + rank;
            const piece = boardState[rowIdx][colIdx];
            const isLight = (rowIdx + colIdx) % 2 === 0;

            const $square = $('<div></div>')
                .addClass('w-full h-full flex items-center justify-center select-none')
                .addClass(isLight ? 'square-light' : 'square-dark')
                .attr('data-square', squareName);

            // Koordinatları yalnızca tahtanın görünen sol ve alt kenarındaki karelere ekle.
            if (c === 0) {
                $('<span></span>')
                    .addClass('board-coordinate board-coordinate-rank')
                    .text(squareName[1])
                    .appendTo($square);
            }
            if (r === 7) {
                $('<span></span>')
                    .addClass('board-coordinate board-coordinate-file')
                    .text(squareName[0])
                    .appendTo($square);
            }

            if (selectedSquare === squareName) {
                $square.addClass('selected');
            }

            if (lastMove && (squareName === lastMove.from || squareName === lastMove.to)) {
                $square.addClass('last-move-highlight');
            }

            if (inCheckSquare === squareName) {
                $square.addClass('king-check-highlight');
            }

            if (legalSquares[squareName]) {
                if (legalSquares[squareName] === 'capture') {
                    $square.addClass('legal-capture-ring');
                } else {
                    $square.addClass('legal-move-dot');
                }
            }

            if (piece) {
                const key = piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
                const $img = $('<img>').attr('src', getPieceSVG(key)).addClass('piece');
                $square.append($img);
            }

            // Sembolü hedef karenin pseudo-element katmanına bağla; taşın flex düzeni etkilenmez.
            if (isAnalysisMode && lastMove && squareName === lastMove.to) {
                const category = moveCategoryMap[analysisIdx];
                const badge = moveQualityBadges[category];
                if (badge) {
                    $square
                        .addClass('analysis-quality-' + category)
                        .attr('data-quality-symbol', badge.symbol)
                        .attr('data-quality-label', badge.label);
                }
            }

            $board.append($square);
        }
    }

    updatePlayerCards();
}

function handleMove(from, to) {
    if (!isAnalysisMode && liveReviewPly !== null) {
        returnToLivePosition();
        renderBoard();
    }
    if (isGameOver && !isReviewing && !isAnalysisMode) return;

    if (!isAnalysisMode && !isReviewing) {
        const isBotTurn = vsBot && game.turn() !== actualPlayerColor;
        if (isBotTurn || isEngineThinking) return;
    }

    const activeGame = isAnalysisMode ? analysisGame : game;
    const movingPiece = activeGame.get(from);
    const isWhite = activeGame.turn() === 'w';

    if (movingPiece && movingPiece.type === 'p') {
        const reachesPromotionRank = (isWhite && to.charAt(1) === '8') || (!isWhite && to.charAt(1) === '1');
        const isLegalPromotionMove = reachesPromotionRank && activeGame.moves({ square: from, verbose: true })
            .some(move => move.to === to && move.promotion);

        if (isLegalPromotionMove) {
            pendingMove = { from: from, to: to };
            openPromotionModal(isWhite ? 'w' : 'b');
            return;
        }
    }

    executeMove(from, to, 'q');
}

function executeMove(from, to, promoPiece) {
    if (isGameOver && !isReviewing && !isAnalysisMode) return;

    const activeGame = isAnalysisMode ? analysisGame : game;
    const movingColor = activeGame.turn();

    const moveObj = activeGame.move({ from: from, to: to, promotion: promoPiece });

    if (moveObj !== null) {
        if (!isAnalysisMode && !isReviewing && movingColor === 'w') clockStarted = true;
        if (!isAnalysisMode && activeGame === game) returnToLivePosition();
        if (!isAnalysisMode && !isReviewing && timeIncrementInSeconds > 0) {
            if (movingColor === 'w') whiteTime += timeIncrementInSeconds;
            else blackTime += timeIncrementInSeconds;
            updateTimerDisplay();
        }

        playMoveSound(moveObj, Boolean(moveObj && moveObj.captured));
        selectedSquare = null;

        if (isAnalysisMode) {
            if (analysisBranchStartIdx === null || analysisIdx < analysisBranchStartIdx) {
                analysisBranchStartIdx = analysisIdx;
                analysisMoveHistory = analysisMainlineHistory.slice(0, analysisIdx + 1);
            } else {
                analysisMoveHistory = analysisMoveHistory.slice(0, analysisIdx + 1);
            }
            analysisMoveHistory.push(moveObj);
            analysisIdx = analysisMoveHistory.length - 1;
        }

        if (!vsBot && autoFlipPvP && !isReviewing && !isAnalysisMode) {
            isFlipped = !isFlipped;
        }

        renderBoard();
        updateStatus();

        if (isAnalysisMode) {
            showEvalLoading();
            requestEngineAnalysis();
            return;
        }

        if (!isReviewing) {
            startTimer();
            const botTurnColor = actualPlayerColor === 'w' ? 'b' : 'w';
            if (vsBot && game.turn() === botTurnColor && !game.game_over()) {
                triggerStockfishMove();
            }
        } else {
            showEvalLoading();
            requestEngineAnalysis();
        }
    } else {
        const piece = activeGame.get(to);
        if (piece && piece.color === activeGame.turn()) {
            selectedSquare = to;
        } else {
            selectedSquare = null;
        }
        renderBoard();
    }
}

function openPromotionModal(color) {
    const qKey = color === 'w' ? 'Q' : 'q';
    const rKey = color === 'w' ? 'R' : 'r';
    const bKey = color === 'w' ? 'B' : 'b';
    const nKey = color === 'w' ? 'N' : 'n';

    $('#pImgQ').attr('src', getPieceSVG(qKey));
    $('#pImgR').attr('src', getPieceSVG(rKey));
    $('#pImgB').attr('src', getPieceSVG(bKey));
    $('#pImgN').attr('src', getPieceSVG(nKey));

    $('#promotionModal').removeClass('hidden');
}

$('.promo-choice').on('click', function() {
    const chosenPiece = $(this).attr('data-piece');
    $('#promotionModal').addClass('hidden');
    if (pendingMove) {
        executeMove(pendingMove.from, pendingMove.to, chosenPiece);
        pendingMove = null;
    }
});

function triggerStockfishMove() {
    if (!stockfishWorker || isGameOver || isReviewing || isAnalysisMode) return;
    if (discardEngineBestMove || analysisSearchStopPending) {
        queuedAnalysisFen = game.fen();
        return;
    }

    isEngineThinking = true;
    const elo = parseInt($('#botElo').val()) || 1400;
    const fen = game.fen();

    let depth = 1;
    if (elo >= 400) depth = 2;
    if (elo >= 800) depth = 3;
    if (elo >= 1200) depth = 4;
    if (elo >= 1400) depth = 6;
    if (elo >= 1600) depth = 9;
    if (elo >= 1800) depth = 12;
    if (elo >= 2000) depth = 15;
    if (elo >= 2200) depth = 18;

    const skillLevelByElo = {
        250: 0,
        400: 1,
        800: 4,
        1200: 8,
        1400: 10,
        1600: 12,
        1800: 14,
        2000: 17,
        2200: 20
    };
    const skillLevel = skillLevelByElo[elo] ?? 10;

    stockfishWorker.postMessage('stop');
    stockfishWorker.postMessage('setoption name Skill Level value ' + skillLevel);
    stockfishWorker.postMessage('position fen ' + fen);
    stockfishWorker.postMessage('go depth ' + depth);
}

$('#board').on('click', 'div[data-square]', function () {
    if (isGameOver && !isReviewing && !isAnalysisMode) return;

    if (!isAnalysisMode && !isReviewing) {
        const isBotTurn = vsBot && game.turn() !== actualPlayerColor;
        if (isBotTurn || isEngineThinking) return;
    }

    const square = $(this).attr('data-square');
    const activeGame = isAnalysisMode ? analysisGame : game;

    if (!selectedSquare) {
        const piece = activeGame.get(square);
        if (piece && piece.color === activeGame.turn()) {
            selectedSquare = square;
            renderBoard();
        }
    } else {
        handleMove(selectedSquare, square);
    }
});

function syncTempoSelection(valStr) {
    const selectedValue = String(valStr);
    $('#timeSelect').val(selectedValue);
    $('.tempo-option-btn').each(function() {
        const isSelected = String($(this).attr('data-time')) === selectedValue;
        $(this)
            .toggleClass('active-tempo border-emerald-500', isSelected)
            .toggleClass('border-zinc-800', !isSelected);
    });
}

function parseTimeControl(valStr) {
    if (valStr.includes('-')) {
        const parts = valStr.split('-');
        selectedTimeInSeconds = parseInt(parts[0]);
        timeIncrementInSeconds = parseInt(parts[1]);
    } else {
        selectedTimeInSeconds = parseInt(valStr);
        timeIncrementInSeconds = 0;
    }
}

$('#timeSelect').on('change', function() {
    const timeVal = $(this).val();
    parseTimeControl(timeVal);
    syncTempoSelection(timeVal);
    resetGame();
});

$('#toggleLegalMoves').on('change', function() {
    showLegalMoves = $(this).is(':checked');
    renderBoard();
});

$('#toggleAutoFlip').on('change', function() {
    autoFlipPvP = $(this).is(':checked');
});

$('.side-choice-btn').on('click', function() {
    $('.side-choice-btn').removeClass('bg-blue-600 text-white font-bold').addClass('text-zinc-400');
    $(this).addClass('bg-blue-600 text-white font-bold').removeClass('text-zinc-400');
    
    userColorSelection = $(this).attr('data-color');
    resetGame();
});

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    if (!clockStarted) return;
    timerInterval = setInterval(() => {
        if (game.game_over() || isGameOver || isReviewing || isAnalysisMode) { clearInterval(timerInterval); return; }
        if (game.turn() === 'w') {
            if (whiteTime > 0) {
                whiteTime--;
            } else {
                isGameOver = true;
                showGameOverModal('Siyah Kazandı!', 'Beyaz oyuncunun süresi bitti.', '⏳');
                clearInterval(timerInterval);
            }
        } else {
            if (blackTime > 0) {
                blackTime--;
            } else {
                isGameOver = true;
                showGameOverModal('Beyaz Kazandı!', 'Siyah oyuncunun süresi bitti.', '⏳');
                clearInterval(timerInterval);
            }
        }
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const format = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
    const formattedWhite = format(whiteTime);
    const formattedBlack = format(blackTime);
    const whiteActive = game.turn() === 'w';
    const blackActive = game.turn() === 'b';

    $('#whiteTimer').text(formattedWhite);
    $('#blackTimer').text(formattedBlack);

    const applyTimerStyle = (selector, isActive, remaining) => {
        const timer = $(selector);
        timer.removeClass('text-emerald-400 bg-emerald-950 border-emerald-600 shadow-[0_0_10px_rgba(52,211,153,0.35)] text-red-100 bg-red-950 border-red-500 shadow-[0_0_14px_rgba(248,113,113,0.65)] animate-pulse');

        const elements = timer.get();
        if (remaining < 60) {
            timer.addClass('animate-pulse');
            elements.forEach(element => {
                element.style.setProperty('color', '#ffffff', 'important');
                element.style.setProperty('background-color', '#b91c1c', 'important');
                element.style.setProperty('border', '2px solid #f87171', 'important');
                element.style.setProperty('box-shadow', '0 0 14px rgba(248, 113, 113, 0.85)', 'important');
            });
        } else {
            elements.forEach(element => {
                element.style.removeProperty('color');
                element.style.removeProperty('background-color');
                element.style.removeProperty('border');
                element.style.removeProperty('box-shadow');
            });
            if (isActive) {
                timer.addClass('text-emerald-400 bg-emerald-950 border-emerald-600 shadow-[0_0_10px_rgba(52,211,153,0.35)]');
            }
        }
    };

    applyTimerStyle('#whiteTimer', whiteActive, whiteTime);
    applyTimerStyle('#blackTimer', blackActive, blackTime);

    if (!isFlipped) {
        $('#topTimerMobile, #topTimerDesktop').text(formattedBlack);
        $('#bottomTimerMobile, #bottomTimerDesktop').text(formattedWhite);
        applyTimerStyle('#topTimerMobile', blackActive, blackTime);
        applyTimerStyle('#bottomTimerMobile', whiteActive, whiteTime);
        applyTimerStyle('#topTimerDesktop', blackActive, blackTime);
        applyTimerStyle('#bottomTimerDesktop', whiteActive, whiteTime);
    } else {
        $('#topTimerMobile, #topTimerDesktop').text(formattedWhite);
        $('#bottomTimerMobile, #bottomTimerDesktop').text(formattedBlack);
        applyTimerStyle('#topTimerMobile', whiteActive, whiteTime);
        applyTimerStyle('#bottomTimerMobile', blackActive, blackTime);
        applyTimerStyle('#topTimerDesktop', whiteActive, whiteTime);
        applyTimerStyle('#bottomTimerDesktop', blackActive, blackTime);
    }
}

function showGameOverModal(title, reason, icon = '🏆') {
    isGameOver = true;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (stockfishWorker && isEngineThinking) {
        discardEngineBestMove = true;
        stockfishWorker.postMessage('stop');
    } else if (stockfishWorker) {
        stockfishWorker.postMessage('stop');
    }
    isEngineThinking = false;
    $('#modalTitle').text(title);
    $('#modalReason').text(reason);
    $('#modalIcon').text(icon);
    $('#gameOverModal').removeClass('hidden');
}

function updateStatus() {
    const reviewingLivePosition = !isAnalysisMode && liveReviewPly !== null;
    const activeGame = isAnalysisMode ? analysisGame : getDisplayedGame();
    const moveColor = activeGame.turn() === 'b' ? 'Siyah' : 'Beyaz';

    if (activeGame.in_checkmate()) {
        if (isAnalysisMode) {
            $('#status').text('Analiz: Şah Mat');
        } else if (reviewingLivePosition) {
            $('#status').text('🔍 Geçmiş Konum (Şah Mat)');
        } else if (!isReviewing) {
            isGameOver = true;
            $('#status').text('Şah Mat!');
            if (vsBot) {
                const userWon = game.turn() !== actualPlayerColor;
                if (userWon) {
                    showGameOverModal('Tebrikler, Kazandın!', 'Stockfish botunu şah mat ettin!', '🎉');
                } else {
                    showGameOverModal('Kaybettin!', 'Stockfish botu seni şah mat etti.', '💀');
                }
            } else {
                const winner = game.turn() === 'b' ? 'Beyaz' : 'Siyah';
                showGameOverModal(`${winner} Kazandı!`, 'Şah mat ile oyun sona erdi.', '🏆');
            }
        } else {
            $('#status').text('İnceleme Modu (Şah Mat)');
        }
    } else if (activeGame.in_draw()) {
        if (isAnalysisMode) {
            $('#status').text('Analiz: Berabere');
        } else if (reviewingLivePosition) {
            $('#status').text('🔍 Geçmiş Konum (Berabere)');
        } else if (!isReviewing) {
            isGameOver = true;
            $('#status').text('Berabere');
            showGameOverModal('Berabere!', 'Oyun beraberlik ile sonuçlandı.', '🤝');
        } else {
            $('#status').text('İnceleme Modu (Berabere)');
        }
    } else {
        let statusText = 'Sıra: ' + moveColor;
        if (activeGame.in_check()) statusText = moveColor + ' (Şah!)';
        if (reviewingLivePosition) statusText = '🔍 Geçmiş Konum — ' + statusText;
        else if (isAnalysisMode) statusText = '🔍 Analiz — ' + statusText;
        else if (isReviewing) statusText = '🔍 İnceleme — ' + statusText;
        $('#status').text(statusText);
    }

    if (isAnalysisMode) {
        renderAnalysisPGN();
    } else {
        renderLivePGN();
    }
}

function renderLivePGN() {
    const activeHistory = game.history({ verbose: true });
    let pgnHtml = '';
    let mobilePgnHtml = '';

    for (let i = 0; i < activeHistory.length; i += 2) {
        const round = Math.floor(i / 2) + 1;
        const whiteMove = activeHistory[i].from + '→' + activeHistory[i].to;
        const blackMove = activeHistory[i + 1] ? activeHistory[i + 1].from + '→' + activeHistory[i + 1].to : '';

        pgnHtml += `
            <div class="py-1 border-b border-zinc-800/50 flex justify-between gap-2 items-center">
                <span class="text-zinc-600 font-semibold">${round}.</span>
                <span class="pgn-move text-zinc-300 font-medium" onclick="jumpToMove(${i})">${whiteMove}</span>
                <span class="pgn-move text-blue-400 font-medium" onclick="jumpToMove(${i + 1})">${blackMove}</span>
            </div>`;

        mobilePgnHtml += `<span class="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300"><span class="text-zinc-500 font-bold mr-1">${round}.</span>${whiteMove} ${blackMove}</span>`;
    }

    $('#pgn').html(pgnHtml);
    $('#mobilePgnList').html(mobilePgnHtml || '<span class="text-zinc-600 italic">Henüz hamle yapılmadı</span>');

    const pgnDiv = document.getElementById('pgn');
    if (pgnDiv) pgnDiv.scrollTop = pgnDiv.scrollHeight;

    const mobileStrip = document.getElementById('mobileMoveStrip');
    if (mobileStrip) mobileStrip.scrollLeft = mobileStrip.scrollWidth;
}

function getBadgeHtml(catKey) {
    const badge = moveQualityBadges[catKey];
    if (!badge) return '';

    const badgeClasses = {
        brilliant: 'bg-cyan-950 text-cyan-400 border-cyan-800',
        best: 'bg-emerald-950 text-emerald-400 border-emerald-800',
        good: 'bg-green-950 text-green-400 border-green-800',
        inaccuracy: 'bg-amber-950 text-amber-400 border-amber-800',
        mistakes: 'bg-orange-950 text-orange-400 border-orange-800',
        blunders: 'bg-red-950 text-red-400 border-red-800',
        missed: 'bg-purple-950 text-purple-400 border-purple-800'
    };

    return '<span class="ml-0.5 px-0.5 rounded text-[9px] font-black border ' +
        badgeClasses[catKey] + '">' + badge.symbol + '</span>';
}

function renderAnalysisPGN() {
    let pgnHtml = '';
    let mobilePgnHtml = '';

    for (let i = 0; i < analysisMoveHistory.length; i += 2) {
        const round = Math.floor(i / 2) + 1;
        const whiteActive = (i === analysisIdx) ? 'pgn-move-active' : '';
        const blackActive = (i + 1 === analysisIdx) ? 'pgn-move-active' : '';

        const whiteCat = moveCategoryMap[i];
        const blackCat = moveCategoryMap[i + 1];

        const whiteBadge = getBadgeHtml(whiteCat);
        const blackBadge = getBadgeHtml(blackCat);

        const whiteMove = analysisMoveHistory[i].from + '→' + analysisMoveHistory[i].to;
        const blackMove = analysisMoveHistory[i + 1] ? analysisMoveHistory[i + 1].from + '→' + analysisMoveHistory[i + 1].to : '';

        pgnHtml += `
            <div class="py-1 border-b border-zinc-800/50 flex justify-between gap-2 items-center">
                <span class="text-zinc-600 font-semibold">${round}.</span>
                <span class="pgn-move text-zinc-300 font-medium ${whiteActive}" onclick="jumpToMove(${i})">${whiteMove}${whiteBadge}</span>
                <span class="pgn-move text-blue-400 font-medium ${blackActive}" onclick="jumpToMove(${i + 1})">${blackMove}${blackBadge}</span>
            </div>`;

        mobilePgnHtml += `
            <span class="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300 flex items-center gap-1">
                <span class="text-zinc-500 font-bold">${round}.</span>
                <span class="cursor-pointer ${whiteActive}" onclick="jumpToMove(${i})">${whiteMove}${whiteBadge}</span>
                ${blackMove ? `<span class="cursor-pointer ${blackActive}" onclick="jumpToMove(${i + 1})">${blackMove}${blackBadge}</span>` : ''}
            </span>`;
    }

    $('#pgn').html(pgnHtml || '<span class="text-zinc-600 italic">Analiz için hamle yok</span>');
    $('#mobilePgnList').html(mobilePgnHtml || '<span class="text-zinc-600 italic">Analiz için hamle yok</span>');

    const activeEl = document.querySelector('.pgn-move-active');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest', inline: 'center' });
}

window.jumpToMove = function(idx) {
    if (isAnalysisMode) {
        if (idx >= -1 && idx < analysisMoveHistory.length) {
            analysisIdx = idx;
            updateAnalysisBoard();
        }
    } else {
        const moveCount = game.history({ verbose: true }).length;
        if (idx >= 0 && idx < moveCount) showLiveReviewPosition(idx + 1);
    }
};

function closePreAnalysisSummary() {
    summaryAnalysisRunId++;
    if (summaryAnalysisTimeout) {
        clearTimeout(summaryAnalysisTimeout);
        summaryAnalysisTimeout = null;
    }
    if (summaryWorker) {
        summaryWorker.terminate();
        summaryWorker = null;
    }
    $('#preAnalysisSummary').addClass('hidden');
}

function openPreAnalysisSummary() {
    const history = game.history({ verbose: true });
    if (!history.length) {
        startAnalysisMode();
        return;
    }

    closePreAnalysisSummary();
    moveCategoryMap = {};
    const runId = ++summaryAnalysisRunId;
    $('#gameOverModal').addClass('hidden');
    $('#preAnalysisSummary').removeClass('hidden');
    $('#summaryResult').text(game.in_checkmate()
        ? (game.turn() === 'b' ? 'Beyaz kazandı · Şah mat' : 'Siyah kazandı · Şah mat')
        : game.in_draw() ? 'Berabere' : 'Maç özeti');
    $('#summaryMoveCount').text(history.length);
    const summaryHistorySAN = history.map(move => move.san);
    const summaryWhiteOpening = findOpeningForSide(summaryHistorySAN, 'w');
    const summaryBlackOpening = findOpeningForSide(summaryHistorySAN, 'b');
    $('#summaryWhiteOpening').text(summaryWhiteOpening ? '📖 ' + localizeOpeningName(summaryWhiteOpening.name) : 'Tanımlanamadı');
    $('#summaryBlackOpening').text(summaryBlackOpening ? '📖 ' + localizeOpeningName(summaryBlackOpening.name) : 'Tanımlanamadı');
    $('#summaryBookMoves').text('Hesaplanıyor…');
    $('#summaryProgressBar').css('width', '0%');
    $('#summaryProgressText').text('Konumlar Stockfish ile değerlendiriliyor…');
    $('#summaryContinueBtn').prop('disabled', true);

    $('#summaryWhiteAccuracy, #summaryBlackAccuracy, #summaryWhiteBrilliant, #summaryBlackBrilliant, #summaryWhiteBest, #summaryBlackBest, #summaryWhiteGood, #summaryBlackGood, #summaryWhiteInaccuracy, #summaryBlackInaccuracy, #summaryWhiteMistakes, #summaryBlackMistakes, #summaryWhiteBlunders, #summaryBlackBlunders, #summaryWhiteMissed, #summaryBlackMissed, #summaryWhiteAcpl, #summaryBlackAcpl').text('—');

    const positions = [];
    const terminalScores = [];
    const replay = new Chess();
    positions.push(replay.fen());
    terminalScores.push(null);

    history.forEach(move => {
        replay.move(move);
        positions.push(replay.fen());
        terminalScores.push(replay.in_checkmate()
            ? (replay.turn() === 'b' ? 10000 : -10000)
            : null);
    });

    let matchedOpeningPlies = 0;
    const sans = history.map(move => move.san);
    openingDatabase.forEach(opening => {
        let matched = 0;
        for (let i = 0; i < opening.moves.length && i < sans.length; i++) {
            if (opening.moves[i] !== sans[i]) break;
            matched++;
        }
        matchedOpeningPlies = Math.max(matchedOpeningPlies, matched);
    });
    $('#summaryBookMoves').text(matchedOpeningPlies + ' tanımlı');

    const evaluations = [];
    let positionIndex = 0;
    let latestScore = 0;
    let currentFenTurn = 'w';

    const finishWithFallback = (message) => {
        if (runId !== summaryAnalysisRunId) return;
        if (summaryAnalysisTimeout) {
            clearTimeout(summaryAnalysisTimeout);
            summaryAnalysisTimeout = null;
        }
        if (summaryWorker) {
            summaryWorker.terminate();
            summaryWorker = null;
        }
        $('#summaryProgressText').text(message);
        $('#summaryFootnote').text('Stockfish değerlendirmesi tamamlanamadı. Hamle ve tanımlı açılış bilgileri gösteriliyor; detaylı metrikler hesaplanamadı.');
        $('#summaryContinueBtn').prop('disabled', false);
    };

    try {
        const workerCode = "importScripts('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');";
        summaryWorker = new Worker(URL.createObjectURL(new Blob([workerCode], { type: 'application/javascript' })));
    } catch (error) {
        finishWithFallback('Motor başlatılamadı.');
        return;
    }

    summaryWorker.onmessage = function(event) {
        if (runId !== summaryAnalysisRunId) return;
        const message = event.data;
        if (typeof message !== 'string') return;

        if (message.trim() === 'uciok') {
            summaryWorker.postMessage('isready');
            return;
        }

        if (message.trim() === 'readyok') {
            if (summaryAnalysisTimeout) clearTimeout(summaryAnalysisTimeout);
            evaluateNext();
            return;
        }

        const parts = message.split(' ');
        const cpIdx = parts.indexOf('cp');
        const mateIdx = parts.indexOf('mate');

        if (message.includes(' score cp ') && cpIdx !== -1 && parts[cpIdx + 1]) {
            let cp = parseInt(parts[cpIdx + 1], 10);
            latestScore = currentFenTurn === 'b' ? -cp : cp;
        } else if (message.includes(' score mate ') && mateIdx !== -1 && parts[mateIdx + 1]) {
            const mate = parseInt(parts[mateIdx + 1], 10);
            let mateScore = mate > 0 ? 10000 : mate < 0 ? -10000 : 0;
            latestScore = currentFenTurn === 'b' ? -mateScore : mateScore;
        }

        if (message.startsWith('bestmove')) {
            if (summaryAnalysisTimeout) {
                clearTimeout(summaryAnalysisTimeout);
                summaryAnalysisTimeout = null;
            }
            evaluations[positionIndex] = latestScore;
            positionIndex++;
            $('#summaryProgressBar').css('width', Math.round(positionIndex / positions.length * 100) + '%');
            $('#summaryProgressText').text('Konum ' + positionIndex + ' / ' + positions.length + ' değerlendirildi.');
            evaluateNext();
        }
    };

    summaryWorker.onerror = () => finishWithFallback('Stockfish yüklenirken hata oluştu.');

    const evaluateNext = () => {
        if (runId !== summaryAnalysisRunId || !summaryWorker) return;

        if (Number.isFinite(terminalScores[positionIndex])) {
            evaluations[positionIndex] = terminalScores[positionIndex];
            positionIndex++;
            $('#summaryProgressBar').css('width', Math.round(positionIndex / positions.length * 100) + '%');
            $('#summaryProgressText').text('Konum ' + positionIndex + ' / ' + positions.length + ' değerlendirildi.');
            evaluateNext();
            return;
        }

        if (positionIndex >= positions.length) {
            const metrics = {
                w: { losses: [], brilliant: [], best: [], good: [], inaccuracy: [], mistakes: [], blunders: [], missed: [] },
                b: { losses: [], brilliant: [], best: [], good: [], inaccuracy: [], mistakes: [], blunders: [], missed: [] }
            };

            history.forEach((move, i) => {
                const before = evaluations[i];
                const after = evaluations[i + 1];
                if (!Number.isFinite(before) || !Number.isFinite(after)) return;

                const lossCp = Math.max(0, move.color === 'w' ? before - after : after - before);
                const player = metrics[move.color];
                player.losses.push(lossCp);

                const beforeForMover = move.color === 'w' ? before : -before;
                const afterForMover = move.color === 'w' ? after : -after;

                let catKey = 'good';

                if (move.captured && lossCp <= 10 && beforeForMover <= -100 && afterForMover >= 150) {
                    player.brilliant.push(i);
                    catKey = 'brilliant';
                } else if (lossCp <= 12) {
                    player.best.push(i);
                    catKey = 'best';
                } else if (lossCp <= 40) {
                    player.good.push(i);
                    catKey = 'good';
                } else if (lossCp <= 100) {
                    player.inaccuracy.push(i);
                    catKey = 'inaccuracy';
                } else if (lossCp < 300) {
                    player.mistakes.push(i);
                    catKey = 'mistakes';
                } else {
                    player.blunders.push(i);
                    catKey = 'blunders';
                }

                if (beforeForMover >= 250 && afterForMover < 80) {
                    player.missed.push(i);
                    catKey = 'missed';
                }

                moveCategoryMap[i] = catKey;
            });

            const accuracy = (player) => player.losses.length
                ? Math.round(player.losses.reduce((sum, loss) => sum + 100 * Math.exp(-loss / 400), 0) / player.losses.length) + '%'
                : '—';

            const acpl = (player) => player.losses.length
                ? Math.round(player.losses.reduce((a, b) => a + b, 0) / player.losses.length)
                : '—';

            $('#summaryWhiteAccuracy').text(accuracy(metrics.w));
            $('#summaryWhiteBrilliant').text(metrics.w.brilliant.length).data('indices', metrics.w.brilliant);
            $('#summaryWhiteBest').text(metrics.w.best.length).data('indices', metrics.w.best);
            $('#summaryWhiteGood').text(metrics.w.good.length).data('indices', metrics.w.good);
            $('#summaryWhiteInaccuracy').text(metrics.w.inaccuracy.length).data('indices', metrics.w.inaccuracy);
            $('#summaryWhiteMistakes').text(metrics.w.mistakes.length).data('indices', metrics.w.mistakes);
            $('#summaryWhiteBlunders').text(metrics.w.blunders.length).data('indices', metrics.w.blunders);
            $('#summaryWhiteMissed').text(metrics.w.missed.length).data('indices', metrics.w.missed);
            $('#summaryWhiteAcpl').text(acpl(metrics.w));

            $('#summaryBlackAccuracy').text(accuracy(metrics.b));
            $('#summaryBlackBrilliant').text(metrics.b.brilliant.length).data('indices', metrics.b.brilliant);
            $('#summaryBlackBest').text(metrics.b.best.length).data('indices', metrics.b.best);
            $('#summaryBlackGood').text(metrics.b.good.length).data('indices', metrics.b.good);
            $('#summaryBlackInaccuracy').text(metrics.b.inaccuracy.length).data('indices', metrics.b.inaccuracy);
            $('#summaryBlackMistakes').text(metrics.b.mistakes.length).data('indices', metrics.b.mistakes);
            $('#summaryBlackBlunders').text(metrics.b.blunders.length).data('indices', metrics.b.blunders);
            $('#summaryBlackMissed').text(metrics.b.missed.length).data('indices', metrics.b.missed);
            $('#summaryBlackAcpl').text(acpl(metrics.b));

            $('#summaryProgressBar').css('width', '100%');
            $('#summaryProgressText').text('Değerlendirme tamamlandı.');
            if (summaryAnalysisTimeout) {
                clearTimeout(summaryAnalysisTimeout);
                summaryAnalysisTimeout = null;
            }
            summaryWorker.terminate();
            summaryWorker = null;
            $('#summaryContinueBtn').prop('disabled', false);
            return;
        }

        if (summaryAnalysisTimeout) clearTimeout(summaryAnalysisTimeout);
        summaryAnalysisTimeout = setTimeout(() => {
            finishWithFallback('Stockfish bir konumu zamanında değerlendiremedi.');
        }, 20000);

        currentFenTurn = positions[positionIndex].split(' ')[1] || 'w';
        latestScore = 0;
        summaryWorker.postMessage('position fen ' + positions[positionIndex]);
        summaryWorker.postMessage('go depth 6');
    };

    summaryAnalysisTimeout = setTimeout(() => {
        finishWithFallback('Stockfish başlatma yanıtı vermedi; analiz süresi aşıldı.');
    }, 20000);
    summaryWorker.postMessage('uci');
}

$(document).on('click', '.summary-click-cell', function() {
    const indices = $(this).data('indices');
    if (indices && indices.length > 0) {
        const targetMoveIdx = indices[0];
        closePreAnalysisSummary();
        startAnalysisMode();
        jumpToMove(targetMoveIdx);
    }
});

function startAnalysisMode() {
    returnToLivePosition();
    isAnalysisMode = true;
    isReviewing = true;

    $('body').addClass('analysis-mode');

    $('#gameOverModal').addClass('hidden');
    $('#evalBarWrapper').removeClass('hidden');
    $('#evalScoreWrapper').removeClass('hidden');
    
    $('#gameplayConfigGroup').addClass('hidden');
    $('#liveGameControls').addClass('hidden');
    $('#analysisNav').removeClass('hidden');

    if (window.innerWidth <= 768) {
        $('#mobileAnalysisPanel').removeClass('hidden');
        $('#mobileQuickControls').addClass('hidden');
        $('#mobileBottomNav').addClass('hidden');
        $('#mobileAnalysisBottomNav').removeClass('hidden');
        $('#mobileMoveStrip').removeClass('hidden');
    }

    $('#panelTitle').text('🔍 Analiz Modu');

    showEvalLoading();
    currentBestMove = null;
    clearArrow();

    analysisMainlineHistory = game.history({ verbose: true });
    analysisMoveHistory = analysisMainlineHistory.slice();
    analysisBranchStartIdx = null;
    if (analysisIdx < 0) {
        analysisIdx = analysisMoveHistory.length - 1;
    }

    updateAnalysisBoard();
}

function exitAnalysisMode() {
    isAnalysisMode = false;
    isReviewing = false;
    queuedAnalysisFen = null;
    if (stockfishWorker && isEngineThinking) {
        analysisSearchStopPending = true;
        stockfishWorker.postMessage('stop');
    }

    $('body').removeClass('analysis-mode');

    $('#gameplayConfigGroup').removeClass('hidden');
    $('#analysisNav').addClass('hidden');
    $('#liveGameControls').removeClass('hidden');

    $('#mobileAnalysisPanel').addClass('hidden');
    $('#mobileQuickControls').removeClass('hidden');
    $('#mobileAnalysisBottomNav').addClass('hidden');
    $('#mobileBottomNav').removeClass('hidden');

    $('#panelTitle').text('Canlı Karşılaşma');

    $('#evalBarWrapper').addClass('hidden');
    $('#evalScoreWrapper').addClass('hidden');
    $('#evalBarWhite').css('height', '50%');
    $('#evalScoreText').text('+0.0');
    $('#evalDescription').text('Eşit konum');
    $('#mEvalScoreText').text('+0.0');
    $('#mEvalDescription').text('Eşit konum');
    pendingEvalScore = null;
    currentBestMove = null;
    clearArrow();

    analysisMoveHistory = [];
    analysisMainlineHistory = [];
    analysisBranchStartIdx = null;
    analysisIdx = -1;

    renderBoard();
    updateStatus();
    if (!isGameOver && !game.game_over()) startTimer();
}

function updateAnalysisBoard() {
    analysisGame.reset();
    for (let i = 0; i <= analysisIdx; i++) {
        if (analysisMoveHistory[i]) {
            analysisGame.move(analysisMoveHistory[i]);
        }
    }

    selectedSquare = null;
    clearArrow();
    currentBestMove = null;

    showEvalLoading();

    renderBoard();
    updateStatus();
    requestEngineAnalysis();
}

$('#navStart, #mNavStart').on('click', () => { if (isAnalysisMode) { analysisIdx = -1; updateAnalysisBoard(); } });
$('#navPrev, #mNavPrev').on('click', () => { if (isAnalysisMode && analysisIdx > -1) { analysisIdx--; updateAnalysisBoard(); } });
$('#navNext, #mNavNext').on('click', () => { if (!isAnalysisMode) return; if (analysisBranchStartIdx !== null && analysisIdx === analysisBranchStartIdx && analysisIdx < analysisMainlineHistory.length - 1) { analysisMoveHistory = analysisMainlineHistory.slice(); analysisBranchStartIdx = null; } if (analysisIdx < analysisMoveHistory.length - 1) { analysisIdx++; updateAnalysisBoard(); } });
$('#navEnd, #mNavEnd').on('click', () => { if (isAnalysisMode && analysisMoveHistory.length > 0) { analysisIdx = analysisMoveHistory.length - 1; updateAnalysisBoard(); } });

$('#exitAnalysisBtn, #mExitAnalysisBtn').on('click', exitAnalysisMode);

$(document).on('keydown', function(e) {
    if (!isAnalysisMode) return;
    if (e.key === 'ArrowLeft') {
        if (analysisIdx > -1) { analysisIdx--; updateAnalysisBoard(); }
    } else if (e.key === 'ArrowRight') {
        if (analysisBranchStartIdx !== null && analysisIdx === analysisBranchStartIdx && analysisIdx < analysisMainlineHistory.length - 1) { analysisMoveHistory = analysisMainlineHistory.slice(); analysisBranchStartIdx = null; }
        if (analysisIdx < analysisMoveHistory.length - 1) { analysisIdx++; updateAnalysisBoard(); }
    }
});

$('#playBestMoveBtn, #mPlayBestMoveBtn').on('click', playBestMove);

function playBestMove() {
    if (!isAnalysisMode || !currentBestMove) return;
    const from = currentBestMove.substring(0, 2);
    const to = currentBestMove.substring(2, 4);
    const promo = currentBestMove.length > 4 ? currentBestMove.substring(4, 5) : 'q';
    const moveObj = analysisGame.move({ from: from, to: to, promotion: promo });
    if (moveObj) {
        playMoveSound(moveObj, Boolean(moveObj.captured));
        if (analysisBranchStartIdx === null || analysisIdx < analysisBranchStartIdx) {
            analysisBranchStartIdx = analysisIdx;
            analysisMoveHistory = analysisMainlineHistory.slice(0, analysisIdx + 1);
        } else {
            analysisMoveHistory = analysisMoveHistory.slice(0, analysisIdx + 1);
        }
        analysisMoveHistory.push(moveObj);
        analysisIdx = analysisMoveHistory.length - 1;
        clearArrow();
        currentBestMove = null;
        renderBoard();
        updateStatus();
        showEvalLoading();
        requestEngineAnalysis();
    }
}

$('#modePvP, #mModePvP').on('click', function() {
    vsBot = false;
    $('#botEloWrapper, #mBotLevelWrapper').addClass('hidden');
    $('#modePvP, #mModePvP').addClass('bg-blue-600 text-white').removeClass('text-zinc-400');
    $('#modeBot, #mModeBot').removeClass('bg-blue-600 text-white').addClass('text-zinc-400');
    $('#mobileModeText').text('2 Kişilik');
    updatePlayerCards();
    $('#botModal').addClass('hidden');
});

$('#modeBot, #mModeBot').on('click', function() {
    vsBot = true;
    $('#botEloWrapper, #mBotLevelWrapper').removeClass('hidden');
    $('#modeBot, #mModeBot').addClass('bg-blue-600 text-white').removeClass('text-zinc-400');
    $('#modePvP, #mModePvP').removeClass('bg-blue-600 text-white').addClass('text-zinc-400');
    $('#mobileModeText').text('Stockfish');
    updatePlayerCards();
    if (game.turn() !== actualPlayerColor && !game.game_over() && !isReviewing && !isAnalysisMode) {
        triggerStockfishMove();
    }
});

const applyPlayerCardTheme = (theme) => {
    const colors = {
        'theme-red': ['#a81c1c', '#861616'],
        'theme-green': ['#769656', '#5e7944'],
        'theme-wood': ['#b58863', '#916b4e'],
        'theme-dark': ['#374151', '#28303d']
    };
    const [background, border] = colors[theme] || colors['theme-green'];
    document.documentElement.style.setProperty('--player-card-theme-bg', background);
    $('#topPlayerCard, #bottomPlayerCard').css({ backgroundColor: background, borderColor: border });
    $('#topPlayerCard, #bottomPlayerCard').attr('data-board-theme', theme);
};

$(document).on('click', '.theme-option-btn', function(e) {
    e.preventDefault();
    const selectedTheme = $(this).attr('data-theme');$('#board').removeClass('theme-red theme-green theme-wood theme-dark').addClass(selectedTheme);
    applyPlayerCardTheme(selectedTheme);
    $('.theme-option-btn').removeClass('border-blue-500 bg-blue-950/40').addClass('border-zinc-800 bg-[#09090b]');
    $(this).addClass('border-blue-500 bg-blue-950/40').removeClass('border-zinc-800 bg-[#09090b]');
    localStorage.setItem('zato_theme', selectedTheme);
});

$(document).on('click', '.piece-style-btn', function(e) {
    e.preventDefault();
    const $btn =$(this).closest('.piece-style-btn');
    currentPieceSet = $btn.attr('data-style');

    $('.piece-style-btn').removeClass('border-blue-500 bg-blue-950/40').addClass('border-zinc-800 bg-[#09090b]');
    $btn.addClass('border-blue-500 bg-blue-950/40').removeClass('border-zinc-800 bg-[#09090b]');

    localStorage.setItem('zato_piece_style', currentPieceSet);
    renderBoard();
});

$(document).on('click', '.anim-speed-btn', function(e) {
    e.preventDefault();
    const animClass = $(this).attr('data-anim');$('#board').removeClass('anim-off anim-slow anim-normal anim-fast').addClass(animClass);
    $('.anim-speed-btn').removeClass('bg-blue-600 text-white font-bold').addClass('text-zinc-400 font-semibold');$(this).addClass('bg-blue-600 text-white font-bold').removeClass('text-zinc-400 font-semibold');
    localStorage.setItem('zato_anim_speed', animClass);
});

$('#toggleSoundEffects').on('change', function() {
    playSoundsEnabled = $(this).is(':checked');
    localStorage.setItem('zato_sound', playSoundsEnabled);
});

$('#soundVolume').on('input change', function() {
    moveSoundVolume = Number($(this).val()) / 100;
    $('#soundVolumeValue').text($(this).val() + '%');
    localStorage.setItem('zato_sound_volume', $(this).val());
});

$('#toggleKingCheckEffect').on('change', function() {
    kingCheckEffectEnabled = $(this).is(':checked');
    localStorage.setItem('zato_king_check', kingCheckEffectEnabled);
    renderBoard();
});

function loadSavedSettings() {
    const savedTheme = localStorage.getItem('zato_theme') || 'theme-green';
    $('#board').removeClass('theme-red theme-green theme-wood theme-dark').addClass(savedTheme);
    applyPlayerCardTheme(savedTheme);
    $(`.theme-option-btn[data-theme="${savedTheme}"]`).addClass('border-blue-500 bg-blue-950/40').removeClass('border-zinc-800 bg-[#09090b]');

    const savedStyle = localStorage.getItem('zato_piece_style') || 'neo';
    currentPieceSet = savedStyle;
    $(`.piece-style-btn[data-style="${savedStyle}"]`).addClass('border-blue-500 bg-blue-950/40').removeClass('border-zinc-800 bg-[#09090b]');

    const savedAnim = localStorage.getItem('zato_anim_speed') || 'anim-normal';
    $('#board').removeClass('anim-off anim-slow anim-normal anim-fast').addClass(savedAnim);
    $(`.anim-speed-btn[data-anim="${savedAnim}"]`).addClass('bg-blue-600 text-white font-bold').removeClass('text-zinc-400 font-semibold');

    if (localStorage.getItem('zato_sound') !== null) {
        playSoundsEnabled = localStorage.getItem('zato_sound') === 'true';
        $('#toggleSoundEffects').prop('checked', playSoundsEnabled);
    }

    const savedSoundVolume = localStorage.getItem('zato_sound_volume') || '100';
    moveSoundVolume = Number(savedSoundVolume) / 100;
    $('#soundVolume').val(savedSoundVolume);
    $('#soundVolumeValue').text(savedSoundVolume + '%');

    if (localStorage.getItem('zato_king_check') !== null) {
        kingCheckEffectEnabled = localStorage.getItem('zato_king_check') === 'true';
        $('#toggleKingCheckEffect').prop('checked', kingCheckEffectEnabled);
    }
}

function setMobileNavActive(activeBtnId) {
    const btns = ['#mobileNavPlayBtn', '#mobileNavBotBtn', '#mobileNavTempoBtn', '#mobileNavSettingsBtn'];
    btns.forEach(id => {
        const $btn =$(id);
        if (id === activeBtnId) {
            $btn.removeClass('text-zinc-400 font-medium').addClass('text-blue-500 font-bold');
        } else {
            $btn.removeClass('text-blue-500 font-bold').addClass('text-zinc-400 font-medium');
        }
    });
}

$(document).on('click', '#mobileNavPlayBtn', function(e) {
    e.preventDefault();
    setMobileNavActive('#mobileNavPlayBtn');
    $('#tempoModal, #botModal, #settingsModal').addClass('hidden');
    resetGame();
});

$(document).on('click', '#mobileNavBotBtn, #mobileBotModalBtn', function(e) {
    e.preventDefault();
    setMobileNavActive('#mobileNavBotBtn');
    $('#tempoModal, #settingsModal').addClass('hidden');
    $('#botModal').removeClass('hidden');
});

$(document).on('click', '#mobileNavTempoBtn, #mobileTempoModalBtn', function(e) {
    e.preventDefault();
    setMobileNavActive('#mobileNavTempoBtn');
    $('#botModal, #settingsModal').addClass('hidden');
    $('#tempoModal').removeClass('hidden');
});

$(document).on('click', '#mobileNavSettingsBtn, #openSettingsBtn, #mobileSettingsModalBtn', function(e) {
    e.preventDefault();
    setMobileNavActive('#mobileNavSettingsBtn');
    $('#tempoModal, #botModal').addClass('hidden');
    $('#settingsModal').removeClass('hidden');
});

$(document).on('click', '.close-modal-btn', function(e) {
    e.preventDefault();
    $('#tempoModal, #botModal, #settingsModal').addClass('hidden');
    setMobileNavActive('#mobileNavPlayBtn');
});

$('#tempoModal, #botModal, #settingsModal').on('click', function(e) {
    if (e.target === this) {
        $(this).addClass('hidden');
        setMobileNavActive('#mobileNavPlayBtn');
    }
});

$('.tempo-option-btn').on('click', function() {
    const timeVal = $(this).attr('data-time');
    parseTimeControl(timeVal);
    syncTempoSelection(timeVal);
    $('#tempoModal').addClass('hidden');
    setMobileNavActive('#mobileNavPlayBtn');
    resetGame();
});

$('.bot-level-btn').on('click', function() {
    const eloVal = $(this).attr('data-elo');$('#botElo').val(eloVal);
    updateBotEloUI(eloVal);
    updatePlayerCards();
    $('#botModal').addClass('hidden');
    setMobileNavActive('#mobileNavPlayBtn');
});

$('#liveNavStart').on('click', () => showLiveReviewPosition(0));
$('#liveNavPrev').on('click', () => {
    const moveCount = game.history({ verbose: true }).length;
    const currentPly = liveReviewPly === null ? moveCount : liveReviewPly;
    showLiveReviewPosition(Math.max(0, currentPly - 1));
});
$('#liveNavNext').on('click', () => {
    const moveCount = game.history({ verbose: true }).length;
    const currentPly = liveReviewPly === null ? moveCount : liveReviewPly;
    showLiveReviewPosition(Math.min(moveCount, currentPly + 1));
});
$('#liveNavEnd').on('click', () => showLiveReviewPosition(game.history({ verbose: true }).length));

$('#quickFlipBtn, #flipBtn').on('click', function (e) {
    e.preventDefault();
    isFlipped = !isFlipped;
    renderBoard();
    updateTimerDisplay();
    if (isAnalysisMode && currentBestMove) {
        drawBestMoveArrow(currentBestMove.substring(0, 2), currentBestMove.substring(2, 4));
    }
});

$('#quickUndoBtn, #undoBtn').on('click', function () {
    if (isAnalysisMode) return;
    returnToLivePosition();
    if (isGameOver && !isReviewing) return;
    if (stockfishWorker && isEngineThinking) {
        discardEngineBestMove = true;
        stockfishWorker.postMessage('stop');
        isEngineThinking = false;
    }
    game.undo();
    if (vsBot && !isReviewing) game.undo();
    selectedSquare = null;
    renderBoard();
    updateStatus();

    if (vsBot && !isReviewing && !isGameOver && !game.game_over() && game.turn() !== actualPlayerColor) {
        triggerStockfishMove();
    }
});

$('#botElo').on('change', function() {
    updateBotEloUI($(this).val());
    updatePlayerCards();
});

function resetGame() {
    closePreAnalysisSummary();
    const engineSearchPending = Boolean(stockfishWorker && (isEngineThinking || discardEngineBestMove));
    if (engineSearchPending) {
        discardEngineBestMove = true;
        analysisSearchStopPending = true;
        isEngineThinking = true;
        stockfishWorker.postMessage('stop');
    } else if (stockfishWorker) {
        stockfishWorker.postMessage('stop');
        discardEngineBestMove = false;
        analysisSearchStopPending = false;
        isEngineThinking = false;
    }
    game.reset();
    analysisGame.reset();
    returnToLivePosition();

    $('body').removeClass('analysis-mode');

    analysisMoveHistory = [];
    analysisIdx = -1;
    isAnalysisMode = false;
    pendingMove = null;
    isGameOver = false;
    isReviewing = false;
    queuedAnalysisFen = null;
    pendingEvalScore = null;
    currentEvalScore = 0;
    currentBestMove = null;
    moveCategoryMap = {};
    clearArrow();

    if (userColorSelection === 'r') {
        actualPlayerColor = Math.random() < 0.5 ? 'w' : 'b';
    } else {
        actualPlayerColor = userColorSelection;
    }

    isFlipped = actualPlayerColor === 'b';

    $('#promotionModal').addClass('hidden');
    
    $('#gameplayConfigGroup').removeClass('hidden');
    $('#analysisNav').addClass('hidden');
    $('#liveGameControls').removeClass('hidden');

    $('#mobileAnalysisPanel').addClass('hidden');
    $('#mobileQuickControls').removeClass('hidden');

    $('#panelTitle').text('Canlı Karşılaşma');
    selectedSquare = null;
    whiteTime = selectedTimeInSeconds;
    blackTime = selectedTimeInSeconds;
    clockStarted = false;
    if (timerInterval) clearInterval(timerInterval);
    $('#gameOverModal').addClass('hidden');

    $('#evalBarWrapper').addClass('hidden');
    $('#evalScoreWrapper').addClass('hidden');
    $('#evalBarWhite').css('height', '50%');
    $('#evalScoreText').text('+0.0');
    $('#evalDescription').text('Eşit konum');
    $('#mEvalScoreText').text('+0.0');
    $('#mEvalDescription').text('Eşit konum');

    updateTimerDisplay();
    renderBoard();
    updateStatus();
    startTimer();

    if (vsBot && actualPlayerColor === 'b') {
        triggerStockfishMove();
    }
}

$('#resetBtn, #modalResetBtn, #quickResetBtn').on('click', function(e) {
    e.preventDefault();
    resetGame();
});

$('#reviewBoardBtn').on('click', function() {
    openPreAnalysisSummary();
});

$('#closeSummaryBtn, #summaryCloseBackBtn').on('click', function() {
    closePreAnalysisSummary();
    if (isGameOver && !isAnalysisMode) {
        $('#gameOverModal').removeClass('hidden');
    }
});

$('#summaryContinueBtn').on('click', function() {
    if ($(this).prop('disabled')) return;
    closePreAnalysisSummary();
    startAnalysisMode();
});

$('#gameOverModal').on('click', function(e) {
    if (e.target === this) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('hidden');
    }
});

initStockfish();
loadSavedSettings();
syncTempoSelection($('#timeSelect').val());
updateTimerDisplay();
renderBoard();
updateStatus();
startTimer();
