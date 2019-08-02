const path = require('path')
const doneRainbow = require('done-rainbow')
const execSync = require('child_process').execSync
const { name, version, innerModule, needBuild } = require('../../../package.json')
const checkNpm = require('./checkNpm')

let increaseVersion = () => {
	let prefix = version.slice(0, version.lastIndexOf('.'))
	let suffix = version.slice(version.lastIndexOf('.') + 1)
	return prefix + '.' + (parseInt(suffix) + 1)
}

let doRelease = async () => {

	let skip = checkNpm(innerModule)

	if (!skip) {
		return
	}

	let version = increaseVersion()
	if (needBuild) {
		try {
			execSync(`npm run build`, { stdio: 'inherit' })
		} catch (err) {
			console.log('build', err)
			throw err
		}
	}

	try {
		execSync(`git add .`, { stdio: 'inherit' })
		execSync(`git commit -am "release: v${version}"`, { stdio: 'inherit' })
		execSync(`git push`, { stdio: 'inherit' })
	} catch (err) {
		console.log('git', err)
		throw err
	}

	try {
		execSync(`npm version ${version} `, { stdio: 'inherit' })
		execSync(`npm publish`, { stdio: 'inherit' })
	} catch (err) {
		console.log('npm', err)
		throw err
	}

	execSync(`git status`, { stdio: 'inherit' })
	execSync(`git push`, { stdio: 'inherit' })

	doneRainbow(`${name}: version ${version} published!`)
}

doRelease()
