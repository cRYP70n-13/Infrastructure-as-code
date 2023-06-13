import "cdktf/lib/testing/adapters/jest";
import { Testing } from "cdktf";
import * as kubernetes from "@cdktf/provider-kubernetes";
import {
  KubernetesNodePortService,
  KubernetesWebAppDeployment,
  SimpleKubernetesWebApp,
} from "./../constructs/kubernetes-web-app";

describe("Initial Test for the construct", () => {
  describe("KubernetesWebAppDeployment", () => {
    it("Should contain a deployment resource", () => {
      expect(
        Testing.synthScope((scope) => {
          new KubernetesWebAppDeployment(scope, "myapp-frontend-dev", {
            image: "nginx:latest",
            replicas: 3,
            app: "myapp",
            component: "frontend",
            environment: "dev",
          });
        })
      ).toHaveResource(kubernetes.deployment.Deployment);
    });
  });

  describe("KubernetesWebApNodePortService", () => {
    it("Should contain a service resource", () => {
      expect(
        Testing.synthScope((scope) => {
          new KubernetesNodePortService(scope, "myapp-frontend-dev", {
            port: 30001,
            app: "myapp",
            component: "frontend",
            environment: "dev",
          });
        })
      ).toHaveResource(kubernetes.service.Service);
    });
  });

  describe("SimpleKubernetesWebApp", () => {
    it("should contain a Service resource", () => {
      expect(
        Testing.synthScope((scope) => {
          new SimpleKubernetesWebApp(scope, "myapp-frontend-dev", {
            image: "nginx:latest",
            replicas: 4,
            app: "myapp",
            component: "frontent",
            environment: "dev",
            port: 30001,
          });
        })
      ).toHaveResource(kubernetes.service.Service);
    });

    it("should contain a Deployment resource", () => {
      expect(
        Testing.synthScope((scope) => {
          new SimpleKubernetesWebApp(scope, "myapp-frontend-dev", {
            image: "nginx:latest",
            replicas: 4,
            app: "myapp",
            component: "frontent",
            environment: "dev",
            port: 30001,
          });
        })
      ).toHaveResource(kubernetes.deployment.Deployment);
    });
  });
});
