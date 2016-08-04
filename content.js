// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'report_back') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        sendResponse(document.all[0].outerHTML);
        // sendResponse('blah from content page');
        parseDom();
        // testPinyin();
    }
});

function testPinyin() {
    var page = '<p>' + mpy('好') + '</p>';
    $('body').html(page);
}

function parseDom() {
    $.ajax({
        url: 'https://www.readability.com/api/content/v1/parser',
        type: 'GET',
        data: {
            token: 'faf03bf4174913773fcd36134dba8c8d595d70dc',
            // get the url for the current doc
            url: window.location.href
        },
        success: function(res) {
            // load the <p> into $
            pinynize(res);
        },
        error: function(jqxhr, status, error) {
            console.log(status + error);
        }
    });
}

// <div class='box'>
// <span class='py'>hao</span>
// <span class='cn'>好</span>
// </div>

function pinynize(res) {
    var original = res.content;
    var ptags = $(original).find('p');
    var content = '<h1 class="cread-title">' + res.title + '</h1>';
    content += '<div class="cread-main">';
    ptags.each(function renderParagraph(pidx, para) {
        content += '<p class="cread-paragraph">';
        var ch = para.childNodes[0].data;
        ch.split('').forEach(function renderTile(char, cidx) {
            // for simplicity, take just the first option
            var py = mpy(char)[0];
            var pyId = 'p' + cidx + '-' + pidx;
            var cnId = 'c' + cidx + '-' + pidx;
            content += '<div class="cread-tile">';
            content += '<span class="cread-py" id="' + pyId + '">' + (py ? (py + ' ') : char) + '</span>';
            content += '<span class="cread-cn" id="' + cnId + '">' + char + '</span></div>';
        });
        content = content + '</p>';
    });
    content += '</div>';
    $('body').replaceWith(content);
    $('.cread-main').on('click', function(event) {
        var id = '#p' + event.target.id.slice(1);
        if ($(id).css('visibility') === 'hidden') {
            $(id).css('visibility', 'visible');
        } else {
            $(id).css('visibility', 'hidden');
        }
    });
}
