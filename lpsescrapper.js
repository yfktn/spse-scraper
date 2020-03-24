/**
 * Ini merupakan aplikasi untuk melakukan scrapping pada halaman daftar paket dan status masing-masing paket
 * di website LPSE, menggunakan phantomjs. Digunakannya phantomjs, karena pada daftar paket tersebut, isinya
 * merupakan hasil render oleh javascript, sehingga dibutuhkan pembacaan dari hasil generatenya menggunakan
 * perangkat kusus, tidak bisa langsung menggunakan fungsi di php. 
 * Terhadap versi SPSE yang di test adalah SPSE v4.3u20191009.
 * Hasil dari berjalannya aplikasi ini adalah dibuatnya deretan file menggunakan nama <id-paket>.htm, yang
 * kemudian akan diproses berikutnya oleh tool lainnya. Pada prosesnya:
 * 1. dapatkan konten dari table#dttable
 * 2. untuk masing-masing row maka dapatkan id dan konten serta jadwal paket
 * 3. simpan ke file bernama <id>.htm dengan isinya adalah <konten> + <jadwal>
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
var maxpagecnt = 1
// waitfor module
var waiter = require('./waitfor')
// md5
var theHash = require('./md5')

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
        var data = {}
        // looping pada masing-masing baris di table lelang
        $('table#tbllelang tr').each(function(index, el) {
            var id = $(el).find("td:first").text(), // ambil id
                contentObj = $(el).find('td:nth-child(2)'), // ambil content object
                linkPengumuman = $(contentObj).find('p:first a').attr('href'), // dapatkan link pengumuman
                content = contentObj.html(), // isinya dalam html
                schedule = $(el).find('td:nth-child(4)').html() // dan jadwal aktif

            if (content !== undefined) {
                data[id] = {
                    'linkPengumuman': linkPengumuman,
                    'content': content + '<p>' + schedule + '</p>',
                    'jadwal': schedule
                }
            }
        })
        // di phantomjs terdapat masalah bila kembalian adalah langsung array
        // maka convert ke string dengan format JSON
        return JSON.stringify(data);
    })
    // ambil datanya
    var result = JSON.parse(tableContent)

    // looping berdasarkan data tersebut
    for(var key in result) {
        content = result[key]['content']

        var md5nya = theHash.md5(content),
            // fileKeyName = key + '.log',
            fileName = key + '_' + md5nya + '.json',
            currDate = new Date()

        if( fs.exists(fileName) ) {
            console.log("File: " + fileName + " tidak ada perubahan.")
            continue
        } else {
            console.log("New/Update file: " + fileName)
        }

        // setiap file memiliki nama id paket dan htm
        fs.write( fileName, JSON.stringify(result[key]), 'w')
    }
}

// mulai untuk membuat objek webpage punya phantomjs
var page = require('webpage').create()

// akses URL
page.open(url, function(status) {
    if (status == 'success') {
        // lakukan recursive
        scrapePage()
    } else {
        console.log("Tidak dapat mengakses url yang dikehendaki")
    }
})