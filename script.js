var audio = document.getElementById('audio');
var songs = ['1.mp3', '2.mp3', '3.mp3'];
var idx = Math.floor(Math.random() * 3);

document.getElementById('enter').onclick = function() {
    this.classList.add('hide');
    document.getElementById('main').classList.add('show');
    audio.src = songs[idx];
    audio.volume = 0.3;
    audio.play();
};

audio.onended = function() {
    idx = (idx + 1) % 3;
    audio.src = songs[idx];
    audio.play();
};

fetch('https://api.lanyard.rest/v1/users/262158823433830402')
    .then(function(r) { return r.json(); })
    .then(function(d) {
        if (!d.success) return;
        var p = d.data;
        document.getElementById('load').style.display = 'none';
        document.getElementById('data').style.display = 'block';
        document.getElementById('dot').className = 'dot ' + (p.discord_status || 'offline');
        document.getElementById('name').textContent = p.discord_user.global_name || p.discord_user.username;
        document.getElementById('user').textContent = '@' + p.discord_user.username;
    })
    .catch(function() {
        document.getElementById('load').textContent = 'failed';
    });