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
var maxpagecnt = 243

/**
 * https://github.com/ariya/phantomjs/blob/master/examples/waitfor.js
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function () {
            if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof (testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if (!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    // console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof (onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};

/**
 * lakukan pengambilan isi datanya.
 */
function scrapePage()
{
    pagecnt = pagecnt + 1
    waitFor(
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
                content = $(el).find('td:nth-child(2)').html(), // isinya
                schedule = $(el).find('td:nth-child(4)').html() // dan jadwal aktif
            data[id] = content + '<p>' + schedule + '</p>' // simpan
        })
        // di phantomjs terdapat masalah bila kembalian adalah langsung array
        // maka convert ke string dengan format JSON
        return JSON.stringify(data);
    })
    // ambil datanya
    var result = JSON.parse(tableContent)
    // looping berdasarkan data tersebut
    for(var key in result) {
        content = result[key]
        // setiap file memiliki nama id paket dan htm
        fs.write( key + '.htm', content, 'w')
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