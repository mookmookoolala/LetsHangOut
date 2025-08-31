# Deploying Letshangout to Minikube

This guide provides detailed instructions for deploying the Letshangout application to Minikube, a local Kubernetes environment.

## Prerequisites

- [Minikube](https://minikube.sigs.k8s.io/docs/start/) installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- [Docker](https://docs.docker.com/get-docker/) installed

## Driver Options

Minikube supports several drivers to run the Kubernetes cluster. The most common ones are:

- **Docker Driver** (default): Runs Kubernetes inside a Docker container. This is the recommended option for most users.
  - **Note**: The Docker driver should not be used with root privileges. If you're running as root, consider using the `none` driver or run Minikube as a non-root user.
  - To use Docker as a non-root user, make sure your user is in the Docker group: `sudo usermod -aG docker $USER && newgrp docker`

- **None Driver**: Runs Kubernetes components directly on the host. This is useful when running in a VM or when you want to avoid nested virtualization.
  - Requires root access
  - Provides better performance but less isolation
  - Recommended for advanced users only
  - Has several limitations and security considerations:
    - Decreased security (services may be available on the Internet)
    - Containers may have full access to your filesystem
    - No built-in resource limit mechanism
    - May interfere with other running software on the system
    - Only supports a single instance (profiles are not supported)
    - Some minikube commands are not supported (dashboard, mount, ssh)
    - Confusing permissions model (some commands need root, others need regular user)

You can specify the driver when starting Minikube:
```bash
minikube start --driver=docker  # Default for most installations
# OR
sudo minikube start --driver=none  # When running as root or in a VM
```

## Quick Start

For a quick setup, use the provided script:

```bash
./minikube-setup.sh
```

This script will:
1. Start Minikube if it's not running
2. Enable necessary Minikube addons
3. Configure Docker to use Minikube's Docker daemon
4. Build the Docker images within Minikube
5. Deploy the application to Minikube
6. Set up an Ingress for easier access
7. Display access information

## Manual Setup

If you prefer to set up manually or want to understand the process better, follow these steps:

### 1. Start Minikube

```bash
minikube start
```

### 2. Configure Docker to use Minikube's Docker daemon

```bash
eval $(minikube docker-env)
```

This command configures your terminal session to use Minikube's Docker daemon. Any Docker images you build after running this command will be available to Minikube without needing to push them to a registry.

### 3. Build the Docker images

```bash
docker build -t go-backend:latest ./go-backend
docker build -t react-app:latest ./react-app
```

### 4. Update deployment files

Ensure the deployment files use the correct image pull policy:

```bash
sed -i 's/imagePullPolicy: Never/imagePullPolicy: IfNotPresent/g' ./go-backend/go-deployment.yaml
sed -i 's/imagePullPolicy: Never/imagePullPolicy: IfNotPresent/g' ./react-app/react-deployment.yaml
```

### 5. Deploy the application

```bash
kubectl apply -f mysql/mysql-deployment.yaml
kubectl apply -f go-backend/go-deployment.yaml
kubectl apply -f react-app/react-deployment.yaml
```

### 6. Access the application

Get the Minikube IP and service NodePorts:

```bash
MINIKUBE_IP=$(minikube ip)
FRONTEND_PORT=$(kubectl get service react-service -o jsonpath='{.spec.ports[0].nodePort}')
BACKEND_PORT=$(kubectl get service go-service -o jsonpath='{.spec.ports[0].nodePort}')

echo "Frontend: http://$MINIKUBE_IP:$FRONTEND_PORT"
echo "Backend API: http://$MINIKUBE_IP:$BACKEND_PORT/api"
```

Or use Minikube's service command to open the services directly:

```bash
minikube service react-service
minikube service go-service
```

## Setting up Ingress (Optional)

For a more production-like setup, you can configure an Ingress:

1. Enable the Ingress addon:

```bash
minikube addons enable ingress
```

2. Create an Ingress resource:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: letshangout-ingress
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
```

3. Add an entry to your hosts file:

```bash
echo "$(minikube ip) letshangout.local" | sudo tee -a /etc/hosts
```

4. Access the application at http://letshangout.local

## Troubleshooting

### Pods are not starting

Check the status of your pods:

```bash
kubectl get pods
kubectl describe pod <pod-name>
```

### Services are not accessible

Ensure the services are properly exposed:

```bash
kubectl get services
minikube service list
```

If services are still not accessible, try running:

```bash
minikube tunnel
```

This command creates a route to services deployed with type LoadBalancer and sets their Ingress to their ClusterIP.

### Images are not found

Verify that your images are available in Minikube's Docker daemon:

```bash
minikube ssh 'docker images'
```

If images are not listed, ensure you've configured Docker to use Minikube's Docker daemon with `eval $(minikube docker-env)` before building the images.

### 'None' Driver Specific Issues

#### Permission denied errors

If you encounter permission denied errors with the 'none' driver, try:

```bash
sudo sysctl fs.protected_regular=0
```

#### CoreDNS CrashLoopBackOff

If CoreDNS goes into CrashLoopBackOff due to a resolver loop, check your `/etc/resolv.conf` configuration.

#### Docker version compatibility

If your Linux has a newer Docker version than what Kubernetes expects, you may need to specify the Kubernetes version:

```bash
sudo minikube start --driver=none --kubernetes-version v1.20.0
```

#### Debugging crashes

For detailed logs to debug crashes with the 'none' driver:

```bash
sudo minikube start --driver=none --alsologtostderr -v=4
```

## Cleaning Up

To remove the deployed resources:

```bash
kubectl delete -f react-app/react-deployment.yaml
kubectl delete -f go-backend/go-deployment.yaml
kubectl delete -f mysql/mysql-deployment.yaml
```

To stop Minikube:

```bash
minikube stop
```

Or to delete the Minikube cluster entirely:

```bash
minikube delete
```

### Cleaning Up After Using the 'None' Driver

When using the 'none' driver, Minikube modifies system paths. After deleting the cluster, you may want to check these locations:

- `/etc/kubernetes` - configuration files
- `/data/minikube`
- `/var/lib/minikube`

If you're running as root and used the 'none' driver, you should run:

```bash
sudo minikube delete
```

Note that the 'none' driver may leave more artifacts on your system than other drivers due to its direct integration with the host.