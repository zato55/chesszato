const game = new Chess();
const reviewGame = new Chess();
const analysisGame = new Chess();

let selectedSquare = null;
let pendingMove = null;
let isFlipped = false;
let vsBot = true;
let timerInterval = null;
let selectedTimeInSeconds = 300;
let whiteTime = 300, blackTime = 300;
let stockfishWorker = null;

let currentSessionId = 0;
let isEngineThinking = false;
let isGameOver = false;
let currentEvalScore = 0;

let liveReviewIdx = -1;
let isAnalysisMode = false;
let moveHistoryList = [];
let currentAnalysisIdx = -1;
let currentBestMove = null;

let whiteOpeningName = "📖 Açılış Bekleniyor";
let blackOpeningName = "📖 Açılış Bekleniyor";

// MASAÜSTÜ SIDEBAR TOGGLE
$('#logoToggleBtn').on('click', function() {
    $('#mainSidebar').toggleClass('collapsed');
});

// MOBİL DRAWER AÇMA / KAPAMA
$('#openMobileMenuBtn, #mobileLogoBtn').on('click', function() {
    $('#mobileDrawer').removeClass('hidden');
});

$('#closeMobileMenuBtn, #mobileDrawer').on('click', function(e) {
    if (e.target === this || e.target.id === 'closeMobileMenuBtn') {
        $('#mobileDrawer').addClass('hidden');
    }
});

const pieceSVG = {
    K: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/300/wk.png',
    Q: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/300/wq.png',
    R: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/300/wr.png',
    B: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/300/wb.png',
    N: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/300/wn.png',
    P: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/300/wp.png',

    k: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/300/bk.png',
    q: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/300/bq.png',
    r: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/300/br.png',
    b: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/300/bb.png',
    n: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/300/bn.png',
    p: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/300/bp.png'
};

const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

const localOpeningBookWhite = {
    'e4': '📖 e4 — Kral Piyonu',
    'd4': '📖 d4 — Vezir Piyonu',
    'c4': '📖 c4 — İngiliz Açılışı',
    'Nf3': '📖 Nf3 — Réti Açılışı'
};

const localOpeningBookBlack = {
    'e4 e5': '📖 e5 — Açık Oyun',
    'e4 c5': '📖 c5 — Sicilya Savunması',
    'e4 e6': '📖 e6 — Fransız Savunması',
    'e4 c6': '📖 c6 — Caro-Kann Savunması',
    'd4 d5': '📖 d5 — Kapalı Oyun',
    'd4 Nf6': '📖 Nf6 — Hint Savunması'
};

function fetchOpenings() {
    const activeEngine = isAnalysisMode ? analysisGame : (liveReviewIdx !== -1 ? reviewGame : game);
    const history = activeEngine.history();
    
    if (history.length === 0) {
        whiteOpeningName = "📖 Açılış Bekleniyor";
        blackOpeningName = "📖 Açılış Bekleniyor";
        renderOpeningLabels();
        return;
    }

    const whiteMove1 = history[0];
    if (whiteMove1 && localOpeningBookWhite[whiteMove1]) {
        whiteOpeningName = localOpeningBookWhite[whiteMove1];
    } else if (whiteMove1) {
        whiteOpeningName = `📖 ${whiteMove1} Hamlesi`;
    }

    if (history.length >= 2) {
        const pair = `${history[0]} ${history[1]}`;
        if (localOpeningBookBlack[pair]) {
            blackOpeningName = localOpeningBookBlack[pair];
        } else {
            blackOpeningName = `📖 ${history[1]} Yanıtı`;
        }
    }

    renderOpeningLabels();

    if (history.length <= 12) {
        const fen = encodeURIComponent(activeEngine.fen());
        $.ajax({
            url: `https://explorer.lichess.ovh/masters?fen=${fen}`,
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                if (data && data.opening) {
                    if (activeEngine.turn() === 'b') {
                        whiteOpeningName = `📖 ${data.opening.eco} — ${data.opening.name}`;
                    } else {
                        blackOpeningName = `📖 ${data.opening.eco} — ${data.opening.name}`;
                    }
                    renderOpeningLabels();
                }
            }
        });
    }
}

