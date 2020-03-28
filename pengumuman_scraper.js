/**
 * Lakukan pembacaan di halaman punya pengumuman, jalankan ini setelah proses pembacaan data awal selesai
 * dilakukan.
 */
// waitfor module
var config = require('./config'),
    waiter = require('./waitfor'),
    pagePengumuman = require('webpage').create(),
    jsonutil = require('./jsonutil'),
    jsonDbPath = config.scraper.dbPath,
    performaStart = performance.now(),
    spseUrl = config.scraper.url

function aksesHalamanPengumumanTenderTerdata()
{
    dataCurrent = jsonutil.getCurrentData()

    if (dataCurrent.visited == 1) {
        console.log("Akses ke tender: " + dataCurrent.idTender + "  sudah dilakukan")

        if (jsonutil.moveNext()) { // maju ke data berikutnya
            aksesHalamanPengumumanTenderTerdata() // recursive
        } else {
            selesai()
        }
    } else {
        linknya = spseUrl + dataCurrent.linkPengumuman // dapatkan link untuk dibuka
        pagePengumuman.open(linknya, function (status) {
            if (status == 'success') {
                waiter.waitFor(
                    function () {
                        // tunggu sampai sesuatu ke load
                        return pagePengumuman.evaluate(function () {
                            return $('div.content').length > 0
                        })
                    },
                    function () {
                        console.log("Mengakses : " + linknya)
                        var dataPengumuman = prosesPengumumanTender()
                        jsonutil.mergeObject(dataCurrent, dataPengumuman)
                        dataCurrent.visited = 1 // set nilai visited jangan lupa!

                        if (jsonutil.moveNext()) { // maju ke data berikutnya
                            aksesHalamanPengumumanTenderTerdata() // recursive
                        } else {
                            selesai()
                        }
                    }
                )
            } else {
                console.log("Halaman pengumuman tidak dapat dicek: " + linknya)
            }
        })
    }
}

/**
 * Lakukan pembacaan terhadap pengumuman Tender
 * @returns {Array} hasil
 */
function prosesPengumumanTender()
{
    var dataTender = pagePengumuman.evaluate(function() {
        var data = {},
            tableTr = $('div.content:first table tr')

        // data['kode_tender'] = $(tableTr[0]).find('td:first').text()
        // data['nama_tender'] = $(tableTr[1]).find('td:first').html()
        // nilai RUP dll
        var dtu = $(tableTr[4]).find('td'),
            pagu = $(tableTr[13]).find('td:first').text(),
            hps = $(tableTr[13]).find('td:last').text()

        data['rup_kode'] = $(dtu[0]).text().trim()
        data['rup_nama_paket'] = $(dtu[1]).text().trim()
        data['sumber_dana'] = $(dtu[3]).text().trim()
        if( data['rup_kode'].length > 0 ) {
            // bila ini ada RUP sudah?
            data['tanggal_pembuatan'] = $(tableTr[5]).find('td:first').text().trim()
            data['keterangan'] = $(tableTr[6]).find('td:first').text().trim()
            data['instansi'] = $(tableTr[8]).find('td:first').text().trim()
            data['satuan_kerja'] = $(tableTr[9]).find('td:first').text().trim()
            data['kategori'] = $(tableTr[10]).find('td:first').text().trim()
            data['sistem_pengadaan'] = $(tableTr[11]).find('td:first').text().trim()
            // data['tahun_anggaran'] = $(tableTr[12]).find('td:first').text().trim()
            data['pagu_paket'] = pagu.replace('Rp ', '')
            data['hps_paket'] = hps.replace('Rp ', '')
            data['cara_pembayaran'] = $(tableTr[14]).find('td:first').text().trim()
            data['lokasi'] = $(tableTr[15]).find('td:first').html()
            data['kualifikasi'] = $(tableTr[16]).find('td:first').text().trim()
        } else {

            pagu = $(tableTr[11]).find('td:first').text().trim()
            hps = $(tableTr[11]).find('td:last').text().trim()
            // ini bila belum ada RUP
            data['tanggal_pembuatan'] = $(tableTr[3]).find('td:first').text().trim()
            data['keterangan'] = $(tableTr[4]).find('td:first').text().trim()
            data['instansi'] = $(tableTr[6]).find('td:first').text().trim()
            data['satuan_kerja'] = $(tableTr[7]).find('td:first').text().trim()
            data['kategori'] = $(tableTr[8]).find('td:first').text().trim()
            data['sistem_pengadaan'] = $(tableTr[9]).find('td:first').text().trim()
            // data['tahun_anggaran'] = $(tableTr[12]).find('td:first').text().trim()
            data['pagu_paket'] = pagu.replace('Rp ', '')
            data['hps_paket'] = hps.replace('Rp ', '')
            data['cara_pembayaran'] = $(tableTr[12]).find('td:first').text().trim()
            data['lokasi'] = $(tableTr[13]).find('td:first').html()
            data['kualifikasi'] = $(tableTr[14]).find('td:first').text().trim()
        }
        data['peserta'] = $('div.content:first table th:last').next().text().trim()

        return JSON.stringify(data)
    })

    return JSON.parse(dataTender)
}

function selesai()
{
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
    aksesHalamanPengumumanTenderTerdata()
}

// laksanakan!
main()