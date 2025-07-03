#!/bin/bash

# Minikube setup script for Letshangout application

set -e

# Check if minikube is installed
if ! command -v minikube &> /dev/null; then
    echo "Minikube is not installed. Please install it first."
    exit 1
fi

# Check if running as root and determine appropriate driver
USE_NONE_DRIVER=false
FORCE_DOCKER=false

if [ "$(id -u)" -eq 0 ]; then
    echo "Running as root user. The Docker driver should not be used with root privileges."
    echo "Options:"
    echo "  1. Use the 'none' driver (recommended for root users)"
    echo "  2. Force using Docker driver with root (not recommended)"
    echo "  3. Exit and run as non-root user"
    read -p "Select option [1-3]: " choice
    
    case $choice in
        1)
            USE_NONE_DRIVER=true
            echo "Using 'none' driver..."
            ;;
        2)
            FORCE_DOCKER=true
            echo "Forcing Docker driver with root privileges..."
            ;;
        3)
            echo "Exiting. Please run this script as a non-root user."
            exit 0
            ;;
        *)
            echo "Invalid option. Exiting."
            exit 1
            ;;
    esac
fi

# Start minikube if not running
if ! minikube status &> /dev/null; then
    echo "Starting Minikube..."
    if [ "$USE_NONE_DRIVER" = true ]; then
        minikube start --driver=none
    elif [ "$FORCE_DOCKER" = true ]; then
        minikube start --driver=docker --force
    else
        minikube start
    fi
fi

# Enable necessary addons
echo "Enabling Minikube addons..."
minikube addons enable ingress
minikube addons enable dashboard
minikube addons enable metrics-server

# Configure Docker environment based on driver
if [ "$USE_NONE_DRIVER" = true ]; then
    echo "Using 'none' driver - no need to configure Docker environment"
    # When using none driver, we'll use the host's Docker directly
    # Check if Docker is running
    if ! systemctl is-active --quiet docker; then
        echo "Docker is not running. Starting Docker..."
        systemctl start docker
    fi
else
    # Set docker to use minikube's docker daemon
    echo "Configuring Docker to use Minikube's Docker daemon..."
    eval $(minikube docker-env)
fi

# Create a namespace for the application
echo "Creating namespace 'letshangout'..."
kubectl create namespace letshangout 2>/dev/null || true

# Set the current context to use the namespace
kubectl config set-context --current --namespace=letshangout

# Build the Docker images
if [ "$USE_NONE_DRIVER" = true ]; then
    echo "Building Docker images using host Docker..."
    # For none driver, we need to tag images so they're available to Kubernetes
    docker build -t localhost/go-backend:latest ./go-backend
    docker build -t localhost/react-app:latest ./react-app
    
    # Update deployment files to use local images with proper tags
    sed -i 's|image: go-backend:latest|image: localhost/go-backend:latest|g' ./go-backend/go-deployment.yaml
    sed -i 's|image: react-app:latest|image: localhost/react-app:latest|g' ./react-app/react-deployment.yaml
else
    echo "Building Docker images in Minikube's Docker daemon..."
    docker build -t go-backend:latest ./go-backend
    docker build -t react-app:latest ./react-app
fi

# Create a ConfigMap for environment variables
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: letshangout-config
  namespace: letshangout
data:
  REACT_APP_BACKEND_URL: "http://\$(GO_SERVICE_SERVICE_HOST):\$(GO_SERVICE_SERVICE_PORT)/api"
  DB_HOST: "mysql"
  DB_PORT: "3306"
  DB_USER: "root"
  DB_PASSWORD: "my-secret-pw"
  DB_NAME: "lets_hang_out"
EOF

# Update deployment files to use appropriate image pull policy
sed -i 's/imagePullPolicy: Never/imagePullPolicy: IfNotPresent/g' ./go-backend/go-deployment.yaml
sed -i 's/imagePullPolicy: Never/imagePullPolicy: IfNotPresent/g' ./react-app/react-deployment.yaml

# Deploy the application
echo "Deploying to Minikube..."
kubectl apply -f mysql/mysql-deployment.yaml
kubectl apply -f go-backend/go-deployment.yaml
kubectl apply -f react-app/react-deployment.yaml

# Wait for pods to be ready
echo "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=go-backend --timeout=120s
kubectl wait --for=condition=ready pod -l app=react-app --timeout=120s

# Create an Ingress resource for easier access
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: letshangout-ingress
  namespace: letshangout
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: letshangout.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: react-service
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: go-service
            port:
              number: 8080
EOF

# Apply the ingress resource
kubectl get ingress -n letshangout

# Display access information based on driver
echo ""
echo "=================================================="
echo "Letshangout Application deployed to Minikube!"
echo "=================================================="
echo ""

if [ "$USE_NONE_DRIVER" = true ]; then
    # For none driver, services are available directly on the host
    HOST_IP="127.0.0.1"
    echo "Using 'none' driver - services are available directly on the host"
    echo ""
    echo "Access the services at:"
    echo "Frontend: http://$HOST_IP:$(kubectl get service react-service -n letshangout -o jsonpath='{.spec.ports[0].nodePort}')"
    echo "Backend API: http://$HOST_IP:$(kubectl get service go-service -n letshangout -o jsonpath='{.spec.ports[0].nodePort}')/api"
    echo ""
    echo "Add this entry to your /etc/hosts file for Ingress access:"
    echo "$HOST_IP letshangout.local"
    echo "Then access the application at: http://letshangout.local"
    echo ""
    echo "Note: When using the 'none' driver, some Minikube commands like 'minikube service' and 'minikube dashboard' may not work as expected."
    echo "To view the Kubernetes Dashboard, run: kubectl proxy"
    echo "Then access: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/"
else
    # Get Minikube IP for Docker driver
    MINIKUBE_IP=$(minikube ip)
    echo "Add this entry to your /etc/hosts file:"
    echo "$MINIKUBE_IP letshangout.local"
    echo ""
    echo "Then access the application at: http://letshangout.local"
    echo ""
    echo "Alternatively, you can access the services directly:"
    echo "Frontend: http://$MINIKUBE_IP:$(kubectl get service react-service -n letshangout -o jsonpath='{.spec.ports[0].nodePort}')"
    echo "Backend API: http://$MINIKUBE_IP:$(kubectl get service go-service -n letshangout -o jsonpath='{.spec.ports[0].nodePort}')/api"
    echo ""
    echo "Or use these commands to open the services in your browser:"
    echo "Frontend: minikube service react-service -n letshangout"
    echo "Backend: minikube service go-service -n letshangout"
    echo ""
    echo "To view the Kubernetes Dashboard, run: minikube dashboard"
fi