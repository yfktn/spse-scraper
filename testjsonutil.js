var jsonutil = require('./jsonutil'),
    fs = require('fs')

jsonutil.setPath('testdata.db')

if(!fs.exists('testdata.db')) {
    console.log("Init data ...")
    for (var i = 1; i <= 999999; i++) {
        jsonutil.push({ id: "id" + i, content: 'INI CONTENT ' + i, otherId: "oid" + i, tanpaIndex: "noid" + i })
    }
    jsonutil.saveData()
} else {
    jsonutil.initAndLoad()
}

jsonutil.addIndex('otherId')

// jsonutil.initAndLoad()

var starting = performance.now()
if( jsonutil.isAlreadyInserted("id" + 3) ) {
    console.log("OKE Sudah ditambahkan oke ...")
} else {
    console.log("Test tidak benar!")
}
console.log("Habis waktu dengan index: " + (performance.now() - starting) + " ms")
starting = performance.now()
if (jsonutil.isAlreadyInserted("id999999")) {
    console.log("OKE Sudah ditambahkan oke ...")
} else {
    console.log("Test tidak benar!")
}
console.log("Habis waktu dengan index: " + (performance.now() - starting) + " ms")
starting = performance.now()
if (jsonutil.indexOfId("id999999") == 999998) {
    console.log("OKE Data pencarian sudah oke ...")
} else {
    console.log("Test tidak benar!")
}
console.log("Habis waktu dengan index: " + (performance.now() - starting) + " ms")
starting = performance.now()
if (jsonutil.findValueInField("oid999999", 'otherId') == 999998) {
    console.log("OKE Data pencarian sudah oke ...")
} else {
    console.log("Test tidak benar!")
}
console.log("Habis waktu dengan index: " + (performance.now() - starting) + " ms")
starting = performance.now()
if (jsonutil.findValueInField("noid999999", 'tanpaIndex') == 999998) {
    console.log("OKE Data pencarian sudah oke ...")
} else {
    console.log("Test tidak benar!")
}
console.log("Habis waktu tanpa index: " + (performance.now() - starting) + " ms")
starting = performance.now()
if (jsonutil.isAlreadyInserted("id-1") == false) {
    console.log("OKE Semestinya tidak ada ...")
} else {
    console.log("Test tidak benar!")
}
// cari data untuk dihapus
jsonutil.moveLast()
var nilaiDihapus = jsonutil.getCurrentData().otherId
// test hapus data
var hapusdatadi = jsonutil.findValueInField(nilaiDihapus, 'otherId')
console.log("Jumlah data sebelum dihapus:" + jsonutil.getLength() + ' data dihapus: ' + nilaiDihapus)
if(jsonutil.deleteDataAtIndex(hapusdatadi)) {
    console.log("Oke sudah terhapus!")
} else {
    console.log("TIDAK Benar tidak dapat terhapus")
}
console.log("Jumlah data sekarang setelah dihapus:" + jsonutil.getLength())
if (jsonutil.findValueInField(nilaiDihapus, 'otherId') === false) {
    console.log("Oke sudah terhapus!")
} else {
    console.log("TIDAK Benar data yang sebelumnya dihapus masih ditemukan, tidak dapat terhapus")
}

jsonutil.moveLast()
console.log("Apakah di akhir? " + (jsonutil.getCurrentData().id == "id999999"))
jsonutil.movePrev()
console.log("Apakah di benar mundur 1 ke belakang? " + (jsonutil.getCurrentData().id == "id999998"))
jsonutil.moveFirst()
console.log("Apakah di awal? " + (jsonutil.getCurrentData().id == "id1"))
jsonutil.moveNext()
console.log("Apakah bisa maju 1 langkah ? " + (jsonutil.getCurrentData().id == "id2"))
// coba di clone
var dataNya = jsonutil.getCurrentData(true),
    dataOri = jsonutil.getCurrentData(),
    dataNyaLagi = { tambah: "Tambah", datanya: "datanya"}
console.log(":: Datanya sebelum di merge (cloned):")
jsonutil.dumpObject(dataNya)
console.log(":: Datanya mau ditambahkan:")
jsonutil.dumpObject(dataNyaLagi)
jsonutil.mergeObject(dataNya, dataNyaLagi)
console.log(":: Datanya setelah di merge:")
jsonutil.dumpObject(dataNya)
console.log(":: Data yang ori:")
jsonutil.dumpObject(dataOri)
jsonutil.mergeObject(dataOri, dataNyaLagi)
console.log(":: Data yang ori setelah ditambahkan:")
jsonutil.dumpObject(dataOri)
var testDataOri = jsonutil.getCurrentData()
console.log(":: Apakah data ori juga berubah?")
jsonutil.dumpObject(testDataOri)
jsonutil.saveData()
phantom.exit()
