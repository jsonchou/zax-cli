/**
 * ususe module
 */
const fs = require('fs-extra');
const path = require('path');
let Client = require('ssh2-sftp-client');

module.exports = function (cfg, localPath, serverPath, middlePath) {

    let sftp = new Client();
    let count = 0;
    sftp.connect(cfg).then(() => {
        const distPath = path.resolve(localPath);
        function parse(dirPath) {
            const dir = fs.readdirSync(dirPath);
            console.log(111, dir)
            if (Array.isArray(dir) && dir.length > 0) {
                dir.forEach(async dirname => {
                    const name = path.join(dirPath, dirname);
                    console.log(222, name)

                    var stat = fs.lstatSync(name);
                    if (stat.isDirectory()) {
                        parse(name);
                    } else {

                        const relativePath = path.relative(distPath, name);
                        const remotePath = `${serverPath}/${middlePath}/${relativePath}`;
                        const remoteDirname = path.dirname(remotePath);

                        if (path.basename(remotePath).indexOf('.DS_Store') > -1) {
                            return
                        }

                        count += 1;

                        // 梯归创建目录
                        try {
                            await sftp.mkdir(remoteDirname, true)
                        } catch (err) {
                            console.log('mkdir err', err)
                        }

                        try {
                            sftp.fastPut(name, remotePath, { concurrency: 64, chunkSize: 32768 }, function (err) {
                                if (!err) {
                                    console.log('*'.repeat(10), relativePath, '*'.repeat(10))
                                }
                                count -= 1;
                                if (count === 0) {
                                    sftp.end();
                                }
                            });
                        } catch (err) {
                            console.log('fastPut', err)
                        }

                    }
                })
            }
        }
        parse(distPath);
    })
}


// const files = klawSync(localDistPath, { nodir: true })
// const filesNum = files.length
// let proms = []

// files.map((item, index) => {
//     let filePath = item.path
//     let flag = filePath.indexOf('/website/')
//     let serverPath = '/www' + filePath.slice(flag)
//     let prom = new Promise((resolve, reject) => {
//         try {
//             sftp.fastPut(filePath, serverPath, (err, result) => {
//                 if (err) {
//                     // console.log('fastPut err', err)
//                     resolve('skip')
//                 } else {
//                     console.log(`${chalk.green('done:')} ` + serverPath.replace(serverPathPrefix, ''))
//                     resolve('done')
//                 }
//             })
//         } catch (err) {
//             console.log('fastPut catch err', err)
//             reject(err)
//         }
//     });
//     proms.push(prom)
// })

// console.log(`${chalk.green('upload files:')}`)
// let promsRes = await Promise.all(proms).catch(err => {
//     console.log('proms all err', err)
// })

