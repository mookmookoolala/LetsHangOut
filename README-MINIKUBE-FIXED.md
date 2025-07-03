# Letshangout Application - Minikube Deployment Guide

This guide provides instructions for deploying the Letshangout application to Minikube, a local Kubernetes environment. The application consists of a React frontend, Go backend, and MySQL database.

## Prerequisites

- [Minikube](https://minikube.sigs.k8s.io/docs/start/) installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- [Docker](https://docs.docker.com/get-docker/) installed

## Quick Start

For a quick setup, use the provided script:

```bash
./minikube-setup.sh
```

This script will:
1. Start Minikube if it's not running
2. Enable necessary Minikube addons (ingress, dashboard, metrics-server)
3. Configure Docker to use Minikube's Docker daemon
4. Build the Docker images within Minikube
5. Deploy the application to Minikube in the `letshangout` namespace
6. Set up an Ingress for easier access
7. Display access information

## Checking Application Status

To check the status of your Minikube cluster and the Letshangout application, use the provided script:

```bash
./check-minikube-status.sh
```

This script will display:
1. Minikube status
2. Kubernetes resources in the `letshangout` namespace (pods, services, deployments, ingress)
3. Access information for the application

## Accessing the Application

The application can be accessed in several ways:

### Using NodePort Services

The React frontend and Go backend are exposed as NodePort services:

- Frontend: http://<minikube-ip>:30003
- Backend API: http://<minikube-ip>:30004/api

You can get the Minikube IP with:

```bash
minikube ip
```

Or use Minikube's service command to open the services directly:

```bash
minikube service react-service -n letshangout
minikube service go-service -n letshangout
```

### Using Ingress

The application is also accessible via Ingress. Add this entry to your `/etc/hosts` file:

```
<minikube-ip> letshangout.local
```

Then access the application at http://letshangout.local

To apply or update the Ingress resource, use the provided script:

```bash
./apply-ingress.sh
```

**Note:** There may be issues with the Ingress controller properly routing to the backend API. If you encounter problems accessing the API through the Ingress (http://letshangout.local/api), you can use the direct NodePort URL instead (http://<minikube-ip>:30004/api).

## Troubleshooting

### Port Conflicts

If you encounter port conflicts when deploying the services, you may need to modify the NodePort values in the deployment files:

- `react-app/react-deployment.yaml` - NodePort 30003 for the frontend
- `go-backend/go-deployment.yaml` - NodePort 30004 for the backend

### Namespace Issues

All resources are deployed in the `letshangout` namespace. When using kubectl commands, make sure to specify the namespace:

```bash
kubectl get pods -n letshangout
kubectl get services -n letshangout
```

### Pods Not Starting

Check the status of your pods:

```bash
kubectl get pods -n letshangout
kubectl describe pod <pod-name> -n letshangout
```

### Services Not Accessible

Ensure the services are properly exposed:

```bash
kubectl get services -n letshangout
minikube service list
```

## Cleaning Up

To remove the deployed resources:

```bash
kubectl delete namespace letshangout
```

To stop Minikube:

```bash
minikube stop
```

Or to delete the Minikube cluster entirely:

```bash
minikube delete
```

## Driver Options

Minikube supports several drivers to run the Kubernetes cluster. The most common ones are:

- **Docker Driver** (default): Runs Kubernetes inside a Docker container. This is the recommended option for most users.
  - **Note**: The Docker driver should not be used with root privileges. If you're running as root, consider using the `none` driver or run Minikube as a non-root user.

- **None Driver**: Runs Kubernetes components directly on the host. This is useful when running in a VM or when you want to avoid nested virtualization.
  - Requires root access
  - Provides better performance but less isolation
  - Recommended for advanced users only

The `minikube-setup.sh` script will help you choose the appropriate driver based on your user privileges.