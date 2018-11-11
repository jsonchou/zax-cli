#!/usr/bin/env node

const notifier = require('node-notifier');

module.exports = () => {
    let name
    let email

    try {
        name = exec('git config --get user.name')
        email = exec('git config --get user.email')
    } catch (e) { }

    name = name && JSON.stringify(name.toString().trim()).slice(1, -1)
    email = email && (' <' + email.toString().trim() + '>')
    return {
        name, email
    }
}
