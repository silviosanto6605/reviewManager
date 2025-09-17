# Review Manager

Review Manager è una semplice applicazione web per gestire e recensire album musicali (Node.js + Express + SQLite) con autenticazione base.

## Features

* Add new albums with details such as cover URL, name, artist, date, rating, genre, and possession status
* Edit existing album entries
* Delete album entries
* View a list of all albums with sorting and search functionality
* Upload album data via CSV files
* User authentication and session management
* Docker support for easy deployment

## Installazione (sviluppo locale senza Docker)

1. Clone the repository:
   ```sh
   git clone https://github.com/silviosanto6605/reviewManager.git
   cd reviewManager
   ```

2. Install dependencies:
   ```sh
   yarn install
   ```

3. Create a `.env` file with the following environment variables:
   ```sh
   USER=<your-username>
   PASSWORD=<your-password>
   ```

4. Create a new user by running:
   ```sh
   node createUser.js
   ```

## Avvio locale

1. Start the application:
   ```sh
   yarn start
   ```

2. Open your browser and navigate to `http://localhost:5000`.

3. Log in with the credentials you created in the installation step.

4. Use the application to manage your music album reviews.

## Avvio con Docker Compose (senza build manuale)

1. Crea `.env` (opzionale, altrimenti usa fallback):
```
USER=admin
PASSWORD=changeme
PORT=5000
```
2. Avvia:
```
docker compose up -d
```
3. Log:
```
docker compose logs -f app
```
4. Cambiare porta:
```
PORT=8081 docker compose up -d
```
5. Reset dati (attenzione, perde i database):
```
docker compose down
rm -rf data uploads
mkdir data uploads
docker compose up -d
```

## Avvio con semplice docker run

Costruisci (una volta):
```
docker build -t review-manager .
```
Esegui:
```
docker run --rm -p 5000:5000 \
   -e USER=admin -e PASSWORD=changeme \
   -v "$(pwd)/data:/app/data" -v "$(pwd)/uploads:/app/uploads" \
   review-manager sh -c "node createUser.js && node ./bin/www"
```
Porta alternativa (es. 8080 fuori / 5000 dentro):
```
docker run --rm -p 8080:5000 -e USER=admin -e PASSWORD=changeme review-manager sh -c "node createUser.js && node ./bin/www"
```
Stessa porta dentro/fuori diversa da default (es. 7000):
```
docker run --rm -e PORT=7000 -p 7000:7000 -e USER=admin -e PASSWORD=changeme review-manager sh -c "node createUser.js && node ./bin/www"
```

## Variabili supportate
USER / PASSWORD: createUser.js crea l’utente se non esiste.
PORT: porta interna (mappata nel compose simmetricamente). Fallback 5000.

## Persistenza
I file `data.db` e `users.db` restano nel volume host `./data`. Uploads in `./uploads`.

## File Structure

* `.github/workflows/docker-image.yml`: (se presente) workflow CI/CD
* `.gitignore`: Git ignore file
* `app.js`: Main application file
* `createUser.js`: Script to create a new user
* `docker-compose.yml`: Docker Compose configuration file
* `Dockerfile`: Dockerfile for building the application image
* `package.json`: Project metadata and dependencies
* `public/stylesheets/style.css`: CSS styles for the application
* `routes/delete.js`: Route for deleting album entries
* `routes/edit.js`: Route for editing and adding album entries
* `routes/index.js`: Route for the home page
* `routes/login.js`: Route for user login and logout
* `routes/view.js`: Route for viewing album entries
* `views/edit.jade`: View template for editing album entries
* `views/error.jade`: View template for error pages
* `views/index.jade`: View template for the home page
* `views/layout.jade`: Layout template for the application
* `views/login.jade`: View template for the login page
* `views/view.jade`: View template for viewing album entries

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.