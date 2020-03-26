/**
 * Tool untuk memudahkan pengorganisasian saat membaca database
 */
// File System
var fs = require('fs')
// TAFFY DB
var TAFFYDB = require('./taffy').taffy,
    dbPath = 'spse-scrapper-default.db', // place of our db
    db = TAFFYDB([])

/**
 * Lakukan pengecekan terhadap db pathnya
 * @param {string} dbPathIni 
 */
function cekDbPath(dbPathIni)
{
    if (dbPathIni !== undefined) {
        dbPath = dbPathIni
    }

    if(!fs.exists(dbPath)) {
        console.log('File database ' + dbPathIni + ' tidak dapat ditemukan, system dihentikan!')
        phantom.exit()
    }
}

/**
 * Dapatkan isi database dan load ke db nya sebagai object taffy
 */
function getAndLoadDb()
{
    var content = fs.read(dbPath)
    db = TAFFYDB(JSON.parse(content))
}

/**
 * Init dan load ke db berdasarkan dbPathIni, bila tidak ada filenya segera buatkan!
 */
exports.initDanLoadCreateDbBilaTidakAda = function(dbPathIni)
{
    if (dbPathIni !== undefined) {
        dbPath = dbPathIni
    }

    if (!fs.exists(dbPath)) {
        fs.write(dbPath, "[]", "w")
        return TAFFYDB([])
    }
    getAndLoadDb()
}

/**
 * Init dan load taffy db yang ada di dbPathIni, bila tidak ada file dan db nya maka 
 * berhenti dan keluarkan error
 */
exports.initDanLoad = function(dbPathIni)
{
    cekDbPath(dbPathIni)
    getAndLoadDb()
}

/**
 * Simpan db di dbPathIni
 */
exports.simpanDb = function(dbPathIni)
{
    cekDbPath(dbPathIni)
    fs.write(dbPath, db().stringify(), "w")
}

/**
 * Dapatkan object db. Hati-hati ini by reference, jadi bila object dikelola di luar module
 * berarti yang ada di sini juga berubah!
 */
exports.getDb = function()
{
    return db
}

/**
 * Clone db nya!
 */
exports.cloneDb = function()
{
    return TAFFYDB(JSON.parse(JSON.stringify(db)))
}
