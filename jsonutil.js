var fs = require('fs'),
    dbData = [],
    dbDataIndex = [],
    filePath = 'dbtest.db'

function syncDbIndex()
{
    dbDataIndex = dbData.map(function (el) {
        return el.id
    })
}

function loadCreateFile()
{
    if(!fs.exists(filePath)) {
        try {
            fs.write(filePath, "[]", "w")
        } catch(e) {
            console.log(e)
            phantom.exit()
        }
    } else {
        dbData = JSON.parse(fs.read(filePath))
        syncDbIndex()
    }
}

exports.setPath = function(pathDb)
{
    filePath = pathDb
}

exports.initAndLoad = function()
{
    loadCreateFile()
}

exports.saveData = function() 
{
    fs.write(filePath, JSON.stringify(dbData), "w")
}

exports.push = function(data)
{
    dbData.push(data)
    dbDataIndex.push(data.id)
}

exports.isAlreadyInserted = function(idValue)
{
    return dbDataIndex.indexOf(idValue) >= 0
}

exports.indexOfId = function(idValue)
{
    return dbDataIndex.indexOf(idValue)
}

exports.getData = function()
{
    return dbData
}

exports.getDataCloned = function()
{
    return JSON.parse(JSON.stringify(dbData))
}

exports.getLength = function()
{
    return dbDataIndex.length
}