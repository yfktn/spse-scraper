# spse-scrapper
Ini merupakan aplikasi untuk melakukan scrapping pada halaman daftar paket dan status masing-masing paket
di website LPSE, menggunakan phantomjs. Digunakannya phantomjs, karena pada daftar paket tersebut, isinya
merupakan hasil render oleh javascript, sehingga dibutuhkan pembacaan dari hasil generatenya menggunakan
perangkat kusus, tidak bisa langsung menggunakan fungsi di php. 
Terhadap versi SPSE yang di test adalah SPSE v4.3u20191009.
Hasil dari berjalannya aplikasi ini adalah dibuatnya deretan file menggunakan nama <id-paket>.htm, yang
kemudian akan diproses berikutnya oleh tool lainnya. 

Pada prosesnya:
1. dapatkan konten dari table#dttable
2. untuk masing-masing row maka dapatkan id dan konten serta jadwal paket
3. simpan ke file bernama \<id>.htm dengan isinya adalah \<konten> + \<jadwal>

Ini masih versi sangat awal.

Pekerjaan ini merupakan salah satu bukti pekerjaan Work From Home PNS Pemprov Kalteng :D
