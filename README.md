# Review Manager

Review Manager is a web application for managing and reviewing music albums. It allows users to add, edit, view, and delete album entries, as well as upload album data via CSV files. The application is built using Node.js, Express, and SQLite, and it includes user authentication and session management.

## Features

* Add new albums with details such as cover URL, name, artist, date, rating, genre, and possession status
* Edit existing album entries
* Delete album entries
* View a list of all albums with sorting and search functionality
* Upload album data via CSV files
* User authentication and session management
* Docker support for easy deployment

## Installation

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

## Usage

1. Start the application:
   ```sh
   yarn start
   ```

2. Open your browser and navigate to `http://localhost:5000`.

3. Log in with the credentials you created in the installation step.

4. Use the application to manage your music album reviews.

## Docker

To run the application using Docker, follow these steps:

1. Build and start the Docker container:
   ```sh
   docker-compose up --build
   ```

2. Open your browser and navigate to `http://localhost:5000`.

## File Structure

* `.github/workflows/docker-image.yml`: GitHub Actions workflow for deploying to Docker Hub
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