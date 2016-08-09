/*
 * global stuff
 *
 * config: stores some config. this file shouldn't be checked in to git
 * mpy: mini-pinyin.js, which is just a giant lookup table
 * $: jquery
 */
// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'report_back') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        sendResponse(document.all[0].outerHTML);

        parseDom();
    }
});

function displayErr(msg) {
    $('body').append(
        '<div id="errDialog"> ' +
        msg +
        '<span class="close">x</span></div>'
        );
    $('#errDialog').slideDown('slow');
    $('#errDialog .close').on('click', function() {
        $('#errDialog').hide();
    });

}

function parseDom() {
    $.ajax({
        url: 'https://www.readability.com/api/content/v1/parser',
        type: 'GET',
        data: {
            token: config.token,
            // get the url for the current doc
            url: window.location.href
        },
        success: function(res) {
            // load the <p> into $
            pinynize(res);
        },
        error: function(jqxhr, status, error) {
            console.log(status + error);
            displayErr('readability api returned error');
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
        // TODO: error handling on no content
        var ch = para.childNodes[0].data || '';
        if (!para) {
            displayErr('no paragraph');
        } else if (!para.childNodes) {
            displayErr('no paragraph.childNodes');
        } else if (!para.childNodes[0]) {
            displayErr('no paragraph.childNodes[0]');
        } else if (!para.childNodes[0].data) {
            displayErr('no paragraph.childNodes[0].data');
        } else {
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
        }
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
