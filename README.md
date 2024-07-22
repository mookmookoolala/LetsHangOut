# Let's Hang Out
## Overview
Let's Hang Out is a full-stack web application designed to help friends coordinate their hangouts by proposing and voting on available dates and places. The frontend is built with React, and the backend is built with Go, both containerized using Docker and deployed on a Kubernetes cluster.

### Project Structure
```
my-project/
├── react-app/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.js
│   │   │   ├── About.js
│   │   │   ├── Contact.js
│   │   ├── App.js
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
├── go-backend/
│   ├── main.go
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
├── react-deployment.yaml
├── go-deployment.yaml
├── README.md
```

### Prerequisites
Docker
Kubernetes (Minikube)
Node.js
Go
NGINX (optional for custom domain)
Setup Instructions
Bold text and bullet points are used for emphasis in these steps.

#### 1. Clone the Repository
```
git clone https://github.com/your-username/my-project.git
cd my-project
```

#### 2. Build Docker Images
React App:

```
cd react-app
docker build -t your-docker-username/react-app:latest .
cd ..
```

Go Backend:

```
cd go-backend
docker build -t your-docker-username/go-backend:latest .
cd ..
```

#### Optional: Push Docker Images to Docker Hub

If you plan to deploy the application to a remote server, follow these steps to push the images to your Docker Hub account:

Tag the images with your username:
```
docker tag react-app:latest your-docker-username/react-app:latest
docker tag go-backend:latest your-docker-username/go-backend:latest
```

Push the images to Docker Hub:
```
docker push your-docker-username/react-app:latest
docker push your-docker-username/go-backend:latest
```

#### 4. Deploy to Kubernetes
Deploy the React and Go backend services using the provided YAML files:

```
kubectl apply -f react-deployment.yaml
kubectl apply -f go-deployment.yaml
```

#### 5. Configure and Restart NGINX (Optional)
This step is only necessary if you want to access the application using a custom domain.

Update the /etc/nginx/nginx.conf file to route requests to the Minikube services. Refer to the NGINX Configuration file for detailed instructions on configuration.

```
sudo systemctl restart nginx
```

Access the Application
Open your browser and navigate to http://yourdomain.com (or your Minikube IP address if using a local deployment) to view the React application.

### Technologies Used
```
Frontend: React
Backend: Go
Containerization: Docker
Orchestration: Kubernetes
Reverse Proxy: NGINX (optional)
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.


Additional Documentation
Dockerfile for React App
Dockerfile for Go Backend
Kubernetes Deployment for React App
Kubernetes Deployment for Go Backend
NGINX Configuration (if applicable)







