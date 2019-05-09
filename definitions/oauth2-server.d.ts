declare module Express {
    export interface Request {
        user?: any;
    }
}

declare module "oauth2-server" {
    import express = require('express');

    module o {
        interface Server {
            authorise(): express.RequestHandler;
            errorHandler(): express.ErrorRequestHandler;
            grant(): express.RequestHandler;
        }

        interface Model {
            getAccessToken(bearerToken: string, callback: (error: any, accessToken?: AccessToken) => void): void;
            getClient(clientId: string, clientSecret: string, callback: (error: any, client?: Client) => void): void;
            grantTypeAllowed(clientId: string, grantType: string, callback: (error: any, allowed?: boolean) => void): void;
            saveAccessToken(accessToken: string, clientId: string, expires: Date, user: any, callback: (error: any) => void): void;
            getUserFromClient(clientId: string, clientSecret: string, callback: (error: any, user?: User) => void): void;
            generateToken(type: string, req: Express.Request, callback: (error: any, token?: string) => void): void;
        }

        interface AccessToken {
            expires: Date;
            user?: Object;
            userId?: any;
        }

        interface Client {
            clientId: string;
            redirectUri?: string;
        }

        interface User {
            id: any;
        }

        interface ServerOptions {
            model: Model;
            grants?: string[];
            debug?: boolean;
            accessTokenLifetime?: number;
            refreshTokenLifetime?: number;
            authCodeLifetime?: number;
            clientIdRegex?: RegExp;
            passthroughErrors?: boolean;
            continueAfterResponse?: boolean;
        }
    }

    function o(options: o.ServerOptions): o.Server;

    export = o;
}
