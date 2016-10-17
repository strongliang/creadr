/*
 * global stuff
 *
 * config: stores some config. this file shouldn't be checked in to git
 * mpy: mini-pinyin.js, which is just a giant lookup table
 * $: jquery
 * Readability: Readability.js
 * config: config.js that contains a API token to readability.com
 */

var globals = {
    // testing: true,
    testing: false,
    toggleAll: false,
    creadrEnabled: false,
    parseOnServer: false
    // parseOnServer: true
};

// global structure for all unique characters in the document
cmap = {};

// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'report_back') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        // sendResponse(document.all[0].outerHTML);
        if (!globals.creadrEnabled) {
            globals.creadrEnabled = true;
            // displayLoadStatus();
            // getContent(globals.testing);
            X_readability();
            processDom(document);

        }
    }
});

function displayErr(msg) {
    $('body').append(
        '<div id="creadr-errDialog"> ' +
        msg +
        '<span class="creadr-close">x</span></div>'
        );
    $('#creadr-errDialog').slideDown('slow');
    $('#creadr-errDialog .creadr-close').on('click', function() {
        $('#creadr-errDialog').hide();
    });
}

function displayLoadStatus() {
    $('body').append(
        '<div id="creadr-loadingDiag"> Loading...');
    $('#creadr-loadingDiag').slideDown('fast');
}

function updateCharMap(char, pyId, cmap) {
    if (!cmap[char]) {
        cmap[char] = {
            char: char,
            clicked: false,
            cnt: 0
        };
        cmap[char].Ids = [];
    }
    cmap[char].Ids.push(pyId);

    return cmap;
}

// <div class='tile'>
// <span class='py'>hao</span>
// <span class='cn'>好</span>
// </div>
function pynize(text, pidx) {
    var div = '';
    text.split('').forEach(function renderTile(char, cidx) {
        var pys = mpy(char);
        // TODO: for hacking it up, take just the first option for now
        py = pys[0];
        var pyId = 'p' + cidx + '-' + pidx;
        var cnId = 'c' + cidx + '-' + pidx;
        if (pys.length > 0) {
            updateCharMap(char, pyId, cmap);
        }
        div += '<span class="creadr-cn" id="' + cnId + '">' + char + '</span>';
        div += '<rp>(</rp><rt class="creadr-py" id="' + pyId + '">' + (py? py: ' ') + '</rt><rp>)</rp>';
    });
    return div;
}

function sidebarContent() {
    var content = '<div class="creadr-sidebar-content">';
    content += '<div id="buttons">' +
        '<p>Toggle:</p>' +
        '<button id="toggle-all">All</button>' +
        '<button id="toggle-random">Random</button>' +
        '<button id="toggle-first">First</button>' +
        '</div>';
    // console.log(
    //     _(cmap).filter(function(o) { return o.clicked; }).value()
    // );
    content += _(cmap)
    .filter(function(o) { return o.clicked; })
    .sortBy(function(o) { return o.cnt; })
    .reverse()
    .map(function(elm) {
        // return '<p>' + elm.char + ': ' + mpy(elm.char).join(', ') + '</p>';
        return '<p>' + elm.char + ': ' + mpy(elm.char)[0] + '</p>';
    })
    .value()
    .join(' ');
    content += '</div>';
    return content;
}
function processDom(doc) {
    console.log('lol');
    var content = '<div><h1 class="creadr-title"><ruby>' + pynize($('h1').text(), 0) + '</ruby></h1></div>';
    content += '<div class="creadr-box"><div>';
    $('p').each(function renderParagraph(pidx) {
        if ($(this).text().trim() !== '') {
            content += '<p class="creadr-paragraph big3"><ruby class="creadr-main">';
            content += pynize($(this).text(), pidx + 2) + '</ruby></p>';
        }
    });
    console.log('abc');
    content += '</div><div class="creadr-sidebar">';
    content += sidebarContent();
    content += '</div></div>';
    // inject the html into the existing page
    // TODO: use modal
    $('body').addClass('creadr-body').html(content);
    // TODO: hacky way to reset the alignment
    $('.creadr-title, .creadr-main').on('click', function(event) {

        var id = event.target.id.slice(1);
        var pid = '#p' + id;
        var char = $('#c' + id).text();
        // console.log(cmap[char]);
        // TODO: why do I need to reset the styles for p tag here?
        if ($(pid).css('visibility') === 'hidden') {
            $(pid).css('visibility', 'visible');
            cmap[char].clicked = true;
            cmap[char].cnt++;
        } else {
            $(pid).css('visibility', 'hidden');
        }
        // update the side bar
        $('.creadr-sidebar').html(sidebarContent());
        attachSidebarButtonListener();

    });

    // TODO: get rid of this duplicate call
    attachSidebarButtonListener();
}

function attachSidebarButtonListener() {
    $('#toggle-all, #toggle-random, #toggle-first').on('click', function(event) {
        if (globals.toggleAll) {
            $('.creadr-py').css('visibility', 'hidden');
            globals.toggleAll = false;
        } else {
            if (event.target.id === 'toggle-all') {
                $('.creadr-py').css('visibility', 'visible');
            } else if (event.target.id === 'toggle-random') {
                randomChar = $('.creadr-py').get().sort(function() {
                    return Math.round(Math.random()) - 0.5;
                });

                $(randomChar)
                .slice(0, randomChar.length * 0.5)
                .css('visibility', 'visible');
            } else if (event.target.id === 'toggle-first') {
                firstChar = _(cmap)
                    .mapValues(function(o){return o.Ids[0];})
                    .values()
                    .value();
                firstChar.forEach(function(elm) {
                    $('#'+elm).css('visibility', 'visible');
                });
            }
            globals.toggleAll = true;
        }
    });
}
