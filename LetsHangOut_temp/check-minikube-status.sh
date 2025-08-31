#!/bin/bash

# Script to check the status of Letshangout application in Minikube

set -e

# Check if minikube is running
if ! minikube status &>/dev/null; then
    echo "Minikube is not running. Start it with: minikube start"
    exit 1
fi

# Detect which driver is being used
DRIVER=$(minikube profile list -o json | grep -o '"Driver":"[^"]*"' | head -1 | cut -d '"' -f 4)
echo "Detected Minikube driver: $DRIVER"

# Set variables based on driver
if [ "$DRIVER" = "none" ]; then
    IS_NONE_DRIVER=true
    echo "Using 'none' driver - services are available directly on the host"
else
    IS_NONE_DRIVER=false
fi

echo "=================================================="
echo "Minikube Status"
echo "=================================================="
minikube status

echo "\n=================================================="
echo "Kubernetes Resources"
echo "=================================================="

echo "\nPods:"
kubectl get pods -n letshangout

echo "\nServices:"
kubectl get services -n letshangout

echo "\nDeployments:"
kubectl get deployments -n letshangout

echo "\nIngress:"
kubectl get ingress -n letshangout

echo "\n=================================================="
echo "Access Information"
echo "=================================================="

# Get service NodePorts
FRONTEND_PORT=$(kubectl get service react-service -n letshangout -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "Not found")
BACKEND_PORT=$(kubectl get service go-service -n letshangout -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "Not found")

if [ "$IS_NONE_DRIVER" = true ]; then
    # For none driver, services are available on localhost
    HOST_IP="127.0.0.1"
    echo "\nHost IP: $HOST_IP (using 'none' driver)"
    
    if [ "$FRONTEND_PORT" != "Not found" ]; then
        echo "Frontend URL: http://$HOST_IP:$FRONTEND_PORT"
    fi
    
    if [ "$BACKEND_PORT" != "Not found" ]; then
        echo "Backend API URL: http://$HOST_IP:$BACKEND_PORT/api"
    fi
    
    echo "\nNote: When using the 'none' driver, the 'minikube service' command may not work as expected."
    echo "\n=================================================="
    echo "Minikube Dashboard"
    echo "=================================================="
    echo "With the 'none' driver, use kubectl proxy to access the dashboard:"
    echo "1. Run: kubectl proxy"
    echo "2. Access: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/"
else
    # Get Minikube IP for other drivers
    MINIKUBE_IP=$(minikube ip)
    echo "\nMinikube IP: $MINIKUBE_IP"
    
    if [ "$FRONTEND_PORT" != "Not found" ]; then
        echo "Frontend URL: http://$MINIKUBE_IP:$FRONTEND_PORT"
    fi
    
    if [ "$BACKEND_PORT" != "Not found" ]; then
        echo "Backend API URL: http://$MINIKUBE_IP:$BACKEND_PORT/api"
    fi
    
    echo "\nYou can also access the services using these commands:"
    echo "Frontend: minikube service react-service -n letshangout"
    echo "Backend: minikube service go-service -n letshangout"
    
    echo "\n=================================================="
    echo "Minikube Dashboard"
    echo "=================================================="
    echo "Run this command to open the Kubernetes Dashboard: minikube dashboard"
fi