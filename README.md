# Water Quality Monitoring (Solo)

This project is a modular web application consisting of three main components:

- **`waterAPI/`**: Water Quality microservice (Spring Boot + SQLite + CSV loader)
- **`auth-service/`**: Authentication & user management microservice (Spring Boot, in-memory users, BCrypt)
- **`frontend-dashboard/`**: React dashboard frontend (Vite)

---

## System Prerequisites & Versions

To run this project locally, ensure you have the following versions of runtime environments and build tools installed. These align with the project's configurations:

| Component              | Technology                    | Version Used / Specified            |
| :--------------------- | :---------------------------- | :---------------------------------- |
| **Backend Common**     | Java SE Development Kit (JDK) | **Java 17** (e.g., OpenJDK 17.0.16) |
|                        | Apache Maven                  | **Maven 3.9.x** (e.g., 3.9.9)       |
| **Water Quality API**  | Spring Boot                   | **2.7.4**                           |
|                        | SQLite JDBC                   | **3.36.0.3**                        |
|                        | OpenCSV                       | **5.5.2**                           |
| **Auth Service**       | Spring Boot                   | **2.7.4**                           |
| **Frontend Dashboard** | Node.js                       | **Node v23.x** (e.g., v23.10.0)     |
|                        | Package Manager               | **npm 10.x** (e.g., 10.9.2)         |
|                        | React                         | **^19.2.6**                         |
|                        | Vite                          | **^8.0.12**                         |
|                        | React Router                  | **^7.15.1**                         |

---

## Default Ports

- **Water API**: `http://localhost:8080`
- **Auth Service**: `http://localhost:8085`
- **Frontend Dev Server**: `http://localhost:5173`

---

## Run & Setup (Development)

### 1) Start Water API

From the root directory, navigate to `waterAPI/` and run the Spring Boot application using Maven:

```bash
cd waterAPI
mvn spring-boot:run
```

_(Requires **Java 17** and **Maven 3.9+**)_

### 2) Start Auth Service

From the root directory, navigate to `auth-service/` and run the Spring Boot application:

```bash
cd auth-service
mvn spring-boot:run
```

_(Requires **Java 17** and **Maven 3.9+**)_

### 3) Start Frontend

From the root directory, navigate to `frontend-dashboard/` to install dependencies and spin up the Vite development server:

```bash
cd frontend-dashboard
npm install
npm run dev -- --host
```

_(Requires **Node v23+** and **npm 10+**)_

---

## Key Endpoints

### Water API

- `GET /api/v1/waterquality/latest` - Fetch the most recent water quality readings
- `GET /api/v1/waterquality/latest-flag` - Fetch water quality readings filtered/flagged
- `GET /api/v1/waterquality/monthly-averages` - Retrieve aggregated monthly averages

### Auth Service

- `POST /api/v1/auth/login` - Authenticate users and retrieve session keys
- `POST /api/v1/users` - Create new users
- `GET /api/v1/users` - Retrieve all users (admin)
- `DELETE /api/v1/users/{username}` - Remove a user
- `PUT /api/v1/users/{username}/password` - Update a user's password
