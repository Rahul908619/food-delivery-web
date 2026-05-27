# Food Delivery Web Backend

This repository contains the backend API for a food delivery application inspired by Swiggy and Zomato. It is built with Spring Boot and provides role based APIs for customers, restaurant owners, delivery partners, and admins.

The project covers the main workflow of a real food delivery system: user onboarding, restaurant registration, menu management, cart handling, order placement, payment verification, delivery tracking, reviews, and admin monitoring.

## Project Objective

The goal of this project is to demonstrate a production style backend for an online food delivery platform. The application separates responsibilities across controllers, services, repositories, DTOs, entities, security filters, and exception handlers so the code is easier to understand, test, and extend.

## Main Features

- User registration and login with JWT authentication.
- Google and Apple OAuth login support.
- Supabase based password reset support.
- Role based access for `ADMIN`, `CUSTOMER`, `RESTAURANT_OWNER`, and `DELIVERY_PARTNER`.
- Customer profile, address, restaurant browsing, cart, order, payment, tracking, and review APIs.
- Restaurant owner APIs for restaurant registration, image upload, menu management, order status updates, analytics, and reviews.
- Delivery partner APIs for availability, location update, available orders, accepted orders, delivery completion, and earnings.
- Admin APIs for dashboard statistics, restaurant approval, users, delivery partners, orders, and account blocking.
- Cloudinary integration for restaurant and menu item image uploads.
- Razorpay integration for online payment initiation and verification.
- Cash on Delivery confirmation support.
- MySQL database support for local and production usage.
- H2 database configuration for tests.
- Swagger/OpenAPI documentation.
- Docker and Docker Compose setup.

## Tech Stack

- Java 17
- Spring Boot 3.2.5
- Spring Security
- Spring Data JPA
- Hibernate
- MySQL 8
- H2 for tests
- JWT using JJWT
- Lombok
- ModelMapper
- Cloudinary
- Razorpay
- Supabase Auth integration
- Springdoc OpenAPI / Swagger UI
- Docker and Docker Compose
- Maven Wrapper

## Application Roles

| Role | Responsibility |
| --- | --- |
| `CUSTOMER` | Browse restaurants, manage cart, place orders, pay, track orders, and add reviews. |
| `RESTAURANT_OWNER` | Register restaurant, manage menu, accept/reject orders, update preparation status, and view analytics. |
| `DELIVERY_PARTNER` | Manage availability, update live location, accept available orders, complete deliveries, and track earnings. |
| `ADMIN` | Approve restaurants, monitor users/orders/delivery partners, and manage account access. |

## API Modules

| Module | Base Path | Description |
| --- | --- | --- |
| Authentication | `/api/auth` | Register, login, OAuth login, phone connection, forgot password, and reset password. |
| Customer | `/api/customer` | Profile, addresses, restaurants, menu, cart, orders, payments, tracking, and reviews. |
| Restaurant Owner | `/api/owner` | Restaurant registration, restaurant details, menu CRUD, order handling, analytics, and reviews. |
| Delivery Partner | `/api/delivery`, `/api/partner` | Profile, availability, location, available orders, accepted orders, delivery completion, and earnings. |
| Admin | `/api/admin` | Dashboard, restaurant approvals, users, delivery partners, orders, and blocking users. |

## Project Structure

```text
src/main/java/com/swiggy
|- config        Application, security, Swagger, local data source, and seed configuration
|- controller    REST controllers grouped by application role
|- dto           Request and response payload models
|- entity        JPA entity classes
|- enums         Role, order, payment, and food type enums
|- exception     Custom exceptions and global exception handling
|- repository    Spring Data JPA repositories
|- security      JWT utility, filter, and user details service
|- service       Business logic for auth, orders, payments, restaurants, delivery, and reviews
`- util          Shared helper utilities
```

## Important Files

| File | Purpose |
| --- | --- |
| `pom.xml` | Maven dependencies and build configuration. |
| `src/main/resources/application.yaml` | Common configuration and environment variable mapping. |
| `src/main/resources/application-prod.yaml` | Production profile database and secret configuration. |
| `.env.example` | Example environment variables for local setup. |
| `docker-compose.yml` | Runs MySQL and the backend together. |
| `Dockerfile` | Builds the Spring Boot application container. |

## Environment Setup

Create a `.env` file from the example file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update `.env` with your local MySQL password and real service keys when required.

For trainer or instructor review, keep the real `.env` file beside this README in the project root before running the backend. The file is intentionally ignored by Git, so it must be shared separately from the repository when someone else needs to run the full project with database, Cloudinary, Razorpay, and Supabase integration enabled.

Required variables:

- `SPRING_PROFILES_ACTIVE`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `LOCAL_DATASOURCE_URL`
- `LOCAL_DATASOURCE_USERNAME`
- `LOCAL_DATASOURCE_PASSWORD`
- `SERVER_PORT`
- `ALLOWED_ORIGINS`
- `APP_JWT_SECRET`
- `APP_JWT_EXPIRATION`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_PASSWORD_RESET_REDIRECT_URL`
- `SUPABASE_USER_PASSWORD_RESET_REDIRECT_URL`
- `SUPABASE_PARTNER_PASSWORD_RESET_REDIRECT_URL`

## Instructor Run Checklist

1. Install Java 17 and MySQL 8.
2. Create the MySQL database or let the JDBC URL create it automatically.
3. Place the real `.env` file in the project root.
4. Run `.\mvnw.cmd test` to verify the backend context loads.
5. Run `.\mvnw.cmd spring-boot:run` to start the API on port `8082`.
6. Open `http://localhost:8082/swagger-ui.html` for endpoint testing when Swagger is enabled.

## Run Locally

Make sure Java 17 and MySQL are installed. Then run:

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Default application URL:

```text
http://localhost:8082
```

## Run With Docker

Docker Compose starts both MySQL and the backend service:

```bash
docker compose up --build
```

Backend URL:

```text
http://localhost:8082
```

## API Documentation

Swagger UI is available when Swagger is enabled through configuration:

```text
http://localhost:8082/swagger-ui.html
```

OpenAPI JSON:

```text
http://localhost:8082/api-docs
```

## Testing

Run the test suite with:

```bash
./mvnw test
```

On Windows:

```powershell
.\mvnw.cmd test
```

The test profile uses H2, so tests do not require a running MySQL database.

## Database Notes

- Local and production profiles are configured separately.
- JPA is set to `ddl-auto: update` for development convenience.
- MySQL is used for application data.
- H2 is used for automated tests.

## Security Notes

- `.env` is intentionally ignored by Git.
- Do not commit real JWT, Cloudinary, Razorpay, Supabase, or database secrets.
- Use a strong `APP_JWT_SECRET` outside local development.
- The local profile can seed an admin account using environment variables for easier testing.

## Suggested Review Flow For Trainer

1. Review the package structure under `src/main/java/com/swiggy`.
2. Start the application locally or with Docker.
3. Open Swagger UI and test authentication first.
4. Test the customer flow: register, browse restaurants, add to cart, place order, initiate payment, and review.
5. Test the owner flow: register restaurant, add menu items, and manage orders.
6. Test the delivery flow: update availability, accept order, update location, and mark delivered.
7. Test admin APIs for restaurant approval and dashboard monitoring.

## Git Branch

The trainer-ready version is maintained on the `backend` branch.
