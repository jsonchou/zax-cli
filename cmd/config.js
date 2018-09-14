#!/usr/bin/env node

'use strict';
const path = require('path')

const beautify = require("js-beautify").js_beautify

const subPath = process.cwd()
const basePath = path.join(subPath, 'build/config.js')
const config = require(basePath)

class CONFIG {
    constructor(args) {

    }
    cmd() {
        let list = Object.keys(config.list);
        let liston = {};
        list.map(c => {
            liston[c] = [];
            let arr = config.list[c];
            liston[c] = liston[c].concat(arr.filter(c => c.on == true));
        });
        console.log(liston)
    }
}

module.exports = CONFIG