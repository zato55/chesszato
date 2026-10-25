// Chesszato hızlı eşleşme için kurgusal sanal rakip profilleri.
// Kullanıcı adları farklı çevrimiçi satranç oyuncularının takma adlarından esinlenir.
window.ZATO_BOT_DATABASE = [
  { id: "ahmet-01", name: "KnightOwl", minElo: 250, maxElo: 800 },
  { id: "emir-02", name: "luna_87", minElo: 250, maxElo: 1200 },
  { id: "kerem-03", name: "xRaven47", minElo: 400, maxElo: 1400 },
  { id: "deniz-04", name: "MiraKnight", minElo: 400, maxElo: 1800 },
  { id: "mert-05", name: "zK4iro", minElo: 250, maxElo: 800 },
  { id: "arda-06", name: "rookie_404", minElo: 800, maxElo: 1600 },
  { id: "yusuf-07", name: "N0vaChess", minElo: 400, maxElo: 1200 },
  { id: "efe-08", name: "blueBishop", minElo: 250, maxElo: 1400 },
  { id: "kaan-09", name: "qZxv91", minElo: 800, maxElo: 1800 },
  { id: "berk-10", name: "ArcticFox22", minElo: 400, maxElo: 1600 },
  { id: "can-11", name: "mateInTwo", minElo: 250, maxElo: 800 },
  { id: "umut-12", name: "Kira_V", minElo: 400, maxElo: 1400 },
  { id: "ali-13", name: "SilentRook", minElo: 800, maxElo: 2000 },
  { id: "burak-14", name: "vexel009", minElo: 400, maxElo: 1200 },
  { id: "furkan-15", name: "NikoStorm", minElo: 250, maxElo: 1600 },
  { id: "enes-16", name: "pawn.exe", minElo: 800, maxElo: 1800 },
  { id: "baran-17", name: "R4nd0mWalk", minElo: 400, maxElo: 1400 },
  { id: "kaan-18", name: "MilaQ", minElo: 1200, maxElo: 2200 },
  { id: "tuna-19", name: "DarkTempo", minElo: 250, maxElo: 1200 },
  { id: "onur-20", name: "h8xKnight", minElo: 800, maxElo: 2000 },
  { id: "selim-21", name: "LeoMoves", minElo: 400, maxElo: 1600 },
  { id: "omer-22", name: "k3nji_17", minElo: 250, maxElo: 800 },
  { id: "batuhan-23", name: "cloudcastle", minElo: 800, maxElo: 1800 },
  { id: "tolga-24", name: "ZedZero", minElo: 1200, maxElo: 2200 },
  { id: "kaan-25", name: "taktik_7", minElo: 400, maxElo: 1400 },
  { id: "kaan-26", name: "AstraVane", minElo: 250, maxElo: 1200 },
  { id: "muhammed-27", name: "blitzMoth", minElo: 800, maxElo: 1600 },
  { id: "emre-28", name: "r0okShift", minElo: 400, maxElo: 1800 },
  { id: "alp-29", name: "Nocturne64", minElo: 1200, maxElo: 2000 },
  { id: "kaan-30", name: "qxMira", minElo: 250, maxElo: 1400 }
];

window.ZATO_BOT_ELO_LEVELS = [250, 400, 800, 1200, 1400, 1600, 1800, 2000, 2200];



