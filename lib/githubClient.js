"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubClient = void 0;
const core = require("@actions/core");
const constants_1 = require("./constants");
const httpClient_1 = require("./utilities/httpClient");
class GitHubClient {
    constructor(repository, token) {
        this._repository = repository;
        this._token = token;
    }
    getWorkflows() {
        return __awaiter(this, void 0, void 0, function* () {
            const getWorkflowFileNameUrl = `https://api.github.com/repos/${this._repository}/actions/workflows`;
            const webRequest = new httpClient_1.WebRequest();
            webRequest.method = "GET";
            webRequest.uri = getWorkflowFileNameUrl;
            webRequest.headers = {
                Authorization: `Bearer ${this._token}`
            };
            core.debug(`Getting workflows for repo: ${this._repository}`);
            const response = yield httpClient_1.sendRequest(webRequest);
            return Promise.resolve(response);
        });
    }
    createDeployment() {
        return __awaiter(this, void 0, void 0, function* () {
            const deploymentStatusUrl = `https://api.github.com/repos/${this._repository}/deployments`;
            const webRequest = new httpClient_1.WebRequest();
            webRequest.method = "POST";
            webRequest.uri = deploymentStatusUrl;
            webRequest.headers = {
                Authorization: `Bearer ${this._token}`,
                environment: constants_1.DEPLOYMENT_ENVIRONMENT
            };
            webRequest.body = JSON.stringify({
                "ref": process.env.GITHUB_SHA
            });
            const response = yield httpClient_1.sendRequest(webRequest);
            console.log(JSON.stringify(response));
            this._deploymentId = response.body["id"];
            return Promise.resolve(response);
        });
    }
    createDeploymentReference(environment, deploymentId, state) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Creating deployment ref", deploymentId, environment, state);
            const deploymentStatusUrl = `https://api.github.com/repos/${this._repository}/deployments/${this._deploymentId}/statuses`;
            const webRequest = new httpClient_1.WebRequest();
            webRequest.method = "POST";
            webRequest.uri = deploymentStatusUrl;
            webRequest.headers = {
                Authorization: `Bearer ${this._token}`
            };
            webRequest.body = JSON.stringify({
                "state": state,
                "log_url": `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
                "description": "",
                "environment": environment,
                "environment_url": ""
            });
            const response = yield httpClient_1.sendRequest(webRequest);
            console.log(JSON.stringify(response));
            return Promise.resolve(response);
        });
    }
}
exports.GitHubClient = GitHubClient;