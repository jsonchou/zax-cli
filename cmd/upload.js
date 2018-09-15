#!/usr/bin/env node

'use strict';

const fs = require('fs-extra');
const http = require('http');
const path = require('path');
const inquirer = require('inquirer')
const Client = require('ssh2').Client;
const glob = require("glob")
const chalk = require('chalk')
const Ora = require('ora');

const rainbow = require('../libs/rainbow')

const conn = new Client();
const serverPathPrefix = '/www/website/assets/subject';//服务器路径地址

const subPath = process.cwd()

let spinner;

let reconfirm = [{
    type: 'confirm',
    name: 'continue',
    message: 'Oh boy, you are playing with fire, do you really want upload your assets to production environment by ZAX CLI ?',
    default: false
}]
class UPLOAD {
    constructor(config, assets, env) {
        this.devConfig = config || {};
        this.assets = assets;
        this.env = env;
        // console.log(config, assets, env, 123)

        if (env === 'development') {
            this._genCliBox(env, 'green')

        } else if (env === 'production') {
            this._genCliBox(env + ' ', 'red')
        }

        console.log();
        console.log();

    }
    async _genCliBox(env, color) {
        console.log(chalk[color]('-'.repeat(30)))
        console.log(chalk[color]('|' + (' '.repeat(28)) + '|'))
        console.log(chalk[color]('|' + (' '.repeat(28)) + '|'))
        console.log(chalk[color]('|' + (' '.repeat(28)) + '|'))
        console.log(chalk[color]('|'.repeat(1)) + (' '.repeat(8)) + chalk[color].bold(env) + (' '.repeat(9)) + chalk[color]('|'.repeat(1)))
        console.log(chalk[color]('|' + (' '.repeat(28)) + '|'))
        console.log(chalk[color]('|' + (' '.repeat(28)) + '|'))
        console.log(chalk[color]('|' + (' '.repeat(28)) + '|'))
        console.log(chalk[color]('-'.repeat(30)))
    }
    async _preFetchHtml(project, config) {
        // clear redis cache
        if (config.machine.indexOf('test') > -1) {
            return;
        }
        http.get(`https://evt${machine}.zhongan.com/${this.devConfig.spa.charAt(0)}/${project.name}/?force=true&v=${Date.now()}&bizOrigin=fromSystemForceUpdate`)
    }
    async _checkSpaProject() {
        let spa = this.devConfig.spa;
        let openProjects = this.devConfig.list[spa].filter(item => item.on == true);

        let _tinyEvt = async (file) => {
            return new Promise((resolve, reject) => {
                let res = fs.existsSync(spaRootHtml);
                if (res) {
                    resolve(true)
                } else {
                    reject(false)
                }
            })
        }

        return new Promise(async (resolve, reject) => {
            if (openProjects.length) {
                let proms = [];
                openProjects.map(async project => {
                    let spaRootHtml = path.join(subPath, `${spa}/${project.name}/index.html`);
                    proms.push(_tinyEvt(spaRootHtml));
                })
                let res = await Promise.all(proms);
                if (res.some(item => item == true)) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            } else {
                console.log(`  ` + chalk.red(`No open ${chalk.yellow(this.devConfig.spa)} project.`))
                console.log()
                reject(false)
            }
        })
    }
    async connectServer() { // 连接服务器
        return new Promise((resolve, reject) => {
            conn.on('ready', () => {
                conn.sftp((err, sftp) => { // stfp 连接
                    if (err) {
                        reject(err);
                    }
                    resolve(sftp);
                });
            }).on('error', (err) => {
                reject(err);
            }).connect(this.devConfig.ftp[this.env]);
        });
    }
    async _singleUpload(file, serverFile) {
        return new Promise((resolve, reject) => {
            let serverDir = serverFile.slice(0, serverFile.lastIndexOf('/') + 1);
            try {
                conn.exec(`mkdir -p ${serverDir}`, function (err, res) {
                    try {
                        sftp.fastPut(file, serverFile, {}, (err, res) => {
                            // console.log(sub, serverFile, 'done fastPut')
                            resolve('done');
                        })
                    } catch (err) {
                        throw new Error('fastPut', err)
                    }
                })
            } catch (err) {
                throw new Error('mkdir', err)
            }
        })
    }
    async _upload() {
        spinner = new Ora({
            text: `Uploading assets ${chalk.bold.cyan(this.assets)} to ${chalk.green(this.env)}`,
            spinner: process.argv[2]
        });

        spinner.start();

        //创建sftp
        let sftp = await this.connectServer();
        let spa = this.devConfig.spa;

        let hasSpa = await this._checkSpaProject();
        console.log(hasSpa, 1111)
        return;
        if (hasSpa) {
            let openProjects = this.devConfig.list[spa].filter(item => item.on == true);

            if (openProjects.length) {
                openProjects.map(async project => {

                    let spaRoot = path.join(subPath, `${spa}/${project.name}`);

                    let files = [];

                    if (this.assets === 'all') {
                        files = glob.sync(path.join(spaRoot, 'assets/!(_src)/**/*'));
                    } else {
                        files = glob.sync(path.join(spaRoot, `assets/${this.assets}/**/*`));
                    }

                    if (this.assets !== 'images') {
                        files.push(path.join(spaRoot, `index.html`));
                    }

                    let proms = [];

                    files.sort((a, b) => a < b).map(async sub => {
                        try {
                            let stats = fs.lstatSync(sub)
                            if (stats && stats.isFile()) {
                                let serverFile = serverPathPrefix + sub.slice(path.join(subPath).length);
                                proms.push(this._singleUpload(sub, serverFile))
                            }
                        } catch (err) {
                            throw new Error('lstatSync', err)
                        }
                    })

                    let ftpRes = await Promise.all(proms);

                    let projectConfigFile = require(path.join(spaRoot, 'api/config'));

                    this._preFetchHtml(project, projectConfigFile)

                    spinner.succeed(`Upload ${spa} ${project.name} assets of ${chalk.bold.cyan(this.assets)} to ${chalk.green(this.env)}, done`);

                });
            }
        }
    }
    async cmd() {
        if (this.env === 'production') {
            inquirer.prompt(reconfirm).then(res => {
                if (res.continue) {
                    this._upload()
                    rainbow(`Your ${this.devConfig.spa} assets ${this.assets} has been uploaded to ${this.env} environment`);
                } else {
                    console.log(chalk.green('Nice, your operation has been canceled~'))
                    process.exit()
                }
            });
        } else {
            this._upload()
        }

    }
}

module.exports = UPLOAD;