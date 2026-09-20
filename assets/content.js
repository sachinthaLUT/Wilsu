/* =====================================================================
   WILSU – SISÄLTÖ (V3)
   ---------------------------------------------------------------------
   0) SETTINGS: logo, hero, membership form, fees, statistics.
   1) SHEETS: the "Publish to web" CSV link of each Google Sheet tab.
      When a link is set, the site reads that tab. When it's empty, or
      Google can't be reached, the site uses the backup content below.
   2) VENUES and LINKS: rarely change, so they live here.
   3) DEFAULT_CONTENT: backup content, shown if the sheet can't be read.
   English: fixed page text is translated in assets/i18n.js. Sheet content
   uses the "... EN" columns in the sheet (filled automatically by Google).
   ===================================================================== */

const SETTINGS = {
  /* Club logo: file in the assets folder, or a Google Drive share link. */
  logo: "assets/WilsuLogo.png",

  /* Top of the homepage:
     "animation" = the 3D badminton rally (current live version)
     "video"     = club video (set heroVideo below), falls back to a photo slideshow
     "slideshow" = slow slideshow of the gallery's homepage photos */
  hero: "animation",
  heroVideo: "",          /* e.g. "assets/hero.mp4" – Google Drive links don't work for video */
  heroVideoMobile: "",    /* optional smaller video for phones */
  heroPoster: "",         /* optional still image while the video loads */

  /* Google Form for membership applications. Must be a docs.google.com/forms/... or forms.gle link.
     The Asetukset tab in the sheet can override this. */
  membershipForm: "https://docs.google.com/forms/d/e/1FAIpQLSe3ePvZzamMiYmugdKnKO0xKxEKWSN6XosHkx95OkhnOrtOFg/viewform?usp=publish-editor",

  /* Membership fees shown on the homepage */
  priceNormal:  "200 €",
  priceForever: "50 €",

  /* Visitor statistics: a GoatCounter site code only (letters, numbers, hyphen), e.g. "saw". Empty = off. */
  statsCode: "wilsu",

  /* Extra hostnames allowed to serve images. Photos should live in Google Drive; only add a host
     you trust, because anything listed here can load images (and see visitors' addresses). */
  allowedImageHosts: []
};

/* Sheet links must be "Publish to web" CSV links on docs.google.com (/spreadsheets/d/e/...).
   Anything else is ignored and the backup content below is used. */
const SHEETS = {
  schedule:      "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-uY64otrGleyElNLoT-_lxYS3kTRIBmaKkqVaQKrMQBR_cPm7FVqRFG3NRb_2RENqufbqNdq5Kvxc/pub?gid=1561646268&single=true&output=csv",   // Vuorot
  cancellations: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-uY64otrGleyElNLoT-_lxYS3kTRIBmaKkqVaQKrMQBR_cPm7FVqRFG3NRb_2RENqufbqNdq5Kvxc/pub?gid=1308069276&single=true&output=csv",   // Peruutukset
  news:          "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-uY64otrGleyElNLoT-_lxYS3kTRIBmaKkqVaQKrMQBR_cPm7FVqRFG3NRb_2RENqufbqNdq5Kvxc/pub?gid=1010366994&single=true&output=csv",   // Uutiset
  events:        "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-uY64otrGleyElNLoT-_lxYS3kTRIBmaKkqVaQKrMQBR_cPm7FVqRFG3NRb_2RENqufbqNdq5Kvxc/pub?gid=1366506154&single=true&output=csv",   // Tapahtumat
  gallery:       "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-uY64otrGleyElNLoT-_lxYS3kTRIBmaKkqVaQKrMQBR_cPm7FVqRFG3NRb_2RENqufbqNdq5Kvxc/pub?gid=1366506154&single=true&output=csv",   // Galleria
  faq:           "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-uY64otrGleyElNLoT-_lxYS3kTRIBmaKkqVaQKrMQBR_cPm7FVqRFG3NRb_2RENqufbqNdq5Kvxc/pub?gid=675361153&single=true&output=csv",   // UKK
  board:         "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-uY64otrGleyElNLoT-_lxYS3kTRIBmaKkqVaQKrMQBR_cPm7FVqRFG3NRb_2RENqufbqNdq5Kvxc/pub?gid=1160483995&single=true&output=csv",   // Hallitus
  sponsors:      "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-uY64otrGleyElNLoT-_lxYS3kTRIBmaKkqVaQKrMQBR_cPm7FVqRFG3NRb_2RENqufbqNdq5Kvxc/pub?gid=1999489781&single=true&output=csv",   // Kumppanit
  settings:      "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-uY64otrGleyElNLoT-_lxYS3kTRIBmaKkqVaQKrMQBR_cPm7FVqRFG3NRb_2RENqufbqNdq5Kvxc/pub?gid=1122069551&single=true&output=csv"    // Asetukset (fees, membership form link)
};

