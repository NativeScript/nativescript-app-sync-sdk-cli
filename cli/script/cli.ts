/// <reference path="../definitions/external/node/node.d.ts" />

import { Promise } from "q";
import * as parser from "./command-parser";
import { execute } from "./command-executor";
import * as chalk from "chalk";

function run(): void {
    if (!parser.command) {
        parser.showHelp(/*showRootDescription*/false);
        return;
    }

    execute(parser.command)
        .catch((error: any): void => {
            console.error(chalk.red("[Error]  " + error.message));
            process.exit(1);
        })
        .done();
}

run();
