#!/bin/bash

# Script to apply the ingress resource to the letshangout namespace

set -e

echo "Creating an Ingress resource for easier access..."
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

echo "Ingress resource created. Checking status..."
kubectl get ingress -n letshangout

# Get Minikube IP
MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "127.0.0.1")

echo ""
echo "================================================="
echo "Add this entry to your /etc/hosts file:"
echo "$MINIKUBE_IP letshangout.local"
echo ""
echo "Then access the application at: http://letshangout.local"
echo "================================================="