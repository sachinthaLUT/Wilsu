# Wilsu – turvallisuus / security

Tämä on staattinen sivusto (GitHub Pages). Sivustolla ei ole palvelinta,
tietokantaa eikä kirjautumista, eikä se käsittele henkilötietoja.
Sisältö luetaan julkaistusta Google Sheet -taulukosta.

## Mitä koodissa on tehty

- Kaikki taulukosta tulevat osoitteet tarkistetaan (`parsedHttpUrl`, `safeUrl`,
  `href`, `mailHref`, `membershipUrl`) ja koodataan ennen kuin ne laitetaan sivulle.
- Kuvat ladataan vain sivuston omasta `assets/`-kansiosta tai Google Drivesta
  (`SETTINGS.allowedImageHosts` laajentaa listaa, jos se on välttämätöntä).
- Taulukoita haetaan vain osoitteista `https://docs.google.com/spreadsheets/d/e/...`.
- Jäsenhakemuksen linkin on oltava Google Forms -lomake.
- Kävijälaskurin tunnus hyväksytään vain muodossa a–z, 0–9 ja väliviiva.
- Jokaisella sivulla on Content-Security-Policy ja referrer-käytäntö `<meta>`-tageina,
  koska GitHub Pages ei lähetä omia otsakkeita.
- Sivu ei salli itsensä upottamista toiselle sivustolle (paras mahdollinen yritys ilman otsakkeita).
- Ainoa selaimeen tallennettava tieto on kielivalinta (`wilsu-lang`). Ei evästeitä.

## Mitä pitää hoitaa koodin ulkopuolella

1. **GitHub**: kaksivaiheinen tunnistautuminen kaikille, joilla on oikeudet.
   Suojaa `main`-haara (branch protection), jotta muutokset eivät mene ohi huomaamatta.
2. **Google-tili**: seuran oma tili, kaksivaiheinen tunnistautuminen,
   palautusosoite seuran hallinnassa.
3. **Google Sheet**: jaa vain nimetyille muokkaajille. Ei "kuka tahansa linkillä voi muokata".
   Julkaistut välilehdet ovat julkisia – älä kirjoita niihin henkilötietoja.
4. **Google Forms**: lomakkeet seuran tilillä. Vastaukset omassa, jakamattomassa kansiossa.
5. **Verkkotunnus**: siirto wilsu.fi-osoitteeseen, kun DNS on valmis. Automaattinen uusinta,
   siirtolukko ja DNSSEC päälle.
6. **Vanha sivusto**: ota vanha PHP-sivusto pois käytöstä siirron jälkeen ja pyydä
   palveluntarjoajaa poistamaan vanhat jäsenhakemusten tiedot.
7. **Tarkistus julkaisun jälkeen**: securityheaders.com ja developer.mozilla.org/observatory.

## Jos jokin menee rikki

Muutokset ovat GitHubin versiohistoriassa ja Google Sheetin versiohistoriassa.
Molemmat voi palauttaa aiempaan versioon muutamalla klikkauksella.
