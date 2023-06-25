export interface KeycloakDeploymentConfig {
    readonly image: string;
    readonly replicas: number;
    readonly app: string;
    readonly component: string;
    readonly environment: string;
    readonly env?: Record<string, string>;
}

export interface KeycloakNodePortConfig {
    readonly port: number;
    readonly app: string;
    readonly component: string;
    readonly environment: string;
}

export interface keycloakClusterIPConfig {
    readonly port: number;
    readonly app: string;
    readonly component: string;
    readonly environment: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface KeycloakIngressConfig {
    // TODO: Implement this Ingress config
}

type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
}

export type KeycloakApplicationConfig = KeycloakDeploymentConfig
    & KeycloakNodePortConfig
    & DeepPartial<keycloakClusterIPConfig>;
