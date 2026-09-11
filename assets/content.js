/* =====================================================================
   WILSU – SISÄLTÖ
   ---------------------------------------------------------------------
   0) SETTINGS: logo, membership form link and fees.
   1) SHEETS: paste the "Publish to web" CSV link of each Google Sheet tab.
      When a link is set, the website reads that tab. When it's empty,
      or Google can't be reached, the site uses the backup content below.
   2) VENUES: the halls. These rarely change, so they live here.
   3) DEFAULT_CONTENT: backup content. Keep it roughly up to date once
      or twice a year, so the site never looks empty.
   ===================================================================== */

const SETTINGS = {
  /* Club logo. Put the file in the assets folder (logo.svg or logo.png) and write its name here,
     or paste a Google Drive share link. Leave empty to use the built-in shuttle mark. */
  logo:"assets/WilsuLogo.png",

  /* Google Form for membership applications. Paste the form's share link here. */
  membershipForm: "",

  /* Membership fees shown on the homepage */
  priceNormal:  "200 €",
  priceForever: "50 €"
};

const SHEETS = {
  schedule:      "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjihjEQSOhyFHJVFKGgH5PlkpPWL7j7E0wOrXmXsK9gGORsS8DUUqYc7Jmovg_8TF6abBTAb8qipuj/pub?gid=1610182645&single=true&output=csv",   // Vuorot
  cancellations: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjihjEQSOhyFHJVFKGgH5PlkpPWL7j7E0wOrXmXsK9gGORsS8DUUqYc7Jmovg_8TF6abBTAb8qipuj/pub?gid=623488143&single=true&output=csv",   // Peruutukset
  news:          "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjihjEQSOhyFHJVFKGgH5PlkpPWL7j7E0wOrXmXsK9gGORsS8DUUqYc7Jmovg_8TF6abBTAb8qipuj/pub?gid=900805977&single=true&output=csv",   // Uutiset
  events:        "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjihjEQSOhyFHJVFKGgH5PlkpPWL7j7E0wOrXmXsK9gGORsS8DUUqYc7Jmovg_8TF6abBTAb8qipuj/pub?gid=1195664895&single=true&output=csv",   // Tapahtumat
  gallery:       "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjihjEQSOhyFHJVFKGgH5PlkpPWL7j7E0wOrXmXsK9gGORsS8DUUqYc7Jmovg_8TF6abBTAb8qipuj/pub?gid=1016504809&single=true&output=csv"    // Galleria
};

const VENUES = {
  huhtiniemi: {
    name: "Huhtiniemen liikuntakeskus",
    short: "Huhtiniemi, monitoimisali",
    info: "Aikuisten ja kaksinpelin vuorot monitoimisalissa. Kisat ja kinkkukisat pelataan täällä.",
    maps: "Huhtiniemen liikuntakeskus, Lappeenranta"
  },
  urheilutalo: {
    name: "Lappeenrannan urheilutalo",
    short: "Urheilutalo",
    info: "Junioreiden vuorot. Sisään valmentajan kanssa tai uimahallin kautta.",
    maps: "Lappeenrannan urheilutalo, Lappeenranta"
  }
};

