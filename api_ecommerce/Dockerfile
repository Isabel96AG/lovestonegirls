FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev zip unzip curl \
    && docker-php-ext-install pdo pdo_mysql gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .
COPY .env.docker .env

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN php artisan key:generate --no-interaction || true

EXPOSE 8000
CMD ["sh", "-c", "php artisan storage:link --force && php artisan serve --host=0.0.0.0 --port=8000"]
