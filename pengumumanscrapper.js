/**
 * Lakukan pembacaan di halaman punya pengumuman, jalankan ini setelah proses pembacaan data awal selesai
 * dilakukan.
 */
// waitfor module
var waiter = require('./waitfor')
var pagePengumuman = require('webpage').create()
// untuk membaca file
var fs = require('fs')
// TAFFY DB
var dbUtama = require('./dbnya'),
    dbUtamaPath = 'spse-scrapper.db'

function aksesHalamanPengumumannya(linknya)
{
    pagePengumuman.open(linknya, function(status) {
        if(status == 'success') {
            scrapePengumuman(linknya)
        } else {
            console.log("Halaman pengumuman tidak dapat dicek: " + linknya)
        }
    })
}

function scrapePengumuman(linknya)
{
    waiter.waitFor(
        function() {
            // tunggu sampai sesuatu ke load
            return page.evaluate(function() {
                return $('div.content').length > 0
            })
        },
        function() {
            prosesPengumumanTender()
        }
    )
}

/**
 * Lakukan pembacaan terhadap pengumuman Tender
 * @returns {String} hasil JSON.stringify( dataPengumuman )
 */
function prosesPengumumanTender()
{
    var dataTender = pagePengumuman.evaluate(function() {
        var data = {}
            tableTr = $('div.content:first table tr')

        // data['kode_tender'] = $(tableTr[0]).find('td:first').text()
        // data['nama_tender'] = $(tableTr[1]).find('td:first').html()
        // nilai RUP dll
        var dtu = $(tableTr[4]).find('td'),
            pagu = $(tableTr[13]).find('td:first').text(),
            hps = $(tableTr[13]).find('td:last').text()

        data['rup_kode'] = $(dtu[0]).text()
        data['rup_nama_paket'] = $(dtu[1]).text()
        data['sumber_dana'] = $(dtu[3]).text()
        data['tanggal_pembuatan'] = $(tableTr[5]).find('td:first').text()
        data['keterangan'] = $(tableTr[6]).find('td:first').text()
        data['instansi'] = $(tableTr[8]).find('td:first').text()
        data['satuan_kerja'] = $(tableTr[9]).find('td:first').text()
        data['kategori'] = $(tableTr[10]).find('td:first').text()
        data['sistem_pengadaan'] = $(tableTr[11]).find('td:first').text()
        // data['tahun_anggaran'] = $(tableTr[12]).find('td:first').text()
        data['pagu_paket'] = pagu.replace('Rp ', '')
        data['hps_paket'] = hps.replace('Rp ', '')
        data['cara_pembayaran'] = $(tableTr[14]).find('td:first').text()
        data['lokasi'] = $(tableTr[15]).find('td:first').html()
        data['kualifikasi'] = $(tableTr[16]).find('td:first').text()
        data['peserta'] = $(tableTr[35]).find('td:first').text()

        return JSON.stringify(data)
    })

    return dataTender
}


function loopingUtama()
{
    // buka dan load db
    dbUtama.initDanLoad(dbUtamaPath)
    // looping di db utama nya

}

