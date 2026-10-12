const game = new Chess();
let selectedSquare = null;
let pendingMove = null;
let isFlipped = false;
let vsBot = true;
let timerInterval = null;
let selectedTimeInSeconds = 300;
let whiteTime = 300, blackTime = 300;
let stockfishWorker = null;

let isEngineThinking = false;
let isGameOver = false;

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

$('#logoToggleBtn').on('click', function() {
    $('#mainSidebar').toggleClass('collapsed');
});

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
                    if (!isGameOver && moveStr && vsBot && game.turn() === 'b' && !game.game_over()) {
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
            }
        };
    } catch (e) {
        console.error("Stockfish başlatılamadı:", e);
    }
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
    const history = game.history({ verbose: true });

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
        alert("Stockfish Bot: Beraberlik teklifinizi reddediyorum!");
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

    const historyVerbose = game.history({ verbose: true });
    let lastMove = historyVerbose.length > 0 ? historyVerbose[historyVerbose.length - 1] : null;
    const boardState = game.board();

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
}

function handleMove(from, to) {
    if (isGameOver) return;
    if (vsBot && (game.turn() === 'b' || isEngineThinking)) return;

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
    if (isGameOver) return;
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

$('#timeSelect').on('change', function() {
    selectedTimeInSeconds = parseInt($(this).val()) || 300;
    resetGame();
});

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (game.game_over() || isGameOver) { clearInterval(timerInterval); return; }
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

    const activeHistory = game.history({ verbose: true });
    
    // 1. Masaüstü Dikey PGN
    let pgnHtml = '';
    // 2. Mobil Yatay PGN Şeridi (Chess.com tarzı)
    let mobilePgnHtml = '';

    for (let i = 0; i < activeHistory.length; i += 2) {
        const round = Math.floor(i / 2) + 1;
        const whiteMove = activeHistory[i].from + '→' + activeHistory[i].to;
        const blackMove = activeHistory[i + 1] ? activeHistory[i + 1].from + '→' + activeHistory[i + 1].to : '';

        pgnHtml += `
            <div class="py-1 border-b border-zinc-800/50 flex justify-between gap-2 items-center">
                <span class="text-zinc-600 font-semibold">${round}.</span>
                <span class="text-zinc-300 font-medium">${whiteMove}</span>
                <span class="text-blue-400 font-medium">${blackMove}</span>
            </div>`;

        mobilePgnHtml += `<span class="bg-zinc-900 px-2 py-1 rounded border border-zinc-800 text-zinc-300"><span class="text-zinc-500 font-bold mr-1">${round}.</span>${whiteMove} ${blackMove}</span>`;
    }

    $('#pgn').html(pgnHtml);
    $('#mobilePgnList').html(mobilePgnHtml || '<span class="text-zinc-600 italic">Henüz hamle yapılmadı</span>');

    const pgnDiv = document.getElementById('pgn');
    if (pgnDiv) pgnDiv.scrollTop = pgnDiv.scrollHeight;

    // Mobil şeridi otomatik en son yapılan hamleye kaydırma
    const mobileStrip = document.getElementById('mobileMoveStrip');
    if (mobileStrip) mobileStrip.scrollLeft = mobileStrip.scrollWidth;
}

// OYUN MODU DEĞİŞTİRME
$('#modePvP').on('click', function() {
    vsBot = false;
    $('#botEloWrapper').addClass('hidden');
    $(this).addClass('bg-blue-600 text-white').removeClass('text-zinc-400');$('#modeBot').removeClass('bg-blue-600 text-white').addClass('text-zinc-400');
    $('#mobileModeText').text('2 Kişilik');
    updatePlayerCards();
});

$('#modeBot').on('click', function() {
    vsBot = true;
    $('#botEloWrapper').removeClass('hidden');
    $(this).addClass('bg-blue-600 text-white').removeClass('text-zinc-400');$('#modePvP').removeClass('bg-blue-600 text-white').addClass('text-zinc-400');
    $('#mobileModeText').text('Stockfish');
    updatePlayerCards();
    if (game.turn() === 'b' && !game.game_over()) {
        triggerStockfishMove();
    }
});

// MOBİL BUTON DİNLEYİCİLERİ
$('#mobileToggleModeBtn').on('click', function() {
    if (vsBot) {
        $('#modePvP').click();
    } else {
        $('#modeBot').click();
    }
});

$('#mobileFlipBtn, #flipBtn').on('click', function (e) {
    e.preventDefault();
    isFlipped = !isFlipped;
    renderBoard();
    updateTimerDisplay();
});

$('#mobileUndoBtn, #undoBtn').on('click', function () {
    if (isGameOver) return;
    game.undo();
    if (vsBot) game.undo();
    selectedSquare = null;
    renderBoard();
    updateStatus();
});

$('#botElo').on('change', updatePlayerCards);

function resetGame() {
    if (stockfishWorker) stockfishWorker.postMessage('stop');
    game.reset();
    pendingMove = null;
    isEngineThinking = false;
    isGameOver = false;

    $('#promotionModal').addClass('hidden');
    selectedSquare = null;
    whiteTime = selectedTimeInSeconds;
    blackTime = selectedTimeInSeconds;
    if (timerInterval) clearInterval(timerInterval);
    $('#gameOverModal').addClass('hidden');
    updateTimerDisplay();
    renderBoard();
    updateStatus();
}

$('#resetBtn, #modalResetBtn, #mobileResetBtn').on('click', function(e) {
    e.preventDefault();
    resetGame();
});

$('#closeModalBtn').on('click', () => $('#gameOverModal').addClass('hidden'));

initStockfish();
updateTimerDisplay();
renderBoard();
updateStatus();