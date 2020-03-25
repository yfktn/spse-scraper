var jsonutil = require('./jsonutil'),
    fs = require('fs')

jsonutil.setPath('testdata.db')

if(!fs.exists('testdata.db')) {
    console.log("Init data ...")
    for (var i = 1; i <= 999999; i++) {
        jsonutil.push({ id: "id" + i, content: 'INI CONTENT ' + i })
    }
    jsonutil.saveData()
} else {
    jsonutil.initAndLoad()
}

// jsonutil.initAndLoad()

if( jsonutil.isAlreadyInserted("id" + 3) ) {
    console.log("OKE Sudah ditambahkan oke ...")
} else {
    console.log("Test tidak benar!")
}

if (jsonutil.isAlreadyInserted("id999999")) {
    console.log("OKE Sudah ditambahkan oke ...")
} else {
    console.log("Test tidak benar!")
}

if (jsonutil.indexOfId("id999999") == 999998) {
    console.log("OKE Data pencarian sudah oke ...")
} else {
    console.log("Test tidak benar!")
}

if (jsonutil.isAlreadyInserted("id-1") == false) {
    console.log("OKE Semestinya tidak ada ...")
} else {
    console.log("Test tidak benar!")
}

phantom.exit()
