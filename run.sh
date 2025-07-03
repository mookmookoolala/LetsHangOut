#!/bin/bash

# Script to build and run the Letshangout application

set -e

function print_help {
  echo "Usage: ./run.sh [option]"
  echo "Options:"
  echo "  docker     - Run using Docker Compose"
  echo "  k8s        - Deploy to Kubernetes"
  echo "  minikube   - Deploy to Minikube"
  echo "  local      - Run locally without containers"
  echo "  build      - Build Docker images only"
  echo "  clean      - Clean up resources"
  echo "  help       - Show this help message"
}

function run_docker {
  echo "Starting application with Docker Compose..."
  docker-compose up --build
}

function deploy_k8s {
  echo "Building Docker images..."
  docker build -t go-backend:latest ./go-backend
  docker build -t react-app:latest ./react-app
  
  echo "Deploying to Kubernetes..."
  kubectl apply -f mysql/mysql-deployment.yaml
  kubectl apply -f go-backend/go-deployment.yaml
  kubectl apply -f react-app/react-deployment.yaml
  
  echo "Waiting for pods to be ready..."
  kubectl wait --for=condition=ready pod -l app=go-backend --timeout=120s
  kubectl wait --for=condition=ready pod -l app=react-app --timeout=120s
  
  echo "Services available at:"
  BACKEND_URL=$(kubectl get service go-service -o jsonpath='{.spec.clusterIP}')
  FRONTEND_PORT=$(kubectl get service react-service -o jsonpath='{.spec.ports[0].nodePort}')
  NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}')
  
  echo "Frontend: http://$NODE_IP:$FRONTEND_PORT"
  echo "Backend API: http://$BACKEND_URL:8080/api"
}

function deploy_minikube {
  # Check if minikube is running
  if ! minikube status &>/dev/null; then
    echo "Starting Minikube..."
    minikube start
  fi
  
  # Set docker to use minikube's docker daemon
  echo "Configuring Docker to use Minikube's Docker daemon..."
  eval $(minikube docker-env)
  
  echo "Building Docker images in Minikube's Docker daemon..."
  docker build -t go-backend:latest ./go-backend
  docker build -t react-app:latest ./react-app
  
  # Update deployment files to use local images
  echo "Updating deployment files to use local images..."
  sed -i 's/imagePullPolicy: Never/imagePullPolicy: IfNotPresent/g' ./go-backend/go-deployment.yaml
  sed -i 's/imagePullPolicy: Never/imagePullPolicy: IfNotPresent/g' ./react-app/react-deployment.yaml
  
  echo "Deploying to Minikube..."
  kubectl apply -f mysql/mysql-deployment.yaml
  kubectl apply -f go-backend/go-deployment.yaml
  kubectl apply -f react-app/react-deployment.yaml
  
  echo "Waiting for pods to be ready..."
  kubectl wait --for=condition=ready pod -l app=go-backend --timeout=120s
  kubectl wait --for=condition=ready pod -l app=react-app --timeout=120s
  
  # Get service URLs
  echo "Enabling services in Minikube..."
  minikube service list
  
  # Get Minikube IP
  MINIKUBE_IP=$(minikube ip)
  BACKEND_PORT=$(kubectl get service go-service -o jsonpath='{.spec.ports[0].nodePort}')
  FRONTEND_PORT=$(kubectl get service react-service -o jsonpath='{.spec.ports[0].nodePort}')
  
  echo "\nApplication deployed to Minikube successfully!"
  echo "Frontend: http://$MINIKUBE_IP:$FRONTEND_PORT"
  echo "Backend API: http://$MINIKUBE_IP:$BACKEND_PORT/api"
  echo "\nYou can also access the services using these commands:"
  echo "  Frontend: minikube service react-service"
  echo "  Backend: minikube service go-service"
}

function run_local {
  echo "Starting backend..."
  cd go-backend
  go run main.go &
  BACKEND_PID=$!
  cd ..
  
  echo "Starting frontend..."
  cd react-app
  npm install
  npm start &
  FRONTEND_PID=$!
  cd ..
  
  echo "Application running locally"
  echo "Frontend: http://localhost:3000"
  echo "Backend: http://localhost:8080"
  
  # Wait for Ctrl+C
  trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
  wait
}

function build_images {
  echo "Building Docker images..."
  docker build -t go-backend:latest ./go-backend
  docker build -t react-app:latest ./react-app
  echo "Images built successfully"
}

function clean_resources {
  echo "Cleaning up resources..."
  
  echo "Stopping Docker Compose services..."
  docker-compose down -v 2>/dev/null || true
  
  echo "Removing Kubernetes resources..."
  kubectl delete -f react-app/react-deployment.yaml 2>/dev/null || true
  kubectl delete -f go-backend/go-deployment.yaml 2>/dev/null || true
  kubectl delete -f mysql/mysql-deployment.yaml 2>/dev/null || true
  
  echo "Would you like to stop Minikube? (y/n)"
  read -r response
  if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Stopping Minikube..."
    minikube stop
  fi
  
  echo "Cleanup complete"
}

# Make the script executable
chmod +x "$0"

# Process command line arguments
if [ $# -eq 0 ]; then
  print_help
  exit 0
fi

case "$1" in
  docker)
    run_docker
    ;;
  k8s)
    deploy_k8s
    ;;
  minikube)
    deploy_minikube
    ;;
  local)
    run_local
    ;;
  build)
    build_images
    ;;
  clean)
    clean_resources
    ;;
  help)
    print_help
    ;;
  *)
    echo "Unknown option: $1"
    print_help
    exit 1
    ;;
esac