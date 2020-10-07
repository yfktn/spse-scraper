/**
 * Lakukan pembacaan terhadap hasil evaluasi
 */
var config = require('./config'),
    waiter = require('./waitfor'),
    pageEvaluasi = require('webpage').create(),
    jsonutil = require('./jsonutil'),
    jsonDbPath = config.scraper.dbPath,
    performaStart = performance.now(),
    spseUrl = config.scraper.urlEvaluasi

function aksesHalamanEvaluasiTerdata()
{
    dataCurrent = jsonutil.getCurrentData()
    if(dataCurrent.visited == 1) {
        var bacaDanEvaluasi = true // apakah di baca dan evaluasi halaman ini?
        if(dataCurrent.ada_pemenang === undefined) {
            bacaDanEvaluasi = true  // belum dilakukan pembacaan sebelumnya
        } else if(dataCurrent.ada_pemenang == 1) {
            bacaDanEvaluasi = false // sudah dibaca dan sudah ada pemenangnya, tidak perlu dibaca lagi
        } else {
            bacaDanEvaluasi = true // lakukan pembacaan karena belum ada pemenang
        }
        if(bacaDanEvaluasi) {
            var linkToTest = spseUrl + dataCurrent.idTender + '/hasil',
                statusHttp = 200
            // terkadang hasil evaluasi belum keluar! Tangkap pesan errornya?
            pageEvaluasi.onResourceReceived = function(response) {
                if(response.stage == 'end') {
                    statusHttp = response.status
                }
            }
            pageEvaluasi.open(linkToTest, function (status) {
                if (status == 'success') {
                    waiter.waitFor(
                        function () {
                            // tunggu sampai sesuatu ke load
                            return pageEvaluasi.evaluate(function () {
                                return $('div.content').length > 0
                            })
                        }, 
                        function() {
                            console.log("Mengakses : " + linkToTest)
                            var dataEvaluasi = prosesDataEvaluasi()
                            jsonutil.mergeObject(dataCurrent, dataEvaluasi)
                            lanjutkanKeDataBerikutnya()
                        }
                    )
                } else {
                    console.log("Tidak dapat mengakses " + linkToTest + " status: " + statusHttp)
                }
            })
        } else {
            // console.log("Ada pemenang!")
            lanjutkanKeDataBerikutnya()
        }
    } else {
        console.log("Data idtender: " + dataCurrent.idTender + " belum update! Jalankan kembali pengumuman-scrapper!")
        phantom.exit()
    }
}

function lanjutkanKeDataBerikutnya()
{
    if (jsonutil.moveNext()) {
        // recursive
        aksesHalamanEvaluasiTerdata()
    } else {
        selesai()
    }
}

function prosesDataEvaluasi() 
{
    var hasilEvaluasi = pageEvaluasi.evaluate(function() {
        var data = {}, 
            tableTr = $('div.content table tr'),
            pemenangTd = $(tableTr).find('td img[src$="star.gif"]')

        if(pemenangTd.length > 0) {
            // ada pemenang, mari baca ...
            // supaya bisa dibaca dengan tipe berbeda untuk masing-masing jenis tender, maka baca dari headernya
            var dexPenawaran = $(tableTr).find('th:contains("Penawaran")').index(),
                dexTerkoreksi = $(tableTr).find('th:contains("Penawaran Terkoreksi")').index(),
                dexNegosiasi = $(tableTr).find('th:contains("Hasil Negosiasi")').index(),
                dexStatusPK = $(tableTr).find('th:contains("PK")').index(),
                barisPemenang = pemenangTd.parent().parent(), // dapatkan baris / tr nya punya data si pemenang
                pemenang = $(barisPemenang).find('td:eq(1)').text().split(" - ")
            // dapatkan index yang menyimpan data baris (row) info pemenang
            data['ada_pemenang'] = 1
            data['pemenang'] = pemenang[0].trim()
            data['npwp'] = pemenang[1].trim()
            // ambil nilai berdasarkan index tanpa harus melihat apakah tag cell menggunakan td atau th
            // issu Bug #31
            data['penawaran'] = $(barisPemenang).children().eq(dexPenawaran).text().replace('Rp ', '')
            data['terkoreksi'] = $(barisPemenang).children().eq(dexTerkoreksi).text().replace('Rp ', '')
            data['negosiasi'] = (dexNegosiasi >= 0 ? $(barisPemenang).children().eq(dexNegosiasi).text().replace('Rp ', ''): 0)
            // apakah sudah di buat di pemenang berkontrak?
            // kalau sudah berkontrak ada di barisnya dengan tanda gambar bintang star.gif
            data['sudah_berkontrak'] = $(barisPemenang).find('td:eq(' + dexStatusPK + ') > img[src$="star.gif"]').length
        } else {
            data['ada_pemenang'] = 0
            data['pemenang'] = ""
            data['npwp'] = ""
            data['penawaran'] = 0
            data['terkoreksi'] = 0
            data['negosiasi'] = 0
            // apakah sudah di buat di pemenang berkontrak?
            // kalau sudah berkontrak ada di barisnya dengan tanda gambar bintang star.gif
            data['sudah_berkontrak'] = 0
        }

        return JSON.stringify(data)
        
    })

    return JSON.parse(hasilEvaluasi)
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
    aksesHalamanEvaluasiTerdata()
}

main()