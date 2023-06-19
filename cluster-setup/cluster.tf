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

      dynamic "extra_port_mappings" {
        content {
          container_port = extra_port_mappings.value
          host_port = extra_port_mappings.value
          listen_address = "0.0.0.0"
          protocol = extra_port_mappings.value == 80 || extra_port_mappings.value == 443 ? "TCP" : null
        }
      }
    }
  }
}