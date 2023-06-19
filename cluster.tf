terraform {
  required_providers {
    kind = {
      source  = "tehcyx/kind"
      version = "0.2.0"
    }
  }
}

provider "kind" {}

resource "kind_cluster" "default" {
  name           = "test-cluster"
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"
    containerd_config_patches = [
      <<-EOT
        [plugins."io.containerd.grpc.v1.cri".registry.mirrors."localhost:5000"]
            endpoint = ["http://local-registry:5000"]
        EOT
    ]

    node {
      role = "control-plane"
      extra_port_mappings {
        container_port = 30005
        host_port      = 30005
        listen_address = "0.0.0.0"
      }

      extra_port_mappings {
        container_port = 30006
        host_port      = 30006
        listen_address = "0.0.0.0"
      }

      extra_port_mappings {
        container_port = 30007
        host_port      = 30007
        listen_address = "0.0.0.0"
      }

      extra_port_mappings {
        container_port = 30008
        host_port      = 30008
        listen_address = "0.0.0.0"
      }

      extra_port_mappings {
        container_port = 80
        host_port      = 80
        protocol       = "TCP"
        listen_address = "0.0.0.0"
      }

      extra_port_mappings {
        container_port = 443
        host_port      = 443
        protocol       = "TCP"
        listen_address = "0.0.0.0"
      }
    }
  }
}