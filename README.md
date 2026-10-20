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

> De exacte OData-entiteiten en velden kunnen per API-versie verschillen. Breid `src/app/api/motions/route.ts` uit met de benodigde `$select`, `$filter` en vervolgentiteiten voor geregistreerde hoofdelijke stemmingen.

## Deployen op Vercel

1. Importeer deze GitHub-repository in [Vercel](https://vercel.com/new).
2. Gebruik de standaard Next.js build-instellingen.
3. Voeg `TWEEDEKAMER_API_URL` toe als environment variable als je niet de standaard-URL gebruikt.
4. Iedere push naar de gekoppelde branch maakt automatisch een nieuwe deployment.
