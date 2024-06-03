# Full Stack Application Deployment on Google Cloud

## High-Level Architecture

### User Interface (UI)
- **Technology:** React (front-end framework)
- **Purpose:** Provides the interface through which users interact with the application.

### API Gateway (Optional)
- **Technology:** Google Cloud Endpoints
- **Purpose:** Manages and routes HTTP requests from the UI to the back-end services, providing additional security features like request throttling and authentication.

### Back-End Services
- **Technology:** Go with Gin (web framework)
- **Purpose:** Handles business logic, processes requests, and interacts with the database.

### Database
- **Technology:** Google Cloud Firestore (NoSQL database)
- **Purpose:** Stores application data, such as user information, lobbies, availability, and votes.

### Containerization and Orchestration
- **Technology:** Docker, Google Kubernetes Engine (GKE)
- **Purpose:** Containerizes the application and orchestrates the deployment and scaling of containers.

### Continuous Integration and Continuous Deployment (CI/CD)
- **Technology:** Google Cloud Build, Google Cloud Deploy
- **Purpose:** Automates the build, test, and deployment processes.

### Monitoring and Logging
- **Technology:** Google Cloud Monitoring, Google Cloud Logging
- **Purpose:** Monitors application performance, logs events, and sets up alerts for specific metrics.

## Detailed System Design

### User Interface (UI) Components
- **Lobby Creation:** Allows users to create a new lobby with a unique code.
- **Calendar:** Allows users to select their availability.
- **Propose Places:** Allows users to propose meeting places.
- **Voting System:** Allows users to vote on proposed places.

**Interactions:**
- User actions trigger API calls to the back-end services.
- Responses from the back-end are rendered in the UI.

### API Gateway (Optional)
- **Role:** Manages HTTP requests and routes them to the appropriate back-end services.
- **Security:** Provides additional security features, such as request throttling and authentication.

### Back-End Services Components
- **Authentication:** Handles user registration and login using JWT.
- **Lobby Management:** Manages lobby creation, retrieval, and updates.
- **Availability Management:** Manages user availability data.
- **Voting Management:** Manages proposal and voting data.

**Interactions:**
- Receives HTTP requests from the UI or API Gateway.
- Processes requests, performs business logic, and interacts with the database.
- Sends responses back to the UI or API Gateway.

### Database Tables
- **Users:** Stores user information.
- **Lobbies:** Stores lobby details.
- **Availability:** Stores user availability for each lobby.
- **Votes:** Stores proposed places and votes.

**Interactions:**
- Back-end services perform CRUD operations on the database.
- Data is retrieved, stored, updated, or deleted based on business logic.

### Containerization and Orchestration

**Docker:**
- Containerizes the front-end and back-end applications for consistency across different environments.
- Dockerfiles define the environment and dependencies for each application.

**Google Kubernetes Engine (GKE):**
- Manages the deployment, scaling, and load balancing of Docker containers.
- Removes the need to manage underlying server infrastructure.

### Continuous Integration and Continuous Deployment (CI/CD)

**Google Cloud Build:**
- Automates the end-to-end build, test, and deployment process.
- Triggers builds and deployments based on code changes in the source repository.

**Google Cloud Deploy:**
- Deploys the application to GKE.

### Monitoring and Logging

**Google Cloud Monitoring:**
- Collects and stores logs from the application and infrastructure.
- Monitors metrics such as CPU usage, memory usage, and response times.
- Sets up alarms to notify when specific thresholds are breached.

## Practical Steps

### Set Up Your Development Environment

1. **Install Dependencies:**
   - Node.js and npm for React.
   - Go for backend development.
   - Docker for containerization.

2. **Initialize Projects:**
   - **React Front-End:**
     ```bash
     npx create-react-app my-app
     cd my-app
     ```

   - **Go Back-End:**
     ```bash
     mkdir backend
     cd backend
     go mod init backend
     go get github.com/gin-gonic/gin
     ```

### Define Infrastructure as Code

Use Terraform or Google Cloud Deployment Manager to define your GCP infrastructure.

**Example Terraform Configuration:**
```hcl
provider "google" {
  project = "your-gcp-project-id"
  region  = "us-central1"
}

resource "google_container_cluster" "primary" {
  name     = "my-gke-cluster"
  location = "us-central1"

  initial_node_count = 3

  node_config {
    machine_type = "e2-medium"
  }
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "primary-node-pool"
  location   = "us-central1"
  cluster    = google_container_cluster.primary.name

  node_config {
    preemptible  = true
    machine_type = "e2-medium"
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }

  initial_node_count = 3
}

resource "google_firestore_document" "default" {
  collection = "settings"
  document_id = "default"
  fields = jsonencode({
    "exampleField" = "exampleValue"
  })
}
