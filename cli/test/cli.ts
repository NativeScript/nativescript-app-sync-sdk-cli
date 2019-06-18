import * as assert from "assert";
import * as sinon from "sinon";
import Q = require("q");
import Promise = Q.Promise;
import * as appSync from "nativescript-app-sync-sdk/script/types";
import * as cli from "../definitions/cli";
import * as cmdexec from "../script/command-executor";
import * as os from "os";

function assertJsonDescribesObject(json: string, object: Object): void {
    // Make sure JSON is indented correctly
    assert.equal(json, JSON.stringify(object, /*replacer=*/ null, /*spacing=*/ 2));
}

function clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

function ensureInTestAppDirectory(): void {
    if (!~__dirname.indexOf("/resources/TestApp")) {
        process.chdir(__dirname + "/resources/TestApp");
    }
}

function ensureNotInTestAppDirectory(): void {
    if (!~__dirname.indexOf("/resources")) {
        process.chdir(__dirname + "/resources");
    }
}

function isDefined(object: any): boolean {
    return object !== undefined && object !== null;
}

const NOW = 1471460856191;
const DEFAULT_ACCESS_KEY_MAX_AGE = 1000 * 60 * 60 * 24 * 60; // 60 days
const TEST_MACHINE_NAME = "Test machine";

export class SdkStub {
    private productionDeployment: appSync.Deployment = {
        name: "Production",
        key: "6"
    };
    private stagingDeployment: appSync.Deployment = {
        name: "Staging",
        key: "6",
        package: {
            appVersion: "1.0.0",
            description: "fgh",
            label: "v2",
            packageHash: "jkl",
            isMandatory: true,
            size: 10,
            blobUrl: "http://mno.pqr",
            uploadTime: 1000
        }
    };

    public getAccountInfo(): Promise<appSync.Account> {
        return Q(<appSync.Account>{
            email: "a@a.com"
        });
    }

    public addAccessKey(name: string, ttl: number): Promise<appSync.AccessKey> {
        return Q(<appSync.AccessKey>{
            key: "key123",
            createdTime: new Date().getTime(),
            name,
            expires: NOW + (isDefined(ttl) ? ttl : DEFAULT_ACCESS_KEY_MAX_AGE)
        });
    }

    public patchAccessKey(oldName: string, newName?: string, newTtl?: number): Promise<appSync.AccessKey> {
        return Q(<appSync.AccessKey>{
            createdTime: new Date().getTime(),
            name: newName,
            expires: NOW + (isDefined(newTtl) ? newTtl : DEFAULT_ACCESS_KEY_MAX_AGE)
        });
    }

    public addApp(name: string, os: string, platform: string, manuallyProvisionDeployments: boolean = false): Promise<appSync.App> {
        return Q(<appSync.App>{
            name: name,
            os: os,
            platform: platform,
            manuallyProvisionDeployments: manuallyProvisionDeployments
        });
    }

    public addCollaborator(name: string, email: string): Promise<void> {
        return Q(<void>null);
    }

    public addDeployment(appName: string, deploymentName: string): Promise<appSync.Deployment> {
        return Q(<appSync.Deployment>{
            name: deploymentName,
            key: "6"
        });
    }

    public clearDeploymentHistory(appName: string, deploymentName: string): Promise<void> {
        return Q(<void>null);
    }

    public getAccessKeys(): Promise<appSync.AccessKey[]> {
        return Q([<appSync.AccessKey>{
            createdTime: 0,
            name: "Test name",
            expires: NOW + DEFAULT_ACCESS_KEY_MAX_AGE
        }]);
    }

    public getSessions(): Promise<appSync.Session[]> {
        return Q([<appSync.Session>{
            loggedInTime: 0,
            machineName: TEST_MACHINE_NAME
        }]);
    }

    public getApps(): Promise<appSync.App[]> {
        return Q([<appSync.App>{
            name: "a",
            collaborators: { "a@a.com": { permission: "Owner", isCurrentAccount: true } },
            deployments: [ "Production", "Staging" ]
        }, <appSync.App>{
            name: "b",
            collaborators: { "a@a.com": { permission: "Owner", isCurrentAccount: true } },
            deployments: [ "Production", "Staging" ]
        }]);
    }

    public getDeployments(appName: string): Promise<appSync.Deployment[]> {
        if (appName === "a") {
            return Q([this.productionDeployment, this.stagingDeployment]);
        }

        return Q.reject<appSync.Deployment[]>();
    }