// Her profil, Stockfish'in birden fazla aday hamlesi arasından seçim yaparken farklı davranır.
// risk: daha alt sıradaki ama değerlendirmesi yakın hamleleri seçme isteği.
// tolerance: en iyi adaydan kaç santipiyon geriye düşmeye izin verileceği.
// weights: uygun adaylar için 1., 2. ve 3. hamlenin göreli seçilme ağırlığı.
window.ZATO_BOT_PERSONALITIES = {
  "ahmet-01": { style: "Temkinli", risk: 0.08, tolerance: 25, weights: [94, 5, 1] },
  "emir-02": { style: "Taktikçi", risk: 0.62, tolerance: 95, weights: [55, 30, 15] },
  "kerem-03": { style: "Konumsal", risk: 0.20, tolerance: 45, weights: [78, 17, 5] },
  "deniz-04": { style: "Saldırgan", risk: 0.72, tolerance: 115, weights: [45, 35, 20] },
  "mert-05": { style: "Sade oyun", risk: 0.12, tolerance: 30, weights: [90, 8, 2] },
  "arda-06": { style: "Dinamik", risk: 0.48, tolerance: 80, weights: [62, 26, 12] },
  "yusuf-07": { style: "Savunmacı", risk: 0.10, tolerance: 30, weights: [91, 7, 2] },
  "efe-08": { style: "Sürprizci", risk: 0.82, tolerance: 135, weights: [38, 34, 28] },
  "kaan-09": { style: "Taktikçi", risk: 0.57, tolerance: 90, weights: [58, 29, 13] },
  "berk-10": { style: "Konumsal", risk: 0.24, tolerance: 50, weights: [75, 20, 5] },
  "can-11": { style: "Temkinli", risk: 0.06, tolerance: 20, weights: [96, 3, 1] },
  "umut-12": { style: "Saldırgan", risk: 0.66, tolerance: 105, weights: [49, 34, 17] },
  "ali-13": { style: "Pozisyoncu", risk: 0.16, tolerance: 35, weights: [84, 13, 3] },
  "burak-14": { style: "Pratik", risk: 0.35, tolerance: 65, weights: [70, 22, 8] },
  "furkan-15": { style: "Keskin oyun", risk: 0.74, tolerance: 120, weights: [43, 35, 22] },
  "enes-16": { style: "Hesapçı", risk: 0.28, tolerance: 50, weights: [76, 19, 5] },
  "baran-17": { style: "Esnek", risk: 0.42, tolerance: 70, weights: [66, 24, 10] },
  "kaan-18": { style: "Konumsal", risk: 0.14, tolerance: 30, weights: [86, 12, 2] },
  "tuna-19": { style: "Sürprizci", risk: 0.78, tolerance: 125, weights: [40, 34, 26] },
  "onur-20": { style: "Hesapçı", risk: 0.22, tolerance: 45, weights: [79, 17, 4] },
  "selim-21": { style: "Savunmacı", risk: 0.09, tolerance: 25, weights: [93, 6, 1] },
  "omer-22": { style: "Sade oyun", risk: 0.18, tolerance: 40, weights: [82, 15, 3] },
  "batuhan-23": { style: "Taktikçi", risk: 0.60, tolerance: 100, weights: [54, 31, 15] },
  "tolga-24": { style: "Saldırgan", risk: 0.68, tolerance: 110, weights: [47, 35, 18] },
  "kaan-25": { style: "Pratik", risk: 0.32, tolerance: 60, weights: [72, 21, 7] },
  "kaan-26": { style: "Temkinli", risk: 0.11, tolerance: 30, weights: [89, 9, 2] },
  "muhammed-27": { style: "Dinamik", risk: 0.50, tolerance: 85, weights: [60, 27, 13] },
  "emre-28": { style: "Keskin oyun", risk: 0.70, tolerance: 115, weights: [46, 35, 19] },
  "alp-29": { style: "Hesapçı", risk: 0.25, tolerance: 45, weights: [77, 19, 4] },
  "kaan-30": { style: "Esnek", risk: 0.39, tolerance: 68, weights: [68, 23, 9] }
};

window.chooseZatoQuickMatchBot = function () {
  const profiles = window.ZATO_BOT_DATABASE;
  const levels = window.ZATO_BOT_ELO_LEVELS;
  const profile = profiles[Math.floor(Math.random() * profiles.length)];
  const eligibleLevels = levels.filter(level => level >= profile.minElo && level <= profile.maxElo);
  const pool = eligibleLevels.length ? eligibleLevels : levels;
  const elo = pool[Math.floor(Math.random() * pool.length)];
  return { ...profile, elo, personality: window.ZATO_BOT_PERSONALITIES[profile.id] };
};
