/**
 * AstroHarmony - Data Module
 * Contains all constants, presets, and reference data
 */

// ========== ZODIAC SIGNS ==========
export const SIGNS = ["Koç","Boğa","İkizler","Yengeç","Aslan","Başak","Terazi","Akrep","Yay","Oğlak","Kova","Balık"];

export const SIGN_SYM = {
  "Koç":"♈","Boğa":"♉","İkizler":"♊","Yengeç":"♋","Aslan":"♌","Başak":"♍",
  "Terazi":"♎","Akrep":"♏","Yay":"♐","Oğlak":"♑","Kova":"♒","Balık":"♓"
};

// ========== PLANETARY RULERS ==========
export const RULERS = ["Mars","Venüs","Merkür","Ay","Güneş","Chiron","Venüs","Plüton","Jüpiter","Satürn","Uranüs","Neptün"];

export const RULER_SYM = {
  "Chiron":"⚷","Merkür":"☿️","Venüs":"♀️","Mars":"♂️","Jüpiter":"♃",
  "Satürn":"♄","Uranüs":"♅","Neptün":"♆","Plüton":"♇","Ay":"☽","Güneş":"☉"
};

// ========== PLANETS ==========
export const PLANETS = [
  {key:'sun',name:'Güneş',sym:'☉'},{key:'moon',name:'Ay',sym:'☽'},
  {key:'mercury',name:'Merkür',sym:'☿️'},{key:'venus',name:'Venüs',sym:'♀️'},
  {key:'mars',name:'Mars',sym:'♂️'},{key:'jupiter',name:'Jüpiter',sym:'♃'},
  {key:'saturn',name:'Satürn',sym:'♄'},{key:'uranus',name:'Uranüs',sym:'♅'},
  {key:'neptune',name:'Neptün',sym:'♆'},{key:'pluto',name:'Plüton',sym:'♇'},
  {key:'chiron',name:'Chiron',sym:'⚷'},{key:'fortune',name:'Şans Noktası',sym:'⊕'},
  {key:'north',name:'KAD',sym:'☊'},{key:'south',name:'GAD',sym:'☋'}
];

// ========== MONTHS (Turkish) ==========
export const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

// ========== ELEMENTS ==========
export const ELEMENT_CYCLE = {
  fire: [0, 4, 8],    // Koç, Aslan, Yay
  earth: [1, 5, 9],   // Boğa, Başak, Oğlak
  air: [2, 6, 10],    // İkizler, Terazi, Kova
  water: [3, 7, 11]   // Yengeç, Akrep, Balık
};

// ========== DEGREE CONSTANTS ==========
export const DEG_IN_MIN = 60;
export const SIGN_IN_MIN = 30 * DEG_IN_MIN;

// ========== TIMEZONE DATA ==========
// Format: {tz: [standardOffset, dstOffset, dstStartMonth, dstEndMonth]}
export const TZ_DATA = {
  "Europe/Istanbul": [3, 3, 0, 0], // Türkiye artık DST yok (2016'dan beri sabit UTC+3)
  "Europe/Berlin": [1, 2, 3, 10],
  "Europe/Vienna": [1, 2, 3, 10],
  "Europe/London": [0, 1, 3, 10],
  "Europe/Paris": [1, 2, 3, 10],
  "Europe/Amsterdam": [1, 2, 3, 10],
  "Europe/Zurich": [1, 2, 3, 10],
  "America/New_York": [-5, -4, 3, 11],
  "America/Chicago": [-6, -5, 3, 11],
  "America/Los_Angeles": [-8, -7, 3, 11],
  "Europe/Bucharest": [2, 3, 3, 10], // Doğu Avrupa (Bulgaristan, Romanya vs)
  "Europe/Moscow": [3, 3, 0, 0] // Moskova (Standart ve Yaz saati aynı)
};

