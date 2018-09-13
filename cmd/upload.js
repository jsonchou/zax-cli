#!/usr/bin/env node

'use strict';

const fs = require('fs-extra');
const path = require('path');
const Client = require('ssh2').Client;
const http = require('http');
const glob = require("glob")
const chalk = require('chalk')

const Ora = require('ora');

const conn = new Client();
const serverPathPrefix = '/www/website/assets/subject';//服务器路径地址

const subPath = process.cwd()

let spinner;

class UPLOAD {
    constructor(config, assets, env) {
        this.devConfig = config || {};
        this.assets = assets;
        this.env = env;
        // console.log(config, assets, env, 123)
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
            }).connect(this.devConfig.server[this.env]);
        });
    }
    async cmd() {

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
}

module.exports = UPLOAD;