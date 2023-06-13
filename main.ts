import { Construct } from 'constructs';
import { App, TerraformStack } from 'cdktf';
import * as k8s from '@cdktf/provider-kubernetes';
import * as path from 'path';
import { SimpleKubernetesWebApp } from './constructs';

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new k8s.provider.KubernetesProvider(this, 'kind', {
      configPath: path.join(__dirname, '../kubeconfig.yaml'),
    });

    new SimpleKubernetesWebApp(this, 'app_frontend', {
      image: 'nginx:latest',
      replicas: 2,
      app: 'frontend',
      component: 'frontend',
      environment: 'dev',
      port: 30002,
    });
  }
}

const app = new App();
new MyStack(app, 'infra');
app.synth();
