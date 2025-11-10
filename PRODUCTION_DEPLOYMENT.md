# Production Deployment Guide - Sakshi Cafe Platform

## Overview
Complete guide for deploying Sakshi Cafe platform to production with security, scalability, and reliability.

---

## 1. Environment Setup

### 1.1 Production Environment Variables

Create `.env.production`:

```bash
# Application
NODE_ENV=production
PORT=3001
API_URL=https://api.sakshicafe.com
FRONTEND_URL=https://sakshicafe.com

# Database
DATABASE_URL=postgresql://user:password@prod-db-host:5432/sakshi_cafe_prod
DATABASE_POOL_SIZE=20
DATABASE_TIMEOUT=30000

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

# Security
CORS_ORIGIN=https://sakshicafe.com,https://app.sakshicafe.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@sakshicafe.com

# SMS Service
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Payment Gateway
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Cloud Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=sakshi-cafe-prod

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### 1.2 Database Setup

```bash
# Create production database
createdb sakshi_cafe_prod

# Run migrations
pnpm db:push

# Seed initial data
pnpm seed:prod

# Create backups
pg_dump sakshi_cafe_prod > backups/sakshi_cafe_prod_$(date +%Y%m%d).sql
```

---

## 2. Docker Deployment

### 2.1 Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build application
COPY . .
RUN pnpm build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "dist/server.js"]
```

### 2.2 Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://sakshi:password@db:5432/sakshi_cafe_prod
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - sakshi-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=sakshi
      - POSTGRES_PASSWORD=secure_password
      - POSTGRES_DB=sakshi_cafe_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sakshi"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - sakshi-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - sakshi-network

volumes:
  postgres_data:

networks:
  sakshi-network:
    driver: bridge
```

---

## 3. Nginx Configuration

### 3.1 nginx.conf

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml application/atom+xml image/svg+xml 
               text/x-js text/x-component text/x-cross-domain-policy;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=1000r/m;

    # Upstream
    upstream app {
        least_conn;
        server app:3001 max_fails=3 fail_timeout=30s;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name sakshicafe.com www.sakshicafe.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name sakshicafe.com www.sakshicafe.com;

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # API endpoints
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # WebSocket
        location /ws/ {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Static files
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Frontend
        location / {
            limit_req zone=general_limit burst=50 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            access_log off;
            proxy_pass http://app;
        }
    }
}
```

---

## 4. SSL/TLS Setup

### 4.1 Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d sakshicafe.com -d www.sakshicafe.com

# Auto-renewal
sudo certbot renew --dry-run
sudo systemctl enable certbot.timer
```

### 4.2 Certificate Renewal

```bash
# Create renewal script
cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
docker exec nginx nginx -s reload
EOF

chmod +x /usr/local/bin/renew-ssl.sh

# Add to crontab
0 3 * * * /usr/local/bin/renew-ssl.sh
```

---

## 5. Database Backup & Recovery

### 5.1 Automated Backups

```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/database"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="sakshi_cafe_prod"

mkdir -p $BACKUP_DIR

# Full backup
pg_dump $DB_NAME | gzip > $BACKUP_DIR/full_$TIMESTAMP.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "full_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/full_$TIMESTAMP.sql.gz"
EOF

chmod +x /usr/local/bin/backup-db.sh

# Schedule daily backups
0 2 * * * /usr/local/bin/backup-db.sh
```

### 5.2 Recovery Procedure

```bash
# List available backups
ls -lh /backups/database/

# Restore from backup
gunzip < /backups/database/full_20251110_020000.sql.gz | psql sakshi_cafe_prod

# Verify restoration
psql sakshi_cafe_prod -c "SELECT COUNT(*) FROM orders;"
```

---

## 6. Monitoring & Logging

### 6.1 Application Monitoring

```bash
# Install PM2
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'sakshi-cafe-api',
    script: './dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }],
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6.2 Logging Setup

```bash
# Install ELK Stack or use cloud service
# For development, use Winston logger

# Create logger configuration
cat > server/utils/logger.ts << 'EOF'
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'sakshi-cafe-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
EOF
```

---

## 7. Performance Optimization

### 7.1 Caching Strategy

```bash
# Install Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Configure Redis caching
# In your application:
# - Cache API responses (5-60 minutes)
# - Cache user sessions (24 hours)
# - Cache menu items (1 hour)
```

### 7.2 Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_location ON orders(location_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX idx_customers_loyalty_tier ON customers(loyalty_tier);
CREATE INDEX idx_customers_total_spent ON customers(total_spent DESC);

CREATE INDEX idx_menu_items_location ON menu_items(location_id);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'pending';
```

---

## 8. Security Hardening

### 8.1 Application Security

```bash
# Update dependencies
pnpm update

# Security audit
pnpm audit

# Enable security headers
# Already configured in nginx.conf

# API rate limiting
# Already configured in nginx.conf
```

### 8.2 Database Security

```sql
-- Create read-only user for analytics
CREATE ROLE analytics_user WITH LOGIN PASSWORD 'analytics_password';
GRANT CONNECT ON DATABASE sakshi_cafe_prod TO analytics_user;
GRANT USAGE ON SCHEMA public TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Create backup user
CREATE ROLE backup_user WITH LOGIN PASSWORD 'backup_password';
GRANT CONNECT ON DATABASE sakshi_cafe_prod TO backup_user;
```

### 8.3 Firewall Configuration

```bash
# UFW firewall setup
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5432/tcp  # PostgreSQL (internal only)
```

---

## 9. Deployment Checklist

- [ ] Environment variables configured
- [ ] Database created and migrated
- [ ] SSL certificates installed
- [ ] Nginx configured and tested
- [ ] Docker images built and tested
- [ ] Backups configured and tested
- [ ] Monitoring and logging enabled
- [ ] Security hardening completed
- [ ] Performance optimization done
- [ ] Load testing completed
- [ ] Rollback plan documented
- [ ] Team trained on deployment process

---

## 10. Rollback Procedure

```bash
# If deployment fails, rollback to previous version
docker-compose down
docker pull sakshi-cafe:v1.0.0
docker-compose up -d

# Verify rollback
curl https://api.sakshicafe.com/health
```

---

## Support & Monitoring

- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry
- **Performance Monitoring**: New Relic, Datadog
- **Log Aggregation**: ELK Stack, Splunk
- **Incident Response**: PagerDuty

---

**Last Updated**: November 10, 2025
**Version**: 1.0.0
