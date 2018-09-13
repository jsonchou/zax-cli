#!/usr/bin/env node

'use strict';
const path = require('path')
const inquirer = require('inquirer')
const gitPkg = require('download-git-repo')
const notifier = require('node-notifier');

const beautify = require("js-beautify").js_beautify
const chalk = require('chalk')
const fs = require('fs-extra')
const rm = require('rimraf').sync
const glob = require('glob')
const Ora = require('ora');

const subPath = process.cwd()
const basePath = path.join(subPath, 'build/config.js')
const config = require(basePath)

const gitUser = require('../git-user')

let spinner, inputProject, inputSubject;

let questions = [{
    type: 'list',
    name: 'spa',
    message: 'What spa do you want?',
    choices: ["Vue", "React", "Preact", new inquirer.Separator(), "Common"],
    filter: function (val) {
        return val.toLowerCase();
    }
}, {
    type: 'confirm',
    name: 'codeSplit',
    message: 'Need code split?',
    default: false,
    when: function (answers) {
        return answers.spa !== 'common';
    }
}, {
    type: 'list',
    name: 'stateLib',
    message: 'which state management lib do you want?',
    choices: ["Redux", "Mobx"],
    default: 'redux',
    filter: function (val) {
        return val.toLowerCase()
    },
    when: function (answers) {
        return answers.spa === 'react'
    }
}]

let projects = [{
    type: 'input',
    name: 'activityCode',
    message: "ActivityCode：",
    default() {
        let dt = new Date()

        let year = dt.getFullYear()
        let month = dt.getMonth() + 1
        let day = dt.getDate()

        // let hour = dt.getHours()
        // let minute = dt.getMinutes()
        // let second = dt.getSeconds()

        let fixZero = function (item) {
            let tmp = '' + item
            return tmp[1] ? tmp : '0' + tmp
        };

        return [year, month, day].map(fixZero).join('')
    }
}, {
    type: 'input',
    name: 'pm',
    message: "需求方：",
    validate: function (value) {
        if (value) {
            return true
        }
        return '需求方必填'
    }
}, {
    type: 'input',
    name: 'projectDesc',
    message: "需求描述：",
    validate: function (value) {
        if (value) {
            return true;
        }
        return '需求描述必填'
    }
}, {
    type: 'input',
    name: 'developers',
    message: "开发：",
    default: gitUser().name
}, {
    type: 'input',
    name: 'designers',
    message: "设计：",
}]

let replaceTable = {

}

// check activity folder exists
let checkActivityFolder = async (dir = '.') => {
    if (fs.existsSync(dir)) {
        return fs.readdirSync(dir).map(item => path.join(dir, item)).filter(item => {
            return fs.lstatSync(item).isDirectory()
        })
    } else {
        return []
    }
}

//modify config
let modifyConfig = async () => {

    spinner.color = 'yellow';
    spinner.text = `Modify ${inputProject.spa} spa basic information`;

    config.spa = inputProject.spa;//modify the type of spa
    let row = config.list[inputProject.spa].filter(item => item.name == inputSubject.activityCode);

    let obj = {
        name: inputSubject.activityCode,
        on: true,
        txt: inputSubject.projectDesc,
        pro: inputSubject.proejctManager,
        design: inputSubject.designers,
        dev: inputSubject.developers
    }

    if (row && row.length) {
        Object.assign(row[0], obj);
    } else {
        config.list[inputProject.spa].push(obj);
    }

    let strm = beautify(JSON.stringify(config), {
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
        "keep_array_indentation": true,
        // "space_before_conditional": true,
        // "unescape_strings": false,
        // "wrap_line_length": 0,
        // "e4x": false,
        // "end_with_newline": false,
        // "comma_first": false,
        "brace_style": "collapse"
    });

    fs.writeFileSync(basePath, "module.exports =" + strm, 'utf8', {
        flag: 'w'
    });
}

//replace template
let replaceTmpl = async (folderPath) => {

    spinner.color = 'cyan';
    spinner.text = `Replace ${inputProject.spa} project replacer`

    let res = glob.sync(folderPath + "/**/*.*", {})

    res.forEach((item) => {

        let data = fs.readFileSync(item, 'utf8');
        if (data) {
            data = data.replace(new RegExp(`(${Object.keys(replaceTable).join('|')})`, 'gi'), function (item, p1, offset) {
                return replaceTable[item]
            })
            fs.writeFileSync(item, data, 'utf8');
        }

    })
}

let handle = async () => {

    let {
        spa,
        codeSplit,
        stateLib
    } = inputProject
    let {
        activityCode,
        proejctManager,
        projectDesc,
        developers,
        designers
    } = inputSubject

    const pkg = path.join(subPath, `./node_modules/zax-package`); //skeleton包路径
    const pkgSpa = path.join(subPath, `./node_modules/zax-package/package/${spa == 'react' ? (spa + '/' + stateLib) : spa}`); //skeleton包路径
    const folderPath = path.join(subPath, `./${spa}/${activityCode}`); //物理路径

    let existActivity = await checkActivityFolder(folderPath)

    if (existActivity && existActivity.length) {
        spinner.fail(`The ${spa} project name ${activityCode} has been used`)
        process.exit(0);
    } else {
        //拷贝相应的项目
        await modifyConfig()

        // check zax-package exist
        if (!fs.existsSync(pkg)) {
            spinner.fail(`you can run [npm i zax-package -D] command to update the package`)
            process.exit(0);
            // return;
        }

        spinner.color = 'blue';
        spinner.text = `Copy ${inputProject.spa} project to dist folder`

        fs.copySync(pkgSpa, folderPath, {
            overwrite: true
        })

        // replace-daddy loader did it
        await replaceTmpl(folderPath)

    }

}

module.exports = async function () {
    inquirer.prompt(questions).then(proj => {
        let {
            spa,
            codeSplit,
            stateLib
        } = proj
        inquirer.prompt(projects).then(async subj => {
            let {
                activityCode,
                proejctManager,
                projectDesc,
                developers,
                designers
            } = subj

            inputProject = proj
            inputSubject = subj

            spinner = new Ora({
                text: `Loading ${spa} project`,
                spinner: process.argv[2]
            });

            spinner.start();

            replaceTable = {
                // '__spaDir__': activityCode, //20170303
                // '__spaMode__': spa, //react,vue,preact,common
                '__codeSplit__': codeSplit, //code split
            }

            await handle()

            setTimeout(() => {
                spinner.succeed('Init Done');
            }, 1000)

        });
    });
}