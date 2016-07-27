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
            console.log();
            pinynize(res);
        },
        error: function(jqxhr, status, error) {
            console.log(status + error);
        }
    });
}
// <table onclick='bolder()'>
//   <tr class='pinyin'>
//     <td id='1'>ni</td>
//     <td id='2'>hao</td>
//   </tr>
//   <tr class='chinese'>
//     <td id='1'>你</td>
//     <td id='2'>好</td>
//   </tr>
// </table>

function pinynize(res) {
    var original = res.content;
    var ptags = $(original).find('p');
    var content = '';
    ptags.each(function(idx, elm) {
        content += '<table><tr>';
        var ch = elm.childNodes[0].data;
        ch.split('').forEach(function(elm, idx) {
            // for simplicity, take just the first option
            var py = mpy(elm)[0];
            content += '<td>' + (py ? (py + ' ') : elm) + '</td>';
        });
        content += '</tr><tr>'
        ch.split('').forEach(function(elm, idx) {
            // for simplicity, take just the first option
            content += '<td>' + elm + '</td>';
        });
        // content = content + ch + '</tr><tr>';
        content = content + '</tr></table>';
    });
    $('body').replaceWith(content);
}
