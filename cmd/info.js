#!/usr/bin/env node

'use strict';
const path = require('path')
const chalk = require('chalk')

const beautify = require("js-beautify").js_beautify

const subPath = process.cwd()
const basePath = path.join(subPath, 'build/config.js')
const serverConfig = require(basePath)

class INFO {
    constructor(config) {
        this.config = config;
    }
    cmd() {
        let { ftp, spa, list, all } = this.config;
        let res;
        if (ftp) {
            res = serverConfig['ftp'];
        } else if (spa) {
            res = serverConfig['spa'];
        } else if (list) {
            let list = Object.keys(serverConfig.list);
            let liston = {};
            list.map(c => {
                liston[c] = [];
                let arr = serverConfig.list[c];
                liston[c] = liston[c].concat(arr.filter(c => c.on == true));
            });
            res = liston;
        } else if (all) {
            let ftp = serverConfig['ftp']
            let spa = serverConfig['spa']
            let list = Object.keys(serverConfig.list);
            let liston = {};
            list.map(c => {
                liston[c] = [];
                let arr = serverConfig.list[c];
                liston[c] = liston[c].concat(arr.filter(c => c.on == true));
            });
            res = {
                ftp, spa, list: liston
            }
        } else {

            console.log()
            console.log('  ' + chalk.red.bold('Incorret arguments'))
            console.log(`  Run ${chalk.cyan(`zax info --help`)} for detailed usage.`)
            console.log()
            return;

        }
        console.log(res);
        process.exit();
    }
}

module.exports = INFO