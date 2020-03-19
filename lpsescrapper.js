var url = 'https://lpse.kalteng.go.id/eproc4/lelang'
var pagecnt = 0

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

function scrapePage()
{
    pagecnt = pagecnt + 1
    console.log("Scrapping halaman: " + pagecnt)
    // page.render(pagecnt + '.png')
    if(pagecnt <= 10 && isNextExist(page)) {
        clickNext(page)
        setTimeout(function() {
            scrapePage()
        }, 5000)
    } else {
        phantom.exit()
    }

}

function isNextExist(page)
{
    return page.evaluate(function() {
        return !$("li#tbllelang_next").hasClass('disabled')
    })
}

function clickNext(page)
{
    page.evaluate(function() {
        $('li#tbllelang_next a[aria-controls="tbllelang"][aria-label="Next"]').click()
    })
}

var page = require('webpage').create()
page.open(url, function(status) {
    if (status == 'success') {
        scrapePage()
    } else {
        console.log("Tidak dapat mengakses url yang dikehendaki")
    }
})