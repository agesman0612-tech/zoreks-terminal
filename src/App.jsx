import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import Chart from 'react-apexcharts';

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!ticker@arr';
const BINANCE_REST_URL = 'https://api.binance.com/api/v3/ticker/24hr';

// Zor AI - Ultra Stratejik Analiz Motoru (Profesyonel Raporlama)
const generateDetailedAIAnalysis = (coin) => {
  const { change, volume, price, high, low } = coin;
  
  // Realism Improvement: Volatility & Range Analysis
  const range = high - low;
  const volatility = range > 0 ? (range / price) * 100 : 2.5;
  const positionInRange = range > 0 ? ((price - low) / range) * 100 : 50;
  
  let signal = "NÖTR / BEKLE";
  let trend = "AKÜMÜLASYON";
  let color = "text-gray-400";
  let bg = "bg-gray-500/10";
  let confidence = 50 + (Math.abs(change) * 2);
  
  // RSI Mock based on price position in 24h range + change
  let rsiMock = positionInRange * 0.8 + (change * 1.5) + 10;
  if (rsiMock > 95) rsiMock = 95; if (rsiMock < 5) rsiMock = 5;

  if (change > 5 || (positionInRange > 80 && change > 0)) { 
    signal = "GÜÇLÜ AL / LONG"; trend = "POZİTİF TREND"; color = "text-green-400"; bg = "bg-green-500/20"; 
  } else if (change > 1.5) { 
    signal = "STRATEJİK EKLEME"; trend = "YUKARI EĞİLİM"; color = "text-green-300"; bg = "bg-green-400/10"; 
  } else if (change < -5 || (positionInRange < 20 && change < 0)) { 
    signal = "GÜÇLÜ SAT / SHORT"; trend = "NEGATİF TREND"; color = "text-red-500"; bg = "bg-red-600/20"; 
  } else if (change < -1.5) { 
    signal = "STRATEJİK AZALT"; trend = "AŞAĞI EĞİLİM"; color = "text-red-400"; bg = "bg-red-500/10"; 
  }

  const isBullish = change >= 0;
  
  // Realistic Targets based on Volatility (ATR-like approach)
  const entryMin = (price * (isBullish ? 0.995 : 1.005)).toFixed(price > 1 ? 2 : 6);
  const entryMax = (price * (isBullish ? 1.002 : 1.002)).toFixed(price > 1 ? 2 : 6);
  
  const targetMultiplier = Math.max(volatility * 0.5, 1.5);
  const tp1 = (price * (isBullish ? (1 + (targetMultiplier * 0.01)) : (1 - (targetMultiplier * 0.01)))).toFixed(price > 1 ? 2 : 6);
  const tp2 = (price * (isBullish ? (1 + (targetMultiplier * 0.025)) : (1 - (targetMultiplier * 0.025)))).toFixed(price > 1 ? 2 : 6);
  const tp3 = (price * (isBullish ? (1 + (targetMultiplier * 0.05)) : (1 - (targetMultiplier * 0.05)))).toFixed(price > 1 ? 2 : 6);
  
  const stopLoss = (price * (isBullish ? (1 - (targetMultiplier * 0.6 * 0.01)) : (1 + (targetMultiplier * 0.6 * 0.01)))).toFixed(price > 1 ? 2 : 6);
  
  // Risk Reward Calculation
  const risk = Math.abs(parseFloat(stopLoss) - price);
  const reward = Math.abs(parseFloat(tp2) - price);
  const rrRatio = (reward / risk).toFixed(2);

  const templates = [
    `ZOREKS Pro Analiz: ${trend} yapısı dahilinde fiyatın ${price.toLocaleString()}$ seviyesindeki likidite temizliği tamamlandı. ${volatility.toFixed(1)}% volatilite ile ${isBullish ? "yukarı yönlü bir kırılım" : "aşağı yönlü bir baskı"} bekleniyor.`,
    `Strateji Raporu: ${trend} sinyalleri güçleniyor. RSI ${rsiMock.toFixed(0)} seviyesinde ve ${rsiMock > 70 ? "aşırı alım" : rsiMock < 30 ? "aşırı satış" : "denge"} bölgesinde. ${rrRatio} R/R oranıyla pozisyon değerlendirilebilir.`,
    `Teknik Görünüm: ${price}$ ana pivot seviyesi üzerinde ${trend} korunuyor. Hacim verileri ${isBullish ? "alış iştahının" : "satış baskısının"} arttığını gösteriyor. Hedefler aktif.`
  ];
  
  const commentary = templates[Math.floor(Date.now() / 1000) % templates.length];

  return { signal, trend, rsiMock, color, bg, entryMin, entryMax, tp1, tp2, tp3, stopLoss, isBullish, confidence: confidence.toFixed(1), rrRatio,
    indicators: `RSI: ${rsiMock.toFixed(0)} | VOLATİLİTE: %${volatility.toFixed(2)} | GÜVEN: %${confidence.toFixed(1)}`,
    comment: commentary
  };
};

// Web Audio API Ping
const playPing = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.4);
  } catch(e) {}
};

