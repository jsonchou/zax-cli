const fs = require('fs-extra')

module.exports = function fetchRemotePreset () {
    const path = require('path')
    const download = require('download-git-repo')
    const tmpdir = path.join(process.cwd(), 'node_modules/zax-package')

    return new Promise((resolve, reject) => {
        if(fs.existsSync(tmpdir)) {
            resolve();
        }
        download('direct:https://github.com/jsonchou/zax-package.git', tmpdir, { clone: true }, err => {
            if (err) return reject(err)
            resolve()
        })
    })
}
