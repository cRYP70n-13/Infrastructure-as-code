import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import * as k8s from "@cdktf/provider-kubernetes";
import * as path from "path";
import { KubernetesWebAppDeployment, KubernetesNodePortService } from './constructs';

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new k8s.provider.KubernetesProvider(this, 'kind', {
      configPath: path.join(__dirname, '../kubeconfig.yaml'),
    });

    new KubernetesWebAppDeployment(this, 'deployment', {
      image: 'nginx:latest',
      replicas: 3,
      app: 'myapp',
      component: 'frontend',
      environment: 'dev',
    })

    new KubernetesNodePortService(this, 'service', {
      port: 30001,
      app: 'myapp',
      component: 'frontend',
      environment: 'dev'
    })
  }
}

const app = new App();
new MyStack(app, "infra");
app.synth();
