#!/usr/bin/env node

'use strict';
const path = require('path')
const notifier = require('node-notifier');
const Ora = require('ora');
const execSync = require('child_process').execSync;

module.exports = async function () {

    const spinner = new Ora({
        text: 'Download zax-package',
        spinner: "dots"
    });

    spinner.start();

    execSync('npm i zax-package -D')

    setTimeout(() => {
        spinner.color = 'blue';
    }, 1000);

    setTimeout(() => {
        spinner.succeed('Download Done');
    }, 2000);

}