    public getDeployment(appName: string, deploymentName: string): Promise<appSync.Deployment> {
        if (appName === "a") {
            if (deploymentName === "Production") {
                return Q(this.productionDeployment);
            } else if (deploymentName === "Staging") {
                return Q(this.stagingDeployment);
            }
        }

        return Q.reject<appSync.Deployment>();
    }

    public getDeploymentHistory(appName: string, deploymentName: string): Promise<appSync.Package[]> {
        return Q([
            <appSync.Package>{
                description: null,
                appVersion: "1.0.0",
                isMandatory: false,
                packageHash: "463acc7d06adc9c46233481d87d9e8264b3e9ffe60fe98d721e6974209dc71a0",
                blobUrl: "https://fakeblobstorage.net/storagev2/blobid1",
                uploadTime: 1447113596270,
                size: 1,
                label: "v1"
            },
            <appSync.Package>{
                description: "New update - this update does a whole bunch of things, including testing linewrapping",
                appVersion: "1.0.1",
                isMandatory: false,
                packageHash: "463acc7d06adc9c46233481d87d9e8264b3e9ffe60fe98d721e6974209dc71a0",
                blobUrl: "https://fakeblobstorage.net/storagev2/blobid2",
                uploadTime: 1447118476669,
                size: 2,
                label: "v2"
            }
        ]);
    }

    public getDeploymentMetrics(appName: string, deploymentName: string): Promise<any> {
        return Q({
            "1.0.0": {
                active: 123
            },
            "v1": {
                active: 789,
                downloaded: 456,
                failed: 654,
                installed: 987
            },
            "v2": {
                active: 123,
                downloaded: 321,
                failed: 789,
                installed: 456
            }
        });
    }

    public getCollaborators(app: appSync.App): Promise<any> {
        return Q({
            "a@a.com": {
                permission: "Owner",
                isCurrentAccount: true
            },
            "b@b.com": {
                permission: "Collaborator",
                isCurrentAccount: false
            }
        });
    }

    public patchRelease(appName: string, deployment: string, label: string, updateMetaData: appSync.PackageInfo): Promise<void> {
        return Q(<void>null);
    }

    public promote(appName: string, sourceDeployment: string, destinationDeployment: string, updateMetaData: appSync.PackageInfo): Promise<void> {
        return Q(<void>null);
    }

    public release(appName: string, deploymentName: string): Promise<string> {
        return Q("Successfully released");
    }

    public removeAccessKey(accessKeyId: string): Promise<void> {
        return Q(<void>null);
    }

    public removeApp(appName: string): Promise<void> {
        return Q(<void>null);
    }

    public removeCollaborator(name: string, email: string): Promise<void> {
        return Q(<void>null);
    }

    public removeDeployment(appName: string, deploymentName: string): Promise<void> {
        return Q(<void>null);
    }

    public removeSession(createdBy: string): Promise<void> {
        return Q(<void>null);
    }

    public renameApp(app: appSync.App): Promise<void> {
        return Q(<void>null);
    }

    public rollback(appName: string, deployment: string, targetRelease: string): Promise<void> {
        return Q(<void>null);
    }

    public transferApp(app: appSync.App): Promise<void> {
        return Q(<void>null);
    }

    public renameDeployment(appName: string, deploymentName: appSync.Deployment): Promise<void> {
        return Q(<void>null);
    }
}

