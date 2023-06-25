import { Construct } from 'constructs';
import * as k8s from '@cdktf/provider-kubernetes';
import {
	KeycloakApplicationConfig,
	KeycloakDeploymentConfig,
	KeycloakNodePortConfig,
	keycloakClusterIPConfig
} from './types';
import { DeploymentSpecTemplateSpecContainerEnv } from '@cdktf/provider-kubernetes/lib/deployment';

export class KeycloakApp extends Construct {
	public readonly deployment: KeycloakDeployment;
	public readonly nodePortService: KeycloakNodePortService;
	public readonly clusterIPService: KeycloakClusterIPService;
	public readonly config : KeycloakApplicationConfig;

	constructor(
		scope: Construct,
		name: string,
		config: KeycloakApplicationConfig
	) {
		super(scope, name);

		this.config = config;
		this.deployment = new KeycloakDeployment(this, 'keycloak-deploy', {
			image: config.image,
			replicas: config.replicas,
			app: config.app,
			component: config.component,
			environment: config.environment,
			env: config.env,
		});

		this.nodePortService = new KeycloakNodePortService(this, 'keycloak-nodeport', {
			port: config.port,
			app: config.app,
			component: config.component,
			environment: config.environment,
		});

		this.clusterIPService = new KeycloakClusterIPService(this, 'keycloak-cluster-ip', {
			port: config.port,
			app: config.app,
			component: config.component,
			environment: config.environment,
		})
	}
}

export class KeycloakDeployment extends Construct {
	public readonly resource: k8s.deployment.Deployment;

	constructor(
		scope: Construct,
		name: string,
		config: KeycloakDeploymentConfig,
	) {
		super(scope, name);

		this.resource = new k8s.deployment.Deployment(this, name, {
			metadata: {
				name,
				labels: {
					app: config.app,
					component: config.component,
					environment: config.environment,
				},
			},
			spec: {
				replicas: config.replicas.toString(),
				selector: {
					matchLabels: {
						app: config.app,
						component: config.component,
						environment: config.environment,
					},
				},
				template: {
					metadata: {
						labels: {
							app: config.app,
							component: config.component,
							environment: config.environment,
						},
					},
					spec: {
						container: [
							{
								image: config.image,
								name: `${config.app}-${config.environment}-sso`,
								env: dumpEnvVars(config.env || {})
							}
						]
					},
				},
			},
		});
	}
}

export class KeycloakNodePortService extends Construct {
	public readonly resource: k8s.service.Service;

	constructor(
		scope: Construct,
		name: string,
		config: KeycloakNodePortConfig
	) {
		super(scope, name);

		this.resource = new k8s.service.Service(this, name, {
			metadata: {
				name: `${config.app}-${config.environment}-sso`,
			},
			spec: {
				type: 'NodePort',
				port: [
					{
						port: 80,
						// TODO: Change this to the real Keycloak port
						targetPort: '80',
						protocol: 'TCP',
						nodePort: config.port,
					}
				],
				selector: {
					app: config.app,
					component: config.component,
					environment: config.environment,
				}
			}
		});
	}
}

export class KeycloakClusterIPService extends Construct {
	public readonly resource: k8s.service.Service;

	constructor(
		scope: Construct,
		name: string,
		config: keycloakClusterIPConfig,
	) {
		super(scope, name);

		this.resource = new k8s.service.Service(this, name, {
			metadata: {
				name: `${config.app}-${config.environment}-sso-cluster-ip`,
			},
			spec: {
				port: [
					{
						port: 80,
						// TODO: Change this to the correct target port after the deployment
						targetPort: '80',
						protocol: 'TCP',
						name: 'HTTP'
					}
				],
				selector: {
					app: config.app,
					environment: config.environment,
					component: config.component,
				}
			},
		});
	}
}

type EnvVars = DeploymentSpecTemplateSpecContainerEnv[];

function dumpEnvVars(envVars: Record<string, string>): EnvVars {
	return Object.entries(envVars || {}).map(([name, value]) => ({
		name,
		value,
	}))
}