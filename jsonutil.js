/**
 * Ini digunakan untuk inputan saja, sedangkan terhadap query yang lebih advanced gunakan tool taffydb
 */
var fs = require('fs'),
    dbData = [],
    dbIndexId = [],
    dbIndex = [],
    filePath = 'dbtest.db',
    activeIndex = 0,
    dbCount = 0

function syncDbIndex()
{
    dbIndexId = dbData.map(function (el) {
        return el.id
    })
}

function syncDbCount()
{
    dbCount = dbData.length
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
        syncDbCount()
    }
}

exports.addIndex = function(fieldName) 
{
    dbIndex[fieldName] = dbData.map(function(el) {
        return el[fieldName]
    })
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

function addValueToIndex(data) 
{
    for (var key in dbIndex) {
        dbIndex[key].push(data[key])
    }
}

exports.push = function(data)
{
    dbData.push(data)
    dbIndexId.push(data.id)
    addValueToIndex(data)
    dbCount = dbCount + 1
}

exports.isAlreadyInserted = function(idValue)
{
    return dbIndexId.indexOf(idValue) >= 0
}

exports.findValueInField = function(value, inField)
{
    if( inField === 'id' ) {
        return dbIndexId.indexOf(value)
    } else {
        if( dbIndex[inField] !== undefined ) {
            return dbIndex[inField].indexOf(value)
        }
    }
    // without index?
    for(var i = 0; i < dbCount; i++) {
        if( dbData[inField] == value ) {
            return i
        }
    }
    return false
}

exports.indexOfId = function(idValue)
{
    return dbIndexId.indexOf(idValue)
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
    return dbIndexId.length
}

exports.moveFirst = function()
{
    activeIndex = 0
}

exports.moveNext = function()
{
    if((activeIndex + 1) >= dbCount) {
        console.log("ups sudah di batas: " + activeIndex)
        return false
    }
    activeIndex = activeIndex + 1
    return true
}

exports.movePrev = function()
{
    if ((activeIndex - 1) < 0) {
        return false
    }
    activeIndex = activeIndex - 1
    return true
}

exports.moveLast = function()
{
    activeIndex = dbCount - 1
}

exports.getCurrentData = function(cloned)
{
    var isCloned = false
    if(cloned !== undefined && cloned == true) {
        isCloned = true
    }
    return isCloned? 
        JSON.parse(JSON.stringify(dbData[activeIndex])):
        dbData[activeIndex]
}

exports.mergeObject = function(target, source)
{
    for (var key in source) {
        var value = source[key]
        target[key] = value
    }
}

exports.dumpObject = function(obj)
{
    for (var key in obj) {
        var value = obj[key]
        console.log(key + " = " + value)
    }
}