const VENUES = {
  huhtiniemi: {
    name: "Huhtiniemen liikuntakeskus",
    short: "Huhtiniemi, monitoimisali",
    info: "Aikuisten ja kaksinpelin vuorot monitoimisalissa. Kisat ja kinkkukisat pelataan täällä.",
    maps: "Huhtiniemen liikuntakeskus, Lappeenranta",
    en: { name: "Huhtiniemi Sports Centre", short: "Huhtiniemi, multi-purpose hall", info: "Adult and singles sessions in the multi-purpose hall. Club tournaments are played here." }
  },
  urheilutalo: {
    name: "Lappeenrannan urheilutalo",
    short: "Urheilutalo",
    info: "Junioreiden vuorot. Sisään valmentajan kanssa tai uimahallin kautta.",
    maps: "Lappeenrannan urheilutalo, Lappeenranta",
    en: { name: "Lappeenranta Sports Hall (Urheilutalo)", short: "Urheilutalo", info: "Junior sessions. Enter with the coach or through the swimming hall." }
  }
};

const DEFAULT_CONTENT = {
  schedule: [
    { id:"Ma 17.30 Juniorit",  day:1, start:"17:30", end:"19:00", group:"juniorit", title:"Harrastejunnut", venue:"urheilutalo", from:"2026-08-31", en:{ title:"Junior training" } },
    { id:"Ke 16.30 Juniorit",  day:3, start:"16:30", end:"17:45", group:"juniorit", title:"Harrastejunnut, lisämaksu", venue:"urheilutalo", tba:true, en:{ title:"Junior training, extra fee" } },
    { id:"Ti 17.00 Aikuiset",  day:2, start:"17:00", end:"18:30", group:"aikuiset", title:"Aikuisten vuoro", venue:"huhtiniemi", from:"2026-09-01", en:{ title:"Adult session" } },
    { id:"To 16.30 Kaksinpeli",day:4, start:"16:30", end:"18:00", group:"kilpa",    title:"Kaksinpeli, aikuiset ja kilpajunnut", venue:"huhtiniemi", from:"2026-09-01", en:{ title:"Singles, adults and competitive juniors" } },
    { id:"To 18.00 Aikuiset",  day:4, start:"18:00", end:"19:30", group:"aikuiset", title:"Aikuisten vuoro", venue:"huhtiniemi", from:"2026-09-01", en:{ title:"Adult session" } },
    { id:"La 10.30 Kaksinpeli",day:6, start:"10:30", end:"12:00", group:"kilpa",    title:"Kaksinpeli, aikuiset ja kilpajunnut", venue:"huhtiniemi", from:"2026-09-01", en:{ title:"Singles, adults and competitive juniors" } },
    { id:"Su 16.30 Aikuiset",  day:0, start:"16:30", end:"18:00", group:"aikuiset", title:"Aikuisten vuoro", venue:"huhtiniemi", from:"2026-09-01", en:{ title:"Adult session" } }
  ],

  cancellations: [],

  news: [
    { date:"2026-05-03", cat:"Kilpailut", title:"Silja Soikkelille luokkamestaruus",
      summary:"Naisten nelinpelin A-luokan mestaruus Lilli Laurin kanssa. Kaikki ottelut päättyivät 2–0.",
      body:"Silja Soikkeli voitti naisten nelinpelin A-luokan luokkamestaruuden parinaan Lilli Lauri Puistolan Urheilijoista.\n\nPari ei hävinnyt kisassa yhtään erää. Finaalissa kaatuivat Veera Lindell (BarBa) ja Nova Nyqvist (HBC) lukemin 21–6, 21–16.",
      image:"" },
    { date:"2026-04-20", cat:"Seuraelämä", title:"Kausi huipentuu sulanrepijäisiin",
      summary:"Aikuisten pelit ja ilta LUTin rantasaunalla, junnuille omat kisat ja iltapala.",
      body:"Aikuisten sulanrepijäiset vietetään lauantaina 16.5. LUTin rantasaunalla. Sulanrepijäispelit pelataan perjantaina 15.5.\n\nJunioreiden kausi päättyy maanantaina 18.5. pieniin kisoihin ja yhteiseen ruokailuun. Vuoro alkaa normaalisti klo 17.30 ja päättyy noin klo 20. Jos et osallistu ruokailuun, voit lähteä kotiin pelien jälkeen klo 19.",
      image:"", caption:"" },
    { date:"2026-03-17", cat:"Ranking", title:"Silja nousi Suomen top 8:aan",
      summary:"Naisten kaksinpelin rankinglistalla sijoitus on nyt kahdeksas.",
      body:"Silja Soikkeli nousi sijalle 8 Suomen naisten kaksinpelin rankinglistalla. Rankingit löytyvät Sulkapalloliiton kisapalvelusta: https://badmintonfinland.tournamentsoftware.com",
      image:"" },
    { date:"2026-02-15", cat:"Kilpailut", title:"SM-kisoista sijat 5–8",
      summary:"Silja kaatoi Unni Parikan kolmessa erässä ennen puolivälierää.",
      body:"Wilsun Silja Soikkeli sijoittui SM-kisoissa sijoille 5–8. Silja voitti Unni Parikan (ESB) 2–1 (15–21, 21–19, 21–16).\n\nPuolivälierässä kisan kakkossijoitettu Petra Saarnivaara (TS) oli vahvempi 2–0 (21–14, 21–11).",
      image:"" },
    { date:"2026-01-13", cat:"Juniorit", title:"Junnuvuorot jatkuvat Urheilutalolla",
      summary:"Maanantain ohjatut treenit klo 17.30–19.00. Uudet pelaajat ovat tervetulleita.",
      body:"Junioreiden vuorot jatkuvat Urheilutalolla maanantaisin 13.1.2026 alkaen klo 17.30–19.00.",
      image:"", caption:"" },
    { date:"2025-11-22", cat:"Kilpailut", title:"Wilsu voitti Qvick-cupin Kouvolassa",
      summary:"Joukkuekisan pisteet: Wilsu 26, Kouvola 23 ja Hamsu 5.",
      body:"Wilsu voitti Qvick-cup-joukkuekisan Kouvolassa. Mukana olivat järjestävä seura KouSS ja Hamsu, ja jokaisella joukkueella oli neljä paria.\n\nParit pelasivat rankingin mukaisen ottelunsa ja lisäksi toisen pelin. Jokaisesta voitetusta erästä tuli joukkueelle piste.\n\nJoukkueessa pelasivat Silja Soikkeli ja Mikko Nikunen, Tommi Penttilä ja Ville Huuhtanen, Kulanaka Rajapaksha ja Teppo Ryhänen sekä Tuomas Kumpula ja Tommi Saukkonen.",
      image:"" },
    { date:"2025-03-09", cat:"Kilpailut", title:"Kaksi ikäsarjojen SM-kultaa",
      summary:"Markus Saukkonen voitti mestaruudet MN65- ja SN65-sarjoissa Vantaalla.",
      body:"Ikähenkilöiden SM-kisoissa Vantaalla Wilsun Markus Saukkonen voitti kaksi mestaruutta: MN65-sarjassa Ilkka Salosen (HämSu) ja SN65-sarjassa Sirpa Korkiakosken (SaSuPa) kanssa.\n\nSemifinaaleihin ylsivät myös Ritva Turkia, Paavo Kokkola ja Mikko Nikunen.",
      image:"" }
  ],

  events: [
    { date:"2026-11-14", title:"Qvick-cup joukkueturnaus", place:"Päivä ja paikka vahvistetaan",
      desc:"Neljän parin joukkuekisa kaakkoisen kulman seuroja vastaan. Joukkueeseen tarvitaan vähintään kahdeksan pelaajaa.",
      linkText:"Ilmoittaudu", link:"mailto:puheenjohtaja@wilsu.fi?subject=Qvick-cup" },
    { date:"2026-12-12", title:"Kinkkukisat ja pikkujoulut", place:"Huhtiniemi",
      desc:"Perinteiset tasoitukselliset kisat, illalla aikuisten pikkujoulut.", linkText:"", link:"" },
    { date:"2025-12-13", title:"Aluemestaruuskisat", place:"Kouvola",
      desc:"Aikuisten ja junioreiden aluemestaruudet.", result:"", resultsLink:"https://badmintonfinland.tournamentsoftware.com" },
    { date:"2025-11-22", title:"Qvick-cup joukkueturnaus", place:"Kouvola",
      desc:"", result:"Wilsu voitti, 26 pistettä", resultsLink:"" },
    { date:"2024-12-14", title:"Kinkkukisat", place:"Huhtiniemi",
      desc:"", result:"Kilpasarjan kaksinpelin voitti Teemu Utela", resultsLink:"" },
    { date:"2024-11-02", title:"Qvick-cup joukkueturnaus", place:"Huhtiniemi",
      desc:"", result:"Wilsun I-joukkue voitti", resultsLink:"" }
  ],

  /* Backup gallery: empty on purpose. Photos come from the Galleria tab (Google Drive links). */
  gallery: [],

  /* Backup sponsors, shown if the Kumppanit tab can't be read */
  sponsors: [
    { name:"Intersport Lappeenranta", url:"https://www.intersport.fi/fi/kauppa/lappeenranta/", desc:"Seurakauppa, mailat ja kengät seuran jäsenhintaan.", order:1,
      en:{ desc:"Club shop with rackets and shoes at member prices." } },
    { name:"Liikuntakeskus", url:"https://www.liikuntakeskus.com", desc:"Huhtiniemen liikuntakeskus, seuran pääasiallinen pelipaikka.", order:2,
      en:{ desc:"Huhtiniemi sports centre, the club's main venue." } },
    { name:"Forever", url:"https://www.foreverclub.fi", desc:"Forever-kuntoklubin jäsenille alennettu seuran jäsenmaksu.", order:3,
      en:{ desc:"Forever fitness club members get a reduced club membership fee." } },
    { name:"AS-Huolto", url:"https://as-huolto.fi/korjaus-ja-huolto/", desc:"Seuran pitkäaikainen yhteistyökumppani.", order:4,
      en:{ desc:"A long-standing partner of the club." } }
  ],

  /* Backup settings, overridden by the Asetukset tab */
  settings: [],

  /* Beginner FAQ. The board should check these answers. */
  faq: [
    { topic:"Aloittaminen", q:"Tarvitaanko aiempaa kokemusta?", a:"Ei tarvita. Vuoroilla pelaa kaikentasoisia pelaajia, ja uudet pelaajat ovat aina tervetulleita. Kerro vuoron alussa, että olet uusi.",
      en:{ q:"Do I need previous experience?", a:"No. Players of all levels play in our sessions, and new players are always welcome. Just tell us at the start of the session that you are new." } },
    { topic:"Aloittaminen", q:"Mitä mukaan ensimmäiselle kerralle?", a:"Sisäpelikengät, joiden pohja ei jätä jälkiä, urheiluvaatteet ja juomapullo. Oma maila, jos sellainen on.",
      en:{ q:"What should I bring the first time?", a:"Indoor shoes with non-marking soles, sportswear and a water bottle. Your own racket if you have one." } },
    { topic:"Aloittaminen", q:"Entä jos minulla ei ole mailaa?", a:"Kysy etukäteen sähköpostilla puheenjohtaja@wilsu.fi, niin katsotaan, löytyykö lainamailaa. Mailoja voi hankkia myös Intersportin seurakaupasta.",
      en:{ q:"What if I don't have a racket?", a:"Ask in advance at puheenjohtaja@wilsu.fi and we will see if a loan racket is available. Rackets are also available from the Intersport club shop." } },
    { topic:"Jäsenyys", q:"Paljonko pelaaminen maksaa?", a:"Jäsenmaksu on 200 € vuodessa, Forever-kuntoklubin jäsenille 50 € vuodessa. Jäsenhakemuksen täyttämisen jälkeen rahastonhoitaja lähettää laskun.",
      en:{ q:"How much does it cost to play?", a:"The membership fee is €200 per year, or €50 per year for Forever fitness club members. After you fill in the membership application, the treasurer will send you an invoice." } },
    { topic:"Jäsenyys", q:"Voinko tulla kokeilemaan ennen liittymistä?", a:"Voit. Tule vuorolle ja kerro olevasi uusi. Jäsenhakemuksen voi täyttää myöhemmin.",
      en:{ q:"Can I try it before joining?", a:"Yes. Come to a session and tell us you are new. You can fill in the membership application later." } },
    { topic:"Juniorit", q:"Minkä ikäiset voivat tulla junioreihin?", a:"Harrastejunnujen vuorot ovat kaikenikäisille junioreille. Alle 18-vuotiaan jäsenhakemukseen tarvitaan huoltajan tiedot.",
      en:{ q:"What age can juniors start?", a:"Junior sessions are open to juniors of all ages. Applicants under 18 need a guardian's details on the membership application." } },
    { topic:"Kilpailut", q:"Tarvitsenko lisenssin?", a:"Harjoitusvuoroilla ei. Sulkapalloliiton kilpailuihin osallistuminen vaatii Suomen Sulkapalloliiton lisenssin.",
      en:{ q:"Do I need a licence?", a:"Not for training sessions. Taking part in Badminton Finland tournaments requires a Badminton Finland player licence." } },
    { topic:"Käytännöt", q:"Mistä näen, onko vuoro peruttu?", a:"Peruutukset näkyvät sivun yläreunassa ja harjoitusajoissa heti, kun ne on ilmoitettu. Jäsenet saavat tiedon myös sähköpostiin.",
      en:{ q:"How do I know if a session is cancelled?", a:"Cancellations appear at the top of the website and in the training schedule as soon as they are announced. Members are also informed by email." } }
  ],

  /* Board of directors. Add photos with a Google Drive link in the sheet. */
  board: [
    { name:"Teemu Utela", role:"Puheenjohtaja", email:"puheenjohtaja@wilsu.fi", en:{ role:"Chairman" } },
    { name:"Timo Alho", role:"Rahastonhoitaja", email:"laskutus@wilsu.fi", en:{ role:"Treasurer" } },
    { name:"Silja Soikkeli", role:"Sihteeri", en:{ role:"Secretary" } },
    { name:"Riku Ahola", role:"Hallituksen jäsen", en:{ role:"Board member" } },
    { name:"Tuomas Aarnikoivu", role:"Hallituksen jäsen", en:{ role:"Board member" } },
    { name:"Oscar Akkanen", role:"Hallituksen jäsen", en:{ role:"Board member" } },
    { name:"Mikko Silvennoinen", role:"Hallituksen jäsen", en:{ role:"Board member" } }
  ]
};

