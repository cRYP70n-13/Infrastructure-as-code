import { Construct } from 'constructs';
import { App, TerraformStack } from 'cdktf';
import * as k8s from '@cdktf/provider-kubernetes';
import * as path from 'path';
import { SimpleKubernetesWebApp } from './constructs';
import { SimpleKubernetesWebAppConfig } from './constructs/types';

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: {
    frontend: SimpleKubernetesWebAppConfig;
    backend: SimpleKubernetesWebAppConfig;
  }){
    super(scope, name);

    new k8s.provider.KubernetesProvider(this, 'kind', {
      configPath: path.join(__dirname, '../kubeconfig.yaml'),
    });

    const appBackend = new SimpleKubernetesWebApp(this, 'app_backend', config.backend);
    new SimpleKubernetesWebApp(this, 'app_frontend', { ...config.frontend, env: { BACKEND_APP_URL: `http://localhost:${appBackend.config.port}`}});
  }
}

const app = new App();

new MyStack(app, 'infra', {
  frontend: {
    image: 'localhost:5000/nocorp-frontend:latest',
    replicas: 3,
    port: 30001,
    app: 'myapp',
    environment: 'dev',
    component: 'frontend',
  },
  backend: {
    image: 'localhost:5000/nocorp-backend:latest',
    replicas: 3,
    port: 30002,
    app: 'myapp',
    environment: 'dev',
    component: 'backend',
  }
});

app.synth();
