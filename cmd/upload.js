'use strict';

const fs = require('fs-extra');
const klawSync = require('klaw-sync')
const request = require('request');
const path = require('path');
const inquirer = require('inquirer')
const Client = require('ssh2').Client;
const glob = require("glob")
const chalk = require('chalk')
const Ora = require('ora');
const { zaxDate } = require('zax-date');
const rainbow = require('done-rainbow')

const conn = new Client();
let serverPathPrefix = '/www/website/assets/subject'; //服务器路径地址

const subPath = process.cwd()

let sftp
let spinner
let fileCount = 0

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

        let hasSpa = await this._checkSpaProject().catch(err => {
            console.log('_checkSpaProject', err)
        });

        if (hasSpa) {
            let openProjects = this.devConfig.list[spa].filter(item => item.on == true);
            if (openProjects.length) {
                let lens = openProjects.length;
                let spinner = new Ora();
                let tmpProms = []
                openProjects.map(async (project, index) => {

                    let myProjectProm = new Promise(async (resolve, reject) => {

                        // spinner.text = `Upload ${spa} ${project.name} assets of ${chalk.bold.cyan(this.assets)} to ${chalk.green(this.env)}\r\n`;
                        // spinner.start();

                        let spaRoot = path.join(subPath, `${spa}/${project.name}`);

                        let myFiles = [];
                        let projectConfigFile = require(path.join(spaRoot, 'api/config'));
                        let projectHtmlFile = fs.readFileSync(path.join(spaRoot, 'index.html'), 'utf8');

                        let safeCheck = this._singleSafeCheck(projectConfigFile, projectHtmlFile);

                        if (!safeCheck) {
                            reject('safe check stop')
                            return;
                        }

                        let localDistPath = path.join(spaRoot, 'assets')
                        let firstDir = path.join(serverPathPrefix, spa, project.name, 'assets')
                        // 创建父级文件夹
                        console.log(chalk.green(`\r\nupload ${project.name} start`))
                        conn.exec(`mkdir -p ${firstDir}`, (err, stream) => {
                            // if (err) {
                            //     console.log(chalk.bold.red('fail:'), ' upload dir ', firstDir)
                            // } else {
                            console.log(`${chalk.green('done:')} ` + firstDir)
                            // }
                        })

                        await this.sleep(500)

                        // 额外上传html
                        let myhtml = path.join(spaRoot, 'index.html')
                        let myFlag = myhtml.indexOf('/website/')
                        let myhtmlServerPath = '/www' + myhtml.slice(myFlag)
                        projectConfigFile.ftp && sftp.fastPut(myhtml, myhtmlServerPath, { concurrency: 64, chunkSize: 32768 }, (err, result) => {
                            console.log(`${chalk.green('\r\nupload index.html')}`)
                            console.log(`${chalk.green('done:')} ` + myhtmlServerPath.replace(serverPathPrefix, ''))
                        });

                        await this._preFetchHtml(project, projectConfigFile).catch(err => {
                            console.log('_preFetchHtml', err)
                        });

                        // 上传文件夹
                        const dirs = klawSync(localDistPath, { nofile: true }).sort((a, b) => {
                            return a.path > b.path ? 1 : -1;
                        })

                        console.log(`${chalk.green('\r\nupload dirs:')}`)
                        dirs.map(item => {
                            let dirPath = item.path
                            let flag = dirPath.indexOf('/website/')
                            let serverPath = '/www' + dirPath.slice(flag)
                            sftp.mkdir(`${serverPath}`, { mode: '0755' }, (err, stream) => {
                                // if (err) {
                                //     console.log(chalk.bold.red('fail:'), ' upload dir ', serverPath)
                                // } else {
                                console.log(`${chalk.green('done:')} ` + serverPath.replace(serverPathPrefix, ''))
                                // }
                            })
                        })

                        await this.sleep(500)

                        // 上传文件
                        const files = klawSync(localDistPath, { nodir: true })
                        const filesNum = files.length
                        let proms = []

                        files.map((item, index) => {
                            let filePath = item.path
                            let flag = filePath.indexOf('/website/')
                            let serverPath = '/www' + filePath.slice(flag)
                            let prom = new Promise((resolve, reject) => {
                                try {
                                    sftp.fastPut(filePath, serverPath, (err, result) => {
                                        if (err) {
                                            // console.log('fastPut err', err)
                                            resolve('skip', err)
                                        } else {
                                            console.log(`${chalk.green('done:')} ` + serverPath.replace(serverPathPrefix, ''))
                                            resolve('done')
                                        }
                                    })
                                } catch (err) {
                                    console.log('fastPut catch err', err)
                                    reject(err)
                                }
                            });
                            proms.push(prom)
                        })

                        console.log(`${chalk.green('\r\nupload files:')}`)
                        let promsRes = await Promise.all(proms).catch(err => {
                            console.log('proms all err', err)
                        })

                        // console.log('promsRes', promsRes)

                        console.log(chalk.green(`\r\nupload ${project.name} end`))

                        if (this.env && this.env !== 'production') {
                            console.log('\r\n')
                            spinner.succeed(`Upload ${spa} ${project.name} assets of ${chalk.bold.cyan(this.assets)} to ${chalk.green(this.env)}, done!\r\n`);
                        }

                        resolve(`upload ${project.name} stop`)

                    })
                    tmpProms.push(myProjectProm)
                });

                return tmpProms

            } else {
                console.log(`No prjects here, you should run [${chalk.bold.yellow('zax create')}] command to init your project`)
                return []
            }

        }
        return []
    }
    async cmd() {
        if (this.env === 'production') {
            inquirer.prompt(reconfirm).then(async res => {
                if (res.continue) {
                    let uploadProms = await this._upload()
                    let res = await Promise.all(uploadProms)
                    rainbow(`${this.devConfig.spa}/${this.assets} upload to ${this.env} environment, done!`);
                } else {
                    console.log(chalk.green('Nice, your operation has been canceled~'))
                    process.exit()
                }
            });
        } else {
            let tmStart = Date.now()
            let uploadProms = await this._upload()
            let res = await Promise.all(uploadProms)
            conn.end();
            console.log(zaxDate.diff(tmStart, Date.now()))
        }
    }
}

module.exports = UPLOAD;
