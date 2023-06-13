import { Construct } from 'constructs';
import * as k8s from '@cdktf/provider-kubernetes';
import { TerraformOutput } from 'cdktf';

export interface KubernetesWebAppDeploymentConfig {
    readonly image: string;
    readonly replicas: number;
    readonly app: string;
    readonly component: string;
    readonly environment: string;
    readonly env?: Record<string, string>;
}

export interface KubernetesNodePortServiceConfig {
    readonly port: number;
    readonly app: string;
    readonly component: string;
    readonly environment: string;
}

export type SimpleKubernetesWebAppConfig = KubernetesWebAppDeploymentConfig & KubernetesNodePortServiceConfig;

export class SimpleKubernetesWebApp extends Construct {
    public readonly deployment: KubernetesWebAppDeployment;
    public readonly service: KubernetesNodePortService;
    public readonly config: SimpleKubernetesWebAppConfig;

    constructor(scope: Construct, name: string, config: SimpleKubernetesWebAppConfig) {
        super(scope, name);

        this.config = config;
        this.deployment = new KubernetesWebAppDeployment(this, 'deployment', {
            image: config.image,
            replicas: config.replicas,
            app: config.app,
            component: config.component,
            environment: config.environment,
            env: config.env,
        });

        this.service = new KubernetesNodePortService(this, 'service', {
            port: config.port,
            app: config.app,
            component: config.component,
            environment: config.environment,
        });

        new TerraformOutput(this, 'url', {
            value: `http://localhost:${config.port}`,
        });
    }
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