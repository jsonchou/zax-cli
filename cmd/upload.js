#!/usr/bin/env node

'use strict';

const fs = require('fs-extra');
const request = require('request');
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

let sftp
let spinner

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
        return new Promise((resolve, reject) => {

            if (this.assets === 'images') {
                resolve('done');
                return;
            }
            if (config.machine.indexOf('test') > -1) {
                reject(false)
                return;
            }
            try {
                let url = `https://evt${config.machine}.zhongan.com/${this.devConfig.spa.charAt(0)}/${project.name}/?force=true&v=${Date.now()}&bizOrigin=fromSystemForceUpdate`;
                // console.log(url, 'prefectchhtml')
                request.get(url).on('response', res => {
                    resolve('done');
                })
            } catch (err) {
                reject(err)
                throw new Error(err);
            }
        })
    }
    async _checkSpaProject() {
        let spa = this.devConfig.spa;
        let openProjects = this.devConfig.list[spa].filter(item => item.on == true);

        let _tinyEvt = async (file, name) => {
            return new Promise((resolve, reject) => {
                let res = fs.existsSync(file);
                if (res == false) {
                    console.log(`You have no ${chalk.yellow(spa + '/' + name)} porject, you can turn it on in your configuration file, or you can run ${chalk.yellow('zax create')} to get a new ${spa}/${name} project`)
                    process.exit();
                }
                resolve(res)
            })
        }

        return new Promise(async (resolve, reject) => {
            if (openProjects.length) {
                let proms = [];
                openProjects.map(async project => {
                    let spaRootHtml = path.join(subPath, `${spa}/${project.name}`);
                    proms.push(_tinyEvt(spaRootHtml, project.name));
                })
                let res = await Promise.all(proms);
                resolve(res)
            } else {
                console.log(`You have no open porject, you can turn it on in your configuration file, or you can run ${chalk.yellow('zax create')} to get a new project`)
                process.exit();
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
    async _singleUpload(sftp, file, serverFile) {

        return new Promise((resolve, reject) => {
            let serverDir = serverFile.slice(0, serverFile.lastIndexOf('/') + 1);
            try {
                conn.exec(`mkdir -p ${serverDir}`, (err, stream) => {

                    // if (err) {
                    // console.log('conn.exec mkdir', err)
                    // return sftp.end();
                    // throw err;
                    // }

                    let _unitUplod = () => {
                        try {

                            sftp.fastPut(file, serverFile, { concurrency: 64 }, (err, res) => {
                                console.log(serverFile.replace(serverPathPrefix, ''))
                                resolve('done')
                                // sftp.end();
                            })

                            // let readStream = fs.createReadStream(file);
                            // let writeStream = sftp.createWriteStream(serverFile, { flags: 'w' });
                            // writeStream.on('close', () => {
                            //     // console.log(serverFile.replace(serverPathPrefix, ''))
                            //     // readStream.destroy();
                            //     // writeStream.destroy();
                            //     // return resolve('done')
                            // }).on('end', () => {
                            //     console.log('ftp end')
                            //     conn.close();
                            // }).on('error', (err) => {
                            //     console.log('sftp put err:', err);
                            // }).on('finish', () => {
                            //     // console.log('sftp put finish:');
                            //     console.log('done', serverFile.replace(serverPathPrefix, ''))
                            //     readStream.destroy();
                            //     writeStream.destroy();
                            //     resolve('done')
                            // })
                            // readStream.pipe(writeStream, (err, res) => {
                            //     console.log(err, res, 321)
                            // });


                        } catch (err) {
                            throw new Error('fastPut', err)
                        }
                    }

                    if (stream) {
                        stream.on('close', function (code, signal) {
                            // console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                            // console.log('stream close if')
                            _unitUplod();
                            // conn.end();
                        }).on('data', function (data) {
                            console.log('STDOUT: ' + data);
                        }).stderr.on('data', function (data) {
                            console.log('STDERR: ' + data);
                        });
                    } else {
                        // console.log('stream else')
                        _unitUplod();
                        // reject('no stream', stream)
                    }

                })
            } catch (err) {
                throw new Error('mkdir', err)
            }
        })
    }
    async _upload() {

        sftp = await this.connectServer();
        let spa = this.devConfig.spa;

        return new Promise(async (resolve, reject) => {
            //创建sftp

            let hasSpa = await this._checkSpaProject();
            if (hasSpa) {
                let openProjects = this.devConfig.list[spa].filter(item => item.on == true);
                if (openProjects.length) {
                    let lens = openProjects.length;
                    let spinner = new Ora();
                    openProjects.map(async (project, index) => {

                        // spinner.text = `Upload ${spa} ${project.name} assets of ${chalk.bold.cyan(this.assets)} to ${chalk.green(this.env)}\r\n`;
                        // spinner.start();

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

                        files.sort((a, b) => a > b).map(async sub => {
                            try {
                                let stats = fs.lstatSync(sub)
                                if (stats && stats.isFile()) {
                                    let serverFile = serverPathPrefix + sub.slice(path.join(subPath).length);
                                    proms.push(this._singleUpload(sftp, sub, serverFile))
                                }
                            } catch (err) {
                                throw new Error('lstatSync', err)
                            }
                        })

                        await Promise.all(proms).catch(err => {
                            console.log(err, 'Promise.all')
                        });

                        sftp.end();
                        let projectConfigFile = require(path.join(spaRoot, 'api/config'));
                        await this._preFetchHtml(project, projectConfigFile)
                        if (this.env !== 'production') {
                            spinner.succeed(`Upload ${spa} ${project.name} assets of ${chalk.bold.cyan(this.assets)} to ${chalk.green(this.env)}, done!\r\n`);
                        }
                        resolve('upload done')

                    });
                }
            } else {
                console.log(`No prjects here, you should run [${chalk.bold.yellow('zax create')}] command to init your project`)
                reject('No prjects here')
            }
        })

    }
    async cmd() {
        if (this.env === 'production') {
            inquirer.prompt(reconfirm).then(async res => {
                if (res.continue) {
                    await this._upload()
                    rainbow(`${this.devConfig.spa}/${this.assets} upload to ${this.env} environment, done!`);
                    setTimeout(() => {
                        process.exit()
                    }, 2000)
                } else {
                    console.log(chalk.green('Nice, your operation has been canceled~'))
                    process.exit()
                }
            });
        } else {
            await this._upload()
            setTimeout(() => {
                process.exit()
            }, 1000)
        }
    }
}

module.exports = UPLOAD;