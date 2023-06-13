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

export interface KubernetesClusterIPServiceConfig {
    readonly port: number;
    readonly app: string;
    readonly component: string;
    readonly environment: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface KubernetesIngressConfig {
    // TODO: Implement this Ingress config
}

type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
}

export type SimpleKubernetesWebAppConfig = KubernetesWebAppDeploymentConfig & KubernetesNodePortServiceConfig & DeepPartial<KubernetesClusterIPServiceConfig>;
