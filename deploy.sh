#!/bin/bash 
set -euo pipefail 

LOG_DIR="/var/log/letshangout" 
GO_BINARY="/tmp/app" 
GO_SRC_DIR="/home/LetsHangOut/go-backend" 
REACT_DIR="/home/LetsHangOut/react-app" 
REACT_BUILD_DIR="${REACT_DIR}/build" 
REACT_DEPLOY_DIR="/var/www/letshangout" 
GO_LOG="${LOG_DIR}/go-backend.log" 

# Create log directory if not exists 
mkdir -p "${LOG_DIR}" 

echo "Starting deployment at $(date)" 

# Step 1: Build Go backend 
echo "Building Go backend..." 
cd "${GO_SRC_DIR}" 
go build -buildvcs=false -o "${GO_BINARY}" 

# Step 2: Stop existing Go backend process 
echo "Stopping previous Go backend process if any..." 
if pgrep -f "${GO_BINARY}" > /dev/null; then 
    pkill -f "${GO_BINARY}" 
    echo "Previous Go backend stopped." 
else 
    echo "No existing Go backend process found." 
fi 

# Step 3: Start Go backend 
echo "Starting Go backend..." 
nohup "${GO_BINARY}" > "${GO_LOG}" 2>&1 & 
echo "Go backend started, logging to ${GO_LOG}" 

# Step 4: Build React frontend 
echo "Building React frontend..." 
cd "${REACT_DIR}" 
npm install 
# Disable CI to avoid build warnings breaking process 
CI='' npm run build 

# Step 5: Deploy React build 
echo "Deploying React build to ${REACT_DEPLOY_DIR}" 
sudo rm -rf "${REACT_DEPLOY_DIR:?}"/*    # avoid rm -rf on empty variables 
sudo cp -r "${REACT_BUILD_DIR}"/* "${REACT_DEPLOY_DIR}/" 
sudo chown -R nginx:nginx "${REACT_DEPLOY_DIR}" 

echo "Deployment completed at $(date)"