// Optimized Ticker Row for High-Performance Rendering
const TickerRow = React.memo(({ t, alerts, onSelect }) => {
  const ai = generateDetailedAIAnalysis(t);
  const isRecentlyUpdated = Date.now() - (t.lastUpdate || 0) < 500;
  const buyRatio = t.buyRatio || 50;
  const sellRatio = 100 - buyRatio;
  const flashClass = isRecentlyUpdated 
    ? (t.status === 'up' ? 'bg-green-500/10' : t.status === 'down' ? 'bg-red-500/10' : '') 
    : '';

  return (
    <tr 
       className={`group hover:bg-white/[0.08] transition-all duration-300 cursor-pointer ${flashClass}`} 
       onClick={() => onSelect(t)}
    >
      <td className="px-10 py-10">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-black text-xl italic group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-xl border border-white/5 relative">
            {t.symbol.charAt(0)}
            {alerts.some(a => a.symbol === t.symbol && a.active) && (
               <div className="absolute -top-2 -right-2 bg-cyan-500 w-5 h-5 rounded-full flex items-center justify-center text-[10px] animate-pulse border-2 border-[#030712] shadow-lg">🔔</div>
            )}
          </div>
          <p className="font-black text-2xl group-hover:text-cyan-400 transition-colors uppercase italic tracking-tighter">{t.symbol.replace('USDT', '')}</p>
        </div>
      </td>
      <td className="px-10 py-10">
        <p className={`font-mono text-xl font-black tracking-tighter transition-colors duration-300 ${isRecentlyUpdated ? (t.status === 'up' ? 'text-green-400' : 'text-red-400') : 'text-white'}`}>
          ${t.price > 1 ? t.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : t.price.toFixed(6)}
        </p>
        <p className="text-[10px] font-black text-cyan-500/60 uppercase mt-2 tracking-widest italic leading-none">HACİM: ${(t.volume/1000000).toFixed(2)}M USD</p>
      </td>
      <td className="px-10 py-10 min-w-[200px]">
        <div className="flex justify-between items-center mb-2">
           <span className="text-[10px] font-black text-green-400">%{buyRatio.toFixed(1)} AL</span>
           <span className="text-[10px] font-black text-red-500">%{sellRatio.toFixed(1)} SAT</span>
        </div>
        <div className="h-1.5 w-full bg-red-500/20 rounded-full flex overflow-hidden border border-white/5 shadow-inner">
           <div className="h-full bg-green-500 transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" style={{ width: `${buyRatio}%` }} />
        </div>
      </td>
      <td className="px-10 py-10 text-right">
        <div className={`inline-flex items-center font-black text-lg px-6 py-3 rounded-[1.5rem] shadow-2xl transition-all ${t.change >= 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
          {t.change > 0 ? '▲' : '▼'} {Math.abs(t.change).toFixed(2)}%
        </div>
      </td>
      <td className="px-10 py-10 text-center">
        <div className={`inline-block px-8 py-2.5 rounded-full text-[11px] font-black tracking-[0.25em] shadow-2xl border border-white/10 uppercase ${ai.bg} ${ai.color}`}>
          {ai.signal}
        </div>
      </td>
    </tr>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.t.price === nextProps.t.price &&
    prevProps.t.change === nextProps.t.change &&
    prevProps.t.volume === nextProps.t.volume &&
    prevProps.t.lastUpdate === nextProps.t.lastUpdate &&
    prevProps.alerts.length === nextProps.alerts.length
  );
});

export default function App() {
  const [tickers, setTickers] = useState({});
  const [status, setStatus] = useState('Yükleniyor...');
  const [activeTab, setActiveTab] = useState('altcoins');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [recentTrades, setRecentTrades] = useState([]);
  const [fundingRate, setFundingRate] = useState(null);
  const [longShortData, setLongShortData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [modalTab, setModalTab] = useState('chart');
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [alarmForm, setAlarmForm] = useState({ target: '', type: 'ABOVE' });
  const [commentInput, setCommentInput] = useState('');
  const [commentSentiment, setCommentSentiment] = useState('Bullish');
  const [toasts, setToasts] = useState([]);
  const [whaleAlerts, setWhaleAlerts] = useState([]);
  const detailWs = useRef(null);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // NOTIFICATION PERMISSION
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // AUTH & PERSISTENCE
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('zoreks_user')) || null);
  const [showLogin, setShowLogin] = useState(!localStorage.getItem('zoreks_user'));
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', email: '', password: '' });
  const [alerts, setAlerts] = useState(JSON.parse(localStorage.getItem('zoreks_alerts')) || []);
  const [bannedUsers, setBannedUsers] = useState(JSON.parse(localStorage.getItem('zoreks_bans')) || []);

  // COMMUNITY & ADMIN DATA
  const [comments, setComments] = useState(JSON.parse(localStorage.getItem('zoreks_comments')) || [
    { id: 1, user: "Balina", text: "BTC 70k hedefim rasyonel bir teknik beklenti.", time: "2 dk", sentiment: "Bullish" },
    { id: 2, user: "Ayı", text: "Makroekonomik veriler baskıyı artırabilir.", time: "5 dk", sentiment: "Bearish" },
  ]);
  const [news, setNews] = useState([
    { 
      id: 1, 
      title: "Drift Protocol'de 280 Milyon Dolarlık 'Admin' Yetkisi İstismarı Saptandı.", 
      time: "1 SAAT", 
      source: "GÜVENLİK", 
      sourceName: "Drift Official", 
      sourceUrl: "https://x.com/DriftProtocol", 
      impact: "YÜKSEK",
      sentiment: "BEARISH",
      summary: "Solana tabanlı Drift Protocol, admin yetkilerinin ele geçirilmesi sonucu 280 milyon doların üzerinde kayıp yaşadı. Ekip, 'durable nonce' mekanizmasının suistimal edildiğini ve saldırının Kuzey Kore bağlantılı gruplarca gerçekleştirilmiş olabileceğini açıkladı. Platformda işlemler geçici olarak durduruldu.",
      strategicTake: "DeFi protokollerinde yönetici anahtarlarının (admin keys) güvenliği hala en zayıf halka. SOL ekosistemindeki likidite geçici olarak sarsılabilir." 
    },
    { 
      id: 2, 
      title: "Wormhole (W) Dev Token Kilidi Açılışı: 1.28 Milyar Token Piyasaya Giriyor.", 
      time: "2 SAAT", 
      source: "ANALİZ", 
      sourceName: "CoinMarketCap", 
      sourceUrl: "https://coinmarketcap.com/currencies/wormhole/", 
      impact: "YÜKSEK",
      sentiment: "BEARISH",
      summary: "Wormhole ekosistemi için bugün kritik bir dönüm noktası. Toplam arzın %28'ine denk gelen 1.28 milyar W token, erken dönem yatırımcıları ve katkı sağlayanlar için serbest bırakıldı. Piyasada ciddi bir satış baskısı ve volatilite bekleniyor.",
      strategicTake: "Böylesine büyük kilit açılışları (unlocks) genellikle 'sell the news' etkisi yaratır. Fiyat istikrarı için yeni likidite girişleri şart."
    },
    { 
      id: 3, 
      title: "Avustralya'da 'Dijital Varlıklar Çerçeve Tasarısı 2025' Yasalaştı.", 
      time: "4 SAAT", 
      source: "REGÜLASYON", 
      sourceName: "Gov.au", 
      sourceUrl: "https://www.aph.gov.au/Parliamentary_Business/Bills_Legislation", 
      impact: "ORTA",
      sentiment: "BULLISH",
      summary: "Avustralya Parlamentosu, kripto borsaları ve saklama kuruluşları için lisans zorunluluğu getiren kapsamlı yasa tasarısını resmen kabul etti. Bu adım, kurumsal yatırımcıların bölgeye girişini hızlandıracak bir hukuki zemin oluşturuyor.",
      strategicTake: "Düzenleme (regulation) kısa vadede kısıtlayıcı görünse de, uzun vadede piyasa meşruiyeti ve güveni için temel taştır." 
    },
    { 
      id: 4, 
      title: "ABD CLARITY Yasası: Stablecoin Faiz Getirileri İçin Yol Haritası Netleşiyor.", 
      time: "6 SAAT", 
      source: "FİNANS", 
      sourceName: "Coinbase Blog", 
      sourceUrl: "https://www.coinbase.com/blog", 
      impact: "ORTA",
      sentiment: "BULLISH",
      summary: "ABD'de görüşülen CLARITY Yasası'nda stablecoin ihraççılarının faiz getirisi sunma haklarına dair müzakereler son aşamaya geldi. Coinbase temsilcileri, bu ay sonunda tasarının komiteden geçmesini beklediklerini açıkladı.",
      strategicTake: "Yasal çerçeveye sahip bir stablecoin piyasası, DeFi ve geleneksel finans arasındaki köprüyü kalıcı hale getirecektir." 
    },
    { 
      id: 5, 
      title: "Geopolitik Gerilimler Bitcoin'i 'Risk-Off' Varlığı Olarak Test Ediyor.", 
      time: "8 SAAT", 
      source: "MAKRO", 
      sourceName: "TradingView", 
      sourceUrl: "https://www.tradingview.com/news/", 
      impact: "YÜKSEK",
      sentiment: "BEARISH",
      summary: "Orta Doğu'da artan tansiyon, Bitcoin fiyatını 24 saatte %5 geri çekti. Analistler, BTC'nin bu daldaki tepkisinin güvenli liman (gold-like) özelliğinden ziyade riskli varlık (risk-on) gibi davrandığını vurguluyor.",
      strategicTake: "Küresel belirsizlik dönemlerinde nakit (USD) kraldır. BTC'nin dijital altın tezi henüz tam olarak içselleştirilmemiş görünüyor." 
    },
    { 
      id: 6, 
      title: "SEC vs Coinbase: Hakim Failla Cüzdan (Wallet) İddiasını Reddetti.", 
      time: "10 SAAT", 
      source: "HUKUK", 
      sourceName: "Reuters", 
      sourceUrl: "https://www.reuters.com/legal/", 
      impact: "ORTA",
      sentiment: "BULLISH",
      summary: "Coinbase ve SEC arasındaki davada önemli bir ara karar verildi. Hakim, Coinbase Wallet'ın bir borsa aracısı (broker) sayılması gereken iddiaları reddetti. Bu karar, self-custody çözümleri için büyük bir zafer.",
      strategicTake: "Cüzdanların regülasyon dışı kalması, merkeziyetsizlik felsefesini koruyan hukuki bir kalkan oluşturuyor." 
    },
    { 
      id: 7, 
      title: "Ethereum 'Pectra' Güncellemesi: EIP-7702 İle Akıllı Cüzdan Devri Başlıyor.", 
      time: "12 SAAT", 
      source: "TEKNOLOJİ", 
      sourceName: "Ethereum Foundation", 
      sourceUrl: "https://ethereum.org/en/roadmap/", 
      impact: "ORTA",
      sentiment: "BULLISH",
      summary: "Ethereum geliştiricileri, bir sonraki büyük güncelleme olan Pectra'nın detaylarını paylaştı. EIP-7702 ile standart hesapların geçici olarak akıllı sözleşme cüzdanı gibi davranması sağlanacak, bu da kullanıcı deneyimini devrimsel boyutta artıracak.",
      strategicTake: "Teknik gelişim hız kesmiyor. 'Mass adoption' için gereken kullanıcı dostu altyapı Ethereum tarafında hızla inşa ediliyor." 
    },
    { 
      id: 8, 
      title: "Uniswap V4 'Hooks' Denetimleri Başladı: Limitless Likidite Mümkün Mü?", 
      time: "1 GÜN", 
      source: "DeFi", 
      sourceName: "Uniswap Labs", 
      sourceUrl: "https://blog.uniswap.org/", 
      impact: "ORTA",
      sentiment: "BULLISH",
      summary: "Merkeziyetsiz finansın devi Uniswap, V4 sürümünde kullanılacak 'Hooks' mimarisinin son güvenlik denetimlerine girdi. Bu sistem, likidite havuzlarının dinamik olarak özelleştirilmesine imkan tanıyarak sermaye verimliliğini maksimize edecek.",
      strategicTake: "Likiditeyi otomatik yöneten kancalar (hooks), LP'ler için pasif gelir optimizasyonunda yeni bir standart belirleyecek." 
    }
  ]);

  const ws = useRef(null);
  const tradeBuffer = useRef([]);
  const [shortTermSentiment, setShortTermSentiment] = useState({ buy: 0, sell: 0, ratio: 50 });
  const [accounts, setAccounts] = useState(JSON.parse(localStorage.getItem('zoreks_accounts')) || []);

  useEffect(() => { localStorage.setItem('zoreks_accounts', JSON.stringify(accounts)); }, [accounts]);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    const existingUser = accounts.find(acc => acc.username === loginForm.username && acc.password === loginForm.password) ||
                       (loginForm.username === 'sszorr' && loginForm.password === 'sszorr' ? { username: 'sszorr', role: 'admin' } : null);

    if (bannedUsers.includes(loginForm.username)) {
       alert("ERİŞİM ENGELLENDİ: ZOREKS kurallarına aykırı davrandınız.");
       return;
    }

    if (existingUser) {
      setUser(existingUser); 
      localStorage.setItem('zoreks_user', JSON.stringify(existingUser));
      setShowLogin(false);
    } else {
      alert("Hatalı kullanıcı adı veya şifre.");
    }
  };

  const handleRegister = (e) => {
    if (e) e.preventDefault();
    if (accounts.some(acc => acc.username === loginForm.username)) {
      alert("Bu kullanıcı adı zaten alınmış.");
      return;
    }
    const newUser = { username: loginForm.username, email: loginForm.email, password: loginForm.password, role: 'user' };
    const updatedAccounts = [...accounts, newUser];
    setAccounts(updatedAccounts);
    setUser(newUser);
    localStorage.setItem('zoreks_user', JSON.stringify(newUser));
    setShowLogin(false);
    alert("Üyeliğiniz başarıyla oluşturuldu! Hoş geldiniz.");
  };

  const handleGuest = () => {
    const guestUser = { username: 'Misafir', role: 'guest' };
    setUser(guestUser); setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null); localStorage.removeItem('zoreks_user'); setShowLogin(true);
  };

  const deleteComment = (id) => {
    if (user?.role !== 'admin') return;
    setComments(comments.filter(c => c.id !== id));
  };

  const banUser = (username) => {
    if (user?.role !== 'admin' || username === 'sszorr') return;
    setBannedUsers([...bannedUsers, username]);
  };

  // FETCH & WS
  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const response = await fetch(BINANCE_REST_URL);
        const data = await response.json();
        if (Array.isArray(data)) {
          const update = {};
          data.forEach(item => { 
            if (item?.symbol?.endsWith('USDT')) {
              const totalBase = parseFloat(item.volume) || 0;
              const takerBase = parseFloat(item.takerBuyBaseAssetVolume) || 0;
              const buyRatio = totalBase > 0 ? (takerBase / totalBase) * 100 : 50;
              
              update[item.symbol] = { 
                symbol: item.symbol, 
                price: parseFloat(item.lastPrice) || 0, 
                change: parseFloat(item.priceChangePercent) || 0, 
                volume: parseFloat(item.quoteVolume) || 0, 
                buyVol: parseFloat(item.takerBuyQuoteAssetVolume) || 0,
                buyRatio: !isNaN(buyRatio) ? buyRatio : 50,
                high: parseFloat(item.highPrice) || 0, 
                low: parseFloat(item.lowPrice) || 0 
              }; 
            }
          });
          setTickers(prev => ({ ...prev, ...update }));
        }
      } catch (e) {}
    };
    fetchTickers();
  }, []);

  useEffect(() => {
    if (!selectedCoin) {
      if (detailWs.current) { detailWs.current.close(); detailWs.current = null; }
      setOrderBook({ bids: [], asks: [] });
      setRecentTrades([]);
      setFundingRate(null);
      setLongShortData(null);
      setAiAnalysis(null);
      setModalTab('chart');
      return;
    }

    const symbol = selectedCoin.symbol;
    const s_low = symbol.toLowerCase();
    // bookTicker for millisecond price updates, trade for sentiment
    const url = `wss://stream.binance.com:9443/ws/${s_low}@bookTicker/${s_low}@trade`;
    
    if (detailWs.current) detailWs.current.close();
    detailWs.current = new WebSocket(url);

    tradeBuffer.current = [];
    setShortTermSentiment({ buy: 0, sell: 0, ratio: 50 });

    const updateStats = async () => {
      setAiAnalysis(generateDetailedAIAnalysis(selectedCoin));
      try {
        const [fRes, lsRes, kRes] = await Promise.all([
          fetch(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`),
          fetch(`https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=${symbol}&period=1h&limit=1`),
          fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=1`)
        ]);
        const [fData, lsData, kData] = await Promise.all([fRes.json(), lsRes.json(), kRes.json()]);
        
        if (fData && fData.lastFundingRate) setFundingRate(parseFloat(fData.lastFundingRate) * 100);
        if (Array.isArray(lsData) && lsData.length > 0) setLongShortData(parseFloat(lsData[0].longShortRatio));
        
        // High-precision sentiment injection
        if (Array.isArray(kData) && kData.length > 0) {
          const k = kData[0];
          const totalQuoteVol = parseFloat(k[7]);
          const takerQuoteVol = parseFloat(k[10]);
          const totalBaseVol = parseFloat(k[5]);
          const takerBaseVol = parseFloat(k[9]);
          const buyRatio = totalBaseVol > 0 ? (takerBaseVol / totalBaseVol) * 100 : 50;

          setTickers(prev => ({
            ...prev,
            [symbol]: {
              ...(prev[symbol] || {}),
              volume: totalQuoteVol,
              buyVol: takerQuoteVol,
              buyRatio: !isNaN(buyRatio) ? buyRatio : 50
            }
          }));
        }
      } catch (e) {}
    };
    updateStats();

    // 30s Refresh Interval
    const analysisTimer = setInterval(() => {
      setAiAnalysis(generateDetailedAIAnalysis(selectedCoin));
    }, 30000);

    detailWs.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      
      if (data.e === 'bookTicker') {
        // ULTRA-SYNC: Update price from bookTicker (Bid/Ask mid-price or best price)
        const bestPrice = (parseFloat(data.b) + parseFloat(data.a)) / 2;
        setTickers(prev => ({
          ...prev,
          [symbol]: {
            ...(prev[symbol] || {}),
            price: bestPrice,
            lastUpdate: Date.now()
          }
        }));
      } else if (data.e === 'trade') {
        const price = parseFloat(data.p);
        const qty = parseFloat(data.q);
        const isBuyerMaker = data.m; // true if sell, false if buy
        const side = isBuyerMaker ? 'sell' : 'buy';

        const newTrade = { id: data.t, price, qty, time: new Date(data.T).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), side };
        setRecentTrades(prev => [newTrade, ...prev].slice(0, 15));

        // 30s MOMENTUM: Add to buffer and calculate sentiment
        const now = Date.now();
        tradeBuffer.current.push({ price, qty, side, time: now });
        
        // Remove trades older than 30s
        tradeBuffer.current = tradeBuffer.current.filter(t => now - t.time <= 30000);
        
        const buyVol = tradeBuffer.current.filter(t => t.side === 'buy').reduce((sum, t) => sum + (t.price * t.qty), 0);
        const sellVol = tradeBuffer.current.filter(t => t.side === 'sell').reduce((sum, t) => sum + (t.price * t.qty), 0);
        const totalVol = buyVol + sellVol;
        const ratio = totalVol > 0 ? (buyVol / totalVol) * 100 : 50;

        setShortTermSentiment({ buy: buyVol, sell: sellVol, ratio });
      }
    };

    return () => { 
      if (detailWs.current) { detailWs.current.close(); detailWs.current = null; }
      clearInterval(analysisTimer);
    };
  }, [selectedCoin]);

  useEffect(() => {
    const connectWS = () => {
      ws.current = new WebSocket(BINANCE_WS_URL);
      ws.current.onopen = () => setStatus('CANLI');
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) {
            const update = {};
            data.forEach(item => {
              if (item?.s?.endsWith('USDT')) {
                const price = parseFloat(item.c);
                const prevPrice = tickers[item.s]?.price || price;
                const status = price > prevPrice ? 'up' : price < prevPrice ? 'down' : tickers[item.s]?.status || 'stable';
                const totalBaseVol = parseFloat(item.v) || 0;
                const takerBuyBaseVol = parseFloat(item.V) || 0;
                const rawBuyRatio = totalBaseVol > 0 ? (takerBuyBaseVol / totalBaseVol) * 100 : 50;
                const buyRatio = !isNaN(rawBuyRatio) ? rawBuyRatio : 50;
                const buyVol = parseFloat(item.Q) || 0;

                update[item.s] = { 
                  symbol: item.s, 
                  price, 
                  prevPrice, 
                  status, 
                  buyRatio, 
                  buyVol,
                  change: parseFloat(item.P) || 0, 
                  volume: parseFloat(item.q) || 0, 
                  high: parseFloat(item.h) || 0, 
                  low: parseFloat(item.l) || 0, 
                  lastUpdate: Date.now() 
                };

                // WHALE TRACKER: Monitor for large trades (> 100k USD in volume spike)
                const volChange = update[item.s].volume - (tickers[item.s]?.volume || 0);
                if (volChange > 100000) { // $100k volume spike
                  const newAlert = { id: Date.now() + Math.random(), symbol: item.s, type: 'VOLUME', value: volChange, time: new Date().toLocaleTimeString() };
                  setWhaleAlerts(prev => [newAlert, ...prev].slice(0, 5));
                  addToast(`🐋 BALİNA HAREKETİ: ${item.s} paritesinde $${(volChange/1000).toFixed(0)}K hacim girişi!`, 'info');
                }

                alerts.forEach(alertItem => { 
                  if (alertItem.symbol === item.s && alertItem.active && ((alertItem.type === 'ABOVE' && price > alertItem.target) || (alertItem.type === 'BELOW' && price < alertItem.target))) { 
                    alertItem.active = false; 
                    playPing(); 
                    
                    // SYSTEM NOTIFICATION
                    if ("Notification" in window && Notification.permission === "granted") {
                      new Notification(`🚨 ZOREKS ALARM: ${alertItem.symbol}`, {
                        body: `${alertItem.target} USD hedefine ulaşıldı! Canlı fiyat: ${price}`,
                        icon: '/favicon.ico'
                      });
                    }
                    addToast(`🚨 ALARM: ${alertItem.symbol} Hedef Fiyata (${alertItem.target}) Ulaştı!`, 'warning'); 
                  } 
                });
              }
            });
            setTickers(prev => ({ ...prev, ...update }));
          }
        } catch (e) {}
      };
      ws.current.onclose = () => setTimeout(connectWS, 5000);
    };
    connectWS();

    // Close News Modal on ESC
    const handleEsc = (event) => {
      if (event.keyCode === 27) setSelectedNews(null);
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      ws.current && ws.current.close();
      window.removeEventListener('keydown', handleEsc);
    };
  }, [alerts]);

  const addComment = (e) => {
    if (e) e.preventDefault();
    if (!user || user.role === 'guest') {
      alert("Yorum yapmak için giriş yapmalısınız.");
      return;
    }
    if (!commentInput.trim()) return;

    const newComment = {
      id: Date.now(),
      user: user.username,
      text: commentInput,
      time: "Şimdi",
      sentiment: commentSentiment,
    };
    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem('zoreks_comments', JSON.stringify(updated));
    setCommentInput('');
  };

  const list = useMemo(() => {
    let result = Object.values(tickers);
    if (activeTab === 'btc') result = result.filter(t => t.symbol === 'BTCUSDT');
    else if (activeTab === 'altcoins') result = result.filter(t => t.symbol !== 'BTCUSDT' && t.symbol !== 'ETHUSDT');
    if (searchTerm) result = result.filter(t => t.symbol.toLowerCase().includes(searchTerm.toLowerCase()));
    return result.sort((a, b) => b.volume - a.volume);
  }, [tickers, activeTab, searchTerm]);

  if (showLogin) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 animate-in fade-in duration-1000">
         <div className="max-w-md w-full bg-white/5 border border-white/10 p-10 rounded-[3rem] glass shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-3xl" />
            <header className="text-center mb-10">
               <div className="w-20 h-20 bg-cyan-500 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.6)] mb-6">
                  <span className="font-black text-white text-5xl italic tracking-tighter">ZX</span>
               </div>
               <h1 className="text-3xl font-black italic tracking-tighter text-white">ZOREKS <span className="text-cyan-400">{isRegistering ? 'KAYIT' : 'GİRİŞ'}</span></h1>
               <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2 italic animate-pulse">Analiz & Strateji Platformu</p>
            </header>

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
               <input type="text" placeholder="Kullanıcı Adı" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500/50 text-white font-bold transition-all" value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} required />
               {isRegistering && (
                 <input type="email" placeholder="E-posta Adresi" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500/50 text-white font-bold transition-all" value={loginForm.email} onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} required />
               )}
               <input type="password" placeholder="Şifre" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500/50 text-white font-bold transition-all" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} required />
               <button type="submit" className="w-full bg-cyan-500 py-4 rounded-2xl text-white font-black hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest shadow-2xl">
                 {isRegistering ? 'HESAP OLUŞTUR' : 'ZOREKS\'E GİRİŞ YAP'}
               </button>
            </form>

            <div className="mt-8 text-center space-y-4">
               <button onClick={() => setIsRegistering(!isRegistering)} className="text-gray-400 font-bold hover:text-cyan-400 transition-all text-xs uppercase tracking-widest">
                 {isRegistering ? 'Zaten hesabınız var mı? Giriş yapın' : 'Henüz hesabınız yok mu? Kayıt olun'}
               </button>
               <div className="h-px bg-white/5 w-1/2 mx-auto" />
               <button onClick={handleGuest} className="w-full py-4 rounded-2xl border border-white/10 text-gray-500 font-bold hover:text-white transition-all uppercase text-[10px] tracking-widest">Misafir Girişi</button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* Haber Özet Overlay (Ultra Premium) */}
      {selectedNews && (
        <div className="fixed inset-0 z-[120] bg-[#030712]/98 backdrop-blur-3xl flex items-start md:items-center justify-center p-4 md:p-10 animate-in zoom-in-95 duration-500 overflow-y-auto">
           <button 
             onClick={() => setSelectedNews(null)} 
             className="fixed top-6 right-6 md:top-12 md:right-12 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all border border-white/20 hover:rotate-90 group z-[150] shadow-2xl backdrop-blur-xl"
           >
              <span className="text-2xl md:text-3xl font-black group-hover:scale-125 transition-transform">✕</span>
           </button>

           <div className="max-w-4xl w-full bg-white/5 border border-white/10 p-8 md:p-16 rounded-[4rem] glass shadow-2xl relative overflow-hidden flex flex-col my-10 md:my-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[120px] -z-10" />
              
              <div className="flex flex-wrap items-center gap-4 mb-10">
                 <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full border shadow-xl ${selectedNews.sentiment === 'BULLISH' ? 'bg-green-500/10 border-green-500/30 text-green-400' : selectedNews.sentiment === 'BEARISH' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>
                   {selectedNews.sentiment} DUYARLILIK
                 </span>
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-6 py-2 rounded-full border border-white/10 italic">
                   {selectedNews.sourceName} | {selectedNews.time} GÖNDERİLDİ
                 </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white mb-10 leading-tight border-l-[10px] border-cyan-500 pl-8">
                "{selectedNews.title}"
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">HABER ÖZETİ</h4>
                    <p className="text-sm md:text-[15px] text-gray-300 leading-relaxed font-semibold italic bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                      "{selectedNews.summary}"
                    </p>
                 </div>
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">ZOR AI STRATEJİK BAKIŞ</h4>
                    <div className="bg-cyan-500/5 p-8 rounded-[2.5rem] border border-cyan-500/20 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 bg-cyan-400 rounded-full animate-ping" />
                       </div>
                       <p className="text-sm md:text-[15px] text-cyan-100 leading-relaxed font-black italic">
                         "{selectedNews.strategicTake}"
                       </p>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ETKİ SKORU:</span>
                       <span className={`text-lg font-black italic tracking-tighter ${selectedNews.impact === 'YÜKSEK' ? 'text-red-500' : selectedNews.impact === 'ORTA' ? 'text-cyan-400' : 'text-green-400'}`}>{selectedNews.impact}</span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-auto justify-center md:justify-start">
                <button 
                  onClick={() => window.open(selectedNews.sourceUrl, '_blank')}
                  className="px-10 py-5 bg-cyan-500 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-cyan-500/20"
                >
                  KAYNAĞA GİT: {selectedNews.sourceName}
                </button>
              </div>
           </div>
        </div>
      )}

      {selectedCoin && (() => {
        const liveCoin = tickers[selectedCoin.symbol] || selectedCoin;
        return (
        <div className="fixed inset-0 z-[150] bg-[#030712]/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-8 animate-in zoom-in-95 duration-500 overflow-y-auto">
           <button onClick={() => setSelectedCoin(null)} className="fixed top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all border border-white/20 z-[200]">✕</button>
           
           <div className="max-w-[1500px] w-full bg-white/5 border border-white/10 rounded-[3rem] glass shadow-2xl relative overflow-hidden flex flex-col h-full max-h-[90vh]">
              {/* Terminal Navigation */}
              <div className="p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-6 bg-white/[0.02]">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic shadow-2xl">{liveCoin.symbol.charAt(0)}</div>
                    <div>
                       <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">{liveCoin.symbol.replace('USDT', '')} <span className="text-cyan-500">PRO TERMİNAL</span></h2>
                       <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
                          <p className="text-[9px] text-gray-500 font-black tracking-widest uppercase">ZOR AI STRATEJİK ANALİZ v2.5</p>
                       </div>
                    </div>
                 </div>

                 <nav className="flex bg-white/5 p-1 rounded-2xl border border-white/10 glass">
                    {['chart', 'sentiment', 'strateji', 'orderbook'].map((tab) => (
                       <button 
                          key={tab}
                          onClick={() => setModalTab(tab)}
                          className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${modalTab === tab ? 'bg-cyan-500 text-white shadow-xl' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                       >
                          {tab === 'chart' ? 'Grafik' : tab === 'sentiment' ? 'Al/Sat Analizi' : tab === 'strateji' ? 'Pro Strateji' : 'Emir Defteri'}
                       </button>
                    ))}
                 </nav>

                 <div className="text-right">
                    <p className="text-2xl font-black text-white font-mono tracking-tighter">${liveCoin.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className={`text-[11px] font-black mt-1 ${liveCoin.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                       {liveCoin.change >= 0 ? '+' : ''}{liveCoin.change}% (24S)
                    </p>
                 </div>
              </div>

              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                 {/* Main Content Area */}
                 <div className="flex-1 p-8 overflow-y-auto custom-scrollbar border-r border-white/10">
                    {modalTab === 'chart' && (
                       <div className="h-full min-h-[500px] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl animate-in zoom-in-95 duration-500">
                          <AdvancedRealTimeChart symbol={`BINANCE:${liveCoin.symbol}`} theme="dark" autosize locale="tr" hide_side_toolbar={false} />
                       </div>
                    )}

                    {modalTab === 'sentiment' && (
                       <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                          {/* GRAFİTİ: AL/SAT BASKI GRAFİĞİ */}
                          <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] glass relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-8 opacity-5">
                                <span className="text-8xl font-black italic text-cyan-500 uppercase">SENTIMENT</span>
                             </div>
                             <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-10">PİYASA BASKI DAĞILIMI (TAKER VOL)</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                <div>
                                   <Chart 
                                      options={{
                                         chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
                                         plotOptions: { 
                                           bar: { 
                                             borderRadius: 12, 
                                             columnWidth: '55%', 
                                             distributed: true,
                                             dataLabels: { position: 'top' }
                                           } 
                                         },
                                         dataLabels: { 
                                           enabled: true, 
                                           formatter: (val) => `$${(val / 1000000).toFixed(2)}M`,
                                           offsetY: -30,
                                           style: { fontSize: '12px', fontWeight: 900, colors: ['#fff'] }
                                         },
                                         xaxis: { 
                                           categories: ['ALIŞ (USDT)', 'SATIŞ (USDT)'], 
                                           labels: { style: { colors: '#94a3b8', fontWeight: 900 } },
                                           axisBorder: { show: false }
                                         },
                                         yaxis: { show: false },
                                         grid: { show: false },
                                         colors: ['#22c55e', '#ef4444'],
                                         tooltip: { 
                                           theme: 'dark',
                                           y: { formatter: (val) => `$${val.toLocaleString()}` }
                                         },
                                         legend: { show: false }
                                      }}
                                      series={[{ name: 'Hacim', data: [liveCoin.buyVol || 0, (liveCoin.volume || 0) - (liveCoin.buyVol || 0)] }]}
                                      type="bar"
                                      height={300}
                                   />
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 text-center relative overflow-hidden">
                                       <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                                          <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${liveCoin.buyRatio || 50}%` }} />
                                       </div>
                                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">24 SAAT ANALİZİ</p>
                                       <p className={`text-4xl md:text-5xl font-black italic tracking-tighter mb-6 ${liveCoin.buyRatio > 50 ? 'text-green-400' : 'text-red-400'}`}>
                                          %{liveCoin.buyRatio?.toFixed(1) || '50.0'} {liveCoin.buyRatio > 50 ? 'BOĞA' : 'AYI'}
                                       </p>
                                       <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5 uppercase font-black text-[9px] tracking-[0.2em]">
                                          <div className="space-y-1">
                                             <p className="text-gray-500">TOPLAM ALIŞ</p>
                                             <p className="text-green-400 text-sm italic font-mono font-bold">${((liveCoin.buyVol || 0) / 1000000).toFixed(2)}M</p>
                                          </div>
                                          <div className="space-y-1">
                                             <p className="text-gray-500">TOPLAM SATIŞ</p>
                                             <p className="text-red-500 text-sm italic font-mono font-bold">${(((liveCoin.volume || 0) - (liveCoin.buyVol || 0)) / 1000000).toFixed(2)}M</p>
                                          </div>
                                       </div>
                                    </div>

                                    {/* 30s MOMENTUM UI */}
                                    <div className="bg-cyan-500/5 p-8 rounded-[2.5rem] border border-cyan-500/20 text-center relative overflow-hidden animate-pulse">
                                       <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                                          <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${shortTermSentiment.ratio}%` }} />
                                       </div>
                                       <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4">30 SANİYE MOMENTUM (ULTRA-SYNC)</p>
                                       <div className="flex items-center justify-center gap-6 mb-6">
                                          <p className={`text-4xl font-black italic tracking-tighter ${shortTermSentiment.ratio > 50 ? 'text-green-400' : 'text-red-400'}`}>
                                             %{shortTermSentiment.ratio.toFixed(1)}
                                          </p>
                                          <div className="flex flex-col items-start leading-none uppercase font-black text-[12px] italic">
                                             <span className={shortTermSentiment.ratio > 50 ? 'text-green-400' : 'text-gray-500'}>ALIM KUVVETİ</span>
                                             <span className={shortTermSentiment.ratio <= 50 ? 'text-red-400' : 'text-gray-500'}>SATIŞ BASKISI</span>
                                          </div>
                                       </div>
                                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                                          <div className="h-full bg-green-500 transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.6)]" style={{ width: `${shortTermSentiment.ratio}%` }} />
                                          <div className="h-full bg-red-500 transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.6)]" style={{ width: `${100 - shortTermSentiment.ratio}%` }} />
                                       </div>
                                       <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-6">CANLI TRADE AKIŞI ANALİZ EDİLİYOR...</p>
                                    </div>
                                   <div className="bg-cyan-500/5 p-6 rounded-2xl border border-cyan-500/20 text-center">
                                      <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">FONLAMA (8S)</p>
                                      <p className={`text-xl font-mono font-black ${fundingRate > 0 ? 'text-red-400' : 'text-green-400'}`}>{fundingRate ? `${fundingRate.toFixed(4)}%` : '---'}</p>
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] glass flex flex-col items-center">
                                <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-6 text-center w-full">LONG / SHORT RATIO (HESAP)</h4>
                                <Chart 
                                   options={{
                                      chart: { type: 'radialBar', sparkline: { enabled: true } },
                                      plotOptions: {
                                         radialBar: {
                                            startAngle: -90, endAngle: 90,
                                            track: { background: "#ffffff10", strokeWidth: '100%' },
                                            dataLabels: {
                                               name: { show: false },
                                               value: { offsetLines: -2, fontSize: '30px', fontWeight: '900', color: '#fff', formatter: (val) => val.toFixed(2) }
                                            }
                                         }
                                      },
                                      fill: { colors: [longShortData > 1 ? '#22c55e' : '#ef4444'] },
                                      labels: ['Ratio'],
                                   }}
                                   series={[longShortData ? (longShortData / 3) * 100 : 50]}
                                   type="radialBar"
                                   width={260}
                                />
                                <p className="text-xl font-black text-white uppercase tracking-widest mt-[-20px]">{longShortData ? `${longShortData.toFixed(2)}x` : '---'}</p>
                             </div>

                             <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] glass flex flex-col justify-center">
                                <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-6">STRATEJİK NOT</h4>
                                <p className="text-sm text-slate-300 italic leading-relaxed font-medium">
                                   {fundingRate > 0.01 
                                     ? "⚠️ Yüksek pozitif fonlama; long pozisyonlar için maliyet artıyor, kısa vadeli bir kar satışı (flush) olasılığı takip edilmeli." 
                                     : "✅ Fonlama oranları dengeli seyrediyor, piyasa mevcut trend yönünde rasyonel bir kaldıraçla ilerliyor."
                                   }
                                </p>
                             </div>
                          </div>
                       </div>
                    )}

                    {modalTab === 'strateji' && aiAnalysis && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                           <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] glass relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-8 opacity-5">
                                 <span className="text-8xl font-black italic text-cyan-500 uppercase">STRATEGY</span>
                              </div>
                              <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-10">ZOREKS PRO İŞLEM SİNYALİ</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                 {/* ENTRY ZONE */}
                                 <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-[2rem] relative group/entry">
                                    <div className="absolute -top-3 -left-3 bg-green-500 text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">GİRİŞ BÖLGESİ</div>
                                    <p className="text-[10px] text-green-400/60 font-black uppercase tracking-widest mb-3">KADEMELİ ALIM ARALIĞI</p>
                                    <h5 className="text-2xl font-black text-green-400 font-mono tracking-tighter mb-2">{aiAnalysis.entryMin} $</h5>
                                    <h5 className="text-2xl font-black text-green-400 font-mono tracking-tighter">{aiAnalysis.entryMax} $</h5>
                                    <div className="mt-6 pt-6 border-t border-green-500/10 flex items-center gap-3">
                                       <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                                       <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">AKÜMÜLASYON AKTİF</span>
                                    </div>
                                 </div>

                                 {/* PROFIT TARGETS */}
                                 <div className="md:col-span-1 bg-cyan-500/5 border border-cyan-500/20 p-8 rounded-[2rem] relative">
                                    <div className="absolute -top-3 -left-3 bg-cyan-500 text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">SATIŞ HEDEFLERİ</div>
                                    <div className="space-y-6">
                                       <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                          <span className="text-[9px] font-black text-gray-500 uppercase">TP-1 (%2.5)</span>
                                          <span className="text-lg font-black text-cyan-400 font-mono">{aiAnalysis.tp1} $</span>
                                       </div>
                                       <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                          <span className="text-[9px] font-black text-gray-500 uppercase">TP-2 (%5.0)</span>
                                          <span className="text-lg font-black text-cyan-400 font-mono">{aiAnalysis.tp2} $</span>
                                       </div>
                                       <div className="flex justify-between items-center bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
                                          <span className="text-[9px] font-black text-white uppercase">TP-3 (%10.0)</span>
                                          <span className="text-lg font-black text-white font-mono">{aiAnalysis.tp3} $</span>
                                       </div>
                                    </div>
                                 </div>

                                 {/* RISK MANAGEMENT */}
                                 <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] relative">
                                    <div className="absolute -top-3 -left-3 bg-red-500 text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">ZARAR DURDUR</div>
                                    <p className="text-[10px] text-red-500/60 font-black uppercase tracking-widest mb-3">CRITICAL STOP LOSS</p>
                                    <h5 className="text-3xl font-black text-red-500 font-mono tracking-tighter mb-4">{aiAnalysis.stopLoss} $</h5>
                                    <p className="text-[9px] font-bold text-red-400 italic">"Bu fiyatın altındaki saatlik kapanışlarda strateji iptal edilmelidir."</p>
                                    <div className="mt-8">
                                       <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">RİSK / ÖDÜL ORANI (R:R)</p>
                                       <div className="flex items-center gap-4">
                                          <div className="h-2 flex-1 bg-red-500/10 rounded-full overflow-hidden">
                                             <div className="h-full bg-cyan-500" style={{ width: `${Math.min((parseFloat(aiAnalysis.rrRatio) / 3) * 100, 100)}%` }} />
                                          </div>
                                          <span className="text-xs font-black text-white font-mono">1 : {aiAnalysis.rrRatio}</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="bg-[#030712] border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl">
                              <div className="flex items-center gap-6">
                                 <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl animate-pulse">📡</div>
                                 <div>
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">SİNYAL OLUŞTURMA ZAMANI</p>
                                    <p className="text-sm font-black text-white uppercase italic tracking-tighter">ŞİMDİ ( CANLI VERİ )</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">GÜVEN SKORU</p>
                                 <p className="text-xl font-black text-cyan-500 italic tracking-widest">%{aiAnalysis.confidence}</p>
                              </div>
                           </div>
                        </div>
                     )}

                    {modalTab === 'orderbook' && (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-full animate-in fade-in slide-in-from-left-8 duration-500">
                          <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] glass flex flex-col overflow-hidden">
                             <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-6">EMİR DEFTERİ GÖRÜNÜMÜ</h4>
                             <div className="flex-1 overflow-hidden font-mono text-[11px] space-y-1">
                                {orderBook.asks.map((a, i) => (
                                   <div key={i} className="flex justify-between py-1 relative">
                                      <div className="absolute inset-0 bg-red-500/5 origin-left" style={{ width: `${(parseFloat(a[1]) / Math.max(...orderBook.asks.map(x=>parseFloat(x[1])))) * 100}%` }} />
                                      <span className="text-red-500 font-bold z-10">{parseFloat(a[0]).toFixed(selectedCoin.price < 1 ? 6 : 2)}</span>
                                      <span className="text-gray-400 z-10">{parseFloat(a[1]).toFixed(3)}</span>
                                   </div>
                                ))}
                                <div className="h-px bg-white/10 my-4" />
                                {orderBook.bids.map((b, i) => (
                                   <div key={i} className="flex justify-between py-1 relative">
                                      <div className="absolute inset-0 bg-green-500/5 origin-left" style={{ width: `${(parseFloat(b[1]) / Math.max(...orderBook.bids.map(x=>parseFloat(x[1])))) * 100}%` }} />
                                      <span className="text-green-400 font-bold z-10">{parseFloat(b[0]).toFixed(selectedCoin.price < 1 ? 6 : 2)}</span>
                                      <span className="text-gray-400 z-10">{parseFloat(b[1]).toFixed(3)}</span>
                                   </div>
                                ))}
                             </div>
                          </div>

                          <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] glass flex flex-col overflow-hidden">
                             <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-6">SON İŞLEM AKIŞI</h4>
                             <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                                {recentTrades.map((tr) => (
                                   <div key={tr.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                      <span className={`text-sm font-black font-mono ${tr.side === 'buy' ? 'text-green-400' : 'text-red-500'}`}>{tr.price.toFixed(selectedCoin.price < 1 ? 6 : 2)}</span>
                                      <span className="text-[10px] font-black text-slate-400">{tr.qty.toFixed(3)}</span>
                                      <span className="text-[9px] font-bold text-gray-500">{tr.time}</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* Sidebar: Zor AI Analysis */}
                 <div className="w-full lg:w-[400px] p-8 bg-white/[0.02] flex flex-col">
                    <div className="mb-10 flex justify-between items-center">
                       <h3 className="text-xl font-black italic text-white tracking-widest">ANALİZ RAPORU</h3>
                       <div className="bg-cyan-500/20 px-3 py-1 rounded-lg border border-cyan-500/30 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                          <span className="text-[8px] font-black text-cyan-400 tracking-[0.2em]">30S YENİLEME</span>
                       </div>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-center">
                             <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">SİNYAL</p>
                             <p className={`text-lg font-black ${aiAnalysis?.color}`}>{aiAnalysis?.signal}</p>
                          </div>
                          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-center">
                             <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">DURUM</p>
                             <p className="text-[11px] font-black text-white italic truncate uppercase">{aiAnalysis?.trend}</p>
                          </div>
                       </div>

                       <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] glass shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                             <span className="text-4xl font-black italic text-cyan-500">AI</span>
                          </div>
                          <h4 className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-4">STRATEJİK YORUM</h4>
                          <p className="text-sm font-semibold text-slate-200 leading-relaxed italic animate-in fade-in duration-1000">
                             "{aiAnalysis?.comment}"
                          </p>
                       </div>

                       <div className="bg-cyan-500/10 p-6 rounded-2xl border border-cyan-500/20 text-center">
                          <p className="text-[10px] font-black text-cyan-400 tracking-widest uppercase">{aiAnalysis?.indicators}</p>
                       </div>
                    </div>

                    <div className="mt-10">
                       <button 
                          onClick={() => setShowAlarmModal(true)}
                          className="w-full bg-cyan-500 text-white font-black py-4 rounded-3xl shadow-lg hover:shadow-cyan-500/40 transition-all uppercase tracking-widest text-[11px]"
                       >
                          ALARM KUR (PRO)
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           {/* PROFESSIONAL ALARM MODAL */}
           {showAlarmModal && (
             <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
               <div className="max-w-md w-full bg-[#030712] border border-white/10 p-10 rounded-[3rem] glass shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6">
                   <button onClick={() => setShowAlarmModal(false)} className="text-gray-500 hover:text-white transition-all text-xl font-black">✕</button>
                 </div>
                 <header className="mb-8">
                   <h3 className="text-2xl font-black italic text-white tracking-widest">ALARM KUR</h3>
                   <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mt-1">{selectedCoin.symbol} İÇİN ÖZEL PİNG</p>
                 </header>

                 <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">HEDEF FİYAT (USD)</label>
                      <input 
                        type="number" 
                        placeholder={selectedCoin.price.toString()}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500/50 text-white font-bold transition-all text-lg"
                        value={alarmForm.target}
                        onChange={(e) => setAlarmForm({...alarmForm, target: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">KOŞUL</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500/50 text-white font-bold transition-all appearance-none"
                        value={alarmForm.type}
                        onChange={(e) => setAlarmForm({...alarmForm, type: e.target.value})}
                      >
                        <option value="ABOVE" className="bg-[#030712]">FİYAT ÜSTÜNE ÇIKINCA</option>
                        <option value="BELOW" className="bg-[#030712]">FİYAT ALTINA İNİNCE</option>
                      </select>
                    </div>

                    <button 
                      onClick={() => {
                        if(!alarmForm.target) return;
                        setAlerts([{ id: Date.now(), symbol: selectedCoin.symbol, target: parseFloat(alarmForm.target), type: alarmForm.type, active: true }, ...alerts]);
                        playPing();
                        setShowAlarmModal(false);
                        setAlarmForm({ target: '', type: 'ABOVE' });
                      }}
                      className="w-full bg-cyan-500 py-5 rounded-2xl text-white font-black hover:scale-[1.02] active:scale-95 transition-all shadow-2xl tracking-[0.2em] uppercase text-xs"
                    >
                      STRATEJİK ALARMI AKTİFLEŞTİR
                    </button>
                  </div>
               </div>
             </div>
           )}
         </div>
        );
      })()}

      {/* Main Apps Header */}
      <header className="sticky top-0 z-[60] bg-[#030712]/90 backdrop-blur-3xl border-b border-white/5 p-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-cyan-500 rounded-[1.25rem] flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.5)]">
            <span className="font-black text-white text-3xl italic tracking-tighter">ZX</span>
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">ZOREKS</h1>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[9px] font-black text-gray-600 tracking-[0.5em] uppercase">{status} ANALİZ</span>
            </div>
          </div>
        </div>

        <nav className="flex bg-white/5 p-1.5 rounded-[1.5rem] border border-white/10 glass shadow-2xl overflow-x-auto no-scrollbar">
          {['all', 'altcoins', 'haberler', 'yorumlar', 'alarms', 'admin'].map((tab) => {
            if (tab === 'admin' && user?.role !== 'admin') return null;
            return (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase transition-all tracking-tighter whitespace-nowrap flex items-center gap-2 md:gap-3 ${activeTab === tab ? 'bg-cyan-500 text-white shadow-2xl scale-105' : 'text-gray-500 hover:text-white'}`}
              >
                {tab === 'all' ? 'Tümü' : tab === 'altcoins' ? 'Altcoin Paketi' : tab === 'haberler' ? 'Dünya Gündemi' : tab === 'yorumlar' ? 'Topluluk' : tab === 'alarms' ? 'Alarmlarım' : 'Yönetim'}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-6">
          <div className="relative group hidden lg:block">
            <input type="text" placeholder="Varlık Ara..." className="bg-white/5 border border-white/10 rounded-full px-10 py-3.5 text-sm outline-none w-72 focus:border-cyan-500/50 shadow-inner font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
            {/* PWA Install Button */}
            <button 
              id="install-btn"
              onClick={() => {
                const btn = document.getElementById('install-btn');
                if (window.deferredPrompt) {
                  window.deferredPrompt.prompt();
                  window.deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                      console.log('User accepted the install prompt');
                      btn.style.display = 'none';
                    }
                    window.deferredPrompt = null;
                  });
                } else {
                  alert("Tabletinizde Chrome menüsünden (üç nokta) 'Uygulamayı Yükle' veya 'Ana Ekrana Ekle' seçeneğine dokunun.");
                }
              }}
              className="hidden sm:flex bg-cyan-500/10 border border-cyan-500/20 px-6 py-2.5 rounded-xl text-cyan-400 font-black text-[10px] uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all shadow-lg"
            >
              Tablete Yükle (APK)
            </button>
            <div className="text-right hidden sm:block">
               <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest">KİMLİK ONAYLI</p>
               <p className="text-base font-black text-white italic tracking-tighter">{user?.username}</p>
            </div>
            <button onClick={handleLogout} className="bg-white/5 w-12 h-12 flex items-center justify-center rounded-2xl border border-white/10 hover:bg-red-500/20 text-red-400 transition-all font-black">X</button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto min-h-[85vh]">
        
        {/* Market Pulse Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in slide-in-from-top duration-700">
           <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 glass group hover:bg-white/[0.08] transition-all">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-2">24S TOPLAM HACİM</p>
              <h3 className="text-3xl font-black italic tracking-tighter text-white">
                ${(Object.values(tickers).reduce((sum, t) => sum + (t.volume || 0), 0) / 1000000).toFixed(2)}M <span className="text-cyan-500 text-sm">USD</span>
              </h3>
           </div>
           <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 glass group hover:bg-white/[0.08] transition-all border-l-4 border-l-cyan-500">
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-2">BTC DOMİNASYON & FİYAT</p>
              <h3 className="text-3xl font-black italic tracking-tighter text-white flex items-center gap-3">
                <span className="text-cyan-500">₿</span> ${tickers['BTCUSDT']?.price?.toLocaleString() || '---'}
                <span className={`text-xs px-2 py-1 rounded-lg ${tickers['BTCUSDT']?.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>
                  %{tickers['BTCUSDT']?.change?.toFixed(2)}
                </span>
              </h3>
           </div>
           <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 glass group hover:bg-white/[0.08] transition-all">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-2">AKTİF POZİSYONLAR</p>
              <h3 className="text-3xl font-black italic tracking-tighter text-white">
                {list.length} <span className="text-gray-500 text-sm uppercase">VARLIK</span>
              </h3>
           </div>
        </div>

        {/* Content Tabs */}
        {activeTab === 'alarms' ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
             <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 glass">
                <h3 className="text-2xl font-black italic text-white mb-8 tracking-widest uppercase">AKTİF ALARMLARINIZ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {alerts.length === 0 ? (
                      <p className="text-gray-500 font-bold italic">Henüz bir alarm kurmadınız.</p>
                   ) : (
                      alerts.map(a => (
                        <div key={a.id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between group hover:bg-white/10 transition-all">
                           <div>
                              <p className="text-xl font-mono font-black text-white">{a.symbol}</p>
                              <p className="text-[10px] font-black text-cyan-400 mt-1 uppercase tracking-widest">
                                 {a.type === 'ABOVE' ? 'Kırılım Üstü' : 'Düşüş Altı'} {a.target} $
                              </p>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full mt-2 inline-block ${a.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>
                                 {a.active ? 'BİLGİ BEKLENİYOR' : 'TETİKLENDİ'}
                              </span>
                           </div>
                           <button 
                             onClick={() => setAlerts(alerts.filter(x => x.id !== a.id))}
                             className="text-gray-600 hover:text-red-500 font-black text-lg p-2 transition-all"
                           >✕</button>
                        </div>
                      ))
                   )}
                </div>
             </div>
          </div>
        ) : activeTab === 'yorumlar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-700">
            <div className="lg:col-span-2 space-y-6">
               {/* POST COMMENT FORM */}
               <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] glass shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/5 blur-3xl group-hover:bg-cyan-500/10 transition-all" />
                  <h3 className="text-xl font-black italic text-white mb-6 uppercase tracking-widest">STRATEJİK YORUMUNUZU PAYLAŞIN</h3>
                  <form onSubmit={addComment} className="space-y-6">
                     <textarea 
                        placeholder="Piyasa beklentinizi buraya yazın..."
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 outline-none focus:border-cyan-500/50 text-white font-bold transition-all min-h-[150px] resize-none text-[15px]"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                     />
                     <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 glass">
                           {['Bullish', 'Bearish'].map((s) => (
                             <button 
                               key={s} 
                               type="button"
                               onClick={() => setCommentSentiment(s)}
                               className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${commentSentiment === s ? (s === 'Bullish' ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'text-gray-500 hover:text-white'}`}
                             >
                               {s === 'Bullish' ? 'BOĞA (AL)' : 'AYI (SAT)'}
                             </button>
                           ))}
                        </div>
                        <button type="submit" className="px-12 py-4 bg-cyan-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-cyan-500/20">PAYLAŞ</button>
                     </div>
                  </form>
               </div>

               {/* COMMENTS FEED */}
               <div className="space-y-6">
                 {comments.map((c) => (
                   <div key={c.id} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] glass shadow-xl hover:bg-white/[0.08] transition-all relative group">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 font-black italic">{c.user.charAt(0)}</div>
                            <span className="font-black text-white italic tracking-tighter uppercase">{c.user}</span>
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{c.time} ÖNCE</span>
                         </div>
                         <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border ${c.sentiment === 'Bullish' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                           {c.sentiment.toUpperCase()}
                         </span>
                      </div>
                      <p className="text-[15px] font-medium text-slate-300 leading-relaxed italic">"{c.text}"</p>
                      {user?.role === 'admin' && (
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                           <button onClick={() => banUser(c.user)} className="bg-red-500/20 p-2 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all text-[8px] font-black uppercase">BANLA</button>
                           <button onClick={() => deleteComment(c.id)} className="bg-white/10 p-2 rounded-lg text-white hover:bg-red-500 transition-all text-xs font-black">✕</button>
                        </div>
                      )}
                   </div>
                 ))}
               </div>
            </div>
            <div className="space-y-8">
               <div className="bg-cyan-500/5 border border-cyan-500/20 p-10 rounded-[3rem] glass">
                  <h3 className="text-xl font-black italic text-white mb-6 uppercase tracking-widest">TOPLULUK KURALLARI</h3>
                  <ul className="space-y-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
                     <li className="flex gap-3"><span className="text-cyan-500">▶</span> Manipülasyon yapmak yasaktır.</li>
                     <li className="flex gap-3"><span className="text-cyan-500">▶</span> Saygılı analiz paylaşımı şarttır.</li>
                     <li className="flex gap-3"><span className="text-cyan-500">▶</span> Reklam içerikleri anında banlanır.</li>
                  </ul>
               </div>
            </div>
          </div>
        ) : activeTab === 'all' || activeTab === 'altcoins' ? (
          <div className="bg-white/[0.01] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl glass animate-in fade-in duration-700">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-500 uppercase tracking-widest font-black bg-white/[0.05]">
                  <th className="px-10 py-10">Kripto Varlık</th>
                  <th className="px-10 py-10">Fiyat / Hacim (24S)</th>
                  <th className="px-10 py-10">Al/Sat Oranı (%)</th>
                  <th className="px-10 py-10 text-right">Momentum Skoru</th>
                  <th className="px-10 py-10 text-center">Zor AI Stratejisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {list.map((t) => (
                   <TickerRow 
                     key={t.symbol} 
                     t={t} 
                     alerts={alerts} 
                     onSelect={setSelectedCoin} 
                   />
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'haberler' ? (
          <div className="space-y-12 animate-in fade-in duration-1000">
             {/* News Ticker Component */}
             <div className="bg-white/5 border border-white/10 rounded-[2rem] p-4 flex items-center gap-6 glass shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="px-6 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl animate-pulse whitespace-nowrap z-10">CANLI HABER</div>
                <div className="flex-1 overflow-hidden">
                   <div className="flex gap-20 whitespace-nowrap animate-ticker">
                      {news.map(n => (
                        <span key={n.id} className="text-[11px] font-black italic tracking-tighter text-gray-300 uppercase">
                          {n.sentiment === 'BULLISH' ? '🚀' : n.sentiment === 'BEARISH' ? '🚨' : '⚡'} {n.title}...
                        </span>
                      ))}
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {news.map(item => (
                   <div key={item.id} onClick={() => setSelectedNews(item)} className="bg-white/5 p-10 rounded-[3.5rem] border border-white/10 hover:border-cyan-500/50 hover:bg-white/[0.12] transition-all group glass cursor-pointer relative overflow-hidden flex flex-col h-[480px]">
                      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-cyan-500/5 blur-[80px] group-hover:bg-cyan-500/15 transition-all duration-700" />
                      
                      <div className="flex justify-between items-start mb-8 relative z-10">
                         <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20 self-start">{item.source} ANALİZ</span>
                            <div className="flex items-center gap-2 px-1">
                               <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${item.sentiment === 'BULLISH' ? 'bg-green-400' : item.sentiment === 'BEARISH' ? 'bg-red-500' : 'bg-cyan-400'}`} />
                               <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{item.sentiment}</span>
                            </div>
                         </div>
                         <span className="text-[14px] font-black text-white/10 group-hover:text-cyan-500/30 transition-colors italic tracking-widest">#{item.id < 10 ? `0${item.id}` : item.id}</span>
                      </div>

                      <h3 className="text-3xl font-black group-hover:text-white text-gray-200 transition-colors leading-[1.1] italic mb-8 flex-1">"{item.title}"</h3>
                      
                      <div className="space-y-6 relative z-10 mt-auto">
                         <div className="p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 backdrop-blur-sm relative group/inner">
                            <p className="text-[12px] font-bold text-gray-400 line-clamp-3 italic mb-4">"{item.summary}"</p>
                            <div className="flex justify-between items-center">
                               <button className="text-[9px] font-black text-cyan-400 underline underline-offset-4 decoration-cyan-500/30 hover:text-white transition-all uppercase tracking-widest animate-pulse">DEVAMINI OKU</button>
                               <span className="text-[9px] font-black text-gray-700 uppercase">{item.impact} ETKİ</span>
                            </div>
                         </div>
                         <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-600 tracking-widest opacity-80 pt-4 border-t border-white/5">
                            <span className="group-hover:text-cyan-400 transition-colors uppercase italic">{item.sourceName}</span>
                            <span>{item.time} ÖNCE</span>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        ) : activeTab === 'admin' ? (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 text-center">
             <div className="bg-white/5 p-12 rounded-[4rem] border border-white/10 glass shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                <h2 className="text-5xl font-black italic text-cyan-400 uppercase tracking-[0.3em] mb-12">Yönetici Paneli</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="bg-white/5 p-10 rounded-[2.5rem] text-left">
                      <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-6">Kara Liste (Ban)</h3>
                      <div className="space-y-4">
                         {bannedUsers.map(b => (
                            <div key={b} className="flex justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-2xl font-black text-red-500 text-sm italic">{b} <span>BLOKLANDI</span></div>
                         ))}
                         <div className="flex gap-4">
                            <input type="text" id="banInput2" placeholder="Hedef Kullanıcı..." className="flex-1 bg-white/5 p-4 rounded-xl text-sm border border-white/5 outline-none focus:border-red-500/50" />
                            <button onClick={() => { const inp = document.getElementById('banInput2'); if(inp.value) banUser(inp.value); inp.value=''; }} className="bg-red-500 px-8 rounded-xl font-black text-white text-[10px] uppercase shadow-2xl">BANLA</button>
                         </div>
                      </div>
                   </div>
                   <div className="bg-white/5 p-10 rounded-[2.5rem] flex flex-col justify-center space-y-4 text-left">
                      <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-4">Sistem Sağlığı</h3>
                      <div className="flex justify-between font-black text-xs uppercase opacity-70"><span>Sunucu Gecikmesi:</span> <span className="text-cyan-400">14ms</span></div>
                      <div className="flex justify-between font-black text-xs uppercase opacity-70"><span>Canlı Veri Havuzu:</span> <span className="text-cyan-400">Aktif</span></div>
                      <div className="flex justify-between font-black text-xs uppercase opacity-70"><span>Güvenlik Katmanı:</span> <span className="text-green-400">Maksimum</span></div>
                   </div>
                </div>
             </div>
          </div>
        ) : null}
      </main>

      <footer className="py-20 text-center opacity-10 text-[10px] uppercase font-black tracking-[1.2em] mt-20 border-t border-white/5">ZOREKS.COM | POWERED BY ZOR AI HIGH-FREQ ANALYTICS</footer>

      {/* Toast Notification Container */}
      <div className="fixed bottom-10 right-10 z-[300] space-y-4 max-w-sm w-full">
         {toasts.map(t => (
           <div key={t.id} className={`p-6 rounded-[2rem] glass border shadow-2xl animate-in slide-in-from-right-10 duration-500 flex items-center gap-4 ${t.type === 'warning' ? 'border-red-500/30' : 'border-cyan-500/30'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${t.type === 'warning' ? 'bg-red-500 text-white' : 'bg-cyan-500 text-white'}`}>
                 {t.type === 'warning' ? '!' : 'i'}
              </div>
              <p className="text-sm font-bold text-white italic tracking-tighter leading-tight">{t.message}</p>
           </div>
         ))}
      </div>
    </div>
  );
}
