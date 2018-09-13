module.exports ={
    "server": {
        "development": {
            "host": "10.253.4.128",
            "port": 22,
            "username": "static",
            "password": "Static123"
        },
        "production": {
            "host": "10.253.4.128",
            "port": 22,
            "username": "static",
            "password": "Static123"
        }
    },
    "devServer": {
        "contentBase": "./",
        "historyApiFallback": false,
        "port": 8081,
        "open": false,
        "quiet": false,
        "noInfo": false,
        "useLocalIp": false,
        "https": false,
        "inline": true,
        "lazy": false,
        "stats": {
            "colors": true,
            "hash": true,
            "version": true,
            "timings": true,
            "assets": true,
            "chunks": false,
            "modules": false,
            "reasons": false,
            "children": false,
            "source": false,
            "errors": true,
            "errorDetails": true,
            "warnings": true,
            "publicPath": true
        },
        "headers": {
            "Access-Control-Allow-Origin": "*"
        },
        "watchOptions": {
            "aggregateTimeout": 300,
            "ignored": {}
        }
    },
    "spa": "react",
    "fullbuild": false,
    "list": {
        "vue": [{
            "name": "demo",
            "on": false,
            "ftp": false,
            "txt": ""
        }, {
            "name": "20180820",
            "txt": "123456",
            "on": false,
            "ftp": false
        }, {
            "name": "20180822",
            "txt": "钟颖 亲子砍价",
            "on": false,
            "ftp": false
        }, {
            "name": "20180824",
            "txt": "MGM咨询分享",
            "on": false,
            "ftp": false
        }, {
            "name": "hehe",
            "txt": "dd",
            "on": true,
            "ftp": false,
            "design": "dd",
            "dev": "jsonchou"
        }, {
            "name": "20180913",
            "on": true,
            "txt": "dd",
            "design": "dd",
            "dev": "jsonchou"
        }, {
            "name": "xx",
            "on": true,
            "txt": "dd",
            "design": "dd",
            "dev": "jsonchou"
        }],
        "react": [{
            "name": "20171222",
            "on": false,
            "ftp": false
        }, {
            "name": "stdMobX",
            "on": false,
            "ftp": false
        }, {
            "name": "stdRedux",
            "on": false,
            "ftp": false
        }, {
            "name": "20180913",
            "on": true,
            "txt": "dd",
            "design": "",
            "dev": "jsonchou"
        }],
        "common": [{
            "name": "20171016",
            "txt": "“e家保”运营活动"
        }, {
            "name": "20180716",
            "txt": "众安福利大礼包"
        }]
    }
}