# User Management Application

This project is a simple user management application built using Node.js, Express, and SQLite. It provides a basic API for creating, listing, and searching users, with a client-side interface for interaction.

## Table of Contents

-   [Project Structure](#project-structure)
-   [API Endpoints](#api-endpoints)
-   [Client-Side Interaction](#client-side-interaction)
-   [How to Run](#how-to-run)
-   [Testing](#testing)
-   [Technologies Used](#technologies-used)
-   [Future Improvements](#future-improvements)

## Project Structure

The project is structured as follows:
Use code with caution.
Markdown
├── domain
│ └── db
│ └── database.db # Database file created at runtime.
├── node_modules/
├── index.html # HTML main page.
├── app.js # Main client-side JavaScript.
├── server.js # Express server configuration.
├── styles.css # CSS rules file.
├── package.json
├── package-lock.json
└── user.js # User class and SQLite interface.

-   `index.html`: The main HTML file that provides the user interface for the application.
-   `app.js`: The main JavaScript file for client-side logic, including form handling and API calls.
-   `styles.css`: Contains custom CSS rules and TailwindCSS.
-   `server.js`: The Node.js file that sets up the Express server, handles API requests, and serves static files.
-   `user.js`:  Contains the `User` class, database initialization, and methods for user creation, retrieval, and listing.
-   `package.json`: Contains metadata about the project, including dependencies and scripts.
-   `package-lock.json`: Records the exact versions of packages used in the project.
-   `domain/db/database.db`: SQLite database file.

## API Endpoints

The following endpoints are available on the server:

-   **GET `/`**: Serves the main `index.html` file.
-   **POST `/create-user`**: Creates a new user. Expects a JSON body with `name`, `email`, and `senha`.
    *   **Request Body:**
        ```json
        {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "senha": "securePassword123"
        }
        ```
    *   **Response:**
        *   201 Created: `{ "message": "Usuário John Doe criado com sucesso!" }`
        *   500 Internal Server Error: `{ "message": "Erro ao criar usuário." }`
-   **GET `/list-users`**: Retrieves a list of all users.
    *   **Response:**
        *   200 OK: `[{"name": "John Doe", "email": "john.doe@example.com", "senha": "securePassword123"}]`
        *   500 Internal Server Error: `{ "message": "Erro ao listar usuários." }`
-   **GET `/search-user?email={email}`**: Searches for a user by email.
    *   **Query Parameter:**
        -   `email`: The email address to search for.
    *   **Response:**
        *   200 OK: `{"name": "John Doe", "email": "john.doe@example.com", "senha": "securePassword123"}`
        *   404 Not Found: `{ "message": "Usuário não encontrado." }`
        *   500 Internal Server Error: `{ "message": "Erro ao buscar usuário." }`

## Client-Side Interaction

The `index.html` file provides a form to interact with the API:

-   **Create User:** A form to create new users by providing their name, email, and password.
-   **List Users:** A button to list all users in the database, showing them on the page.
-   **Search User:** An input field to search for a specific user using their email.

All form submission and button clicks are handled by the `app.js` file, which sends requests to the API endpoints.

## How to Run

1.  **Clone the Repository**

    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```
2.  **Install Dependencies**
    ```bash
    npm install
    ```
3.  **Run the Server:**

    ```bash
    node server.js
    ```
4.  **Access the Application**
    Open your web browser and navigate to [http://127.0.0.1:8080](http://127.0.0.1:8080)

## Testing

-   **Live Application:**
    The application is accessible at `http://147.79.83.59:8080/`.
-   **Manual Testing:**
    -   You can manually test the application by using the web interface or tools like Postman to call the API.
    -   Create and list users, and test the user search by email.
-   **Unit Testing:**
    -   For more robust tests, consider implementing unit tests for the API with Jest or Mocha.

## Technologies Used

-   Node.js
-   Express.js
-   SQLite
-   Tailwind CSS
-   HTML
-   JavaScript
-   Es Modules

## Future Improvements

-   Implement more robust error handling on both the server and client.
-   Add data validation for inputs to prevent errors and bad data.
-   Use environment variables for sensitive data and configuration.
-   Implement a more sophisticated user interface.
-   Add authentication and authorization.
-   Implement unit tests.
-   Use a proper database driver such as `better-sqlite3` to prevent the `invalid ELF header` error.
Use code with caution.
Explanation of Sections

Project Structure: Explains the layout of the files.
API Endpoints: Explains each API endpoint, its purpose, expected request body/parameters, and the responses.
Client-Side Interaction: Explains the interface available in index.html and how it interacts with the API using app.js.
How to Run: Explains the steps to install dependencies and run the server locally.
Testing: Explains how to test the application using the public IP and manually.
Technologies Used: Lists the technologies.
Future Improvements: Lists the possible extensions of this application.
Important Notes

This README assumes the user is familiar with Node.js and has it installed.
The provided external IP http://147.79.83.59:8080/ should allow testing the application.
The application is built with ESM (ECMAScript Modules), so package.json needs to be configured with type: "module".
The usage of sqlite3 is prone to produce the error "invalid ELF header". To prevent it use a cross-plataform library like better-sqlite3.
Feel free to adapt this README.md to your needs and add any additional information you feel is relevant. I hope this is helpful!