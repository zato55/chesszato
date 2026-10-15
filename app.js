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

let stockfishWorker = null;

let isEngineThinking = false;
let discardEngineBestMove = false;
let isGameOver = false;
let isReviewing = false;

let isAnalysisMode = false;
let analysisMoveHistory = [];
let analysisIdx = -1;
let pendingEvalScore = null;
let currentEvalScore = 0;
let analysisSearchStopPending = false;
let queuedAnalysisFen = null;

let currentBestMove = null;

let userColorSelection = 'w';
let actualPlayerColor = 'w';
let showLegalMoves = true;
let autoFlipPvP = false;

// ⚙️ AYARLAR VE DİNAMİK TERCİHLER
let playSoundsEnabled = true;
let kingCheckEffectEnabled = true;
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
    { moves: ['d4', 'Nf6', 'c4', 'g6'], name: 'Şah-Hint Savunması' },
    { moves: ['d4', 'Nf6', 'c4', 'e6'], name: 'Nimzo / Bogo-Hint' },
    { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'], name: 'Ruy Lopez (İspanyol)' },
    { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'], name: 'İtalyan Açılışı' }
];

$('#logoToggleBtn').on('click', function() {
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
                    const engineSide = isAnalysisMode ? analysisGame.turn() : game.turn();
                    if (engineSide === 'b') score = -score;
                    pendingEvalScore = { score: score, isMate: false };
                }
            } else if (message.includes('score mate')) {
                const parts = message.split(' ');
                const mateIdx = parts.indexOf('mate');
                if (mateIdx !== -1 && parts[mateIdx + 1]) {
                    let mateIn = parseInt(parts[mateIdx + 1]);
                    const engineSide = isAnalysisMode ? analysisGame.turn() : game.turn();
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
                        stockfishWorker.postMessage('position fen ' + nextFen);
                        stockfishWorker.postMessage('go depth 8');
                        isEngineThinking = true;
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
                        updateEvalBar(winnerIsWhite ? 1 : -1, true);
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

                    const targetPiece = game.get(to);
                    const moveObj = game.move({ from: from, to: to, promotion: promotion });

                    if (timeIncrementInSeconds > 0) {
                        if (botTurnColor === 'w') whiteTime += timeIncrementInSeconds;
                        else blackTime += timeIncrementInSeconds;
                        updateTimerDisplay();
                    }

                    playMoveSound(moveObj, targetPiece !== null);
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

function updateEvalBar(score, isMate) {
    let scoreText, descText, percentage;

    if (isMate) {
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
        updateEvalBar(targetGame.turn() === 'b' ? 1 : -1, true);
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
    stockfishWorker.postMessage('position fen ' + targetFen);
    stockfishWorker.postMessage('go depth 8');
    isEngineThinking = true;
}

function playMoveSound(moveObj, isCapture) {
    if (!playSoundsEnabled) return;

    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = ctx.sampleRate * 0.03;
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
        gain.gain.setValueAtTime(isCapture ? 0.3 : 0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
    } catch (e) {}
}

function detectOpening(side) {
    const activeGame = isAnalysisMode ? analysisGame : game;
    const historySAN = activeGame.history();
    if (historySAN.length === 0) return '📖 ...';

    let bestMatch = '📖 ...';
    let maxMatchedMoves = 0;

    for (const opening of openingDatabase) {
        const owner = (opening.moves.length % 2 === 1) ? 'w' : 'b';
        if (owner !== side) continue;

        if (opening.moves.length <= historySAN.length) {
            let match = true;
            for (let i = 0; i < opening.moves.length; i++) {
                if (historySAN[i] !== opening.moves[i]) {
                    match = false;
                    break;
                }
            }
            if (match && opening.moves.length > maxMatchedMoves) {
                maxMatchedMoves = opening.moves.length;
                bestMatch = '📖 ' + opening.name;
            }
        }
    }
    return bestMatch;
}

function updatePlayerCards() {
    const activeGame = isAnalysisMode ? analysisGame : game;
    const history = activeGame.history({ verbose: true });

    let whiteCaptured = [];
    let blackCaptured = [];
    let whiteScore = 0;
    let blackScore = 0;

    history.forEach(m => {
        if (m.captured) {
            if (m.color === 'w') {
                whiteCaptured.push(m.captured);
                whiteScore += pieceValues[m.captured] || 0;
            } else {
                blackCaptured.push(m.captured);
                blackScore += pieceValues[m.captured] || 0;
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
            .toggleClass('bg-zinc-800 text-zinc-300', topColor === 'b');
        $('#bottomAvatar')
            .text(bottomColor === 'w' ? '♙' : '♟')
            .toggleClass('bg-zinc-100 text-zinc-900', bottomColor === 'w')
            .toggleClass('bg-zinc-800 text-zinc-300', bottomColor === 'b');
    } else {
        $('#topPlayerName').text(isFlipped ? 'Oyuncu 1 (Beyaz)' : 'Oyuncu 2 (Siyah)');
        $('#bottomPlayerName').text(isFlipped ? 'Oyuncu 2 (Siyah)' : 'Oyuncu 1 (Beyaz)');
        $('#topPlayerElo').text('');
        $('#bottomPlayerElo').text('');
    }

    const drawIcons = (capturedArr, isWhiteCaptures) => {
        return capturedArr.map(p => {
            const key = isWhiteCaptures ? p.toLowerCase() : p.toUpperCase();
            return `<img src="${getPieceSVG(key)}" class="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain opacity-80 inline-block">`;
        }).join('');
    };

    if (!isFlipped) {
        $('#topCapturedPieces').html(drawIcons(blackCaptured, false));
        $('#bottomCapturedPieces').html(drawIcons(whiteCaptured, true));

        $('#topMaterialDiff').text(blackScore > whiteScore ? `+${blackScore - whiteScore}` : '');
        $('#bottomMaterialDiff').text(whiteScore > blackScore ? `+${whiteScore - blackScore}` : '');
    } else {
        $('#topCapturedPieces').html(drawIcons(whiteCaptured, true));
        $('#bottomCapturedPieces').html(drawIcons(blackCaptured, false));

        $('#topMaterialDiff').text(whiteScore > blackScore ? `+${whiteScore - blackScore}` : '');
        $('#bottomMaterialDiff').text(blackScore > whiteScore ? `+${blackScore - whiteScore}` : '');
    }
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
    const $board =$('#board');
    $board.empty();

    const activeGame = isAnalysisMode ? analysisGame : game;
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

            const $square =$('<div></div>')
                .addClass('w-full h-full flex items-center justify-center select-none')
                .addClass(isLight ? 'square-light' : 'square-dark')
                .attr('data-square', squareName);

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
                const $img =$('<img>').attr('src', getPieceSVG(key)).addClass('piece');
                $square.append($img);
            }

            $board.append($square);
        }
    }

    updatePlayerCards();
}

function handleMove(from, to) {
    if (isGameOver && !isReviewing && !isAnalysisMode) return;

    if (!isAnalysisMode && !isReviewing) {
        const isBotTurn = vsBot && game.turn() !== actualPlayerColor;
        if (isBotTurn || isEngineThinking) return;
    }

    const activeGame = isAnalysisMode ? analysisGame : game;
    const movingPiece = activeGame.get(from);
    const isWhite = activeGame.turn() === 'w';

    if (movingPiece && movingPiece.type === 'p') {
        if ((isWhite && to.charAt(1) === '8') || (!isWhite && to.charAt(1) === '1')) {
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
    const targetPiece = activeGame.get(to);
    const movingColor = activeGame.turn();

    const moveObj = activeGame.move({ from: from, to: to, promotion: promoPiece });

    if (moveObj !== null) {
        if (!isAnalysisMode && !isReviewing && timeIncrementInSeconds > 0) {
            if (movingColor === 'w') whiteTime += timeIncrementInSeconds;
            else blackTime += timeIncrementInSeconds;
            updateTimerDisplay();
        }

        playMoveSound(moveObj, targetPiece !== null);
        selectedSquare = null;

        if (isAnalysisMode) {
            analysisMoveHistory = analysisMoveHistory.slice(0, analysisIdx + 1);
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
    const chosenPiece = $(this).attr('data-piece');$('#promotionModal').addClass('hidden');
    if (pendingMove) {
        executeMove(pendingMove.from, pendingMove.to, chosenPiece);
        pendingMove = null;
    }
});

function triggerStockfishMove() {
    if (!stockfishWorker || isGameOver || isReviewing || isAnalysisMode) return;

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

    // Stockfish Skill Level deliberately weakens play at lower settings.
    // Elo labels are approximate; Stockfish's built-in Elo limiter cannot represent the lowest menu levels.
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
    parseTimeControl($(this).val());
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
    $('.side-choice-btn').removeClass('bg-blue-600 text-white font-bold').addClass('text-zinc-400');$(this).addClass('bg-blue-600 text-white font-bold').removeClass('text-zinc-400');
    
    userColorSelection = $(this).attr('data-color');
    resetGame();
});

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
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
        timer.removeClass('text-emerald-300 bg-emerald-950 border-emerald-700 shadow-[0_0_8px_rgba(52,211,153,0.25)] text-red-200 bg-red-950 border-red-700 animate-pulse');
        if (isActive && remaining <= 30) {
            timer.addClass('text-red-200 bg-red-950 border-red-700 animate-pulse');
        } else if (isActive) {
            timer.addClass('text-emerald-300 bg-emerald-950 border-emerald-700 shadow-[0_0_8px_rgba(52,211,153,0.25)]');
        }
    };

    applyTimerStyle('#whiteTimer', whiteActive, whiteTime);
    applyTimerStyle('#blackTimer', blackActive, blackTime);

    if (!isFlipped) {
        $('#topTimerMobile').text(formattedBlack);
        $('#bottomTimerMobile').text(formattedWhite);
        applyTimerStyle('#topTimerMobile', blackActive, blackTime);
        applyTimerStyle('#bottomTimerMobile', whiteActive, whiteTime);
    } else {
        $('#topTimerMobile').text(formattedWhite);
        $('#bottomTimerMobile').text(formattedBlack);
        applyTimerStyle('#topTimerMobile', whiteActive, whiteTime);
        applyTimerStyle('#bottomTimerMobile', blackActive, blackTime);
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
    const activeGame = isAnalysisMode ? analysisGame : game;
    const moveColor = activeGame.turn() === 'b' ? 'Siyah' : 'Beyaz';

    const openingForWhite = detectOpening('w');
    const openingForBlack = detectOpening('b');

    if (!isFlipped) {
        $('#topOpeningText').text(openingForBlack);
        $('#bottomOpeningText').text(openingForWhite);
    } else {
        $('#topOpeningText').text(openingForWhite);
        $('#bottomOpeningText').text(openingForBlack);
    }

    if (activeGame.in_checkmate()) {
        if (isAnalysisMode) {
            $('#status').text('Analiz: Şah Mat');
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
        if (isAnalysisMode) statusText = '🔍 Analiz — ' + statusText;
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

        mobilePgnHtml += `<span class="bg-zinc-900 px-2 py-1 rounded border border-zinc-800 text-zinc-300"><span class="text-zinc-500 font-bold mr-1">${round}.</span>${whiteMove} ${blackMove}</span>`;
    }

    $('#pgn').html(pgnHtml);
    $('#mobilePgnList').html(mobilePgnHtml || '<span class="text-zinc-600 italic">Henüz hamle yapılmadı</span>');

    const pgnDiv = document.getElementById('pgn');
    if (pgnDiv) pgnDiv.scrollTop = pgnDiv.scrollHeight;

    const mobileStrip = document.getElementById('mobileMoveStrip');
    if (mobileStrip) mobileStrip.scrollLeft = mobileStrip.scrollWidth;
}

function renderAnalysisPGN() {
    let pgnHtml = '';

    for (let i = 0; i < analysisMoveHistory.length; i += 2) {
        const round = Math.floor(i / 2) + 1;
        const whiteActive = (i === analysisIdx) ? 'pgn-move-active' : '';
        const blackActive = (i + 1 === analysisIdx) ? 'pgn-move-active' : '';

        const whiteMove = analysisMoveHistory[i].from + '→' + analysisMoveHistory[i].to;
        const blackMove = analysisMoveHistory[i + 1] ? analysisMoveHistory[i + 1].from + '→' + analysisMoveHistory[i + 1].to : '';

        pgnHtml += `
            <div class="py-1 border-b border-zinc-800/50 flex justify-between gap-2 items-center">
                <span class="text-zinc-600 font-semibold">${round}.</span>
                <span class="pgn-move text-zinc-300 font-medium ${whiteActive}" onclick="jumpToMove(${i})">${whiteMove}</span>
                <span class="pgn-move text-blue-400 font-medium ${blackActive}" onclick="jumpToMove(${i + 1})">${blackMove}</span>
            </div>`;
    }

    $('#pgn').html(pgnHtml || '<span class="text-zinc-600 italic">Analiz için hamle yok</span>');

    const activeEl = document.querySelector('.pgn-move-active');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
}

window.jumpToMove = function(idx) {
    if (isAnalysisMode) {
        if (idx >= -1 && idx < analysisMoveHistory.length) {
            analysisIdx = idx;
            updateAnalysisBoard();
        }
    }
};

function startAnalysisMode() {
    isAnalysisMode = true;
    isReviewing = true;

    $('body').addClass('analysis-mode');

    $('#gameOverModal').addClass('hidden');
    $('#evalBarWrapper').removeClass('hidden');
    $('#evalScoreWrapper').removeClass('hidden');
    $('#analysisNav').removeClass('hidden');
    $('#normalControls').addClass('hidden');
    $('#mobileAnalysisPanel').removeClass('hidden');
    $('#mobileQuickControls').addClass('hidden');
    $('#panelTitle').text('🔍 Analiz Modu');

    showEvalLoading();
    currentBestMove = null;
    clearArrow();

    analysisMoveHistory = game.history({ verbose: true });
    analysisIdx = analysisMoveHistory.length - 1;

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

    $('#analysisNav').addClass('hidden');
    $('#normalControls').removeClass('hidden');
    $('#mobileAnalysisPanel').addClass('hidden');
    $('#mobileQuickControls').removeClass('hidden');
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

$('#navStart').on('click', () => { if (isAnalysisMode) { analysisIdx = -1; updateAnalysisBoard(); } });
$('#navPrev').on('click', () => { if (isAnalysisMode && analysisIdx > -1) { analysisIdx--; updateAnalysisBoard(); } });
$('#navNext').on('click', () => { if (isAnalysisMode && analysisIdx < analysisMoveHistory.length - 1) { analysisIdx++; updateAnalysisBoard(); } });
$('#navEnd').on('click', () => { if (isAnalysisMode && analysisMoveHistory.length > 0) { analysisIdx = analysisMoveHistory.length - 1; updateAnalysisBoard(); } });

$('#mNavStart').on('click', () => { if (isAnalysisMode) { analysisIdx = -1; updateAnalysisBoard(); } });
$('#mNavPrev').on('click', () => { if (isAnalysisMode && analysisIdx > -1) { analysisIdx--; updateAnalysisBoard(); } });
$('#mNavNext').on('click', () => { if (isAnalysisMode && analysisIdx < analysisMoveHistory.length - 1) { analysisIdx++; updateAnalysisBoard(); } });
$('#mNavEnd').on('click', () => { if (isAnalysisMode && analysisMoveHistory.length > 0) { analysisIdx = analysisMoveHistory.length - 1; updateAnalysisBoard(); } });

$('#exitAnalysisBtn').on('click', exitAnalysisMode);
$('#mExitAnalysisBtn').on('click', exitAnalysisMode);

$(document).on('keydown', function(e) {
    if (!isAnalysisMode) return;
    if (e.key === 'ArrowLeft') {
        if (analysisIdx > -1) { analysisIdx--; updateAnalysisBoard(); }
    } else if (e.key === 'ArrowRight') {
        if (analysisIdx < analysisMoveHistory.length - 1) { analysisIdx++; updateAnalysisBoard(); }
    }
});

$('#playBestMoveBtn').on('click', playBestMove);
$('#mPlayBestMoveBtn').on('click', playBestMove);

function playBestMove() {
    if (!isAnalysisMode || !currentBestMove) return;
    const from = currentBestMove.substring(0, 2);
    const to = currentBestMove.substring(2, 4);
    const promo = currentBestMove.length > 4 ? currentBestMove.substring(4, 5) : 'q';
    const moveObj = analysisGame.move({ from: from, to: to, promotion: promo });
    if (moveObj) {
        playMoveSound(moveObj, Boolean(moveObj.captured));
        analysisMoveHistory = analysisMoveHistory.slice(0, analysisIdx + 1);
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

$('#openSettingsBtn, #mobileSettingsModalBtn').on('click', function(e) {
    e.preventDefault();
    $('#settingsModal').removeClass('hidden');
});

// 1. Tahta Renk Teması
$(document).on('click', '.theme-option-btn', function(e) {
    e.preventDefault();
    const selectedTheme = $(this).attr('data-theme');$('#board').removeClass('theme-red theme-green theme-wood theme-dark').addClass(selectedTheme);
    $('.theme-option-btn').removeClass('border-blue-500 bg-blue-950/40').addClass('border-zinc-800 bg-[#09090b]');
    $(this).addClass('border-blue-500 bg-blue-950/40').removeClass('border-zinc-800 bg-[#09090b]');
    localStorage.setItem('zato_theme', selectedTheme);
});

// 2. Taş Stili Seçimi
$(document).on('click', '.piece-style-btn', function(e) {
    e.preventDefault();
    const $btn =$(this).closest('.piece-style-btn');
    currentPieceSet = $btn.attr('data-style');

    $('.piece-style-btn').removeClass('border-blue-500 bg-blue-950/40').addClass('border-zinc-800 bg-[#09090b]');
    $btn.addClass('border-blue-500 bg-blue-950/40').removeClass('border-zinc-800 bg-[#09090b]');

    localStorage.setItem('zato_piece_style', currentPieceSet);
    renderBoard();
});

// 3. Animasyon Hızı Seçimi
$(document).on('click', '.anim-speed-btn', function(e) {
    e.preventDefault();
    const animClass = $(this).attr('data-anim');$('#board').removeClass('anim-off anim-slow anim-normal anim-fast').addClass(animClass);
    $('.anim-speed-btn').removeClass('bg-blue-600 text-white font-bold').addClass('text-zinc-400 font-semibold');$(this).addClass('bg-blue-600 text-white font-bold').removeClass('text-zinc-400 font-semibold');
    localStorage.setItem('zato_anim_speed', animClass);
});

// 4. Ses ve Efekt Toggles
$('#toggleSoundEffects').on('change', function() {
    playSoundsEnabled = $(this).is(':checked');
    localStorage.setItem('zato_sound', playSoundsEnabled);
});

$('#toggleKingCheckEffect').on('change', function() {
    kingCheckEffectEnabled = $(this).is(':checked');
    localStorage.setItem('zato_king_check', kingCheckEffectEnabled);
    renderBoard();
});

function loadSavedSettings() {
    const savedTheme = localStorage.getItem('zato_theme') || 'theme-green';
    $('#board').removeClass('theme-red theme-green theme-wood theme-dark').addClass(savedTheme);
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

    if (localStorage.getItem('zato_king_check') !== null) {
        kingCheckEffectEnabled = localStorage.getItem('zato_king_check') === 'true';
        $('#toggleKingCheckEffect').prop('checked', kingCheckEffectEnabled);
    }
}

$('#mobileTempoModalBtn').on('click', function(e) {
    e.preventDefault();
    $('#tempoModal').removeClass('hidden');
});

$('#mobileBotModalBtn').on('click', function(e) {
    e.preventDefault();
    $('#botModal').removeClass('hidden');
});

$('.close-modal-btn, #tempoModal, #botModal, #settingsModal').on('click', function(e) {
    if (e.target === this || $(e.target).hasClass('close-modal-btn')) {$('#tempoModal, #botModal, #settingsModal').addClass('hidden');
    }
});

$('.tempo-option-btn').on('click', function() {
    const timeVal = $(this).attr('data-time');
    parseTimeControl(timeVal);
    $('#timeSelect').val(timeVal);
    $('.tempo-option-btn').removeClass('border-emerald-500 active-tempo').addClass('border-zinc-800');
    $(this).addClass('border-emerald-500 active-tempo');$('#tempoModal').addClass('hidden');
    resetGame();
});

$('.bot-level-btn').on('click', function() {
    const eloVal = $(this).attr('data-elo');$('#botElo').val(eloVal);
    updateBotEloUI(eloVal);
    updatePlayerCards();
    $('#botModal').addClass('hidden');
});

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
    if (stockfishWorker && isEngineThinking) {
        discardEngineBestMove = true;
        stockfishWorker.postMessage('stop');
    } else if (stockfishWorker) {
        stockfishWorker.postMessage('stop');
    }
    game.reset();
    analysisGame.reset();

    $('body').removeClass('analysis-mode');

    analysisMoveHistory = [];
    analysisIdx = -1;
    isAnalysisMode = false;
    pendingMove = null;
    isEngineThinking = false;
    isGameOver = false;
    isReviewing = false;
    analysisSearchStopPending = false;
    queuedAnalysisFen = null;
    pendingEvalScore = null;
    currentEvalScore = 0;
    currentBestMove = null;
    clearArrow();

    if (userColorSelection === 'r') {
        actualPlayerColor = Math.random() < 0.5 ? 'w' : 'b';
    } else {
        actualPlayerColor = userColorSelection;
    }

    isFlipped = actualPlayerColor === 'b';

    $('#promotionModal').addClass('hidden');
    $('#analysisNav').addClass('hidden');
    $('#normalControls').removeClass('hidden');
    $('#mobileAnalysisPanel').addClass('hidden');
    $('#mobileQuickControls').removeClass('hidden');
    $('#panelTitle').text('Canlı Karşılaşma');
    selectedSquare = null;
    whiteTime = selectedTimeInSeconds;
    blackTime = selectedTimeInSeconds;
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
    startAnalysisMode();
});

$('#closeModalBtn').on('click', () => $('#gameOverModal').addClass('hidden'));

initStockfish();
loadSavedSettings();
updateTimerDisplay();
renderBoard();
updateStatus();
startTimer();