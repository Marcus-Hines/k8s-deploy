import { Kubectl } from "./kubectl";
import { ExecOutput, getExecOutput } from "@actions/exec";
import * as core from "@actions/core";


export class PrivateKubectl extends Kubectl{
  protected async execute(args: string[], silent: boolean = false) {
    if (this.ignoreSSLErrors) {
      args.push("--insecure-skip-tls-verify");
    }

    args = args.concat(["--namespace", this.namespace]);
    args.unshift("kubectl")
    const kubectlCmd = args.join(" ")
    const privateClusterArgs = ["aks", "command", "invoke", 
      "--resource-group", this.resourceGroup, 
      "--name", "this.name",
      "--command", kubectlCmd
    ]
    if(this.containsFilenames(kubectlCmd)) {
      const fileNames = this.extractFiles(kubectlCmd);
      privateClusterArgs.concat(["--file", fileNames.join(" ")]);
    }
  core.debug(`private cluster Kubectl run with invoke command: ${kubectlCmd}`);
  return await getExecOutput("az", privateClusterArgs, { silent });
  }


  private containsFilenames(str: string) {
    return str.includes("-f ") || str.includes("filename");
  }

  public extractFiles(strToParse: string) {
    const result = [];
    if (strToParse == null || strToParse.length == 0){
      return result;
    }
    // handle long hand
    const start = strToParse.indexOf("-f" ) + 3;
    if (start == -1){
      return result;
    }
    const temp = strToParse.substring(start);
    const end = temp.indexOf(" -");
    // End could be case where the -f flag was last, or -f is followed by some additonal flag and it's arguments
    return temp.substring(3, end == -1 ? temp.length : end).trim().split("\\s");
  }
}