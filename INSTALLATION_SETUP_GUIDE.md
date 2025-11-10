# Installation & Setup Guide: AANS Sakshi Cafe Platform

**This guide provides step-by-step instructions to get the AANS Sakshi Cafe platform running on your local machine. The setup process should take approximately 30-60 minutes.**

---

## 1. Prerequisites

Before you begin, ensure you have the following software installed on your system:

| Software         | Required Version | Installation Guide                                  |
| :--------------- | :--------------- | :-------------------------------------------------- |
| **Node.js**      | `20.x` or later  | [https://nodejs.org/](https://nodejs.org/)          |
| **pnpm**         | `9.x` or later   | [https://pnpm.io/installation](https://pnpm.io/installation) |
| **Docker**       | `20.x` or later  | [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/) |

---

## 2. Installation Steps

Follow these steps to set up the project on your local machine.

### Step 2.1: Clone the Repository

First, clone the project repository to your local machine. You will need to replace the placeholder URL with the actual URL of your Git repository.

```bash
# Replace with your actual repository URL
git clone https://github.com/your-username/aans-sakshi-cafe.git
cd aans-sakshi-cafe
```

### Step 2.2: Install Dependencies

This project uses `pnpm` for package management. Install all dependencies by running the following command in the project root:

```bash
pnpm install
```

This will install all the necessary packages for both the `client` and `server` applications.

### Step 2.3: Set Up Environment Variables

The platform requires a set of environment variables to run correctly. These include database credentials, API keys for external services, and other configuration settings.

1.  **Create a `.env` file:** In the root of the project, create a new file named `.env` by copying the example file:

    ```bash
    cp .env.example .env
    ```

2.  **Fill in the variables:** Open the `.env` file and fill in the required values. The file is commented to explain each variable.

    ```dotenv
    # .env

    # Database
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=your_database_password # Replace with a secure password
    DB_NAME=aans_sakshi_cafe

    # Manus OAuth
    MANUS_CLIENT_ID=your_manus_client_id
    MANUS_CLIENT_SECRET=your_manus_client_secret

    # API Keys
    OPENAI_API_KEY=your_openai_api_key
    ANTHROPIC_API_KEY=your_anthropic_api_key
    TWILIO_ACCOUNT_SID=your_twilio_account_sid
    TWILIO_AUTH_TOKEN=your_twilio_auth_token
    SENDGRID_API_KEY=your_sendgrid_api_key
    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret

    # Sentry for error tracking
    SENTRY_DSN=your_sentry_dsn
    ```

---

## 3. Database Setup

The project uses a MySQL database. The easiest way to get a local database running is with Docker.

### Step 3.1: Start the MySQL Container

Run the following command to start a MySQL container with the credentials you specified in your `.env` file. Make sure to replace `your_database_password` with the same password you used in the `.env` file.

```bash
docker run --name mysql-aans -e MYSQL_ROOT_PASSWORD=your_database_password -p 3306:3306 -d mysql:8
```

### Step 3.2: Run Database Migrations

Once the database container is running, you need to apply the database schema. The project uses Drizzle ORM to manage migrations.

Run the following command to apply all migrations:

```bash
pnpm db:push
```

This will create all the necessary tables and relationships in your local database.

---

## 4. Running the Application

Now that the environment is set up, you can start the development server.

```bash
pnpm dev
```

This command will start both the backend server and the frontend development server. You can now access the application in your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 5. Troubleshooting

Here are some common issues you might encounter during setup:

*   **Database Connection Errors:**
    *   Ensure your Docker container is running.
    *   Double-check that the `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASSWORD` in your `.env` file match the Docker container settings.

*   **Dependency Installation Failures:**
    *   Make sure you are using the correct versions of Node.js and pnpm.
    *   Try deleting the `node_modules` directory and the `pnpm-lock.yaml` file, and then run `pnpm install` again.

*   **`pnpm dev` command fails:**
    *   Ensure all environment variables in `.env` are correctly filled out. Missing API keys can sometimes cause startup errors.

**If you encounter any other issues, please refer to the detailed documentation in the project repository or consult the `EXECUTIVE_SUMMARY_ACTION_PLAN.md` for more context.**
