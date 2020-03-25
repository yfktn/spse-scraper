/**
 * Ini merupakan aplikasi untuk melakukan scrapping pada halaman daftar paket dan status masing-masing paket
 * di website LPSE, menggunakan phantomjs. Digunakannya phantomjs, karena pada daftar paket tersebut, isinya
 * merupakan hasil render oleh javascript, sehingga dibutuhkan pembacaan dari hasil generatenya menggunakan
 * perangkat kusus, tidak bisa langsung menggunakan fungsi di php. 
 * Terhadap versi SPSE yang di test adalah SPSE v4.3u20191009.
 * 
 * Hasil dari proses ini adalah adanya file database sebagaimana yang di set pada bagian dbPath, berupa JSON
 * file untuk dibaca kembali oleh tool pembacaan isi pengumuman.
 * 
 * Jalankan dengan perintah dari shell:
 * $ phantomjs lpsescrapper.js
 * 
 * @author Yan F (friskantoni@gmail.com)
 */
// url dituju
var url = 'https://lpse.kalteng.go.id/eproc4/lelang'
// untuk membuat file
var fs = require('fs')
// jumlah halaman dibaca
var pagecnt = 0
// maksimal halaman,masukkan nilai 0 untuk mengabaikan halaman, pada skenario ini sistem melakukan pembacaan
// hingga tombol next pada pembagian halaman data tidak dapat di klik.
var maxpagecnt = 240
// waitfor module
var waiter = require('./waitfor')
// md5
var theHash = require('./md5')
// TAFFY DB
var TAFFYDB = require('./taffy').taffy,
    dbScrapper = TAFFYDB([]), // object db with TAFFYDB
    dbPath = 'spse-scrapper.db' // place of our db

/**
 * lakukan pengambilan isi datanya.
 */
function scrapePage()
{
    pagecnt = pagecnt + 1
    waiter.waitFor(
        function() {
            // mulai proses pembacaan dan melakukan evaluasi saat halaman sudah terload
            return page.evaluate(function () {
                return $('div#tbllelang_paginate ul.pagination').is(':visible')
            })
        },
        function() {
            stopLoop = false // apa looping diteruskan?
            if(maxpagecnt > 0) { // diputuskan utk membatasi halaman?
                if(pagecnt > maxpagecnt) { // halaman saat ini > max?
                    stopLoop = true
                }
            }
            if (!stopLoop) {
                console.log("Scrapping page: " + pagecnt)
                processingThePage(page, pagecnt)
                if (isNextExist(page)) { // ada kelihatan tombol halaman utk next?
                    clickNext(page) // click next nya!
                    scrapePage() // recursive function
                } else {
                    stopLoop = true
                }
            }
            if( stopLoop ) {
                storeOurDb()
                phantom.exit()
            }
        }
    )
}

/**
 * Check apakah tombol untuk klik next page, tidak di disabled? Kalau di disabled artinya
 * sudah tidak ada lagi halaman yang bisa di load
 * @param {page} page 
 */
function isNextExist(page)
{
    return page.evaluate(function() {
        return !$("li#tbllelang_next").hasClass('disabled')
    })
}

/**
 * click link ke halaman berikutnya
 * @param {page} page 
 */
function clickNext(page)
{
    page.evaluate(function() {
        $('li#tbllelang_next a[aria-controls="tbllelang"][aria-label="Next"]').click()
    })
}

/**
 * Proses halaman yang sedang aktif saat itu!
 * @param {page} page 
 * @param {int} currentPage 
 */
function processingThePage(page, currentPage)
{
    var tableContent = page.evaluate(function() {
        var data = []
        // looping pada masing-masing baris di table lelang
        $('table#tbllelang tr').each(function(index, el) {
            var id = $(el).find("td:first").text(), // ambil id
                contentObj = $(el).find('td:nth-child(2)'), // ambil content object
                link = $(contentObj).find('p:first a'),
                linkPengumuman = $(link).attr('href'), // dapatkan link pengumuman
                namaPaket = $(link).html(),
                versiSpse = $(link).next().text(),
                content = contentObj.html(), // isinya dalam html
                schedule = $(el).find('td:nth-child(4)').html(), // dan jadwal aktif
                tentangTender = $(contentObj).find('p:nth-child(2)').text(), // tentang tender
                tentangTenderA = tentangTender.split("-")

            if (content !== undefined) {
                data.push({
                    'idTender': id,
                    'namaPaket': namaPaket,
                    'versiSpse': versiSpse,
                    'linkPengumuman': linkPengumuman,
                    'content': content + '<p>' + schedule + '</p>',
                    'jadwal': schedule,
                    'jenis': tentangTenderA[0].trim(),
                    'tahun_anggaran': tentangTenderA[1].trim(),
                    'metode': tentangTenderA[2].trim(),
                    'pelaksanaan': tentangTenderA[3].trim(),
                })
            }
        })
        // di phantomjs terdapat masalah bila kembalian adalah langsung array
        // maka convert ke string dengan format JSON
        return JSON.stringify(data);
    })
    // ambil datanya
    var result = JSON.parse(tableContent),
        resultLength = result.length

    // looping berdasarkan data tersebut
    for(var i = 0; i < resultLength; i++) {
        content = result[i]['content']

        var md5nya = theHash.md5(content),
            idDicari = result[i]['idTender'] + '_' + md5nya,
            currDate = Date.now() // get timestamps, so it easier to sort!

        if( dbScrapper( { id: { is: idDicari } } ).count() > 0 ) {
            // console.log("Database: " + idDicari + " tidak ada perubahan.")
            continue
        } else {
            // console.log("New/Update file: " + idDicari)
            result[i]['id'] = idDicari
            result[i]['waktu_check'] = currDate
            dbScrapper.insert(result[i])
        }
    }
}

function initOurDb()
{
    var content = fs.read(dbPath)
    dbScrapper = TAFFYDB(JSON.parse(content))
    console.log("DB init ...")
}

function storeOurDb()
{
    fs.write(dbPath, dbScrapper().stringify(), "w")
    console.log("DB stored")
}

// mulai untuk membuat objek webpage punya phantomjs
var page = require('webpage').create()

// akses URL
page.open(url, function(status) {
    if (status == 'success') {
        // lakukan recursive
        initOurDb()
        scrapePage()
    } else {
        console.log("Tidak dapat mengakses url yang dikehendaki")
    }
})