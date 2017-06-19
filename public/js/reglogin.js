/**
 * Created by Administrator on 2017/5/27.
 */
//to-do. dry-up & remove jq
$('.select__label').click(function() {
    $('.select__label').removeClass('select__label--active');
    $(this).addClass('select__label--active');
});

$('#js-usr-rtn').click(function() {
    $('#js-btn, .pointer, #js-field__pass').removeClass('--usr-new --usr-rst ui-field--hidden');
    $('#js-btn, .pointer').addClass('--usr-rtn');
    $('#js-field__r-pass').addClass('ui-field--hidden');
});
$('#js-usr-new').click(function() {
    $('#js-btn, .pointer, #js-field__r-pass, #js-field__pass').removeClass('--usr-rtn --usr-rst ui-field--hidden');
    $('#js-btn').addClass('--usr-new');
});
$('#js-usr-rst').click(function() {
    $('#js-btn, .pointer').removeClass('--usr-rtn --usr-new');
    $('#js-btn, .pointer').addClass('--usr-rst');
    $('#js-field__r-pass, #js-field__pass').addClass('ui-field--hidden');
});