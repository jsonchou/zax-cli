#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path')
const { execSync } = require('child_process');

// const zaxSpa = require('zax-spa');

const commander = require('commander');
const request = require('request');
const superagent = require('superagent');
const progressBar = require('progress');
const chalk = require('chalk');
const ncp = require('ncp').ncp;

const co = require('co');
const prompt = require('co-prompt');
const glob = require("glob")
const beautify = require("js-beautify").js_beautify

// console.log(process.execPath)
// console.log(__dirname)
// console.log(process.cwd())

const subPath = process.cwd(); //subject path
const zaxPath = __dirname;

const basePath = path.join(subPath, 'build/base.js');

const base = require(basePath);

const getDirectories = (dir = '.') => {
    if (fs.existsSync(dir)) {
        return fs.readdirSync(dir).map(item => path.join(dir, item)).filter(item => {
            return fs.lstatSync(item).isDirectory()
        })
    } else {
        return [];
    }
}

let barOpts = {
    total: 30,
};

const replaceTable = {
    '__spaDir__': '', //20170303
    '__spaMode__': '', //react,vue,common
}

let replaceEvt = co.wrap(function*(folder, spaType, stateType) {

    replaceTable['__spaDir__'] = folder;
    replaceTable['__spaMode__'] = spaType;

    let folderPath = path.join(subPath, `./${spaType}/${folder}`);
    let tmp = getDirectories(folderPath);
    if (tmp && tmp.length) {
        console.log(chalk.bold.red('The project name ' + folder + ' has been used'));
        process.exit(0);
        return;
    } else {

        let pe = yield prompt(chalk.bold.green('需求方: '));
        let description = yield prompt(chalk.bold.green('需求描述: '));
        let develper = yield prompt(chalk.bold.green('前后端: '));
        let designer = yield prompt(chalk.bold.green('设计师: '));

        base.list[spaType].push({ name: folder, on: true, txt: description, pro: pe, design: designer, dev: develper });

        let strm = beautify(JSON.stringify(base), {
            // "indent_size": 4,
            // "indent_char": " ",
            // "eol": "auto",
            "preserve_newlines": true,
            // "break_chained_methods": false,
            // "max_preserve_newlines": 0,
            // "space_in_paren": false,
            // "space_in_empty_paren": false,
            // "jslint_happy": false,
            // "space_after_anon_function": false,
            "keep_array_indentation": false,
            // "space_before_conditional": true,
            // "unescape_strings": false,
            // "wrap_line_length": 0,
            // "e4x": false,
            // "end_with_newline": false,
            // "comma_first": false,
            "brace_style": "collapse"
        });

        fs.writeFileSync(basePath, "module.exports =" + strm, 'utf8', { flag: 'w' });

        let sourcePath = path.join(subPath, `./node_modules/zax-package/package/${spaType == 'react' ? spaType + '/' + stateType : spaType}`);

        // check zax-package exist
        if (!fs.existsSync(sourcePath)) {
            console.log(chalk.bold.red(`you can input`), chalk.bold.underline.green('zax update'), chalk.bold.red(`command to download or update the package`));
            process.exit(0);
            // return;
        }

        fs.mkdirSync(folderPath);

        let bar = new progressBar(chalk.bold.green('handling zax-cli [:bar] :percent :etas'), { total: barOpts.total });

        let timer = setInterval(function() {
            bar.tick();
            if (bar.complete) {
                clearInterval(timer);
                console.log(chalk.bold.green('done!'));
                console.log(chalk.bold.blue('remember to synchronize information to your README.md'));
                process.exit(0);
            }
        }, 100);

        ncp(sourcePath, folderPath, {}, function(err) {
            if (err) {
                console.log(chalk.bold.red(err));
                process.exit(0);
            }

            let res = glob.sync(folderPath + "/**/*.*", {})
            let resLen = res.length;

            res.forEach((item, index) => {

                fs.readFile(item, 'utf8', (err, data) => {
                    if (err) {
                        bar.interrupt(chalk.bold.red(err));
                        process.exit(0);
                    }

                    data && Object.keys(replaceTable).forEach(c => {
                        let rex = new RegExp(c, 'gi');
                        data = data.replace(rex, replaceTable[c])
                    })

                    data && fs.writeFile(item, data, 'utf8', function(err) {
                        if (err) {
                            bar.interrupt(chalk.bold.red(err));
                            process.exit(0);
                        }
                    });
                });

            })
        })
    }
});

commander
    .version(require('./package').version)
    .arguments('<cmd>')
    .option('-s, --spa type <spa>', 'The spa type as')
    .option('-f, --folder name <folder>', 'The spa folder name as')
    .option('-u, --update zax-package <update>', 'Update or Install latest zax-package')
    .option('-i, --boot cli <update>', 'Boot cli')
    .action(function(cmd) {
        if (cmd == 'init') {
            co(function*() {
                let spa = yield prompt(`spa project type：${chalk.bold.green('vue[0]')}，${chalk.bold.green('react[1]')}，${chalk.bold.green('common[2]')}：`);
                if (spa == 0 || spa.toLowerCase() == 'vue' || spa == 2 || spa.toLowerCase() == 'common') {
                    let spaType = (spa == 0 || spa.toLowerCase() == 'vue') ? 'vue' : 'common';
                    let folder = yield prompt('project name: ');
                    if (!folder) {
                        console.log(chalk.bold.red('please input correct project name：'));
                        process.exit(0);
                    }

                    replaceEvt(folder, spaType)

                } else if (spa == 1 || spa.toLowerCase() == 'react') {
                    let spa = yield prompt(`please input your spa state management type：${chalk.bold.green('redux[0]')}，${chalk.bold.green('mobx[1]')}：`);
                    if (spa == 0 || spa.toLowerCase() == 'redux' || spa == 1 || spa.toLowerCase() == 'redux') {
                        let stateType = (spa == 0 || spa.toLowerCase() == 'redux') ? 'redux' : 'mobx';
                        let folder = yield prompt('project name: ');
                        if (!folder) {
                            console.log(chalk.bold.red('please input correct project name：'));
                            process.exit(0);
                        }

                        replaceEvt(folder, 'react', stateType)

                    } else {
                        console.log(`Please choose correct spa state management type：${chalk.bold.green('redux[0]')}，${chalk.bold.green('mobx[1]')}：`);
                        process.exit(0);
                        return;
                    }
                } else {
                    console.log(`Please choose correct spa project type：${chalk.bold.green('vue[0]')}，${chalk.bold.green('react[1]')}，${chalk.bold.green('common[2]')}：`);
                    process.exit(0);
                }
            })
        } else if (cmd == 'update') {
            //download zax-package

            let bar = new progressBar(chalk.bold.green('downloading zax-package [:bar] :percent :etas'), { total: barOpts.total });

            let timer = setInterval(function() {
                bar.tick();
                if (bar.complete) {
                    console.log(chalk.bold.green('zax-package donwload successfull'));
                    clearInterval(timer);
                }
            }, 100);

            execSync('cnpm install zax-package')

            if (bar.complete) {
                process.exit(0);
            }

        } else {
            console.log(chalk.bold.red('illegal command : ' + cmd));
            process.exit(0);
        }
    }).parse(process.argv);