const DEFAULT_CONTENT = {
  schedule: [
    { id:"Ma 17.30 Juniorit",  day:1, start:"17:30", end:"19:00", group:"juniorit", title:"Harrastejunnut", venue:"urheilutalo", from:"2026-08-31" },
    { id:"Ke 16.30 Juniorit",  day:3, start:"16:30", end:"17:45", group:"juniorit", title:"Harrastejunnut, lisämaksu", venue:"urheilutalo", tba:true },
    { id:"Ti 17.00 Aikuiset",  day:2, start:"17:00", end:"18:30", group:"aikuiset", title:"Aikuisten vuoro", venue:"huhtiniemi", from:"2026-09-01" },
    { id:"To 16.30 Kaksinpeli",day:4, start:"16:30", end:"18:00", group:"kilpa",    title:"Kaksinpeli, aikuiset ja kilpajunnut", venue:"huhtiniemi", from:"2026-09-01" },
    { id:"To 18.00 Aikuiset",  day:4, start:"18:00", end:"19:30", group:"aikuiset", title:"Aikuisten vuoro", venue:"huhtiniemi", from:"2026-09-01" },
    { id:"La 10.30 Kaksinpeli",day:6, start:"10:30", end:"12:00", group:"kilpa",    title:"Kaksinpeli, aikuiset ja kilpajunnut", venue:"huhtiniemi", from:"2026-09-01" },
    { id:"Su 16.30 Aikuiset",  day:0, start:"16:30", end:"18:00", group:"aikuiset", title:"Aikuisten vuoro", venue:"huhtiniemi", from:"2026-09-01" }
  ],

  /* Example cancellation to demonstrate the banner. Remove before launch. */
  cancellations: [
    { slot:"To 18.00 Aikuiset", date:"2026-09-17", reason:"hallilla on tapahtuma" }
  ],

  news: [
    { date:"2026-05-03", cat:"Kilpailut", title:"Silja Soikkelille luokkamestaruus",
      summary:"Naisten nelinpelin A-luokan mestaruus Lilli Laurin kanssa. Kaikki ottelut päättyivät 2–0.",
      body:"Silja Soikkeli voitti naisten nelinpelin A-luokan luokkamestaruuden parinaan Lilli Lauri Puistolan Urheilijoista.\n\nPari ei hävinnyt kisassa yhtään erää. Finaalissa kaatuivat Veera Lindell (BarBa) ja Nova Nyqvist (HBC) lukemin 21–6, 21–16.",
      image:"https://i.media.fi/incoming/p6er69/9131692.jpg/alternates/FREE_1440/9131692.jpg" },
    { date:"2026-04-20", cat:"Seuraelämä", title:"Kausi huipentuu sulanrepijäisiin",
      summary:"Aikuisten pelit ja ilta LUTin rantasaunalla, junnuille omat kisat ja iltapala.",
      body:"Aikuisten sulanrepijäiset vietetään lauantaina 16.5. LUTin rantasaunalla. Sulanrepijäispelit pelataan perjantaina 15.5.\n\nJunioreiden kausi päättyy maanantaina 18.5. pieniin kisoihin ja yhteiseen ruokailuun. Vuoro alkaa normaalisti klo 17.30 ja päättyy noin klo 20. Jos et osallistu ruokailuun, voit lähteä kotiin pelien jälkeen klo 19.",
      image:"https://www.visitfinland.com/.imaging/mte/visit-finland-theme/lgUpW/dam/vf/Seasons/Spring/Visit_-land_web-DSC_4933_optimized.jpg/jcr:content/Visit_%C3%85land_web-DSC_4933_optimized.jpg", caption:"Treenivuoro Huhtiniemessä. Kuva: Tomi Karttunen" },
    { date:"2026-03-17", cat:"Ranking", title:"Silja nousi Suomen top 8:aan",
      summary:"Naisten kaksinpelin rankinglistalla sijoitus on nyt kahdeksas.",
      body:"Silja Soikkeli nousi sijalle 8 Suomen naisten kaksinpelin rankinglistalla. Rankingit löytyvät Sulkapalloliiton kisapalvelusta: https://badmintonfinland.tournamentsoftware.com",
      image:"https://kouvolansulkapalloseura.sporttisaitti.com/@Bin/989901/MK-B%207.1.2023%20Silja%20ja%20Noora.jpg" },
    { date:"2026-02-15", cat:"Kilpailut", title:"SM-kisoista sijat 5–8",
      summary:"Silja kaatoi Unni Parikan kolmessa erässä ennen puolivälierää.",
      body:"Wilsun Silja Soikkeli sijoittui SM-kisoissa sijoille 5–8. Silja voitti Unni Parikan (ESB) 2–1 (15–21, 21–19, 21–16).\n\nPuolivälierässä kisan kakkossijoitettu Petra Saarnivaara (TS) oli vahvempi 2–0 (21–14, 21–11).",
      image:"" },
    { date:"2026-01-13", cat:"Juniorit", title:"Junnuvuorot jatkuvat Urheilutalolla",
      summary:"Maanantain ohjatut treenit klo 17.30–19.00. Uudet pelaajat ovat tervetulleita.",
      body:"Junioreiden vuorot jatkuvat Urheilutalolla maanantaisin 13.1.2026 alkaen klo 17.30–19.00.",
      image:"https://wilsu.fi/tiedostot/Wilsun%20treenit%2017.10-20.jpg", caption:"Kuva: Tomi Karttunen" },
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

  gallery: [1,10,11,12,13,14,16,17,18,19,2,20,21,23,24,25,26,28,29,30,31,32,4,6,7,9]
    .map(n => ({ image:"https://wilsu.fi/tiedostot/" + encodeURIComponent(`Wilsun treenit 17.10-${n}.jpg`), caption:"Treenivuoro Huhtiniemessä. Kuva: Tomi Karttunen" }))
};

/* Archive photos for the history section. Add scanned photos when members send them. */
const ARCHIVE = [
  { image:"https://wilsu.fi/tiedostot/IMG_20170909_152310_1_resized_20170913_094543384.jpg", caption:"Armilan koulu, 1980-luku" },
  { image:"", caption:"Prisman juniorit" }
];

const LINKS = [
  { name:"Suomen Sulkapalloliitto", url:"https://www.sulkapallo.fi", desc:"Lajiliiton uutiset, lisenssit ja valmennus." },
  { name:"Kisakalenteri ja tulokset", url:"https://badmintonfinland.tournamentsoftware.com", desc:"Kaikki kotimaan kisat, ilmoittautumiset ja rankingit." },
  { name:"BWF", url:"https://bwfbadminton.com", desc:"Maailman sulkapalloliitto, World Tour ja maailmanranking." },
  { name:"BWF TV", url:"https://www.youtube.com/@bwftv", desc:"Huippuotteluita ja koosteita YouTubessa." },
  { name:"Badminton Europe", url:"https://www.badmintoneurope.com", desc:"Euroopan liiton kisat ja EM-kilpailut." },
  { name:"Arctic Open", url:"https://www.arcticopen.fi", desc:"Maailman huiput Vantaalla joka syksy." }
];
