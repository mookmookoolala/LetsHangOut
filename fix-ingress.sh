#!/bin/bash

# Script to fix the ingress resource for the letshangout application

set -e

echo "Updating the Ingress resource with simpler configuration..."
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: letshangout-ingress
  namespace: letshangout
spec:
  rules:
  - host: letshangout.local
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: go-service
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: react-service
            port:
              number: 80
EOF

echo "Ingress resource updated. Checking status..."
kubectl get ingress -n letshangout

echo ""
echo "================================================="
echo "Add this entry to your /etc/hosts file (if not already added):"
echo "$(minikube ip) letshangout.local"
echo ""
echo "Then access the application at: http://letshangout.local"
echo "API should be accessible at: http://letshangout.local/api"
echo "================================================="