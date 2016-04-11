$(document).ready(function() {
    $('body').on('click', '.scrollspy a', function (e) {
        e.preventDefault();
        var target = $(this).attr('href');
        window.location = $(this).attr('href');
        $(window).scrollTop($(target).offset().top - 60);
    });
    $('#nav').affix({
        offset: {
            top: 0
        }
    });

    $('body').on('click', 'span[data-collapse]', function () {
        $(this).closest('section').find('.panel-body').toggle();
        $(this).closest('section').find('.panel-footer').toggle();
        $(this).toggleClass('glyphicon-chevron-right');
        $(this).toggleClass('glyphicon-chevron-down');
    });

    $('.github').addClass('hidden');
    setTimeout(function () {
        $('.github').removeClass('hidden');
    }, 1000);

    [].forEach.call(document.querySelectorAll('pre'), function($pre) {
        var lines = $pre.textContent.split('\n');
        var matches;
        var indentation = (matches = /^\s+/.exec(lines[0])) != null ? matches[0] : null;
        if (!!indentation) {
            lines = lines.map(function(line) {
                return line.replace(indentation, '');
            });
            return $pre.textContent = lines.join('\n').trim();
        }
    });
});