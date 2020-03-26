/**
 * Lakukan pembacaan terhadap hasil evaluasi
 */
var waiter = require('./waitfor'),
    pageEvaluasi = require('webpage').create(),
    jsonutil = require('./jsonutil'),
    jsonDbPath = 'db-visited-reset.db',
    performaStart = performance.now(),
    spseUrl = 'https://lpse.kalteng.go.id/eproc4/evaluasi/'

function aksesHalamanEvaluasiTerdata()
{
    dataCurrent = jsonutil.getCurrentData()
    if(dataCurrent.visited == 1) {
        var bacaDanEvaluasi = true // apakah di baca dan evaluasi halaman ini?
        if(dataCurrent.adaPemenang === undefined) {
            bacaDanEvaluasi = true  // belum dilakukan pembacaan sebelumnya
        } else if(dataCurrent.adaPemenang == 1) {
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
                            if(jsonutil.moveNext()) {
                                // recursive
                                aksesHalamanEvaluasiTerdata()
                            } else {
                                selesai()
                            }
                        }
                    )
                } else {
                    console.log("Tidak dapat mengakses " + linkToTest + " status: " + statusHttp)
                }
            })
        }
    } else {
        console.log("Data idtender: " + dataCurrent.idTender + " belum update! Jalankan kembali pengumuman-scrapper!")
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
                barisPemenang = pemenangTd.parent().parent() // dapatkan baris / tr nya punya data si pemenang
            // dapatkan index yang menyimpan data baris (row) info pemenang
            data['ada_pemenang'] = 1
            data['penawaran'] = $(barisPemenang).find('td:eq(' + dexPenawaran + ')').text().replace('Rp ', '')
            data['terkoreksi'] = $(barisPemenang).find('td:eq(' + dexTerkoreksi + ')').text().replace('Rp ', '')
            data['negosiasi'] = $(barisPemenang).find('td:eq(' + dexNegosiasi + ')').text().replace('Rp ', '')
            // apakah sudah di buat di pemenang berkontrak?
            // kalau sudah berkontrak ada di barisnya dengan tanda gambar bintang star.gif
            data['sudah_berkontrak'] = $(barisPemenang).find('td:eq(' + dexStatusPK + ') > img[src$="star.gif"]').length
        } else {

            data['ada_pemenang'] = 0
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
    aksesHalamanEvaluasiTerdata()
}

main()