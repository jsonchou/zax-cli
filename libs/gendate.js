module.exports = function () {
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