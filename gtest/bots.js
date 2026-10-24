// Chesszato Hızlı Eşleştirme bot profilleri.
// İsimler kurgusal profillerdir; arayüzde rakibin bot olduğu açıkça belirtilir.
window.ZATO_BOT_DATABASE = [
  { id: "ahmet-01", name: "Ahmet", minElo: 250, maxElo: 800 },
  { id: "emir-02", name: "Emir", minElo: 250, maxElo: 1200 },
  { id: "kerem-03", name: "Kerem", minElo: 400, maxElo: 1400 },
  { id: "deniz-04", name: "Deniz", minElo: 400, maxElo: 1800 },
  { id: "mert-05", name: "Mert", minElo: 250, maxElo: 800 },
  { id: "arda-06", name: "Arda", minElo: 800, maxElo: 1600 },
  { id: "yusuf-07", name: "Yusuf", minElo: 400, maxElo: 1200 },
  { id: "efe-08", name: "Efe", minElo: 250, maxElo: 1400 },
  { id: "kaan-09", name: "Kaan", minElo: 800, maxElo: 1800 },
  { id: "berk-10", name: "Berk", minElo: 400, maxElo: 1600 },
  { id: "can-11", name: "Can", minElo: 250, maxElo: 800 },
  { id: "umut-12", name: "Umut", minElo: 400, maxElo: 1400 },
  { id: "ali-13", name: "Ali", minElo: 800, maxElo: 2000 },
  { id: "burak-14", name: "Burak", minElo: 400, maxElo: 1200 },
  { id: "furkan-15", name: "Furkan", minElo: 250, maxElo: 1600 },
  { id: "enes-16", name: "Enes", minElo: 800, maxElo: 1800 },
  { id: "baran-17", name: "Baran", minElo: 400, maxElo: 1400 },
  { id: "kaan-18", name: "Kaan Y.", minElo: 1200, maxElo: 2200 },
  { id: "tuna-19", name: "Tuna", minElo: 250, maxElo: 1200 },
  { id: "onur-20", name: "Onur", minElo: 800, maxElo: 2000 },
  { id: "selim-21", name: "Selim", minElo: 400, maxElo: 1600 },
  { id: "omer-22", name: "Ömer", minElo: 250, maxElo: 800 },
  { id: "batuhan-23", name: "Batuhan", minElo: 800, maxElo: 1800 },
  { id: "tolga-24", name: "Tolga", minElo: 1200, maxElo: 2200 },
  { id: "kaan-25", name: "Kaan Demir", minElo: 400, maxElo: 1400 },
  { id: "kaan-26", name: "Kaan A.", minElo: 250, maxElo: 1200 },
  { id: "muhammed-27", name: "Muhammed", minElo: 800, maxElo: 1600 },
  { id: "emre-28", name: "Emre", minElo: 400, maxElo: 1800 },
  { id: "alp-29", name: "Alp", minElo: 1200, maxElo: 2000 },
  { id: "kaan-30", name: "Kaan K.", minElo: 250, maxElo: 1400 }
];

window.ZATO_BOT_ELO_LEVELS = [250, 400, 800, 1200, 1400, 1600, 1800, 2000, 2200];

window.chooseZatoQuickMatchBot = function () {
  const profiles = window.ZATO_BOT_DATABASE;
  const levels = window.ZATO_BOT_ELO_LEVELS;
  const profile = profiles[Math.floor(Math.random() * profiles.length)];
  const eligibleLevels = levels.filter(level => level >= profile.minElo && level <= profile.maxElo);
  const pool = eligibleLevels.length ? eligibleLevels : levels;
  const elo = pool[Math.floor(Math.random() * pool.length)];
  return { ...profile, elo };
};
