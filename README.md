# PolitiQ

Wie vertegenwoordigt jou forreal?

Een Next.js-template voor live inzicht in moties, stemmingen en partijstemgedrag van de Tweede Kamer. De interface is voorbereid op de [Tweede Kamer OData API](https://opendata.tweedekamer.nl/documentatie/odata-api).

## Lokaal starten

```bash
npm install
npm run dev
```

Open daarna [http://localhost:3000](http://localhost:3000).

## API-proxy

De route `GET /api/motions` haalt de laatste moties server-side op. Daarmee blijft de upstream-configuratie buiten de browser en kan de route op Vercel gecachet worden. De basis-URL kan worden aangepast met `TWEEDEKAMER_API_URL`; zie [.env.example](./.env.example).

De loader gebruikt de live `Zaak`-entiteit met `$filter=Soort eq 'Motie'` en haalt de zes meest recente moties op. De route geeft genormaliseerde JSON terug aan eventuele andere clients.

## Manifesto-classificatie

De PDF's in [`data/manifestos`](./data/manifestos) kunnen offline met een
OpenAI-compatible model worden geclassificeerd. De classifier stuurt ieder
manifesto één keer naar de ingestelde provider en schrijft per partij twaalf
compacte scores (zes assen met een x- en y-score van `0` tot `1`) naar
`data/manifesto-ai-scores.json`. Dat bestand wordt automatisch gebruikt door de
manifesto-API; zonder dat bestand blijft de deterministische fallback actief.

Stel eerst de variabelen in je lokale `.env.local` in:

```text
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_API_KEY=...
AI_MODEL=openai/gpt-oss-20b
```

Start daarna:

```bash
npm run classify:manifestos
```

Tijdelijke netwerkfouten worden automatisch opnieuw geprobeerd. De classifier
schrijft na elk verwerkt tekstfragment een checkpoint, zodat je hetzelfde
commando veilig opnieuw kunt uitvoeren als de provider een timeout geeft. De
partijen worden afzonderlijk verwerkt: als één partij definitief faalt, gaat de
volgende partij door. De uitvoer toont tijdens het verwerken een geschatte
resterende tijd (ETA) op basis van de werkelijk gemeten requestduur.

Wil je opnieuw starten vanaf een specifieke partij, bijvoorbeeld na een
providerstoring bij `ja21`, gebruik dan in PowerShell:

```powershell
$env:AI_START_PARTY="ja21"
npm run classify:manifestos
```

Partijen vóór deze partij worden overgeslagen; de gekozen partij wordt vanaf het
laatste checkpoint hervat.

De uitvoer bevat per partij een score voor iedere as en dimensie. `0` betekent
de eerste pool van een as en `1` de tweede pool. Controleer deze scores voor
productiegebruik; de app zet ze intern om naar de grafiekschaal van `-1` tot
`1` en roept geen AI-model aan tijdens het laden van de pagina.

Bij lokale modellen kan een volledige PDF te groot zijn voor het contextvenster.
Daarom worden standaard maximaal 12.000 tekens met relevante passages verstuurd.
Verlaag `AI_MAX_INPUT_CHARS` als Ollama een 500-fout geeft; verhoog deze waarde
alleen als het model een groter contextvenster ondersteunt.

## Deployen op Vercel

1. Importeer deze GitHub-repository in [Vercel](https://vercel.com/new).
2. Gebruik de standaard Next.js build-instellingen.
3. Voeg `TWEEDEKAMER_API_URL` toe als environment variable als je niet de standaard-URL gebruikt.
4. Iedere push naar de gekoppelde branch maakt automatisch een nieuwe deployment.