describe("CLI", () => {
    var log: Sinon.SinonStub;
    var sandbox: Sinon.SinonSandbox;
    var spawn: Sinon.SinonStub;
    var wasConfirmed = true;
    const INVALID_RELEASE_FILE_ERROR_MESSAGE: string = "It is unnecessary to package releases in a .zip or binary file. Please specify the direct path to the update content's directory (e.g. /platforms/ios/www) or file (e.g. main.jsbundle).";

    beforeEach((): void => {
        wasConfirmed = true;

        sandbox = sinon.sandbox.create();

        sandbox.stub(cmdexec, "confirm", (): Promise<boolean> => Q(wasConfirmed));
        sandbox.stub(cmdexec, "createEmptyTempReleaseFolder", (): Promise<void> => Q(<void>null));
        log = sandbox.stub(cmdexec, "log", (message: string): void => { });
        spawn = sandbox.stub(cmdexec, "spawn", (command: string, commandArgs: string[]): any => {
            return {
                stdout: { on: () => { } },
                stderr: { on: () => { } },
                on: (event: string, callback: () => void) => {
                    callback();
                }
            };
        });
        cmdexec.sdk = <any>new SdkStub();
    });

    afterEach((): void => {
        sandbox.restore();
    });

    it("accessKeyAdd creates access key with name and default ttl", (done: MochaDone): void => {
        var command: cli.IAccessKeyAddCommand = {
            type: cli.CommandType.accessKeyAdd,
            name: "Test name"
        };

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledTwice(log);
                assert.equal(log.args[0].length, 1);

                var actual: string = log.args[0][0];
                var expected = `Successfully created the "Test name" access key: key123`;
                assert.equal(actual, expected);

                actual = log.args[1][0];
                expected = "Make sure to save this key value somewhere safe, since you won't be able to view it from the CLI again!";
                assert.equal(actual, expected);

                done();
            });
    });

    it("accessKeyAdd creates access key with name and specified ttl", (done: MochaDone): void => {
        var ttl = 10000;
        var command: cli.IAccessKeyAddCommand = {
            type: cli.CommandType.accessKeyAdd,
            name: "Test name",
            ttl
        };

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledTwice(log);
                assert.equal(log.args[0].length, 1);

                var actual: string = log.args[0][0];
                var expected = `Successfully created the "Test name" access key: key123`;
                assert.equal(actual, expected);

                actual = log.args[1][0];
                expected = "Make sure to save this key value somewhere safe, since you won't be able to view it from the CLI again!";
                assert.equal(actual, expected);

                done();
            });
    });

    it("accessKeyPatch updates access key with new name", (done: MochaDone): void => {
        var command: cli.IAccessKeyPatchCommand = {
            type: cli.CommandType.accessKeyPatch,
            oldName: "Test name",
            newName: "Updated name"
        };

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(log);
                assert.equal(log.args[0].length, 1);

                var actual: string = log.args[0][0];
                var expected = `Successfully renamed the access key "Test name" to "Updated name".`;

                assert.equal(actual, expected);
                done();
            });
    });


    /*
    it("accessKeyPatch updates access key with new ttl", (done: MochaDone): void => {
        var ttl = 10000;
        var command: cli.IAccessKeyPatchCommand = {
            type: cli.CommandType.accessKeyPatch,
            oldName: "Test name",
            ttl
        };

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(log);
                assert.equal(log.args[0].length, 1);

                var actual: string = log.args[0][0];
                var expected = `Successfully changed the expiration date of the "Test name" access key to Wednesday, August 17, 2016 12:07 PM.`;

                assert.equal(actual, expected);
                done();
            });
    });

    it("accessKeyPatch updates access key with new name and ttl", (done: MochaDone): void => {
        var ttl = 10000;
        var command: cli.IAccessKeyPatchCommand = {
            type: cli.CommandType.accessKeyPatch,
            oldName: "Test name",
            newName: "Updated name",
            ttl
        };

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(log);
                assert.equal(log.args[0].length, 1);

                var actual: string = log.args[0][0];
                var expected = `Successfully renamed the access key "Test name" to "Updated name" and changed its expiration date to Wednesday, August 17, 2016 12:07 PM.`;

                assert.equal(actual, expected);
                done();
            });
    });
    */

    it("accessKeyList lists access key name and expires fields", (done: MochaDone): void => {
        var command: cli.IAccessKeyListCommand = {
            type: cli.CommandType.accessKeyList,
            format: "json"
        };

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(log);
                assert.equal(log.args[0].length, 1);

                var actual: string = log.args[0][0];
                var expected = [
                    {
                        createdTime: 0,
                        name: "Test name",
                        expires: NOW + DEFAULT_ACCESS_KEY_MAX_AGE
                    }
                ];

                assertJsonDescribesObject(actual, expected);
                done();
            });
    });

    it("accessKeyRemove removes access key", (done: MochaDone): void => {
        var command: cli.IAccessKeyRemoveCommand = {
            type: cli.CommandType.accessKeyRemove,
            accessKey: "8"
        };

        var removeAccessKey: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "removeAccessKey");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(removeAccessKey);
                sinon.assert.calledWithExactly(removeAccessKey, "8");
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, "Successfully removed the \"8\" access key.");

                done();
            });
    });

    it("accessKeyRemove does not remove access key if cancelled", (done: MochaDone): void => {
        var command: cli.IAccessKeyRemoveCommand = {
            type: cli.CommandType.accessKeyRemove,
            accessKey: "8"
        };

        var removeAccessKey: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "removeAccessKey");

        wasConfirmed = false;

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.notCalled(removeAccessKey);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, "Access key removal cancelled.");

                done();
            });
    });

    it("appAdd reports new app name and ID", (done: MochaDone): void => {
        var command: cli.IAppAddCommand = {
            type: cli.CommandType.appAdd,
            appName: "a",
            os: "ios",
            platform: "react-native"
        };

        var addApp: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "addApp");
        var deploymentList: Sinon.SinonSpy = sandbox.spy(cmdexec, "deploymentList");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(addApp);
                sinon.assert.calledTwice(log);
                sinon.assert.calledWithExactly(log, "Successfully added the \"a\" app, along with the following default deployments:");
                sinon.assert.calledOnce(deploymentList);
                done();
            });
    });

    it("appList lists app names and ID's", (done: MochaDone): void => {
        var command: cli.IAppListCommand = {
            type: cli.CommandType.appList,
            format: "json"
        };

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(log);
                assert.equal(log.args[0].length, 1);

                var actual: string = log.args[0][0];
                var expected = [
                    {
                        name: "a",
                        collaborators: {
                            "a@a.com": {
                                permission: "Owner",
                                isCurrentAccount: true
                            }
                        },
                        deployments: ["Production", "Staging"]
                    },
                    {
                        name: "b",
                        collaborators: {
                            "a@a.com": {
                                permission: "Owner",
                                isCurrentAccount: true
                            }
                        },
                        deployments: ["Production", "Staging"]
                    }
                ];

                assertJsonDescribesObject(actual, expected);
                done();
            });
    });

    it("appRemove removes app", (done: MochaDone): void => {
        var command: cli.IAppRemoveCommand = {
            type: cli.CommandType.appRemove,
            appName: "a"
        };

        var removeApp: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "removeApp");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(removeApp);
                sinon.assert.calledWithExactly(removeApp, "a");
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, "Successfully removed the \"a\" app.");

                done();
            });
    });

    it("appRemove does not remove app if cancelled", (done: MochaDone): void => {
        var command: cli.IAppRemoveCommand = {
            type: cli.CommandType.appRemove,
            appName: "a"
        };

        var removeApp: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "removeApp");

        wasConfirmed = false;

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.notCalled(removeApp);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, "App removal cancelled.");

                done();
            });
    });

    it("appRename renames app", (done: MochaDone): void => {
        var command: cli.IAppRenameCommand = {
            type: cli.CommandType.appRename,
            currentAppName: "a",
            newAppName: "c"
        };

        var renameApp: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "renameApp");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(renameApp);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, "Successfully renamed the \"a\" app to \"c\".");

                done();
            });
    });

    it("appTransfer transfers app", (done: MochaDone): void => {
        var command: cli.IAppTransferCommand = {
            type: cli.CommandType.appTransfer,
            appName: "a",
            email: "b@b.com"
        };

        var transferApp: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "transferApp");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(transferApp);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, "Successfully transferred the ownership of app \"a\" to the account with email \"b@b.com\".");

                done();
            });
    });

    it("collaboratorAdd adds collaborator", (done: MochaDone): void => {
        var command: cli.ICollaboratorAddCommand = {
            type: cli.CommandType.collaboratorAdd,
            appName: "a",
            email: "b@b.com"
        };

        var addCollaborator: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "addCollaborator");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(addCollaborator);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, "Collaborator invitation email for \"a\" sent to \"b@b.com\".");

                done();
            });
    });

    it("collaboratorList lists collaborators email and properties", (done: MochaDone): void => {
        var command: cli.ICollaboratorListCommand = {
            type: cli.CommandType.collaboratorList,
            appName: "a",
            format: "json"
        };

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(log);
                assert.equal(log.args[0].length, 1);

                var actual: string = log.args[0][0];
                var expected = {
                    "collaborators":
                    {
                        "a@a.com": { permission: "Owner", isCurrentAccount: true },
                        "b@b.com": { permission: "Collaborator", isCurrentAccount: false }
                    }
                };

                assertJsonDescribesObject(actual, expected);
                done();
            });
    });

    it("collaboratorRemove removes collaborator", (done: MochaDone): void => {
        var command: cli.ICollaboratorRemoveCommand = {
            type: cli.CommandType.collaboratorRemove,
            appName: "a",
            email: "b@b.com"
        };

        var removeCollaborator: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "removeCollaborator");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(removeCollaborator);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, "Successfully removed \"b@b.com\" as a collaborator from the app \"a\".");

                done();
            });
    });


    it("deploymentAdd reports new app name and ID", (done: MochaDone): void => {
        var command: cli.IDeploymentAddCommand = {
            type: cli.CommandType.deploymentAdd,
            appName: "a",
            deploymentName: "b",
            default: false
        };

        var addDeployment: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "addDeployment");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(addDeployment);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, "Successfully added the \"b\" deployment with key \"6\" to the \"a\" app.");
                done();
            });
    });

    it("deploymentHistoryClear clears deployment", (done: MochaDone): void => {
        var command: cli.IDeploymentHistoryClearCommand = {
            type: cli.CommandType.deploymentHistoryClear,
            appName: "a",
            deploymentName: "Staging"
        };

        var clearDeployment: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "clearDeploymentHistory");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(clearDeployment);
                sinon.assert.calledWithExactly(clearDeployment, "a", "Staging");
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, "Successfully cleared the release history associated with the \"Staging\" deployment from the \"a\" app.");

                done();
            });
    });

    it("deploymentHistoryClear does not clear deployment if cancelled", (done: MochaDone): void => {
        var command: cli.IDeploymentHistoryClearCommand = {
            type: cli.CommandType.deploymentHistoryClear,
            appName: "a",
            deploymentName: "Staging"
        };

        var clearDeployment: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "clearDeploymentHistory");

        wasConfirmed = false;

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.notCalled(clearDeployment);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, "Clear deployment cancelled.");

                done();
            });
    });

    it("deploymentList lists deployment names, deployment keys, and package information", (done: MochaDone): void => {
        var command: cli.IDeploymentListCommand = {
            type: cli.CommandType.deploymentList,
            appName: "a",
            format: "json",
            displayKeys: true
        };

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(log);
                assert.equal(log.args[0].length, 1);

                var actual: string = log.args[0][0];
                var expected = [
                    {
                        name: "Production",
                        key: "6"
                    },
                    {
                        name: "Staging",
                        key: "6",
                        package: {
                            appVersion: "1.0.0",
                            description: "fgh",
                            label: "v2",
                            packageHash: "jkl",
                            isMandatory: true,
                            size: 10,
                            blobUrl: "http://mno.pqr",
                            uploadTime: 1000,
                            metrics: {
                                active: 123,
                                downloaded: 321,
                                failed: 789,
                                installed: 456,
                                totalActive: 1035
                            }
                        }
                    }
                ];

                assertJsonDescribesObject(actual, expected);
                done();
            });
    });

    it("deploymentRemove removes deployment", (done: MochaDone): void => {
        var command: cli.IDeploymentRemoveCommand = {
            type: cli.CommandType.deploymentRemove,
            appName: "a",
            deploymentName: "Staging"
        };

        var removeDeployment: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "removeDeployment");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(removeDeployment);
                sinon.assert.calledWithExactly(removeDeployment, "a", "Staging");
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, "Successfully removed the \"Staging\" deployment from the \"a\" app.");

                done();
            });
    });

    it("deploymentRemove does not remove deployment if cancelled", (done: MochaDone): void => {
        var command: cli.IDeploymentRemoveCommand = {
            type: cli.CommandType.deploymentRemove,
            appName: "a",
            deploymentName: "Staging"
        };

        var removeDeployment: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "removeDeployment");

        wasConfirmed = false;

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.notCalled(removeDeployment);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, "Deployment removal cancelled.");

                done();
            });
    });

    it("deploymentRename renames deployment", (done: MochaDone): void => {
        var command: cli.IDeploymentRenameCommand = {
            type: cli.CommandType.deploymentRename,
            appName: "a",
            currentDeploymentName: "Staging",
            newDeploymentName: "c"
        };

        var renameDeployment: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "renameDeployment");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(renameDeployment);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, "Successfully renamed the \"Staging\" deployment to \"c\" for the \"a\" app.");

                done();
            });
    });

    it("deploymentHistory lists package history information", (done: MochaDone): void => {
        var command: cli.IDeploymentHistoryCommand = {
            type: cli.CommandType.deploymentHistory,
            appName: "a",
            deploymentName: "Staging",
            format: "json",
            displayAuthor: false
        };

        var getDeploymentHistory: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "getDeploymentHistory");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(getDeploymentHistory);
                sinon.assert.calledOnce(log);
                assert.equal(log.args[0].length, 1);

                var actual: string = log.args[0][0];
                var expected: appSync.Package[] = [
                    {
                        description: null,
                        appVersion: "1.0.0",
                        isMandatory: false,
                        packageHash: "463acc7d06adc9c46233481d87d9e8264b3e9ffe60fe98d721e6974209dc71a0",
                        blobUrl: "https://fakeblobstorage.net/storagev2/blobid1",
                        uploadTime: 1447113596270,
                        size: 1,
                        label: "v1",
                        metrics: {
                            active: 789,
                            downloaded: 456,
                            failed: 654,
                            installed: 987,
                            totalActive: 1035
                        }
                    },
                    {
                        description: "New update - this update does a whole bunch of things, including testing linewrapping",
                        appVersion: "1.0.1",
                        isMandatory: false,
                        packageHash: "463acc7d06adc9c46233481d87d9e8264b3e9ffe60fe98d721e6974209dc71a0",
                        blobUrl: "https://fakeblobstorage.net/storagev2/blobid2",
                        uploadTime: 1447118476669,
                        size: 2,
                        label: "v2",
                        metrics: {
                            active: 123,
                            downloaded: 321,
                            failed: 789,
                            installed: 456,
                            totalActive: 1035
                        }
                    }
                ];

                assertJsonDescribesObject(actual, expected);
                done();
            });
    });

    it("patch command successfully updates specific label", (done: MochaDone): void => {
        var command: cli.IPatchCommand = {
            type: cli.CommandType.patch,
            appName: "a",
            deploymentName: "Staging",
            label: "v1",
            disabled: false,
            description: "Patched",
            mandatory: true,
            rollout: 25,
            appStoreVersion: "1.0.1"
        };

        var patch: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "patchRelease");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(patch);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, `Successfully updated the "v1" release of "a" app's "Staging" deployment.`);

                done();
            });
    });

    it("patch command successfully updates latest release", (done: MochaDone): void => {
        var command: cli.IPatchCommand = {
            type: cli.CommandType.patch,
            appName: "a",
            deploymentName: "Staging",
            label: null,
            disabled: false,
            description: "Patched",
            mandatory: true,
            rollout: 25,
            appStoreVersion: "1.0.1"
        };

        var patch: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "patchRelease");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(patch);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, `Successfully updated the "latest" release of "a" app's "Staging" deployment.`);

                done();
            });
    });

    it("patch command successfully updates without appStoreVersion", (done: MochaDone): void => {
        var command: cli.IPatchCommand = {
            type: cli.CommandType.patch,
            appName: "a",
            deploymentName: "Staging",
            label: null,
            disabled: false,
            description: "Patched",
            mandatory: true,
            rollout: 25,
            appStoreVersion: null
        };

        var patch: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "patchRelease");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(patch);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, `Successfully updated the "latest" release of "a" app's "Staging" deployment.`);

                done();
            });
    });

    it("patch command fails if no properties were specified for update", (done: MochaDone): void => {
        var command: cli.IPatchCommand = {
            type: cli.CommandType.patch,
            appName: "a",
            deploymentName: "Staging",
            label: null,
            disabled: null,
            description: null,
            mandatory: null,
            rollout: null,
            appStoreVersion: null
        };

        var patch: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "patchRelease");

        cmdexec.execute(command)
            .then(() => {
                done(new Error("Did not throw error."));
            })
            .catch((err) => {
                assert.equal(err.message, "At least one property must be specified to patch a release.");
                sinon.assert.notCalled(patch);
                done();
            })
            .done();
    });

    it("promote works successfully", (done: MochaDone): void => {
        var command: cli.IPromoteCommand = {
            type: cli.CommandType.promote,
            appName: "a",
            sourceDeploymentName: "Staging",
            destDeploymentName: "Production",
            description: "Promoted",
            mandatory: true,
            rollout: 25,
            appStoreVersion: "1.0.1"
        };

        var promote: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "promote");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(promote);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, `Successfully promoted the "Staging" deployment of the "a" app to the "Production" deployment.`);

                done();
            });
    });

    it("promote works successfully without appStoreVersion", (done: MochaDone): void => {
        var command: cli.IPromoteCommand = {
            type: cli.CommandType.promote,
            appName: "a",
            sourceDeploymentName: "Staging",
            destDeploymentName: "Production",
            description: "Promoted",
            mandatory: true,
            rollout: 25,
            appStoreVersion: null
        };

        var promote: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "promote");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(promote);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, `Successfully promoted the "Staging" deployment of the "a" app to the "Production" deployment.`);

                done();
            });
    });

    it("rollback works successfully", (done: MochaDone): void => {
        var command: cli.IRollbackCommand = {
            type: cli.CommandType.rollback,
            appName: "a",
            deploymentName: "Staging",
            targetRelease: "v2"
        };

        var rollback: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "rollback");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(rollback);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, `Successfully performed a rollback on the "Staging" deployment of the "a" app.`);

                done();
            });
    });

    it("release doesn't allow non valid semver ranges", (done: MochaDone): void => {
        var command: cli.IReleaseCommand = {
            type: cli.CommandType.release,
            appName: "a",
            deploymentName: "Staging",
            description: "test releasing zip file",
            mandatory: false,
            rollout: null,
            appStoreVersion: "not semver",
            package: "./resources"
        };

        releaseHelperFunction(command, done, "Please use a semver-compliant target binary version range, for example \"1.0.0\", \"*\" or \"^1.2.3\".");
    });

    it("release doesn't allow releasing .zip file", (done: MochaDone): void => {
        var command: cli.IReleaseCommand = {
            type: cli.CommandType.release,
            appName: "a",
            deploymentName: "Staging",
            description: "test releasing zip file",
            mandatory: false,
            rollout: null,
            appStoreVersion: "1.0.0",
            package: "/fake/path/test/file.zip"
        };

        releaseHelperFunction(command, done, INVALID_RELEASE_FILE_ERROR_MESSAGE);
    });

    it("release doesn't allow releasing .ipa file", (done: MochaDone): void => {
        var command: cli.IReleaseCommand = {
            type: cli.CommandType.release,
            appName: "a",
            deploymentName: "Staging",
            description: "test releasing ipa file",
            mandatory: false,
            rollout: null,
            appStoreVersion: "1.0.0",
            package: "/fake/path/test/file.ipa"
        };

        releaseHelperFunction(command, done, INVALID_RELEASE_FILE_ERROR_MESSAGE);
    });

    it("release doesn't allow releasing .apk file", (done: MochaDone): void => {
        var command: cli.IReleaseCommand = {
            type: cli.CommandType.release,
            appName: "a",
            deploymentName: "Staging",
            description: "test releasing apk file",
            mandatory: false,
            rollout: null,
            appStoreVersion: "1.0.0",
            package: "/fake/path/test/file.apk"
        };

        releaseHelperFunction(command, done, INVALID_RELEASE_FILE_ERROR_MESSAGE);
    });

    it("release-nativescript fails if CWD does not contain a package.json", (done: MochaDone): void => {
        var command: cli.IReleaseNativeScriptCommand = {
            type: cli.CommandType.releaseNativeScript,
            appName: "a",
            appStoreVersion: null,
            deploymentName: "Staging",
            description: "Test invalid folder",
            mandatory: false,
            rollout: null,
            platform: "ios"
        };

        ensureNotInTestAppDirectory();

        var release: Sinon.SinonSpy = sandbox.spy(cmdexec, "release");
        var releaseNativeScript: Sinon.SinonSpy = sandbox.spy(cmdexec, "releaseNativeScript");

        cmdexec.execute(command)
            .then(() => {
                done(new Error("Did not throw error."));
            })
            .catch((err) => {
                assert.equal(err.message, "Unable to find or read \"package.json\" in the CWD. The \"release\" command must be executed in a NativeScript project folder.");
                sinon.assert.notCalled(release);
                sinon.assert.notCalled(spawn);
                done();
            })
            .done();
    });

    it("release-nativescript fails if platform is invalid", (done: MochaDone): void => {
        var command: cli.IReleaseNativeScriptCommand = {
            type: cli.CommandType.releaseNativeScript,
            appName: "a",
            appStoreVersion: null,
            deploymentName: "Staging",
            description: "Test invalid platform",
            mandatory: false,
            rollout: null,
            platform: "blackberry",
        };

        ensureInTestAppDirectory();

        var release: Sinon.SinonSpy = sandbox.spy(cmdexec, "release");
        var releaseNativeScript: Sinon.SinonSpy = sandbox.spy(cmdexec, "releaseNativeScript");

        cmdexec.execute(command)
            .then(() => {
                done(new Error("Did not throw error."));
            })
            .catch((err) => {
                assert.equal(err.message, "Platform must be either \"android\" or \"ios\".");
                sinon.assert.notCalled(release);
                sinon.assert.notCalled(spawn);
                done();
            })
            .done();
    });

    it("release-nativescript fails if the platforms/app build folder can't be found and the --build switch was false", (done: MochaDone): void => {
        var bundleName = "bundle.js";
        var command: cli.IReleaseNativeScriptCommand = {
            type: cli.CommandType.releaseNativeScript,
            appName: "a",
            appStoreVersion: null,
            deploymentName: "Staging",
            description: "Test no build folder",
            mandatory: false,
            rollout: null,
            build: false,
            platform: "android"
        };

        ensureInTestAppDirectory();

        var release: Sinon.SinonSpy = sandbox.stub(cmdexec, "release", () => { return Q(<void>null) });
        var releaseNativeScript: Sinon.SinonSpy = sandbox.spy(cmdexec, "releaseNativeScript");

        cmdexec.execute(command)
            .then(() => {
                done(new Error("Did not throw error."));
            })
            .catch((err) => {
                assert(!!err.message);
                sinon.assert.notCalled(release);
                sinon.assert.notCalled(spawn);
                done();
            })
            .done();
    });

    it("release-nativescript fails if a release build was requested for Android without the keystore switches", (done: MochaDone): void => {
        var bundleName = "bundle.js";
        var command: cli.IReleaseNativeScriptCommand = {
            type: cli.CommandType.releaseNativeScript,
            appName: "a",
            appStoreVersion: null,
            deploymentName: "Staging",
            description: "Test no build folder",
            mandatory: false,
            rollout: null,
            build: true,
            isReleaseBuildType: true,
            platform: "android"
        };

        ensureInTestAppDirectory();

        var release: Sinon.SinonSpy = sandbox.stub(cmdexec, "release", () => { return Q(<void>null) });
        var releaseNativeScript: Sinon.SinonSpy = sandbox.spy(cmdexec, "releaseNativeScript");

        cmdexec.execute(command)
            .then(() => {
                done(new Error("Did not throw error."));
            })
            .catch((err) => {
                assert.equal(err.message, "When requesting a release build for Android, these parameters are required: keystorePath, keystorePassword, keystoreAlias and keystoreAliasPassword.");
                sinon.assert.notCalled(release);
                sinon.assert.notCalled(spawn);
                done();
            })
            .done();
    });

    it("release-nativescript fails if targetBinaryRange is not a valid semver range expression", (done: MochaDone): void => {
        var bundleName = "bundle.js";
        var command: cli.IReleaseNativeScriptCommand = {
            type: cli.CommandType.releaseNativeScript,
            appName: "a",
            appStoreVersion: "notsemver",
            deploymentName: "Staging",
            description: "Test uses targetBinaryRange",
            mandatory: false,
            rollout: null,
            build: true,
            isReleaseBuildType: false,
            platform: "android"
        };

        ensureInTestAppDirectory();

        var release: Sinon.SinonSpy = sandbox.stub(cmdexec, "release", () => { return Q(<void>null) });
        var releaseNativeScript: Sinon.SinonSpy = sandbox.spy(cmdexec, "releaseNativeScript");

        cmdexec.execute(command)
            .then(() => {
                done(new Error("Did not throw error."));
            })
            .catch((err) => {
                assert.equal(err.message, "Please use a semver-compliant target binary version range, for example \"1.0.0\", \"*\" or \"^1.2.3\".");
                sinon.assert.notCalled(release);
                sinon.assert.notCalled(spawn);
                done();
            })
            .done();
    });

    it("sessionList lists session name and expires fields", (done: MochaDone): void => {
        var command: cli.IAccessKeyListCommand = {
            type: cli.CommandType.sessionList,
            format: "json"
        };

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(log);
                assert.equal(log.args[0].length, 1);

                var actual: string = log.args[0][0];
                var expected = [
                    {
                        loggedInTime: 0,
                        machineName: TEST_MACHINE_NAME,
                    }
                ];

                assertJsonDescribesObject(actual, expected);
                done();
            });
    });

    it("sessionRemove removes session", (done: MochaDone): void => {
        var machineName = TEST_MACHINE_NAME;
        var command: cli.ISessionRemoveCommand = {
            type: cli.CommandType.sessionRemove,
            machineName: machineName
        };

        var removeSession: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "removeSession");

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.calledOnce(removeSession);
                sinon.assert.calledWithExactly(removeSession, machineName);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, `Successfully removed the login session for "${machineName}".`);

                done();
            });
    });

    it("sessionRemove does not remove session if cancelled", (done: MochaDone): void => {
        var machineName = TEST_MACHINE_NAME;
        var command: cli.ISessionRemoveCommand = {
            type: cli.CommandType.sessionRemove,
            machineName: machineName
        };

        var removeSession: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "removeSession");

        wasConfirmed = false;

        cmdexec.execute(command)
            .done((): void => {
                sinon.assert.notCalled(removeSession);
                sinon.assert.calledOnce(log);
                sinon.assert.calledWithExactly(log, "Session removal cancelled.");

                done();
            });
    });

    it("sessionRemove does not remove current session", (done: MochaDone): void => {
        var machineName = os.hostname();
        var command: cli.ISessionRemoveCommand = {
            type: cli.CommandType.sessionRemove,
            machineName: machineName
        };

        var removeSession: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "removeSession");

        wasConfirmed = false;

        cmdexec.execute(command)
            .then(() => {
                done(new Error("Did not throw error."));
            })
            .catch((err) => {
                done();
            })
            .done();
    });

    function releaseHelperFunction(command: cli.IReleaseCommand, done: MochaDone, expectedError: string): void {
        var release: Sinon.SinonSpy = sandbox.spy(cmdexec.sdk, "release");
        cmdexec.execute(command)
            .done((): void => {
                throw "Error Expected";
            }, (error: any): void => {
                assert(!!error);
                assert.equal(error.message, expectedError);
                done();
            });
    }
});
