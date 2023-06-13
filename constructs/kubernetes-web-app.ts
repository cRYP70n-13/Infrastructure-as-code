import { Construct } from 'constructs';
import * as k8s from '@cdktf/provider-kubernetes';
import { TerraformOutput } from 'cdktf';
import { KubernetesClusterIPServiceConfig, KubernetesNodePortServiceConfig, KubernetesWebAppDeploymentConfig, SimpleKubernetesWebAppConfig } from './types';

export class SimpleKubernetesWebApp extends Construct {
    public readonly deployment: KubernetesWebAppDeployment;
    public readonly nodePortService: KubernetesNodePortService;
    public readonly clusterIPService: KubernetesClusterIPService;
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

        this.nodePortService = new KubernetesNodePortService(this, 'service', {
            port: config.port,
            app: config.app,
            component: config.component,
            environment: config.environment,
        });

        this.clusterIPService = new KubernetesClusterIPService(this, 'anotherService', {
            port: config.port,
            app: config.app,
            component: config.component,
            environment: config.environment,
        })

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

// NOTE: This will give us two clusterIP services because:
// For each application we create using these class will create a nodePort plus a clusterIP
export class KubernetesClusterIPService extends Construct {
    public readonly resource: k8s.service.Service;

    constructor(scope: Construct, name: string, config: KubernetesClusterIPServiceConfig) {
        super(scope, name);

        this.resource = new k8s.service.Service(this, name, {
            metadata: {
                name: `${config.app}-${config.component}-${config.environment}-cluster-ip`,
            },
            spec: {
                type: 'ClusterIP',
                port: [
                    {
                        name: 'http',
                        port: 80,
                        targetPort: '80',
                        protocol: 'TCP',
                    }
                ],
                selector: {
                    app: config.app,
                    environment: config.environment,
                    component: config.component,
                }
            },
        })
    }
}