import { Construct } from 'constructs';
import * as k8s from '@cdktf/provider-kubernetes';

export interface KubernetesWebAppDeploymentConfig {
    readonly image: string
    readonly replicas: number
    readonly app: string
    readonly component: string
    readonly environment: string
    readonly env?: Record<string, string>
};

export interface KubernetesNodePortServiceConfig {
    readonly port: number,
    readonly app: string,
    readonly component: string,
    readonly environment: string
}

export class KubernetesWebAppDeployment extends Construct {
    public readonly resource: k8s.deployment.Deployment;

    constructor(scope: Construct, name: string, config: KubernetesWebAppDeploymentConfig) {
        super(scope, name);

        this.resource = new k8s.deployment.Deployment(this, name, {
            metadata: {
                labels: {
                    app: config.app,
                    component: config.component,
                    environment: config.environment,
                },
                name: `${config.app}-${config.component}-${config.environment}`,
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
                        }
                    },
                    spec: {
                        container: [
                            {
                                image: config.image,
                                name: `${config.app}-${config.component}-${config.environment}`,
                                env: Object.entries(config.env || {}).map(([name, value]) => ({
                                    name,
                                    value,
                                })),
                            }
                        ]
                    }
                }
            },
        })
    }
}

export class KubernetesNodePortService extends Construct {
    public readonly resource: k8s.service.Service;

    constructor(scope: Construct, name: string, config: KubernetesNodePortServiceConfig) {
        super(scope, name);

        this.resource = new k8s.service.Service(this, name, {
            metadata: {
                name: `${config.app}-${config.component}-${config.environment}`,
            },
            spec: {
                type: 'NodePort',
                port: [
                    {
                        port: 80,
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