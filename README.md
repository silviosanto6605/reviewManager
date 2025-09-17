# Review Manager

Review Manager è una semplice applicazione web per gestire e recensire album musicali (Node.js + Express + SQLite) con autenticazione base.

## Features

* Aggiungi nuovi album con dettagli come cover URL, nome, artista, data, valutazione, genere e stato di possesso
* Modifica album esistenti
* Elimina album
* Visualizza lista di tutti gli album con ordinamento e ricerca
* Carica dati album tramite file CSV
* Autenticazione utente e gestione sessioni
* Supporto Docker per deploy facile

## Avvio con Docker Compose (raccomandato)

1. Crea `.env` (opzionale, altrimenti usa fallback):
```env
APP_USER=admin
APP_PASSWORD=changeme
PORT=5000
```

2. Avvia:
```bash
docker compose up -d
```

3. Apri http://localhost:5000 e login con le credenziali

4. Logs:
```bash
docker compose logs -f review-manager
```

### Opzioni avanzate Docker Compose

**Porta diversa:**
```bash
echo "PORT=8081" >> .env
docker compose up -d
```

**Reset completo dati:**
```bash
docker compose down --volumes --remove-orphans
rm -rf data uploads *.db
mkdir -p data uploads  
docker compose up -d
```

**Utente diverso:**
```bash
echo -e "APP_USER=myuser\nAPP_PASSWORD=mypass\nPORT=5000" > .env
docker compose up -d --force-recreate
```

**Usa immagine pre-built (senza build locale):**
```bash
# Rimuovi la sezione 'build:' dal docker-compose.yml, poi:
docker compose pull
docker compose up -d
```

## Avvio con docker run

**Usa immagine da registry:**
```bash
docker run --rm -p 5000:5000 \
   -e APP_USER=admin -e APP_PASSWORD=changeme \
   -v "$(pwd)/data:/app/data" -v "$(pwd)/uploads:/app/uploads" \
   silviosanto6605/review-manager:latest
```

**Build locale:**
```bash
docker build -t review-manager .
docker run --rm -p 5000:5000 \
   -e APP_USER=admin -e APP_PASSWORD=changeme \
   -v "$(pwd)/data:/app/data" -v "$(pwd)/uploads:/app/uploads" \
   review-manager
```

**Porta diversa (8080 host → 5000 container):**
```bash
docker run --rm -p 8080:5000 \
   -e APP_USER=admin -e APP_PASSWORD=changeme \
   -v "$(pwd)/data:/app/data" -v "$(pwd)/uploads:/app/uploads" \
   silviosanto6605/review-manager:latest
```

**Stessa porta dentro/fuori (7000):**
```bash
docker run --rm -p 7000:7000 \
   -e PORT=7000 -e APP_USER=admin -e APP_PASSWORD=changeme \
   -v "$(pwd)/data:/app/data" -v "$(pwd)/uploads:/app/uploads" \
   silviosanto6605/review-manager:latest
```

**Senza volumi persistenti (dati persi al riavvio):**
```bash
docker run --rm -p 5000:5000 \
   -e APP_USER=admin -e APP_PASSWORD=changeme \
   silviosanto6605/review-manager:latest
```

## Sviluppo locale (senza Docker)

1. Clone:
```bash
git clone https://github.com/silviosanto6605/reviewManager.git
cd reviewManager
```

2. Install dipendenze:
```bash
npm install
```

3. Crea `.env`:
```bash
echo -e "APP_USER=admin\nAPP_PASSWORD=changeme\nPORT=5000" > .env
```

4. Crea utente:
```bash
node createUser.js
```

5. Avvia:
```bash
npm start
```

Oppure tutto in un comando:
```bash
APP_USER=admin APP_PASSWORD=changeme node createUser.js && npm start
```

## Variabili d'ambiente

| Variabile | Descrizione | Default |
|-----------|-------------|---------|
| `APP_USER` | Username per login | `admin` |
| `APP_PASSWORD` | Password per login | `changeme` |
| `PORT` | Porta applicazione | `5000` |
| `IMAGE_REGISTRY` | Registry Docker (docker-compose) | `silviosanto6605` |
| `IMAGE_TAG` | Tag immagine (docker-compose) | `latest` |

**Note:** Le variabili `USER` e `PASSWORD` sono ancora supportate come fallback per compatibilità.

## Persistenza dati

I dati persistono nelle cartelle:
- `./data/` → Database SQLite (data.db, users.db)
- `./uploads/` → File CSV caricati

Per backup:
```bash
tar -czf backup-$(date +%Y%m%d).tar.gz data/ uploads/
```

Per ripristino:
```bash
tar -xzf backup-YYYYMMDD.tar.gz
```

## Test funzionalità

Dopo l'avvio, testa:
1. **Login**: http://localhost:5000/login
2. **Visualizza DB**: http://localhost:5000/view  
3. **Aggiungi album**: http://localhost:5000/edit
4. **Import CSV**: carica file con formato: `ID,Cover,Nome,Artista,Data,Voto,Genere,Possesso`

## Troubleshooting

**Container non si avvia:**
```bash
docker compose logs review-manager
```

**Reset completo:**
```bash
docker compose down --volumes --remove-orphans
docker system prune -f
rm -rf data uploads *.db
mkdir -p data uploads
docker compose up -d --force-recreate
```

**Problema permessi file:**
```bash
sudo chown -R $USER:$USER data uploads
chmod 755 data uploads
```

## Contributing

I contributi sono benvenuti! Apri un issue o invia una pull request.

## License

Questo progetto è sotto licenza MIT.