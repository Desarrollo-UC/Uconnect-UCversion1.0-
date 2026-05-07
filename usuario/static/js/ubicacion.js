$(document).ready(function () {
    var isEdge = window.navigator.userAgent.indexOf("Edge") > -1 || window.navigator.userAgent.indexOf("Edg") > -1;
    var sanjose = document.getElementById('iframeSanJose');
    var heredia = document.getElementById('iframeHeredia');
    var perez = document.getElementById('iframePerez');
    if (isEdge) {
        sanjose.setAttribute('src', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1389.4562161707297!2d-84.06906319653176!3d9.93598382879684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0e37ce4b1eee7%3A0x5bc1401227d5f920!2sUIA!5e0!3m2!1ses!2scr!4v1685388499158!5m2!1ses!2scr');
        heredia.setAttribute('src', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d982.2952809392623!2d-84.11760020000001!3d10.0018929!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0fbda3dbf70a1%3A0x6c4b24ca34d99451!2sUIA%20Heredia!5e0!3m2!1ses!2scr!4v1685389100367!5m2!1ses!2scr');
        perez.setAttribute('src', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3936.907502292161!2d-83.67616582496369!3d9.34145288401975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa14d44def35499%3A0x9d5a8df2cc76a8bb!2sUIA!5e0!3m2!1ses-419!2scr!4v1706574061167!5m2!1ses-419!2scr');
    } else{
        sanjose.setAttribute('src', 'https://embed.waze.com/iframe?zoom=16&lat=9.935880&lon=-84.068123&ct=livemap&pin=1&nav=1&search=0');
        heredia.setAttribute('src', 'https://embed.waze.com/iframe?zoom=16&lat=10.001754&lon=-84.117637&ct=livemap&pin=1&nav=1&search=0');
        perez.setAttribute('src', 'https://embed.waze.com/iframe?zoom=16&lat=9.341448&lon=-83.673591&ct=livemap&pin=1&nav=1&search=0');
    }
});