provider "google" {
  project = "your-gcp-project-id"
  region  = "asia-southeast1"
}

resource "google_container_cluster" "primary" {
  name     = "my-gke-cluster"
  location = "asia-southeast1"

  initial_node_count = 3

  node_config {
    machine_type = "e2-medium"
  }
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "primary-node-pool"
  location   = "asia-southeast1"
  cluster    = google_container_cluster.primary.name

  node_config {
    preemptible  = true
    machine_type = "e2-medium"
    oauth_scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  initial_node_count = 3
}

resource "google_firestore_document" "default" {
  collection  = "settings"
  document_id = "default"
  fields      = jsonencode({
    "exampleField" = "exampleValue"
  })
}
