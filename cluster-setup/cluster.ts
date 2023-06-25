/* eslint-disable max-len */
import { Construct } from 'constructs';
import { provider, cluster } from '../.gen/providers/kind/index';
import { ClusterKindConfigNodeExtraPortMappings } from '../.gen/providers/kind/cluster';
import { TerraformOutput } from 'cdktf';

export class MyKindCluster extends Construct {
	public readonly cluster: cluster.Cluster;

	constructor(scope: Construct, name: string) {
		super(scope, name);

		new provider.KindProvider(this, 'kind', {});

		this.cluster = new cluster.Cluster(this, name, {
			name: 'my-test-kind-cluster',
			waitForReady: true,
			kindConfig: {
				kind: 'cluster',
				apiVersion: 'kind.x-k8s.io/v1alpha4',
				containerdConfigPatches: [
					`
						[plugins."io.containerd.grpc.v1.cri".registry.mirrors."localhost:5000"]
						endpoint = ["http://local-registry:5000"]
					`
				],
				nodeAttribute: [{
					role: 'control-plane',
					extraPortMappings: getExtraPortMapping()
				}]
			},
		});

		new TerraformOutput(this, 'cluster_name', { value: name });
	}
}

function getExtraPortMapping(): ClusterKindConfigNodeExtraPortMappings[] {
	const ports = [30009, 30010, 30011, 30012];

	return ports.map(port => ({
		containerPort: port,
		hostPort: port,
		listenAddress: '0.0.0.0',
		protocol: port === 80 || port === 443 ? 'TCP' : undefined,
	}));
}