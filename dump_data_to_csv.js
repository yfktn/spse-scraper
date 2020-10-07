var config = require('./config'),
    jsonutil = require('./jsonutil'),
    jsonDbPath = config.scraper.dbPath,
    performaStart = performance.now(),
    dumpToCSV = 'spse-scraper.csv'

function main()
{
    jsonutil.setPath(jsonDbPath)
    jsonutil.initAndLoad()
    console.log("Tunggu proses selesai ...")
    jsonutil.dumpObjectToCSV(dumpToCSV)
    console.log("selesai dalam waktu:" + (performance.now() - performaStart) + " ms")
    phantom.exit()
}

main()