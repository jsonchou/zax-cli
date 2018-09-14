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
    async _preFetchHtml() {
        // clear redis cache
        http.get('')
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
    async _upload() {
        spinner = new Ora({
            text: `Uploading assets ${chalk.bold.cyan(this.assets)} to ${chalk.green(this.env)}`,
            spinner: process.argv[2]
        });

        spinner.start();

        //创建sftp
        let sftp = await this.connectServer();
        let spa = this.devConfig.spa;
        let openPorjects = this.devConfig.list[spa].filter(item => item.on == true);

        if (openPorjects.length) {
            openPorjects.map(async project => {

                let spaRoot = path.join(subPath, `${spa}/${project.name}`);

                let files = [];

                if (this.assets === 'all') {
                    files = glob.sync(path.join(spaRoot, 'assets/!(_src)/**/*'));
                } else {
                    files = glob.sync(path.join(spaRoot, `assets/${this.assets}/**/*`));
                    //额外上传首页
                }

                files.push(path.join(spaRoot, `index.html`));

                files.sort((a, b) => a < b).map(async sub => {
                    fs.lstat(sub, (err, stats) => {
                        if (stats && stats.isFile()) {
                            let serverFile = serverPathPrefix + sub.slice(path.join(subPath).length);
                            let serverDir = serverFile.slice(0, serverFile.lastIndexOf('/') + 1);

                            conn.exec(`mkdir -p ${serverDir}`, function (err, res) {
                                sftp.fastPut(sub, serverFile, {}, (err, res) => {
                                    // console.log(sub, serverFile, 'done fastPut')
                                })
                            })

                        }
                    })
                })

                setTimeout(() => {
                    spinner.succeed(`Upload assets ${chalk.bold.cyan(this.assets)} to ${chalk.green(this.env)}, done`);
                }, 1000)

            });
        } else {
            console.log(`  ` + chalk.red(`No open ${chalk.yellow(this.devConfig.spa)} project.`))
            console.log()
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