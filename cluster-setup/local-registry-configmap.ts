import * as k8s from '@cdktf/provider-kubernetes';
import { Construct } from 'constructs';

export class LocalRegistryConfigMap extends Construct {
	public readonly configMap: k8s.configMap.ConfigMap;

	constructor(scope: Construct, name: string) {
		super(scope, name);

		this.configMap = new k8s.configMap.ConfigMap(this, name, {
			metadata: {
				name,
				namespace: 'kube-public',
			},
			data: {
				'localRegistryHosting.v1': `
					host: "localhost:5000"
					help: "https://kind.sigs.k8s.io/docs/user/local-registry/"
				`
			}
		});
	}
}