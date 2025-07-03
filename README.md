# Letshangout Application

A full-stack application with a React frontend and Go backend.

## Project Structure

- `go-backend/`: Go backend API server
- `react-app/`: React frontend application
- `mysql/`: MySQL database configuration

## Prerequisites

- Docker and Docker Compose (for local development)
- Kubernetes or Minikube (for deployment)
- Node.js and npm (for frontend development)
- Go (for backend development)

## Local Development

### Backend (Go)

1. Navigate to the backend directory:
   ```
   cd go-backend
   ```

2. Run the Go application:
   ```
   go run main.go
   ```

   The backend will be available at http://localhost:8080

### Frontend (React)

1. Navigate to the frontend directory:
   ```
   cd react-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

   The frontend will be available at http://localhost:3000

## Kubernetes Deployment

### Standard Kubernetes

1. Build the Docker images:
   ```
   docker build -t go-backend:latest ./go-backend
   docker build -t react-app:latest ./react-app
   ```

2. Apply the Kubernetes configurations:
   ```
   kubectl apply -f mysql/mysql-deployment.yaml
   kubectl apply -f go-backend/go-deployment.yaml
   kubectl apply -f react-app/react-deployment.yaml
   ```

3. Access the application:
   - Frontend: http://[node-ip]:30001
   - Backend API: http://[node-ip]:30002

### Minikube Deployment

For a quick setup with Minikube, use the provided script:

```bash
./minikube-setup.sh
```

This script automates the entire deployment process for Minikube and handles driver selection:

- If running as a regular user, it will use the Docker driver (recommended)
- If running as root, it will prompt you to choose between:
  - Using the 'none' driver (recommended for root users)
  - Forcing the Docker driver with root (not recommended)
  - Exiting to run as a non-root user

**Note**: The Docker driver should not be used with root privileges. If you're running as root, the script will guide you through the appropriate options.

For detailed instructions and troubleshooting for Minikube deployment, see the [Minikube Guide](./MINIKUBE.md).

### Using the Helper Script

For convenience, you can use the provided `run.sh` script:

```
# For standard Kubernetes deployment
./run.sh k8s

# For Minikube deployment
./run.sh minikube

# For local development with Docker Compose
./run.sh docker

# For running locally without containers
./run.sh local
```

## API Endpoints

- `GET /`: Welcome message
- `GET /api`: Returns JSON data from the backend

## Troubleshooting

- If the frontend cannot connect to the backend, check that the backend URL is correctly set in the React app's environment variables.
- For Kubernetes deployments, ensure all services are running with `kubectl get pods` and `kubectl get services`.
- For Minikube deployments:
  - Ensure Minikube is running with `minikube status`
  - If services aren't accessible, try `minikube tunnel` in a separate terminal
  - Check if images are properly loaded with `minikube ssh 'docker images'` (not applicable for 'none' driver)
  - Verify the correct NodePorts are being used with `kubectl get services`
  - If running as root and getting errors with the Docker driver, use the 'none' driver instead
  - For detailed status information, run the provided script: `./check-minikube-status.sh`

### Common Minikube Issues

- **Root privileges error**: If you see `The "docker" driver should not be used with root privileges`, either:
  - Run Minikube as a non-root user
  - Use the 'none' driver with `sudo minikube start --driver=none`
  - Force using Docker with root: `sudo minikube start --driver=docker --force` (not recommended)

- **Driver-specific issues**: Different drivers have different characteristics and limitations. See the [Minikube Guide](./MINIKUBE.md) for driver-specific troubleshooting.