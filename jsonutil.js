/**
 * Ini digunakan untuk inputan saja, sedangkan terhadap query yang lebih advanced gunakan tool taffydb
 */
var fs = require('fs'),
    dbData = [],
    dbIndexId = [],
    dbIndex = [],
    filePath = 'dbtest.db',
    activeIndex = 0,
    dbCount = 0

/**
 * Sinkronkan database index dengan data
 */
function syncDbIndex()
{
    dbIndexId = dbData.map(function (el) {
        return el.id
    })
    // for dbIndex
    for (var key in dbIndex) {
        dbIndex[key] = dbData.map(function(el) {
            return el[key]
        })
    }
}

/**
 * Sinkronkan jumlah items data
 */
function syncDbCount()
{
    dbCount = dbData.length
}

/**
 * load file dan bikin baru bila tidak ditemukan. Di sii dilakukan juga sinkronisasi terhadap
 * index dan jumlah.
 */
function loadCreateFile()
{
    if(!fs.exists(filePath)) {
        try {
            fs.write(filePath, "[]", "w")
        } catch(e) {
            console.log(e)
            phantom.exit()
        }
    } else {
        dbData = JSON.parse(fs.read(filePath))
        syncDbIndex()
        syncDbCount()
    }
}

/**
 * Apabila dibutuhkan, bisa ditambahkan index lain selain id.
 */
exports.addIndex = function(fieldName) 
{
    dbIndex[fieldName] = dbData.map(function(el) {
        return el[fieldName]
    })
}

/**
 * Set path file jsonnya, ini harus dipanggil pertama kali
 */
exports.setPath = function(pathDb)
{
    filePath = pathDb
}

/**
 * Init dan load json berdasarkan setPath yang sudah dipanggil sebelumnya.
 */
exports.initAndLoad = function()
{
    loadCreateFile()
}

/**
 * Simpan datanya
 */
exports.saveData = function() 
{
    fs.write(filePath, JSON.stringify(dbData), "w")
}

/**
 * Tambahkan nilai data ke index tambahan
 * @param {[]]} data 
 */
function addValueToIndex(data) 
{
    for (var key in dbIndex) {
        dbIndex[key].push(data[key])
    }
}

/**
 * Tambahkan data ke akhir data
 */
exports.push = function(data)
{
    dbData.push(data)
    dbIndexId.push(data.id)
    addValueToIndex(data)
    dbCount = dbCount + 1
}

/**
 * Hapus data yang saat itu ditunjukkan oleh activeIndex. Hati-hati setelah melakukan ini
 * maka pointer data harus diset ulang bila masih di looping
 */
exports.deleteDataAtIndex = function(indexData)
{
    if( indexData >= dbCount || indexData < 0 ) {
        return false;
    }
    dbData.splice(indexData, 1)
    syncDbCount()
    syncDbIndex()
    return true
}

/**
 * Apakah sudah ditambahkan data berdasarkan idValue yang dimasukkan?
 */
exports.isAlreadyInserted = function(idValue)
{
    return dbIndexId.indexOf(idValue) >= 0
}

/**
 * Dapatkan nilai di field yang dipilih. Misalnya data json:
 * [
 *  {id: 11, a: 1, b: 2},
 *  {id: 12, a: 3, b: 2}
 * ]
 * ingin mencari nilai a yang 1, maka dipanggil:
 * jsonutil.findValueInField(1, 'a')
 */
exports.findValueInField = function(value, inField)
{
    if( inField === 'id' ) {
        return dbIndexId.indexOf(value)
    } else {
        if( dbIndex[inField] !== undefined ) {
            var ret = dbIndex[inField].indexOf(value)
            return ret >= 0? ret: false
        }
    }
    // without index?
    for(var i = 0; i < dbCount; i++) {
        if( dbData[i][inField] == value ) {
            return i
        }
    }
    // ret = dbData.findIndex(function(i) {
    //     return i[inField] == value
    // })
    return false
}

/**
 * Dapatkan index berdasarkan nilai id idValue
 */
exports.indexOfId = function(idValue)
{
    return dbIndexId.indexOf(idValue)
}

/**
 * Dapatkan semua data, ini dikembalikan sebagai references.
 */
exports.getData = function()
{
    return dbData
}

/**
 * Dapatkan data yang di clone
 */
exports.getDataCloned = function()
{
    return JSON.parse(JSON.stringify(dbData))
}

/**
 * Dapatkan length dari data
 */
exports.getLength = function()
{
    return dbIndexId.length
}

/**
 * Maju ke data awal
 */
exports.moveFirst = function()
{
    activeIndex = 0
}

/**
 * Maju pointer ke data berikutnya, bila sudah sampai di batas akan dikembalikan dengan nilai false.
 */
exports.moveNext = function()
{
    if((activeIndex + 1) >= dbCount) {
        console.log("ups sudah di batas: " + activeIndex)
        return false
    }
    activeIndex = activeIndex + 1
    return true
}

/**
 * Mundurkan pointer.
 */
exports.movePrev = function()
{
    if ((activeIndex - 1) < 0) {
        return false
    }
    activeIndex = activeIndex - 1
    return true
}

/**
 * Mundur ke item terakhir
 */
exports.moveLast = function()
{
    activeIndex = dbCount - 1
}

/**
 * Dapatkan data saat itu yang ditunjukkan oleh pointer.
 */
exports.getCurrentData = function(cloned)
{
    var isCloned = false
    if(cloned !== undefined && cloned == true) {
        isCloned = true
    }
    return isCloned? 
        JSON.parse(JSON.stringify(dbData[activeIndex])):
        dbData[activeIndex]
}

/**
 * merge object, karena phantomjs tidak mengenal Object.assign( ... ) maka dibuat ini.
 * target akan dirubah oleh fungsi ini.
 */
exports.mergeObject = function(target, source)
{
    for (var key in source) {
        var value = source[key]
        target[key] = value
    }
}

/**
 * Untuk kebutuhan debug!
 */
exports.dumpObject = function(obj)
{
    for (var key in obj) {
        var value = obj[key]
        console.log(key + " = " + value)
    }
}