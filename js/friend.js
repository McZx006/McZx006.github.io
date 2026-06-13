// Friend links are rendered from /json_data/friend.json so the page stays easy to maintain.
$(function () {
    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function renderCard(item, invalid) {
        var avatar = item.src || '/img/avatar.png';
        var name = item.name || item.url || '未命名站点';
        var url = item.url || '#';
        var date = invalid ? (item.stopTime || item.date || '未记录') : (item.date || '未记录');
        var desc = item.desc || '这个朋友还没有留下简介。';
        var timeLabel = invalid ? '状态' : '时间';

        return [
            '<article class="friend-card-item">',
            '  <img class="ava" src="' + escapeHtml(avatar) + '" alt="' + escapeHtml(name) + '">',
            '  <div class="friend-card-body">',
            '    <div class="friend-card-name"><a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(name) + '</a></div>',
            '    <div class="friend-line"><span>网址：</span><a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(url) + '</a></div>',
            '    <div class="friend-line"><span>' + timeLabel + '：</span>' + escapeHtml(date) + '</div>',
            '    <div class="friend-desc" data-full="' + escapeHtml(desc) + '"><span>简介：</span><span class="friend-desc-text">' + escapeHtml(desc) + '</span></div>',
            '    <button class="friend-toggle" type="button" aria-expanded="false">展开简介</button>',
            '  </div>',
            '</article>'
        ].join('');
    }

    $.getJSON('/json_data/friend.json', function (data) {
        var validLinks = data.filter(function (item) { return item.valid !== 0; });
        var invalidLinks = data.filter(function (item) { return item.valid === 0; });
        var html = [];

        html.push('<div class="friend-title-item">我的友链</div>');
        validLinks.forEach(function (item) {
            html.push(renderCard(item, false));
        });

        if (invalidLinks.length > 0) {
            html.push('<div class="friend-title-item">暂时无法访问</div>');
            invalidLinks.forEach(function (item) {
                html.push(renderCard(item, true));
            });
        }

        $('.links-content').html(html.join(''));
    });

    $('.links-content').on('click', '.friend-toggle', function () {
        var $button = $(this);
        var $desc = $button.siblings('.friend-desc');
        var expanded = $button.attr('aria-expanded') === 'true';

        $desc.toggleClass('is-expanded', !expanded);
        $button.attr('aria-expanded', String(!expanded));
        $button.text(expanded ? '展开简介' : '收起简介');
    });
});
