/*
 * global stuff
 *
 * config: stores some config. this file shouldn't be checked in to git
 * mpy: mini-pinyin.js, which is just a giant lookup table
 * $: jquery
 */
// var testing = true;
var testing = false;

// global structure for all unique characters in the document
cmap = {};

// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'report_back') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        sendResponse(document.all[0].outerHTML);

        getContent(testing);
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

function getContent() {
    if (testing) {
        // some dummy test data
        processContent({
            domain: 'www.ppzuowen.com',
            next_page_id: null,
            url: 'http://www.ppzuowen.com/book/ertongshuiqiangushi/121549.html',
            short_url: 'http://rdd.me/aofwuppq',
            author: null,
            excerpt: '&hellip;',
            direction: 'ltr',
            word_count: 0,
            total_pages: 0,
            "content": '<div><div class="articleBody articleContent1 "> <div class="articleContent">&#x3000;&#x3000;&#x8FD9;&#x662F;&#x4E00;&#x4E2A;&#x795E;&#x8BDD;&#x6545;&#x4E8B;&#xFF0C;&#x4F20;&#x8BF4;&#x5728;&#x5F88;&#x4E45;&#x5F88;&#x4E45;&#x4EE5;&#x524D;&#xFF0C;&#x5929;&#x4E0B;&#x5206;&#x4E3A;&#x4E1C;&#x80DC;&#x795E;&#x6D32;&#x3001;&#x897F;&#x725B;&#x8D3A;&#x6D32;&#x3001;&#x5357;&#x8D61;&#x90E8;&#x6D32;&#x3001;&#x5317;&#x4FF1;&#x82A6;&#x6D32;&#x3002;&#x5728;&#x4E1C;&#x80DC;&#x795E;&#x6D32;&#x50B2;&#x6765;&#x56FD;&#xFF0C;&#x6709;&#x4E00;&#x5EA7;&#x82B1;&#x679C;&#x5C71;&#xFF0C;&#x5C71;&#x4E0A;&#x6709;&#x4E00;&#x5757;&#x4ED9;&#x77F3;&#xFF0C;&#x4E00;&#x5929;&#x4ED9;&#x77F3;&#x5D29;&#x88C2;&#xFF0C;&#x4ECE;&#x77F3;&#x5934;&#x4E2D;&#x6EDA;&#x51FA;&#x4E00;&#x4E2A;&#x5375;&#xFF0C;&#x8FD9;&#x4E2A;&#x5375;&#x4E00;&#x89C1;&#x98CE;&#x5C31;&#x53D8;&#x6210;&#x4E00;&#x4E2A;&#x77F3;&#x7334;&#xFF0C;&#x7334;&#x773C;&#x5C04;&#x51FA;&#x4E00;&#x9053;&#x9053;&#x91D1;&#x5149;&#xFF0C;&#x5411;&#x56DB;&#x65B9;&#x671D;&#x62DC;&#x3002;<p> &#x3000;&#x3000;&#x90A3;&#x7334;&#x80FD;&#x8D70;&#x3001;&#x80FD;&#x8DD1;&#xFF0C;&#x6E34;&#x4E86;&#x5C31;&#x559D;&#x4E9B;&#x5C71;&#x6DA7;&#x4E2D;&#x7684;&#x6CC9;&#x6C34;&#xFF0C;&#x997F;&#x4E86;&#x5C31;&#x5403;&#x4E9B;&#x5C71;&#x4E0A;&#x7684;&#x679C;&#x5B50;&#x3002;</p><p> \n   &#x3000;&#x3000;&#x6574;&#x5929;&#x548C;&#x5C71;&#x4E2D;&#x7684;&#x52A8;&#x7269;&#x4E00;&#x8D77;&#x73A9;&#x4E50;&#xFF0C;&#x8FC7;&#x5F97;&#x5341;&#x5206;&#x5FEB;&#x6D3B;&#x3002;&#x4E00;&#x5929;&#xFF0C;&#x5929;&#x6C14;&#x7279;&#x522B;&#x70ED;&#xFF0C;&#x7334;&#x5B50;&#x4EEC;&#x4E3A;&#x4E86;&#x8EB2;&#x907F;&#x708E;&#x70ED;&#x7684;&#x5929;&#x6C14;&#xFF0C;&#x8DD1;&#x5230;&#x5C71;&#x6DA7;&#x91CC;&#x6D17;&#x6FA1;&#x3002;&#x5B83;&#x4EEC;&#x770B;&#x89C1;&#x8FD9;&#x6CC9;&#x6C34;&#x54D7;&#x54D7;&#x5730;&#x6D41;&#xFF0C;&#x5C31;&#x987A;&#x7740;&#x6DA7;&#x5F80;&#x524D;&#x8D70;&#xFF0C;&#x53BB;&#x5BFB;&#x627E;&#x5B83;&#x7684;&#x6E90;&#x5934;&#x3002;</p></div></div>', "date_published": null, "dek": null, "lead_image_url": null, "title": "老虎和青蛙_【儿童睡前故事】_ 皮皮少儿阅读频道", "rendered_pages": 1 });
    } else {
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
                processContent(res);
            },
            error: function(jqxhr, status, error) {
                console.log(status + error);
                displayErr('readability api returned error');
            }
        });
    }
}

