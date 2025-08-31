#!/bin/bash

# Script to check the health of the Letshangout application components

set -e

echo "================================================="
echo "Checking Letshangout Application Health"
echo "================================================="

# Get Minikube IP
MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "127.0.0.1")

# Check if namespace exists
echo "\nChecking namespace..."
if kubectl get namespace letshangout &>/dev/null; then
    echo "✅ Namespace 'letshangout' exists"
else
    echo "❌ Namespace 'letshangout' does not exist"
    exit 1
fi

# Check deployments
echo "\nChecking deployments..."
DEPLOYMENTS=("mysql" "go-backend" "react-app")
for deployment in "${DEPLOYMENTS[@]}"; do
    if kubectl get deployment $deployment -n letshangout &>/dev/null; then
        READY=$(kubectl get deployment $deployment -n letshangout -o jsonpath='{.status.readyReplicas}')
        DESIRED=$(kubectl get deployment $deployment -n letshangout -o jsonpath='{.spec.replicas}')
        if [ "$READY" == "$DESIRED" ]; then
            echo "✅ Deployment '$deployment' is healthy ($READY/$DESIRED replicas ready)"
        else
            echo "❌ Deployment '$deployment' is not healthy ($READY/$DESIRED replicas ready)"
        fi
    else
        echo "❌ Deployment '$deployment' does not exist"
    fi
done

# Check services
echo "\nChecking services..."
SERVICES=("mysql" "go-service" "react-service")
for service in "${SERVICES[@]}"; do
    if kubectl get service $service -n letshangout &>/dev/null; then
        echo "✅ Service '$service' exists"
    else
        echo "❌ Service '$service' does not exist"
    fi
done

# Check ingress
echo "\nChecking ingress..."
if kubectl get ingress letshangout-ingress -n letshangout &>/dev/null; then
    echo "✅ Ingress 'letshangout-ingress' exists"
else
    echo "❌ Ingress 'letshangout-ingress' does not exist"
fi

# Check frontend accessibility
echo "\nChecking frontend accessibility..."
FRONTEND_PORT=$(kubectl get service react-service -n letshangout -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)
if [ -n "$FRONTEND_PORT" ]; then
    FRONTEND_URL="http://$MINIKUBE_IP:$FRONTEND_PORT"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
    if [ "$HTTP_CODE" == "200" ]; then
        echo "✅ Frontend is accessible at $FRONTEND_URL"
    else
        echo "❌ Frontend is not accessible at $FRONTEND_URL (HTTP code: $HTTP_CODE)"
    fi
else
    echo "❌ Could not determine frontend port"
fi

# Check backend API accessibility
echo "\nChecking backend API accessibility..."
BACKEND_PORT=$(kubectl get service go-service -n letshangout -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)
if [ -n "$BACKEND_PORT" ]; then
    BACKEND_URL="http://$MINIKUBE_IP:$BACKEND_PORT/api"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL)
    if [ "$HTTP_CODE" == "200" ]; then
        echo "✅ Backend API is accessible at $BACKEND_URL"
    else
        echo "❌ Backend API is not accessible at $BACKEND_URL (HTTP code: $HTTP_CODE)"
    fi
else
    echo "❌ Could not determine backend port"
fi

# Check ingress accessibility
echo "\nChecking ingress accessibility..."
if grep -q "$MINIKUBE_IP letshangout.local" /etc/hosts; then
    echo "✅ Host entry for letshangout.local exists in /etc/hosts"
    
    # Check frontend via ingress
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://letshangout.local)
    if [ "$HTTP_CODE" == "200" ]; then
        echo "✅ Frontend is accessible via ingress at http://letshangout.local"
    else
        echo "❌ Frontend is not accessible via ingress at http://letshangout.local (HTTP code: $HTTP_CODE)"
    fi
    
    # Check backend via ingress
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://letshangout.local/api)
    if [ "$HTTP_CODE" == "200" ]; then
        echo "✅ Backend API is accessible via ingress at http://letshangout.local/api"
    else
        echo "❌ Backend API is not accessible via ingress at http://letshangout.local/api (HTTP code: $HTTP_CODE)"
        echo "   Note: This may be due to ingress configuration issues. Use the direct NodePort URL instead."
    fi
else
    echo "❌ Host entry for letshangout.local does not exist in /etc/hosts"
    echo "   Add this entry to your /etc/hosts file: $MINIKUBE_IP letshangout.local"
fi

echo "\n================================================="
echo "Summary of Access URLs"
echo "================================================="
echo "Frontend (direct): http://$MINIKUBE_IP:$FRONTEND_PORT"
echo "Backend API (direct): http://$MINIKUBE_IP:$BACKEND_PORT/api"
echo "Frontend (ingress): http://letshangout.local"
echo "Backend API (ingress): http://letshangout.local/api (may not work due to ingress configuration)"
echo "================================================="