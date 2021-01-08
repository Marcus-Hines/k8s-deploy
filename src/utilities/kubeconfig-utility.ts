import { getParsedYaml } from './files-helper';
import * as core from '@actions/core';

const KUBECONFIG_VARIABLE = 'KUBECONFIG';
const CURRENT_CONTEXT = 'current-context';
const CONTEXTS = 'contexts';
const CONTEXT = 'context';
const CLUSTERS = 'clusters';
const CLUSTER = 'cluster';
const SERVER = 'server';
const NAME = 'name';

interface ClusterMetadata {
  name: string;
  url: string;
}

export function getClusterMetadata(): ClusterMetadata {
  let kubeconfigMetadata: ClusterMetadata = {
    name: '',
    url: ''
  };

  const currentCluster = getCurrentCluster();
  if (currentCluster) {
    kubeconfigMetadata.name = currentCluster[NAME] || '';
    kubeconfigMetadata.url = (currentCluster[CLUSTER] && currentCluster[CLUSTER][SERVER]) || '';
  }

  return kubeconfigMetadata;
}

function getCurrentCluster(): any {
  // SAMPLE KUBECONFIG
  //
  // apiVersion: v1
  // clusters:
  // - cluster:
  //     certificate-authority-data: contosoCert
  //     server: https://contosok8s.io:443
  //   name: contosoCluster
  // contexts:
  // - context:
  //     cluster: contosoCluster
  //     user: contosoUser
  //   name: contosoCluster
  // current-context: contosoCluster
  // kind: Config
  // preferences: {}
  // users:
  // - name: contosoUser
  //   user:
  //     client-certificate-data: contosoCert
  //     client-key-data: contosoKey
  //     token: contosoToken

  const kubeconfig = readKubeconfig();
  if(!kubeconfig) {
    return null;
  }

  const currentContextName = kubeconfig[CURRENT_CONTEXT];
  const currentContext = currentContextName
    && kubeconfig[CONTEXTS]
    && kubeconfig[CONTEXTS].find(context => context[NAME] == currentContextName);

  const currentClusterName = currentContext[CONTEXT] && currentContext[CONTEXT][CLUSTER];
  const currentCluster = currentClusterName
    && kubeconfig[CLUSTERS]
    && kubeconfig[CLUSTERS].find(cluster => cluster[NAME] == currentClusterName)

  return currentCluster;
}

function readKubeconfig(): any {
  const kubeconfigPath = process.env[KUBECONFIG_VARIABLE];
  let kubeconfig = null;
  try {
    kubeconfig = getParsedYaml(kubeconfigPath);
  } catch (error) {
    core.debug(`An error occured while reading the kubeconfig. Error: ${error}`);
  }

  return kubeconfig;
}