#!/usr/bin/env node

'use strict';
const path = require('path')
const chalk = require('chalk')

const beautify = require("js-beautify").js_beautify

const subPath = process.cwd()
const basePath = path.join(subPath, 'build/config.js')
const config = require(basePath)

class INFO {
    constructor(info) {
        this.info = info;
    }
    cmd() {
        let { ftp, spa, list } = this.info;
        let res;
        if (ftp) {
            res = config['ftp'];
        } else if (spa) {
            res = config['spa'];
        } else if (list) {
            let list = Object.keys(config.list);
            let liston = {};
            list.map(c => {
                liston[c] = [];
                let arr = config.list[c];
                liston[c] = liston[c].concat(arr.filter(c => c.on == true));
            });
            res = liston;
        } else {
            
            console.log()
            console.log(chalk.red.bold('Incorret arguments'))
            console.log(`  Run ${chalk.cyan(`zax info --help`)} for detailed usage.`)
            console.log()

        }
        console.log(res);
    }
}

module.exports = INFO