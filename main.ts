import { App, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { SimpleKubernetesWebApp } from './constructs';
import { SimpleKubernetesWebAppConfig } from './constructs/types';
import * as k8s from '@cdktf/provider-kubernetes';
import * as path from 'path';

class MyStack extends TerraformStack {
	constructor(scope: Construct, name: string, config: {
		frontend: SimpleKubernetesWebAppConfig;
		backend: SimpleKubernetesWebAppConfig;
	}) {
		super(scope, name);

		new k8s.provider.KubernetesProvider(this, 'kind', {
			configPath: path.join(__dirname, '../kubeconfig.yaml'),
		});

		// eslint-disable-next-line max-len
		const appBackend = new SimpleKubernetesWebApp(this, 'back', config.backend);
		new SimpleKubernetesWebApp(this, 'frontend', {
			...config.frontend,
			env: {
				BACKEND_APP_URL: `http://localhost:${appBackend.config.port}`
			}
		});

		// NOTE: So this is a pod that I built by my own now its time to deploy
		// Some docker images that I should build by my self and push them
		// To my registry then, deploy the pods.
		new k8s.pod.Pod(this, 'nginx', {
			metadata: {
				name: 'test-nginx',
				labels: {
					app: 'test',
				}
			},
			spec: {
				container: [{
					image: 'nginx:latest',
					name: 'test-container-with-cdktf',
					port: [{
						containerPort: 80,
					}]
				}]
			}
		})
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
