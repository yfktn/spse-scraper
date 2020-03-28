/**
 * File konfigurasi
 * NOTE: silahkan copy file ini, dan beri-nama filenya dengan config.js
 * supaya bisa dibaca oleh sistem. 
 */
exports.scraper = {
    // masukkan alamat web LPSE, perhatikan tanda "/" tidak ada di bagian terakhir
    url: 'https://lpse.url-anda-di-sini.go.id/eproc4',
    // masukkan link alamat untuk daftar lelang, pastikan bahwa tanda "/" TIDAK ADA dibagian akhir
    urlDaftarLelang: 'https://lpse.url-anda-di-sini.go.id/eproc4/lelang',
    // masukkan link alamat untuk evaluasi di sini, perhatikan tanda "/" ada dibagian akhir
    urlEvaluasi: 'https://lpse.url-anda-di-sini.go.id/eproc4/evaluasi/',
    // masukkan path tempat data di buat
    dbPath: 'spse-craper.db',
    // masukkan nilai di sini, berapa halaman maksimal yang dibaca oleh scraper untuk diolah, di mana
    // daftar halaman ini merujuk ke jumlah halaman yang muncul saat kita mengakses halaman yang
    // ditampilkan oleh "urlDaftarLelang" di atas.
    // Isikan dengan 0 untuk melakukan pembacaan hingga habis
    maxPageCnt: 0
}