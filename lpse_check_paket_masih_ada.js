/**
 * Lakukan pengecekan apakah data paket masih ada? Bila tidak ada bisa jadi paket sudah dihapus!
 */
var config = require('./config'),
    waiter = require('./waitfor'),
    pageEvaluasi = require('webpage').create(),
    jsonutil = require('./jsonutil'),
    jsonDbPath = config.scraper.dbPath,
    performaStart = performance.now(),
    spseUrl = config.scraper.urlTanpaService


function ayoCheckPaketnyaHidupAtauTidak()
{
    dataCurrent = jsonutil.getCurrentData()
    var linkToTest = spseUrl + dataCurrent.linkPengumuman, // lakukan pengetesan pada pengumuman
        statusHttp = 200

    // console.log("ngecek: " + linkToTest)
    // dapatkan status http nya
    pageEvaluasi.onResourceReceived = function (response) {
        if (response.stage === 'end' && 
            response.url === linkToTest) {
            statusHttp = parseInt( response.status )
            // console.log("Status: " + statusHttp)
        }
    }
    pageEvaluasi.open(linkToTest, function (status) {
        console.log(linkToTest + ":" + statusHttp)
        // data untuk status baca dan status baca terhadap keterangan tersebut
        // todo: sesuaikan dengan status baca 403 atau 404?
        var data = {}
        data['statusbaca'] = 200
        data['statusbacaketerangan'] = "OKE"
        if (status === 'success' && statusHttp === 200) {
            waiter.waitFor(
                function () {
                    // tunggu sampai sesuatu ke load
                    return pageEvaluasi.evaluate(function () {
                        return $('div.content').length > 0
                    })
                },
                function () {
                    jsonutil.mergeObject(dataCurrent, data)
                    // maju ke data berikut
                    lanjutkanKeDataBerikutnya()
                }
            )
        } else {
            console.log("UPS bermasalah!")
            // data ini bermasalah
            data['statusbaca'] = statusHttp
            data['statusbacaketerangan'] = "DIBATALKAN ATAU DIULANG BELUM DIUMUMKAN!"
            jsonutil.mergeObject(dataCurrent, data)
            // lanjutkan ke data berikutnya
            lanjutkanKeDataBerikutnya()
        }
    })
}

function lanjutkanKeDataBerikutnya()
{
    if (jsonutil.moveNext()) {
        // recursive
        ayoCheckPaketnyaHidupAtauTidak()
    } else {
        selesai()
    }
}

function selesai() {
    // klo sudah tidak ada lagi sudah sampai sini
    jsonutil.saveData() // simpan datanya

    var performaEnd = performance.now()
    console.log("Diselesaikan dalam waktu: " + (performaEnd - performaStart) + " ms")

    phantom.exit() // keluar!
}

function main()
{
    jsonutil.setPath(jsonDbPath)
    // buka dan load db
    jsonutil.initAndLoad()
    // move to the first data
    jsonutil.moveFirst()
    console.log("Mohon menunggu proses hingga selesai ...")
    ayoCheckPaketnyaHidupAtauTidak()
}

main()