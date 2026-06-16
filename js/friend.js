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

    function openApplyModal() {
        $('.friend-apply-modal').prop('hidden', false).addClass('is-active').attr('aria-hidden', 'false');
        $('.friend-apply-toggle').attr('aria-expanded', 'true');
        $('body').addClass('friend-apply-open');
        window.setTimeout(function () {
            $('#friend-apply-form input[name="name"]').trigger('focus');
        }, 80);
    }

    function closeApplyModal() {
        $('.friend-apply-modal').removeClass('is-active').attr('aria-hidden', 'true').prop('hidden', true);
        $('.friend-apply-toggle').attr('aria-expanded', 'false');
        $('body').removeClass('friend-apply-open');
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

    $('.friend-apply-toggle').on('click', openApplyModal);
    $('[data-friend-apply-close]').on('click', closeApplyModal);
    $(document).on('keydown', function (event) {
        if (event.key === 'Escape') closeApplyModal();
    });

    $('#friend-apply-form').on('submit', function (event) {
        event.preventDefault();
        var $form = $(this);
        var $status = $('#friend-apply-status');
        var isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);

        if (!isLocal) {
            $status.text('当前是静态线上页面，申请接口需要本地后台运行。你可以在本地预览中提交，或通过留言板联系我。');
            return;
        }

        var payload = {};
        $form.serializeArray().forEach(function (item) {
            payload[item.name] = item.value;
        });

        $status.text('正在提交申请...');
        $.ajax({
            url: 'http://localhost:4010/api/friend-applications',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload)
        }).done(function () {
            $status.text('申请已提交，等待后台审核。');
            $form[0].reset();
        }).fail(function (xhr) {
            var message = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : '提交失败，请确认本地后台已启动。';
            $status.text(message);
        });
    });
});
