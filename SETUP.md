# Laravel Frontend Setup Guide

This guide helps you set up the Laravel application with React frontend after cloning the repository.

## Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 18 or higher
- NPM

## Quick Setup

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd yes1
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Generate application key**
   ```bash
   php artisan key:generate
   ```

5. **Configure database** (SQLite recommended for development)
   - Edit `.env` file and set:
   ```
   DB_CONNECTION=sqlite
   DB_DATABASE=/path/to/your/project/database/database.sqlite
   ```

6. **Create database file**
   ```bash
   touch database/database.sqlite
   ```

7. **Run migrations**
   ```bash
   php artisan migrate
   ```

8. **Install Node.js dependencies**
   ```bash
   npm install
   ```

9. **Build frontend assets**
   ```bash
   npm run build
   ```

10. **Start the application**
    ```bash
    php artisan serve
    ```

## Development Mode

For development with hot reloading:

```bash
# Terminal 1: Start Laravel server
php artisan serve

# Terminal 2: Start Vite dev server
npm run dev
```

## Alternative: MySQL Database

If you prefer MySQL, update your `.env` file:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Make sure MySQL is running and the database exists before running migrations.

## Troubleshooting

- **Frontend not displaying**: Ensure you've run `npm run build` and assets are compiled
- **Database errors**: Check your `.env` database configuration
- **Permission errors**: Make sure storage and bootstrap/cache directories are writable
- **Laravel key errors**: Run `php artisan key:generate`

## Production Deployment

For production, run:

```bash
composer install --no-dev --optimize-autoloader
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```