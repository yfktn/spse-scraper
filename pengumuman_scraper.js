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
    spseUrl = config.scraper.urlTanpaService

function aksesHalamanPengumumanTenderTerdata()
{
    dataCurrent = jsonutil.getCurrentData()
    if (dataCurrent.visited == 1) {
        // console.log("Akses ke tender: " + dataCurrent.idTender + "  sudah dilakukan")

        if (jsonutil.moveNext()) { // maju ke data berikutnya
            aksesHalamanPengumumanTenderTerdata() // recursive
        } else {
            selesai()
        }
    } else {
        linknya = spseUrl + dataCurrent.linkPengumuman // dapatkan link untuk dibuka
        console.log("Akses:" + linknya)
        // pagePengumuman.onResourceReceived = function (response) {
        //     console.log('Receive ' + JSON.stringify(response, undefined, 4));
        // };
        pagePengumuman.open(linknya, function (status) {
            if (status === 'success') {
                waiter.waitFor(
                    function () {
                        // tunggu sampai sesuatu ke load
                        return pagePengumuman.evaluate(function () {
                            return $('div.content').length > 0
                        })
                    },
                    function () {
                        //console.log("Mengakses : " + linknya)
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

        // untuk kode rup lebih dahulu
        ruptable = $(tableTr).find('th:first-child:contains("Rencana Umum Pengadaan")').next()
        if( ruptable.text().trim().length > 0 ) { // ada yang tidak ada RUP! damn
            // ambil baris pertama aja dari nilainya
            rowCellnya = ruptable.find('table tr:nth-child(2) td')
            data['rup_kode'] = rowCellnya.eq(0).text().trim()
            data['rup_nama_paket'] = rowCellnya.eq(1).text().trim()
            data['sumber_dana'] = rowCellnya.eq(2).text().trim()
        } else {
            data['rup_kode'] = 0
            data['rup_nama_paket'] = 'NOT-FOUND'
            data['sumber_dana'] = '?'
        }

        // kode rup
        data['tanggal_pembuatan'] = $(tableTr).find('th:first-child:contains("Tanggal Pembuatan")').next().text().trim()
        data['keterangan'] = $(tableTr).find('th:first-child:contains("Keterangan")').next().text().trim()
        data['instansi'] = $(tableTr).find('th:first-child:contains("Instansi")').next().text().trim()
        data['satuan_kerja'] = $(tableTr).find('th:first-child:contains("Satuan Kerja")').next().text().trim()
        data['kategori'] = $(tableTr).find('th:first-child:contains("Kategori")').next().text().trim()
        data['sistem_pengadaan'] = $(tableTr).find('th:first-child:contains("Sistem Pengadaan")').next().text().trim()
        data['kategori'] = $(tableTr).find('th:first-child:contains("Kategori")').next().text().trim()
        data['pagu_paket'] = $(tableTr).find('th:first-child:contains("Nilai Pagu Paket")').next().text().trim().replace('Rp ', '')
        data['hps_paket'] = $(tableTr).find('th:contains("Nilai HPS Paket")').next().text().trim().replace('Rp ', '')
        data['cara_pembayaran'] = $(tableTr).find('th:contains("Cara Pembayaran")').next().text().trim()
        data['lokasi'] = $(tableTr).find('th:contains("Lokasi Pekerjaan")').next().html()
        data['kualifikasi'] = $(tableTr).find('th:contains("Kualifikasi Usaha")').next().text().trim()
        data['peserta'] = $(tableTr).find('th:first-child:contains("Peserta Tender")').next().text().trim()

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
    console.log("Proses dimulai, mohon tunggu ...")
    aksesHalamanPengumumanTenderTerdata()
}

// laksanakan!
main()
