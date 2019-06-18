declare module 'nativescript-app-sync-sdk/script/acquisition-sdk' {
	export module Http {
	    const enum Verb {
	        GET = 0,
	        HEAD = 1,
	        POST = 2,
	        PUT = 3,
	        DELETE = 4,
	        TRACE = 5,
	        OPTIONS = 6,
	        CONNECT = 7,
	        PATCH = 8,
	    }
	    interface Response {
	        statusCode: number;
	        body?: string;
	    }
	    interface Requester {
	        request(verb: Verb, url: string, callback: Callback<Response>): void;
	        request(verb: Verb, url: string, requestBody: string, callback: Callback<Response>): void;
	    }
	}
	export interface Package {
	    deploymentKey: string;
	    description: string;
	    label: string;
	    appVersion: string;
	    isMandatory: boolean;
	    packageHash: string;
	    packageSize: number;
	}
	export interface RemotePackage extends Package {
	    downloadUrl: string;
	}
	export interface NativeUpdateNotification {
	    updateAppVersion: boolean;
	    appVersion: string;
	}
	export interface LocalPackage extends Package {
	    localPath: string;
	}
	export interface Callback<T> {
	    (error: Error, parameter: T): void;
	}
	export interface Configuration {
	    appVersion: string;
	    clientUniqueId: string;
	    deploymentKey: string;
	    serverUrl: string;
	    ignoreAppVersion?: boolean;
	}
	export class AcquisitionStatus {
	    static DeploymentSucceeded: string;
	    static DeploymentFailed: string;
	}
	export class AcquisitionManager {
	    private _appVersion;
	    private _clientUniqueId;
	    private _deploymentKey;
	    private _httpRequester;
	    private _ignoreAppVersion;
	    private _serverUrl;
	    constructor(httpRequester: Http.Requester, configuration: Configuration);
	    queryUpdateWithCurrentPackage(currentPackage: Package, callback?: Callback<RemotePackage | NativeUpdateNotification>): void;
	    reportStatusDeploy(deployedPackage?: Package, status?: string, previousLabelOrAppVersion?: string, previousDeploymentKey?: string, callback?: Callback<void>): void;
	    reportStatusDownload(downloadedPackage: Package, callback?: Callback<void>): void;
	}

}
declare module 'nativescript-app-sync-sdk/script/types' {
	export { AccessKeyRequest, Account, App, AppCreationRequest, CollaboratorMap, CollaboratorProperties, Deployment, DeploymentMetrics, Package, PackageInfo, AccessKey as ServerAccessKey, UpdateMetrics } from "rest-definitions";
	export interface CodePushError {
	    message: string;
	    statusCode: number;
	}
	export interface AccessKey {
	    createdTime: number;
	    expires: number;
	    name: string;
	    key?: string;
	}
	export interface Session {
	    loggedInTime: number;
	    machineName: string;
	}
	export type Headers = {
	    [headerName: string]: string;
	};

}
declare module 'nativescript-app-sync-sdk/script/management-sdk' {
	import Q = require("q");
	import Promise = Q.Promise;
	import { AccessKey, Account, App, CollaboratorMap, Deployment, DeploymentMetrics, Headers, Package, PackageInfo, Session } from 'nativescript-app-sync-sdk/script/types'; class AccountManager {
	    static AppPermission: {
	        OWNER: string;
	        COLLABORATOR: string;
	    };
	    static SERVER_URL: string;
	    static MOBILE_CENTER_SERVER_URL: string;
	    private static API_VERSION;
	    static ERROR_GATEWAY_TIMEOUT: number;
	    static ERROR_INTERNAL_SERVER: number;
	    static ERROR_NOT_FOUND: number;
	    static ERROR_CONFLICT: number;
	    static ERROR_UNAUTHORIZED: number;
	    private _accessKey;
	    private _serverUrl;
	    private _customHeaders;
	    private _proxy;
	    constructor(accessKey: string, customHeaders?: Headers, serverUrl?: string, proxy?: string);
	    accessKey: string;
	    isAuthenticated(throwIfUnauthorized?: boolean): Promise<boolean>;
	    addAccessKey(friendlyName: string, ttl?: number): Promise<AccessKey>;
	    getAccessKey(accessKeyName: string): Promise<AccessKey>;
	    getAccessKeys(): Promise<AccessKey[]>;
	    getSessions(): Promise<Session[]>;
	    patchAccessKey(oldName: string, newName?: string, ttl?: number): Promise<AccessKey>;
	    removeAccessKey(name: string): Promise<void>;
	    removeSession(machineName: string): Promise<void>;
	    getAccountInfo(): Promise<Account>;
	    getApps(): Promise<App[]>;
	    getApp(appName: string): Promise<App>;
	    addApp(appName: string, appOs: string, appPlatform: string, manuallyProvisionDeployments?: boolean): Promise<App>;
	    removeApp(appName: string): Promise<void>;
	    renameApp(oldAppName: string, newAppName: string): Promise<void>;
	    transferApp(appName: string, email: string): Promise<void>;
	    getCollaborators(appName: string): Promise<CollaboratorMap>;
	    addCollaborator(appName: string, email: string): Promise<void>;
	    removeCollaborator(appName: string, email: string): Promise<void>;
	    addDeployment(appName: string, deploymentName: string): Promise<Deployment>;
	    clearDeploymentHistory(appName: string, deploymentName: string): Promise<void>;
	    getDeployments(appName: string): Promise<Deployment[]>;
	    getDeployment(appName: string, deploymentName: string): Promise<Deployment>;
	    renameDeployment(appName: string, oldDeploymentName: string, newDeploymentName: string): Promise<void>;
	    removeDeployment(appName: string, deploymentName: string): Promise<void>;
	    getDeploymentMetrics(appName: string, deploymentName: string): Promise<DeploymentMetrics>;
	    getDeploymentHistory(appName: string, deploymentName: string): Promise<Package[]>;
	    release(appName: string, deploymentName: string, filePath: string, targetBinaryVersion: string, updateMetadata: PackageInfo, uploadProgressCallback?: (progress: number) => void): Promise<Package>;
	    patchRelease(appName: string, deploymentName: string, label: string, updateMetadata: PackageInfo): Promise<void>;
	    promote(appName: string, sourceDeploymentName: string, destinationDeploymentName: string, updateMetadata: PackageInfo): Promise<Package>;
	    rollback(appName: string, deploymentName: string, targetRelease?: string): Promise<void>;
	    private packageFileFromPath(filePath);
	    private generateRandomFilename(length);
	    private get(endpoint, expectResponseBody?);
	    private post(endpoint, requestBody, expectResponseBody, contentType?);
	    private patch(endpoint, requestBody, expectResponseBody?, contentType?);
	    private del(endpoint, expectResponseBody?);
	    private makeApiRequest(method, endpoint, requestBody, expectResponseBody, contentType);
	    private getCodePushError(error, response);
	    private getErrorStatus(error, response);
	    private getErrorMessage(error, response);
	    private attachCredentials(request);
	    private appNameParam(appName);
	}
	export = AccountManager;

}
declare module 'nativescript-app-sync-sdk/script/index' {
	import AccountManager = require('nativescript-app-sync-sdk/script/management-sdk');
	export = AccountManager;

}
declare module 'nativescript-app-sync-sdk' {
	import main = require('nativescript-app-sync-sdk/script/index');
	export = main;
}
