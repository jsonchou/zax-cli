let zaxDate = require('zax-date')

module.exports = (zaxDate(new Date(), 'yyyy-mm-dd') + '').replace(/\-/gi, '')