function renderOpeningLabels() {
    if (isFlipped) {
        $('#topOpeningText').text(whiteOpeningName);
        $('#bottomOpeningText').text(blackOpeningName);
    } else {
        $('#topOpeningText').text(blackOpeningName);
        $('#bottomOpeningText').text(whiteOpeningName);
    }
}

function initStockfish() {
    try {
        const blob = new Blob([
            "importScripts('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');"
        ], { type: 'application/javascript' });
        
        stockfishWorker = new Worker(URL.createObjectURL(blob));

        stockfishWorker.onmessage = function (event) {
            const message = event.data;
            if (typeof message === 'string') {
                if (message.startsWith('bestmove')) {
                    isEngineThinking = false;
                    const moveStr = message.split(' ')[1];
                    
                    if (isAnalysisMode && moveStr && moveStr !== '(none)') {
                        currentBestMove = moveStr;
                        $('#bestMoveText').text(`En İyi Hamle: ${moveStr.substring(0,2)} → ${moveStr.substring(2,4)}`);
                        drawBestMoveArrow(moveStr.substring(0,2), moveStr.substring(2,4));
                    } else if (!isAnalysisMode && !isGameOver && moveStr && vsBot && game.turn() === 'b' && !game.game_over()) {
                        const from = moveStr.substring(0, 2);
                        const to = moveStr.substring(2, 4);
                        const promotion = moveStr.length > 4 ? moveStr.substring(4, 5) : 'q';

                        const targetPiece = game.get(to);
                        const moveObj = game.move({ from: from, to: to, promotion: promotion });
                        playMoveSound(moveObj, targetPiece !== null);
                        renderBoard();
                        updateStatus();
                    }
                }

                if (message.includes('score cp')) {
                    const parts = message.split(' ');
                    const cpIdx = parts.indexOf('cp');
                    if (cpIdx !== -1 && parts[cpIdx + 1]) {
                        let score = parseInt(parts[cpIdx + 1]);
                        currentEvalScore = score;
                        if (isAnalysisMode) {
                            if (analysisGame.turn() === 'b') score = -score;
                            updateEvalBar(score, false);
                        }
                    }
                } else if (message.includes('score mate') && isAnalysisMode) {
                    const parts = message.split(' ');
                    const mateIdx = parts.indexOf('mate');
                    if (mateIdx !== -1 && parts[mateIdx + 1]) {
                        let mateIn = parseInt(parts[mateIdx + 1]);
                        if (analysisGame.turn() === 'b') mateIn = -mateIn;
                        updateEvalBar(mateIn, true);
                    }
                }
            }
        };
    } catch (e) {
        console.error("Stockfish başlatılamadı:", e);
    }
}