function updateCharMap(char, cmap) {
    if (!cmap[char]) {
        cmap[char] = {
            clicked: false
        };
    }

    return cmap;
}

// <div class='tile'>
// <span class='py'>hao</span>
// <span class='cn'>好</span>
// </div>
function pynize(text, pidx) {
    var div = '<div>';
    text.split('').forEach(function renderTile(char, cidx) {
        updateCharMap(char, cmap);
        // for simplicity, take just the first option
        var py = mpy(char)[0];
        var pyId = 'p' + cidx + '-' + pidx;
        var cnId = 'c' + cidx + '-' + pidx;
        div += '<div class="creadr-tile">';
        div += '<span class="creadr-py" id="' + pyId + '">' + (py ? (py + ' ') : char) + '</span>';
        div += '<span class="creadr-cn" id="' + cnId + '">' + char + '</span></div>';
    });
    div += '</div>';
    return div;
}

function sidebarContent() {
    var content = '<div class="creadr-sidebar-content">';
    content += _(cmap)
    .pickBy(function(value, key) {
        return value.clicked;
    })
    .keys()
    .map(function(elm) {
        return '<p>' + elm + ': ' + mpy(elm).join(', ') + '</p>';
    })
    .value()
    .join(' ');
    content += '</div>';
    return content;
}

function processContent(res) {
    var original = res.content;
    var dataTag;
    var content = '<body><h1 class="creadr-title">' + pynize(res.title, 0) + '</h1>';
    content += '<div class="creadr-box"><div class="creadr-main">';
    // main content layout
    // <div class="box">
    //   <div class="content"></div>
    //   <div class="sidebar"></div>
    // </div>

    if ($(original).find('div div').text().indexOf('\n') !== -1) {
        dataTag = 'div div';
    } else {
        dataTag = 'div';
    }

    $(original).find(dataTag).text().split('\n').forEach(function renderParagraph(para, pidx) {
        if (para.trim() !== '') {
            content += '<p class="creadr-paragraph">';
            content += pynize(para, pidx + 2) + '</p>';
        }
    });
    content += '</div><div class="creadr-sidebar">';
    content += sidebarContent();
    content += '</div></div></body>';

    // inject the html into the existing page
    $('body').html(content);
    $('.creadr-title, .creadr-main').on('click', function(event) {
        var id = event.target.id.slice(1);
        var pid = '#p' + id;
        var char = $('#c' + id).text();
        // console.log(char);
        // console.log(cmap[char]);
        cmap[char].clicked = true;
        // update the side bar
        $('.creadr-sidebar').html(sidebarContent());
        // TODO: why do I need to reset the styles for p tag here?
        $('.creadr-sidebar p').css({'height': '30'});
        if ($(pid).css('visibility') === 'hidden') {
            $(pid).css('visibility', 'visible');
        } else {
            $(pid).css('visibility', 'hidden');
        }
    });
}
