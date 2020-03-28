var config = require('./config_example')

console.log(config.scraper.url === 'https://lpse.url-anda-di-sini.go.id/eproc4')
console.log(config.scraper.urlDaftarLelang === 'https://lpse.url-anda-di-sini.go.id/eproc4/lelang')
console.log(config.scraper.urlEvaluasi === 'https://lpse.url-anda-di-sini.go.id/eproc4/evaluasi/')
console.log(config.scraper.dbPath === 'spse-craper.db')
console.log(config.scraper.maxPageCnt === 0)

phantom.exit()