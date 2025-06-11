#!/bin/bash

# Attendre que MinIO soit prêt
echo "Waiting for MinIO to be ready..."
while ! curl -s http://localhost:9000/minio/health/live; do
    sleep 1
done

# Configurer MinIO Client
echo "Configuring MinIO Client..."
mc alias set local http://127.0.0.1:9000 minioadmin minioadmin

# Créer le bucket
echo "Creating S3 bucket..."
mc mb local/min-bucket

# Configurer les permissions du bucket
echo "Setting bucket policy..."
mc anonymous set download local/min-bucket

echo "MinIO initialization completed!"