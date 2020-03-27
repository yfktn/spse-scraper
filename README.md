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

Ini masih versi sangat awal.

*Pekerjaan ini merupakan salah satu bukti pekerjaan Work From Home PNS Pemprov Kalteng :D*
