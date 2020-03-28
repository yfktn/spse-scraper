# spse-scraper
Ini merupakan aplikasi untuk melakukan scraping pada halaman daftar paket dan status masing-masing paket
di website LPSE, menggunakan phantomjs. Digunakannya phantomjs, karena pada daftar paket tersebut, isinya
merupakan hasil render oleh javascript, sehingga dibutuhkan pembacaan dari hasil generatenya menggunakan
perangkat kusus karena tidak bisa langsung menggunakan fungsi di php. 

Terhadap versi SPSE yang di test saat ini dikembangkan adalah SPSE v4.3u20191009.

Setelah aplikasi ini dijalankan, akan ada sebuah file dengan format JSON, menyimpan semua data hasil penelusuran.

## Ide sederhana untuk alur program ini adalah:
Untuk Init:
1. dapatkan konten dari table#dttable
2. untuk masing-masing row maka dapatkan id dan konten serta jadwal paket
3. simpan ke JSON

## Setelah Init Dilakukan
Setelah hasil init didapatkan:
1. Lakukan pembacaan terhadap data pengumuman
2. Dapatkan data basic
3. Tambahkan variable visited supaya bisa di tracking bagian mana yang baru ditambahkan

## Setelah data dasar didapatkan
Dapat data dasarnya kemudian:
1. Baca hasil evaluasi
2. Cari tahu siapa pemenangnya dan NPWP
3. Lakukan penyimpanan supaya nanti bisa ditelusuri ulang untuk optimasi

## Cara penggunaan
Untuk bisa menggunakan aplikasi scraper ini adalah:
1. Pastikan bahwa **aplikasi phantomjs** telah terinstal, untuk ini silahkan [Download Binary Phantom.js](https://phantomjs.org/download.html). Sesuaikan dengan OS yang digunakan, serta pastikan sudah bisa dieksekusi dari command shell.
2. Lakukan copy terhadap file config_example.js menjadi file config.js dan lakukan penyesuaian.
3. Jalankan script lpse_scraper.js melalui command shell:
```
$ phantomjs lpse_scraper.js
```
4. Jalankan script pengumuman_scraper.js melalui command shell:
```
$ phantomjs pengumuman_scraper.js
```
5. Jalankan script hasil_evaluasi_scraper.js.
```
$ phantomjs hasil_evaluasi_scraper.js
```
6. Dari hasil langkah yang tidak boleh ditukar ini, maka akan dihasilkan file data tender pada website SPSE terpilih.

## Versi SPSE
Versi SPSE yang dikenali adalah SPSE versi 4.3.

## Perhatian
Karena proses pembacaan membuat trafik yang sangat tinggi pada website, diharapkan agar penggunaan tool ini dilakukan dengan sepengetahuan System Admin LPSE.

Ini masih versi sangat awal.

*Pekerjaan ini merupakan salah satu bukti pekerjaan Work From Home PNS Pemprov Kalteng :D*