function updateEvalBar(score, isMate) {
    if (isMate) {
        const text = score > 0 ? `#M${score}` : `-M${Math.abs(score)}`;
        $('#evalScoreText').text(text);
        $('#evalBarWhite').css('height', score > 0 ? '98%' : '2%');
    } else {
        let evalVal = (score / 100).toFixed(1);
        if (evalVal > 0) evalVal = '+' + evalVal;
        $('#evalScoreText').text(evalVal);

        let percentage = 50 + (score / 15);
        percentage = Math.max(5, Math.min(95, percentage));
        $('#evalBarWhite').css('height', percentage + '%');
    }
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

function playMoveSound(moveObj, isCapture) {
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

function updatePlayerCards() {
    const activeEngine = isAnalysisMode ? analysisGame : (liveReviewIdx !== -1 ? reviewGame : game);
    const history = activeEngine.history({ verbose: true });

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

    if (vsBot) {
        const elo = $('#botElo').val();
        if (isFlipped) {
            $('#bottomPlayerName').text('Stockfish Bot');
            $('#bottomPlayerElo').text(`(${elo})`);
            $('#topPlayerName').text('Siz');
            $('#topPlayerElo').text('(1500)');
            $('#topAvatar').text('♙').addClass('bg-zinc-100 text-zinc-900').removeClass('bg-zinc-800 text-zinc-300');
            $('#bottomAvatar').text('♟').addClass('bg-zinc-800 text-zinc-300').removeClass('bg-zinc-100 text-zinc-900');
        } else {
            $('#topPlayerName').text('Stockfish Bot');
            $('#topPlayerElo').text(`(${elo})`);
            $('#bottomPlayerName').text('Siz');
            $('#bottomPlayerElo').text('(1500)');
            $('#topAvatar').text('♟').addClass('bg-zinc-800 text-zinc-300').removeClass('bg-zinc-100 text-zinc-900');
            $('#bottomAvatar').text('♙').addClass('bg-zinc-100 text-zinc-900').removeClass('bg-zinc-800 text-zinc-300');
        }
    } else {
        $('#topPlayerName').text(isFlipped ? 'Oyuncu 1 (Beyaz)' : 'Oyuncu 2 (Siyah)');
        $('#bottomPlayerName').text(isFlipped ? 'Oyuncu 2 (Siyah)' : 'Oyuncu 1 (Beyaz)');
    }

    const drawIcons = (capturedArr, isWhiteCaptures) => {
        return capturedArr.map(p => {
            const key = isWhiteCaptures ? p.toLowerCase() : p.toUpperCase();
            return `<img src="${pieceSVG[key]}" class="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain opacity-80 inline-block">`;
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

window.surrenderGame = function(position) {
    if (isGameOver) return;
    const surrenderingColor = (position === 'bottom' && !isFlipped) || (position === 'top' && isFlipped) ? 'Beyaz' : 'Siyah';
    const winner = surrenderingColor === 'Beyaz' ? 'Siyah' : 'Beyaz';

    if (confirm(`${surrenderingColor} oyuncusu oyunu terk etmek istiyor. Onaylıyor musunuz?`)) {
        if (timerInterval) clearInterval(timerInterval);
        if (stockfishWorker) stockfishWorker.postMessage('stop');
        showGameOverModal(`${winner} Kazandı!`, `${surrenderingColor} oyuncu oyunu terk etti (Surrender).`, '🏳️');
    }
};

window.offerDraw = function(position) {
    if (isGameOver) return;
    
    if (vsBot) {
        if (Math.abs(currentEvalScore) <= 80) {
            if (timerInterval) clearInterval(timerInterval);
            if (stockfishWorker) stockfishWorker.postMessage('stop');
            showGameOverModal('Berabere!', 'Stockfish botu beraberlik teklifinizi kabul etti.', '🤝');
        } else {
            alert("Stockfish Bot: Beraberlik teklifinizi reddediyorum, konumumu üstün görüyorum!");
        }
    } else {
        const offeringPlayer = (position === 'bottom' && !isFlipped) || (position === 'top' && isFlipped) ? 'Beyaz' : 'Siyah';
        if (confirm(`${offeringPlayer} oyuncusu beraberlik teklif ediyor. Kabul ediyor musunuz?`)) {
            if (timerInterval) clearInterval(timerInterval);
            showGameOverModal('Berabere!', 'Oyuncular karşılıklı beraberlik konusunda anlaştı.', '🤝');
        }
    }
};

function renderBoard() {
    const $board =$('#board');
    $board.empty();

    let activeEngine = game;
    let lastMove = null;

    if (isAnalysisMode) {
        activeEngine = analysisGame;
        if (currentAnalysisIdx >= 0 && moveHistoryList[currentAnalysisIdx]) {
            lastMove = moveHistoryList[currentAnalysisIdx];
        }
    } else if (liveReviewIdx !== -1) {
        const historyVerbose = game.history({ verbose: true });
        reviewGame.reset();
        for (let i = 0; i <= liveReviewIdx; i++) {
            if (historyVerbose[i]) reviewGame.move(historyVerbose[i]);
        }
        activeEngine = reviewGame;
        if (liveReviewIdx >= 0 && historyVerbose[liveReviewIdx]) {
            lastMove = historyVerbose[liveReviewIdx];
        }
    } else {
        const historyVerbose = game.history({ verbose: true });
        if (historyVerbose.length > 0) {
            lastMove = historyVerbose[historyVerbose.length - 1];
        }
    }

    const boardState = activeEngine.board();

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

            if (piece) {
                const key = piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
                const $img =$('<img>').attr('src', pieceSVG[key]).addClass('piece');
                $square.append($img);
            }

            $board.append($square);
        }
    }

    updatePlayerCards();
    fetchOpenings();
}

function handleMove(from, to) {
    if (isAnalysisMode || isGameOver) return;
    if (vsBot && (game.turn() === 'b' || isEngineThinking)) return;

    if (liveReviewIdx !== -1) returnToLive();

    const movingPiece = game.get(from);
    const isWhite = game.turn() === 'w';

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
    const targetPiece = game.get(to);
    const moveObj = game.move({ from: from, to: to, promotion: promoPiece });

    if (moveObj !== null) {
        playMoveSound(moveObj, targetPiece !== null);
        selectedSquare = null;
        renderBoard();
        updateStatus();
        startTimer();

        if (vsBot && game.turn() === 'b' && !game.game_over()) {
            triggerStockfishMove();
        }
    } else {
        const piece = game.get(to);
        if (piece && piece.color === game.turn()) {
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

    $('#pImgQ').attr('src', pieceSVG[qKey]);
    $('#pImgR').attr('src', pieceSVG[rKey]);
    $('#pImgB').attr('src', pieceSVG[bKey]);
    $('#pImgN').attr('src', pieceSVG[nKey]);

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
    if (!stockfishWorker || isGameOver) return;

    isEngineThinking = true;
    const elo = parseInt($('#botElo').val()) || 1400;
    const fen = game.fen();

    let depth = 3;
    if (elo >= 1400) depth = 5;
    if (elo >= 1600) depth = 8;
    if (elo >= 1800) depth = 12;

    stockfishWorker.postMessage('stop');
    stockfishWorker.postMessage('position fen ' + fen);
    stockfishWorker.postMessage('go depth ' + depth);
}

$('#board').on('click', 'div[data-square]', function () {
    if (isAnalysisMode || isGameOver) return;
    if (vsBot && (game.turn() === 'b' || isEngineThinking)) return;

    const square = $(this).attr('data-square');

    if (!selectedSquare) {
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
            selectedSquare = square;
            renderBoard();
        }
    } else {
        handleMove(selectedSquare, square);
    }
});

function returnToLive() {
    liveReviewIdx = -1;
    $('#liveReviewBanner').addClass('hidden');
    renderBoard();
    updateStatus();
}

$('#returnLiveBtn').on('click', returnToLive);

function startAnalysisMode() {
    isAnalysisMode = true;
    liveReviewIdx = -1;
    if (stockfishWorker) stockfishWorker.postMessage('stop');
    
    $('#liveReviewBanner').addClass('hidden');
    $('#gameOverModal').addClass('hidden');
    $('#mobileDrawer').addClass('hidden');
    $('#modeWrapper, #botEloWrapper, #timeControlWrapper, #normalControls').addClass('hidden');
    $('#analysisNav, #evalBarWrapper, #bestMoveCard').removeClass('hidden');
    $('#panelTitle').text('🔍 Maç Analizi');
    $('#status').text('Analiz Modu');

    moveHistoryList = game.history({ verbose: true });
    currentAnalysisIdx = moveHistoryList.length - 1;
    
    updateAnalysisBoard();
}

function exitAnalysisMode() {
    isAnalysisMode = false;
    clearArrow();
    if (stockfishWorker) stockfishWorker.postMessage('stop');

    $('#analysisNav, #evalBarWrapper, #bestMoveCard').addClass('hidden');
    $('#modeWrapper, #timeControlWrapper, #normalControls').removeClass('hidden');
    if (vsBot) $('#botEloWrapper').removeClass('hidden');
    $('#panelTitle').text('Canlı Karşılaşma');
    
    renderBoard();
    updateStatus();
}

function updateAnalysisBoard() {
    clearArrow();
    analysisGame.reset();
    for (let i = 0; i <= currentAnalysisIdx; i++) {
        if (moveHistoryList[i]) {
            analysisGame.move(moveHistoryList[i]);
        }
    }

    renderBoard();
    renderAnalysisPGN();

    if (stockfishWorker) {
        stockfishWorker.postMessage('stop');
        stockfishWorker.postMessage('position fen ' + analysisGame.fen());
        stockfishWorker.postMessage('go depth 12');
    }
}

function renderAnalysisPGN() {
    let pgnHtml = '';
    for (let i = 0; i < moveHistoryList.length; i += 2) {
        const round = Math.floor(i / 2) + 1;
        const whiteActive = (i === currentAnalysisIdx) ? 'active-move px-1.5 py-0.5' : '';
        const blackActive = (i + 1 === currentAnalysisIdx) ? 'active-move px-1.5 py-0.5' : '';

        const whiteMove = moveHistoryList[i].from + '→' + moveHistoryList[i].to;
        const blackMove = moveHistoryList[i + 1] ? moveHistoryList[i + 1].from + '→' + moveHistoryList[i + 1].to : '';

        pgnHtml += `
            <div class="py-1.5 border-b border-zinc-800/50 flex justify-between gap-2 items-center">
                <span class="text-zinc-600 font-semibold">${round}.</span>
                <span class="text-zinc-300 font-medium cursor-pointer ${whiteActive}" onclick="jumpToMove(${i})">${whiteMove}</span>
                <span class="text-blue-400 font-medium cursor-pointer ${blackActive}" onclick="jumpToMove(${i + 1})">${blackMove}</span>
            </div>`;
    }

    $('#pgn').html(pgnHtml);
}

window.jumpToMove = function(idx) {
    if (isAnalysisMode) {
        if (idx >= -1 && idx < moveHistoryList.length) {
            currentAnalysisIdx = idx;
            updateAnalysisBoard();
        }
    } else {
        const moves = game.history({ verbose: true });
        if (idx >= 0 && idx < moves.length) {
            if (idx === moves.length - 1) {
                returnToLive();
            } else {
                liveReviewIdx = idx;
                $('#liveReviewBanner').removeClass('hidden');
                renderBoard();
                updateStatus();
            }
        }
    }
};

$('#playBestMoveBtn').on('click', function() {
    if (currentBestMove && isAnalysisMode) {
        const from = currentBestMove.substring(0, 2);
        const to = currentBestMove.substring(2, 4);
        const moveObj = analysisGame.move({ from: from, to: to, promotion: 'q' });
        if (moveObj) {
            playMoveSound(moveObj, true);
            
            moveHistoryList = moveHistoryList.slice(0, currentAnalysisIdx + 1);
            moveHistoryList.push(moveObj);
            currentAnalysisIdx++;

            updateAnalysisBoard();
        }
    }
});

$(document).on('keydown', function(e) {
    if (isAnalysisMode) {
        if (e.key === 'ArrowLeft') $('#navPrev').click();
        if (e.key === 'ArrowRight') $('#navNext').click();
    } else {
        const moves = game.history({ verbose: true });
        if (moves.length === 0) return;

        if (e.key === 'ArrowLeft') {
            if (liveReviewIdx === -1) {
                liveReviewIdx = moves.length - 2;
            } else if (liveReviewIdx > 0) {
                liveReviewIdx--;
            }
            if (liveReviewIdx >= 0) {
                $('#liveReviewBanner').removeClass('hidden');
                renderBoard();
                updateStatus();
            }
        } else if (e.key === 'ArrowRight') {
            if (liveReviewIdx !== -1) {
                if (liveReviewIdx < moves.length - 1) {
                    liveReviewIdx++;
                    renderBoard();
                    updateStatus();
                } else {
                    returnToLive();
                }
            }
        }
    }
});

$('#navStart').on('click', () => { currentAnalysisIdx = -1; updateAnalysisBoard(); });
$('#navPrev').on('click', () => { if (currentAnalysisIdx > -1) { currentAnalysisIdx--; updateAnalysisBoard(); } });
$('#navNext').on('click', () => { if (currentAnalysisIdx < moveHistoryList.length - 1) { currentAnalysisIdx++; updateAnalysisBoard(); } });
$('#navEnd').on('click', () => { currentAnalysisIdx = moveHistoryList.length - 1; updateAnalysisBoard(); });
$('#exitAnalysisBtn').on('click', exitAnalysisMode);

$('#timeSelect').on('change', function() {
    selectedTimeInSeconds = parseInt($(this).val()) || 300;
    resetGame();
});

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (game.game_over() || isAnalysisMode || isGameOver) { clearInterval(timerInterval); return; }
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

    $('#whiteTimer').text(formattedWhite);
    $('#blackTimer').text(formattedBlack);

    if (!isFlipped) {
        $('#topTimerMobile').text(formattedBlack);
        $('#bottomTimerMobile').text(formattedWhite);
    } else {
        $('#topTimerMobile').text(formattedWhite);
        $('#bottomTimerMobile').text(formattedBlack);
    }
}

function showGameOverModal(title, reason, icon = '🏆') {
    isGameOver = true;
    $('#modalTitle').text(title);
    $('#modalReason').text(reason);
    $('#modalIcon').text(icon);
    $('#gameOverModal').removeClass('hidden');
}

function updateStatus() {
    const moveColor = game.turn() === 'b' ? 'Siyah' : 'Beyaz';

    if (game.in_checkmate()) {
        isGameOver = true;
        $('#status').text('Şah Mat!');
        if (vsBot) {
            if (game.turn() === 'b') {
                showGameOverModal('Tebrikler, Kazandın!', 'Stockfish botunu şah mat ettin!', '🎉');
            } else {
                showGameOverModal('Kaybettin!', 'Stockfish botu seni şah mat etti.', '💀');
            }
        } else {
            const winner = game.turn() === 'b' ? 'Beyaz' : 'Siyah';
            showGameOverModal(`${winner} Kazandı!`, 'Şah mat ile oyun sona erdi.', '🏆');
        }
    } else if (game.in_draw()) {
        isGameOver = true;
        $('#status').text('Berabere');
        showGameOverModal('Berabere!', 'Oyun beraberlik ile sonuçlandı.', '🤝');
    } else {
        let statusText = 'Sıra: ' + moveColor;
        if (game.in_check()) statusText = moveColor + ' (Şah!)';
        $('#status').text(statusText);
    }

    const activeHistory = isAnalysisMode ? moveHistoryList : game.history({ verbose: true });
    let pgnHtml = '';

    for (let i = 0; i < activeHistory.length; i += 2) {
        const round = Math.floor(i / 2) + 1;
        const activeIdx = isAnalysisMode ? currentAnalysisIdx : (liveReviewIdx !== -1 ? liveReviewIdx : activeHistory.length - 1);
        
        const whiteActive = (i === activeIdx) ? 'active-move px-1.5 py-0.5' : '';
        const blackActive = (i + 1 === activeIdx) ? 'active-move px-1.5 py-0.5' : '';

        const whiteMove = activeHistory[i].from + '→' + activeHistory[i].to;
        const blackMove = activeHistory[i + 1] ? activeHistory[i + 1].from + '→' + activeHistory[i + 1].to : '';

        pgnHtml += `
            <div class="py-1.5 border-b border-zinc-800/50 flex justify-between gap-2 items-center">
                <span class="text-zinc-600 font-semibold">${round}.</span>
                <span class="text-zinc-300 font-medium cursor-pointer ${whiteActive}" onclick="jumpToMove(${i})">${whiteMove}</span>
                <span class="text-blue-400 font-medium cursor-pointer ${blackActive}" onclick="jumpToMove(${i + 1})">${blackMove}</span>
            </div>`;
    }

    $('#pgn').html(pgnHtml);
    const pgnDiv = document.getElementById('pgn');
    if (pgnDiv && liveReviewIdx === -1 && !isAnalysisMode) pgnDiv.scrollTop = pgnDiv.scrollHeight;
}

$('#modePvP').on('click', function() {
    vsBot = false;
    $('#botEloWrapper').addClass('hidden');
    $(this).addClass('bg-blue-600 text-white').removeClass('text-zinc-400');$('#modeBot').removeClass('bg-blue-600 text-white').addClass('text-zinc-400');
    updatePlayerCards();
});

$('#modeBot').on('click', function() {
    vsBot = true;
    $('#botEloWrapper').removeClass('hidden');
    $(this).addClass('bg-blue-600 text-white').removeClass('text-zinc-400');$('#modePvP').removeClass('bg-blue-600 text-white').addClass('text-zinc-400');
    updatePlayerCards();
    if (game.turn() === 'b' && !game.game_over()) {
        triggerStockfishMove();
    }
});

$('#botElo').on('change', updatePlayerCards);

$('#flipBtn, #mobileFlipBtn').on('click', function (e) {
    e.preventDefault();
    isFlipped = !isFlipped;
    renderBoard();
    updateTimerDisplay();
    if (isAnalysisMode && currentBestMove) {
        const from = currentBestMove.substring(0, 2);
        const to = currentBestMove.substring(2, 4);
        drawBestMoveArrow(from, to);
    }
});

$('.navAnalysisBtn').on('click', function(e) {
    e.preventDefault();
    startAnalysisMode();
});

function resetGame() {
    currentSessionId++;
    if (stockfishWorker) stockfishWorker.postMessage('stop');

    game.reset();
    reviewGame.reset();
    liveReviewIdx = -1;
    pendingMove = null;
    isEngineThinking = false;
    isGameOver = false;

    whiteOpeningName = "📖 Açılış Bekleniyor";
    blackOpeningName = "📖 Açılış Bekleniyor";
    renderOpeningLabels();

    $('#liveReviewBanner').addClass('hidden');
    $('#promotionModal').addClass('hidden');
    selectedSquare = null;
    whiteTime = selectedTimeInSeconds;
    blackTime = selectedTimeInSeconds;
    if (timerInterval) clearInterval(timerInterval);
    $('#gameOverModal').addClass('hidden');
    if (isAnalysisMode) exitAnalysisMode();
    updateTimerDisplay();
    renderBoard();
    updateStatus();
}

$('#resetBtn, #modalResetBtn').on('click', resetGame);
$('#modalInspectBtn').on('click', startAnalysisMode);
$('#closeModalBtn').on('click', () => $('#gameOverModal').addClass('hidden'));

$('#undoBtn').on('click', function () {
    if (isGameOver) return;
    if (liveReviewIdx !== -1) returnToLive();
    game.undo();
    if (vsBot) game.undo();
    selectedSquare = null;
    renderBoard();
    updateStatus();
});

initStockfish();
updateTimerDisplay();
renderBoard();
updateStatus();