// ========== COUNTRY & CITY DATABASE ==========
export const COUNTRIES = {
  TR: {name: "Türkiye", tz: "Europe/Istanbul", cities: {
    // 81 İl (tüm iller)
    "Adana": {lat:37.0000,lng:35.3213}, "Adıyaman": {lat:37.7648,lng:38.2786}, "Afyonkarahisar": {lat:38.7507,lng:30.5567},
    "Ağrı": {lat:39.7191,lng:43.0503}, "Aksaray": {lat:38.3687,lng:34.0370}, "Amasya": {lat:40.6499,lng:35.8353},
    "Ankara": {lat:39.9334,lng:32.8597}, "Antalya": {lat:36.8969,lng:30.7133}, "Ardahan": {lat:41.1105,lng:42.7022},
    "Artvin": {lat:41.1828,lng:41.8183}, "Aydın": {lat:37.8560,lng:27.8416}, "Balıkesir": {lat:39.6484,lng:27.8826},
    "Bartın": {lat:41.6344,lng:32.3375}, "Batman": {lat:37.8812,lng:41.1351}, "Bayburt": {lat:40.2552,lng:40.2249},
    "Bilecik": {lat:40.0567,lng:30.0665}, "Bingöl": {lat:38.8854,lng:40.4966}, "Bitlis": {lat:38.4006,lng:42.1095},
    "Bolu": {lat:40.7358,lng:31.6061}, "Burdur": {lat:37.7203,lng:30.2906}, "Bursa": {lat:40.1885,lng:29.0610},
    "Çanakkale": {lat:40.1553,lng:26.4142}, "Çankırı": {lat:40.6013,lng:33.6134}, "Çorum": {lat:40.5506,lng:34.9556},
    "Denizli": {lat:37.7765,lng:29.0864}, "Diyarbakır": {lat:37.9144,lng:40.2306}, "Düzce": {lat:40.8438,lng:31.1565},
    "Edirne": {lat:41.6818,lng:26.5623}, "Elazığ": {lat:38.6810,lng:39.2264}, "Erzincan": {lat:39.7500,lng:39.5000},
    "Erzurum": {lat:39.9043,lng:41.2679}, "Eskişehir": {lat:39.7767,lng:30.5206}, "Gaziantep": {lat:37.0662,lng:37.3833},
    "Giresun": {lat:40.9128,lng:38.3895}, "Gümüşhane": {lat:40.4386,lng:39.5086}, "Hakkari": {lat:37.5833,lng:43.7333},
    "Hatay": {lat:36.4018,lng:36.3498}, "Iğdır": {lat:39.9167,lng:44.0333}, "Isparta": {lat:37.7648,lng:30.5566},
    "İstanbul": {lat:41.0082,lng:28.9784}, "İzmir": {lat:38.4192,lng:27.1287}, "Kahramanmaraş": {lat:37.5858,lng:36.9371},
    "Karabük": {lat:41.2061,lng:32.6204}, "Karaman": {lat:37.1759,lng:33.2287}, "Kars": {lat:40.6167,lng:43.1000},
    "Kastamonu": {lat:41.3887,lng:33.7827}, "Kayseri": {lat:38.7312,lng:35.4787}, "Kırıkkale": {lat:39.8468,lng:33.5153},
    "Kırklareli": {lat:41.7333,lng:27.2167}, "Kırşehir": {lat:39.1425,lng:34.1709}, "Kilis": {lat:36.7184,lng:37.1212},
    "Kocaeli": {lat:40.8533,lng:29.8815}, "Konya": {lat:37.8746,lng:32.4932}, "Kütahya": {lat:39.4167,lng:29.9833},
    "Malatya": {lat:38.3552,lng:38.3095}, "Manisa": {lat:38.6191,lng:27.4289}, "Mardin": {lat:37.3212,lng:40.7245},
    "Mersin": {lat:36.8121,lng:34.6415}, "Muğla": {lat:37.2153,lng:28.3636}, "Muş": {lat:38.9462,lng:41.7539},
    "Nevşehir": {lat:38.6939,lng:34.6857}, "Niğde": {lat:37.9667,lng:34.6833}, "Ordu": {lat:40.9839,lng:37.8764},
    "Osmaniye": {lat:37.0742,lng:36.2478}, "Rize": {lat:41.0201,lng:40.5234}, "Sakarya": {lat:40.6940,lng:30.4358},
    "Samsun": {lat:41.2928,lng:36.3313}, "Siirt": {lat:37.9333,lng:41.9500}, "Sinop": {lat:42.0231,lng:35.1531},
    "Sivas": {lat:39.7477,lng:37.0179}, "Şanlıurfa": {lat:37.1674,lng:38.7955}, "Şırnak": {lat:37.5164,lng:42.4611},
    "Tekirdağ": {lat:40.9833,lng:27.5167}, "Tokat": {lat:40.3167,lng:36.5500}, "Trabzon": {lat:41.0027,lng:39.7168},
    "Tunceli": {lat:39.1079,lng:39.5401}, "Uşak": {lat:38.6823,lng:29.4082}, "Van": {lat:38.4891,lng:43.4089},
    "Yalova": {lat:40.6500,lng:29.2667}, "Yozgat": {lat:39.8181,lng:34.8147}, "Zonguldak": {lat:41.4564,lng:31.7987}
  }},
  DE: {name: "Almanya", tz: "Europe/Berlin", cities: {
    "Berlin": {lat:52.5200,lng:13.4050}, "Hamburg": {lat:53.5511,lng:9.9937}, "München": {lat:48.1351,lng:11.5820},
    "Köln": {lat:50.9375,lng:6.9603}, "Frankfurt": {lat:50.1109,lng:8.6821}, "Stuttgart": {lat:48.7758,lng:9.1829},
    "Düsseldorf": {lat:51.2277,lng:6.7735}, "Dortmund": {lat:51.5136,lng:7.4653}, "Essen": {lat:51.4556,lng:7.0116},
    "Bremen": {lat:53.0793,lng:8.8017}, "Dresden": {lat:51.0504,lng:13.7373}, "Leipzig": {lat:51.3397,lng:12.3731},
    "Hannover": {lat:52.3759,lng:9.7320}, "Nürnberg": {lat:49.4521,lng:11.0767}, "Duisburg": {lat:51.4344,lng:6.7623},
    "Bochum": {lat:51.4818,lng:7.2162}, "Wuppertal": {lat:51.2562,lng:7.1508}, "Bielefeld": {lat:52.0302,lng:8.5325},
    "Bonn": {lat:50.7374,lng:7.0982}, "Münster": {lat:51.9607,lng:7.6261}, "Mannheim": {lat:49.4875,lng:8.4660},
    "Karlsruhe": {lat:49.0069,lng:8.4037}, "Augsburg": {lat:48.3705,lng:10.8978}, "Wiesbaden": {lat:50.0782,lng:8.2398}
  }},
  AT: {name: "Avusturya", tz: "Europe/Vienna", cities: {
    "Wien": {lat:48.2082,lng:16.3738}, "Graz": {lat:47.0707,lng:15.4395}, "Linz": {lat:48.3069,lng:14.2858},
    "Salzburg": {lat:47.8095,lng:13.0550}, "Innsbruck": {lat:47.2692,lng:11.4041}, "Klagenfurt": {lat:46.6228,lng:14.3051},
    "Villach": {lat:46.6111,lng:13.8558}, "Wels": {lat:48.1575,lng:14.0289}, "St.Pölten": {lat:48.2047,lng:15.6256},
    "Dornbirn": {lat:47.4125,lng:9.7417}
  }},
  US: {name: "ABD", tz: "America/New_York", cities: {
    "New York": {lat:40.7128,lng:-74.0060,tz:"America/New_York"}, "Los Angeles": {lat:34.0522,lng:-118.2437,tz:"America/Los_Angeles"},
    "Chicago": {lat:41.8781,lng:-87.6298,tz:"America/Chicago"}, "Houston": {lat:29.7604,lng:-95.3698,tz:"America/Chicago"},
    "Miami": {lat:25.7617,lng:-80.1918,tz:"America/New_York"}, "San Francisco": {lat:37.7749,lng:-122.4194,tz:"America/Los_Angeles"},
    "Phoenix": {lat:33.4484,lng:-112.0740,tz:"America/Phoenix"}, "Philadelphia": {lat:39.9526,lng:-75.1652,tz:"America/New_York"},
    "San Antonio": {lat:29.4241,lng:-98.4936,tz:"America/Chicago"}, "San Diego": {lat:32.7157,lng:-117.1611,tz:"America/Los_Angeles"},
    "Dallas": {lat:32.7767,lng:-96.7970,tz:"America/Chicago"}, "Austin": {lat:30.2672,lng:-97.7431,tz:"America/Chicago"},
    "Jacksonville": {lat:30.3322,lng:-81.6557,tz:"America/New_York"}, "San Jose": {lat:37.3382,lng:-121.8863,tz:"America/Los_Angeles"},
    "Fort Worth": {lat:32.7555,lng:-97.3308,tz:"America/Chicago"}, "Columbus": {lat:39.9612,lng:-82.9988,tz:"America/New_York"},
    "Charlotte": {lat:35.2271,lng:-80.8431,tz:"America/New_York"}, "Indianapolis": {lat:39.7684,lng:-86.1581,tz:"America/Indiana/Indianapolis"},
    "Seattle": {lat:47.6062,lng:-122.3321,tz:"America/Los_Angeles"}, "Denver": {lat:39.7392,lng:-104.9903,tz:"America/Denver"},
    "Boston": {lat:42.3601,lng:-71.0589,tz:"America/New_York"}, "Atlanta": {lat:33.7490,lng:-84.3880,tz:"America/New_York"},
    "Las Vegas": {lat:36.1699,lng:-115.1398,tz:"America/Los_Angeles"}, "Portland": {lat:45.5051,lng:-122.6750,tz:"America/Los_Angeles"},
    "Detroit": {lat:42.3314,lng:-83.0458,tz:"America/Detroit"}, "Nashville": {lat:36.1627,lng:-86.7816,tz:"America/Chicago"},
    "Baltimore": {lat:39.2904,lng:-76.6122,tz:"America/New_York"}, "Oklahoma City": {lat:35.4676,lng:-97.5164,tz:"America/Chicago"}
  }},
  GB: {name: "İngiltere", tz: "Europe/London", cities: {
    "London": {lat:51.5074,lng:-0.1278}, "Manchester": {lat:53.4808,lng:-2.2426}, "Birmingham": {lat:52.4862,lng:-1.8904},
    "Liverpool": {lat:53.4084,lng:-2.9916}, "Bristol": {lat:51.4545,lng:-2.5879}, "Leeds": {lat:53.8008,lng:-1.5491},
    "Glasgow": {lat:55.8642,lng:-4.2518}, "Edinburgh": {lat:55.9533,lng:-3.1883}, "Sheffield": {lat:53.3811,lng:-1.4701}
  }},
  FR: {name: "Fransa", tz: "Europe/Paris", cities: {
    "Paris": {lat:48.8566,lng:2.3522}, "Lyon": {lat:45.7640,lng:4.8357}, "Marseille": {lat:43.2965,lng:5.3698},
    "Toulouse": {lat:43.6047,lng:1.4442}, "Nice": {lat:43.7102,lng:7.2620}, "Nantes": {lat:47.2184,lng:-1.5536},
    "Strasbourg": {lat:48.5734,lng:7.7521}, "Bordeaux": {lat:44.8378,lng:-0.5792}, "Lille": {lat:50.6292,lng:3.0573}
  }},
  NL: {name: "Hollanda", tz: "Europe/Amsterdam", cities: {
    "Amsterdam": {lat:52.3676,lng:4.9041}, "Rotterdam": {lat:51.9244,lng:4.4777}, "Den Haag": {lat:52.0705,lng:4.3007},
    "Utrecht": {lat:52.0907,lng:5.1214}, "Eindhoven": {lat:51.4416,lng:5.4697}
  }},
  CH: {name: "İsviçre", tz: "Europe/Zurich", cities: {
    "Zürich": {lat:47.3769,lng:8.5417}, "Genève": {lat:46.2044,lng:6.1432}, "Basel": {lat:47.5596,lng:7.5886},
    "Bern": {lat:46.9480,lng:7.4474}, "Lausanne": {lat:46.5197,lng:6.6323}
  }},
  BG: {name: "Bulgaristan", tz: "Europe/Bucharest", cities: {
    "Sofya": {lat:42.6977,lng:23.3219}, "Plovdiv": {lat:42.1354,lng:24.7453}, "Varna": {lat:43.2141,lng:27.9147},
    "Burgas": {lat:42.5048,lng:27.4626}, "Ruse": {lat:43.8356,lng:25.9657}, "Stara Zagora": {lat:42.4258,lng:25.6345},
    "Pleven": {lat:43.4170,lng:24.6067}, "Sliven": {lat:42.6816,lng:26.3292}, "Dobriç": {lat:43.5667,lng:27.8333},
    "Şumen": {lat:43.2708,lng:26.9225}, "Pernik": {lat:42.6000,lng:23.0333}, "Hasköy": {lat:41.9344,lng:25.5556},
    "Yambol": {lat:42.4833,lng:26.5000}, "Pazarcık": {lat:42.2000,lng:24.3333}, "Blagoevgrad": {lat:42.0167,lng:23.1000}
  }},
  RO: {name: "Romanya", tz: "Europe/Bucharest", cities: {
    "Bükreş": {lat:44.4268,lng:26.1025}, "Cluj-Napoca": {lat:46.7712,lng:23.6236}, "Temeşvar": {lat:45.7489,lng:21.2087},
    "Yaş": {lat:47.1585,lng:27.6014}, "Köstence": {lat:44.1792,lng:28.6121}, "Craiova": {lat:44.3302,lng:23.7949},
    "Brașov": {lat:45.6427,lng:25.5887}, "Galați": {lat:45.4353,lng:28.0080}, "Ploiești": {lat:44.9500,lng:26.0167},
    "Oradea": {lat:47.0722,lng:21.9211}, "Brăila": {lat:45.2692,lng:27.9575}, "Arad": {lat:46.1667,lng:21.3167},
    "Piteşti": {lat:44.8565,lng:24.8692}, "Sibiu": {lat:45.7983,lng:24.1256}, "Bacău": {lat:46.5670,lng:26.9146},
    "Târgu Mureș": {lat:46.5456,lng:24.5625}, "Baia Mare": {lat:47.6567,lng:23.5850}, "Buzău": {lat:45.1500,lng:26.8333},
    "Botoșani": {lat:47.7486,lng:26.6694}, "Satu Mare": {lat:47.7925,lng:22.8858}
  }},
  RU: {name: "Rusya", tz: "Europe/Moscow", cities: {
    "Moskova": {lat:55.7558,lng:37.6173}, "Saint Petersburg": {lat:59.9343,lng:30.3351}, "Kazan": {lat:55.7961,lng:49.1064},
    "Soçi": {lat:43.6028,lng:39.7342}, "Krasnodar": {lat:45.0355,lng:38.9753}, "Novosibirsk": {lat:55.0084,lng:82.9357},
    "Yekaterinburg": {lat:56.8389,lng:60.6057}, "Nizhny Novgorod": {lat:56.2965,lng:43.9361}, "Samara": {lat:53.1959,lng:50.1002},
    "Omsk": {lat:54.9885,lng:73.3242}, "Rostov-na-Donu": {lat:47.2357,lng:39.7015}, "Ufa": {lat:54.7388,lng:55.9721},
    "Krasnoyarsk": {lat:56.0153,lng:92.8932}, "Voronej": {lat:51.6720,lng:39.1843}, "Perm": {lat:58.0105,lng:56.2502},
    "Volgograd": {lat:48.7080,lng:44.5133}, "Saratov": {lat:51.5330,lng:46.0344}, "Tyumen": {lat:57.1522,lng:65.5272},
    "Tolyatti": {lat:53.5078,lng:49.4204}, "Barnaul": {lat:53.3548,lng:83.7698}, "İrkutsk": {lat:52.2978,lng:104.2964},
    "Ulyanovsk": {lat:54.3282,lng:48.3866}, "Vladivostok": {lat:43.1332,lng:131.9113}, "Yaroslavl": {lat:57.6261,lng:39.8845},
    "Mahachkala": {lat:42.9849,lng:47.5047}
  }}
};

// ========== PRESETS ==========
// Birth data presets for testing
export const PRESETS = {
  D: {
    day: 1, month: 1, year: 1990, hour: 12, minute: 0,
    lat: 41.0082, lng: 28.9784, city: 'İstanbul'
  },
  S: {
    day: 6, month: 8, year: 1998, hour: 14, minute: 37,
    lat: 36.8969, lng: 30.7133, city: 'Antalya'
  },
  K: {
    day: 6, month: 10, year: 1994, hour: 5, minute: 21,
    lat: 41.0082, lng: 28.9784, city: 'İstanbul'
  }
};

// ========== ASPECT COLORS ==========
export const ASPECT_COLORS = {
  kavuşum: '#f59e0b',
  karşıt: '#ef4444',
  üçgen: '#22c55e',
  kare: '#ef4444',
  altmışlık: '#22c55e',
  yüzelllik: '#a855f7'
};
