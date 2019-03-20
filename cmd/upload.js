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

const rainbow = require('done-rainbow')

const conn = new Client();
const serverPathPrefix = '/www/website/assets/subject'; //服务器路径地址

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
        // clear redis catch
        return new Promise((resolve, reject) => {

            if (this.assets === 'images') {
                resolve('done');
                return;
            }
            if (config.machine.indexOf('test') > -1) {
                // reject(false)
                resolve('done');
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
                let res = await Promise.all(proms).catch(err => {
                    console.log('_checkSpaProject', err)
                });
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
    sleep(slp) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('awake')
            }, slp)
        })
    }
    _preCreateServerDir(serverDirs) {
        let createDir = serverDir => {
            return new Promise((resolve, reject) => {
                conn.exec(`mkdir -p ${serverDir}`, (err, stream) => {
                    // if (err) {
                    //     console.log('mkdir ', err)
                    //     reject(err)
                    // } else {
                    //     resolve('mkdir done')
                    // }
                    resolve('mkdir done')
                })
            })
        }

        let proms = []
        serverDirs.map(item => {
            let res = createDir(item).catch(err => {
                console.log('createDir err', err)
            })
            proms.push(res)
        })
        return proms
    }
    _singleUpload(sftp, localPath, serverFolder, fileName) {
        return new Promise((resolve, reject) => {
            let serverFile = path.join(serverFolder, fileName)

            console.log(2222222, serverFile)

            try {
                sftp.fastPut(localPath, serverFile, {
                    concurrency: 200
                }, (err, res) => {
                    if (err) {
                        console.log('---fastPut error2---')
                        console.log('serverFolder', serverFolder)
                        console.log('localPath', localPath)
                        console.log('serverFile', fileName)
                        console.log('err', err)
                        console.log('-----\r\n')
                        reject(err)
                    }

                    console.log(`${chalk.green('done:')} ` + serverFile.replace(serverPathPrefix, ''))
                    resolve('done')
                })

            } catch (err) {
                reject(err)
                // throw new Error('fastPut', err)
            }

        })
    }
    _testPromise() {
        return new Promise((resolve, reject) => {
            console.log('test outer')
            setTimeout(() => {
                console.log('test inner')
                resolve('test done')
            }, 4000)
        })
    }
    async _singleSafeCheck(configFile, htmlFile) {
        //check by env
        if (this.env !== 'production') {
            return true;
        }

        // check config assets path
        if (configFile.machine || configFile.machineBox) {
            console.error('config:machine params should be production env');
            process.exit();
            return false;
        }

        //check assets path
        if (configFile.assetsPath.indexOf('staticdaily') > -1) {
            console.error('config:assetsPath params should be production env');
            process.exit();
            return false;
        }

        // check html inner assets path
        if (htmlFile.indexOf('staticdaily') > -1) {
            console.error('your html inner path should be production env');
            process.exit();
            return false;
        }

        return true;


    }
    async _upload() {

        sftp = await this.connectServer().catch(err => {
            console.log('connectServer', err)
        });
        let spa = this.devConfig.spa;

        return new Promise(async (resolve, reject) => {
            //创建sftp

            let hasSpa = await this._checkSpaProject().catch(err => {
                console.log('_checkSpaProject', err)
            });
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

                        let projectConfigFile = require(path.join(spaRoot, 'api/config'));
                        if (projectConfigFile.ftp) {
                            files.push(path.join(spaRoot, `index.html`));
                        }

                        let projectHtmlFile = fs.readFileSync(path.join(spaRoot, 'index.html'), 'utf8');

                        let safeCheck = this._singleSafeCheck(projectConfigFile, projectHtmlFile);

                        if (!safeCheck) {
                            return;
                        }

                        let proms = [];
                        let myserverfolders = []

                        files.sort((a, b) => a.length < b.length ? 1 : -1).map(localPath => {
                            try {
                                let stats = fs.lstatSync(localPath)
                                if (stats) {
                                    let serverPath = serverPathPrefix + localPath.slice(path.join(subPath).length);
                                    if (stats.isFile()) {
                                        let serverFolder = serverPath.slice(0, serverPath.lastIndexOf('/'));
                                        let fileName = localPath.slice(localPath.lastIndexOf('/') + 1)
                                        myserverfolders.push(serverFolder)
                                        let myprom = this._singleUpload(sftp, localPath, serverFolder, fileName)
                                        proms.push(myprom)
                                    }
                                }
                            } catch (err) {
                                throw new Error('lstatSync', err)
                            }
                        })

                        myserverfolders = [...new Set(myserverfolders)]

                        await Promise.all(this._preCreateServerDir(myserverfolders)).catch(err => {
                            console.log('_preCreateServerDir err', err)
                        })

                        // await this.sleep(200)

                        await Promise.all(proms).catch(err => {
                            console.log('Promise.all upload', err)
                        });

                        await this._preFetchHtml(project, projectConfigFile).catch(err => {
                            console.log('_preFetchHtml', err)
                        });

                        sftp.end();

                        if (this.env !== 'production') {
                            console.log('\r\n')
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
                    await this._upload().catch(err => {
                        console.log('_upload', err)
                    });
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
            await this._upload().catch(err => {
                console.log('_upload', err)
            });
            setTimeout(() => {
                process.exit()
            }, 1000)
        }
    }
}

module.exports = UPLOAD;