import { Kubectl } from "./kubectl";
import { ExecOutput, getExecOutput } from "@actions/exec";
import * as core from "@actions/core";


export class PrivateKubectl extends Kubectl{
  protected async execute(args: string[], silent: boolean = false) {
    if (this.ignoreSSLErrors) {
     // args.push("--insecure-skip-tls-verify");
    }

    //args = args.concat(["--namespace", this.namespace]);
    args.unshift("/k8stools/kubectl")
    const kubectlCmd = args.join(" ")
    const privateClusterArgs = ["aks", "command", "invoke", 
      "--resource-group", this.resourceGroup, 
      "--name", this.name,
      "--command", kubectlCmd 
    ]
    if(this.containsFilenames(kubectlCmd)) {
      const fileNames = this.extractFiles(kubectlCmd);
      
      //var spaceSeperatedFilenames = fileNames.join().replace(/,/g, " ");
       console.log("Filenames should have no leading slashes: " + fileNames);

      privateClusterArgs.push(...["--file", "."]);
      console.log("testing without modifying files and just using directory: " + privateClusterArgs);
    }

  core.debug(`private cluster Kubectl run with invoke command: ${kubectlCmd}`);
  return await getExecOutput("az", privateClusterArgs, { silent });
  }


  private containsFilenames(str: string) {
    return str.includes("-f ") || str.includes("filename ");
  }

  public extractFiles(strToParse: string) {
    var result = [];
    var start = strToParse.indexOf("-filename"); 
    var offset = 7;

    if(start == -1){
      start = strToParse.indexOf("-f");
      
      if(start == -1){
        return result;
      }
      offset = 0;
    }

    
    var temp = strToParse.substring(start + offset);
    var end = temp.indexOf(" -");
    
    // End could be case where the -f flag was last, or -f is followed by some additonal flag and it's arguments
    result = temp.substring(3, end == -1 ? temp.length : end).trim().split(/[\s]+/);
    return this.removeLeadingSlashesFromFilenames(result);
  }



  private removeLeadingSlashesFromFilenames(arr: string[]){
    if(arr == null || arr.length == 0){
      console.log("Attempting to remove leading slashes, but the input was null or empty");
      return arr;
    }
    
    for(var index = 0; index < arr.length; index++){
      // Skip if no leading slash
      if(arr[index].charAt(0) != "/"){
        continue;
      }
      arr[index] = arr[index].substring(1);
    }

    return arr;
  }
}