/* Archive photos for the history section. Add scanned photos when members send them. */
const ARCHIVE = [
  { image:"https://drive.google.com/file/d/1cLEoWIA7qZbApuHmb1oRG1szN9uCAVE1/view?usp=sharing", caption:"Armilan koulu, 1980-luku" },
  { image:"https://drive.google.com/file/d/1PCILceynd-FNFX7cWDlv60QqbmP8MCJV/view?usp=sharing", caption:"Prisman juniorit" }
];

const LINKS = [
  { name:"Suomen Sulkapalloliitto", url:"https://www.sulkapallo.fi", desc:"Lajiliiton uutiset, lisenssit ja valmennus.", en:{ name:"Badminton Finland", desc:"National federation news, licences and coaching." } },
  { name:"Kisakalenteri ja tulokset", url:"https://badmintonfinland.tournamentsoftware.com", desc:"Kaikki kotimaan kisat, ilmoittautumiset ja rankingit.", en:{ name:"Tournaments and results", desc:"All Finnish tournaments, entries and rankings." } },
  { name:"BWF", url:"https://bwfbadminton.com", desc:"Maailman sulkapalloliitto, World Tour ja maailmanranking.", en:{ desc:"Badminton World Federation, World Tour and world rankings." } },
  { name:"BWF TV", url:"https://www.youtube.com/@bwftv", desc:"Huippuotteluita ja koosteita YouTubessa.", en:{ desc:"Top matches and highlights on YouTube." } },
  { name:"Badminton Europe", url:"https://www.badmintoneurope.com", desc:"Euroopan liiton kisat ja EM-kilpailut.", en:{ desc:"European tournaments and championships." } },
  { name:"Arctic Open", url:"https://www.arcticopen.fi", desc:"Maailman huiput Vantaalla joka syksy.", en:{ desc:"World-class players in Vantaa every autumn." } }
];
