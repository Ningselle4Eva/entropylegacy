function handleKeyPress(event) {
    if (event.key === 'Enter') {
        checkPassword();
    }
}
  
const correctPassword = "ningning";

function checkPassword() {
    const inputPassword = document.getElementById("passwordInput").value;
    if (inputPassword === correctPassword) {
        document.getElementById("login-screen").style.display = "none";
    } else {
        alert("Incorrect password, try again.");
    }
}

function togglePassword() {
    const passwordField = document.getElementById("passwordInput");
    const toggleButton = document.getElementById("togglePassword");
    if (passwordField.type === "password") {
        passwordField.type = "text";
        toggleButton.textContent = "Hide";
    } else {
        passwordField.type = "password";
        toggleButton.textContent = "Show";
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const videoElement = document.getElementById('video');
    const pipButton = document.getElementById('pipButton');
    const channelListElement = document.getElementById('channelList');
    const videoContainer = document.getElementById('videoContainer');

    if (!document.pictureInPictureEnabled) {
        pipButton.style.display = 'none';
    }

    pipButton.addEventListener('click', () => {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
        } else {
            videoElement.requestPictureInPicture().catch(error => {
                console.error('Error entering PiP mode: ', error);
            });
        }
    });

    const player = new shaka.Player(videoElement);
    const ui = new shaka.ui.Overlay(player, videoContainer, videoElement);

    ui.configure({
        'overflowMenuButtons': ['quality', 'language', 'captions', 'playback_rate', 'cast']
    });

    async function loadChannel(channel) {
        videoElement.style.display = "block";
        videoContainer.classList.add("active");

        if (!shaka.Player.isBrowserSupported()) {
            alert("Your browser does not support Shaka Player.");
            return;
        }

        try {
            await player.attach(videoElement);
            player.configure({
                drm: {
                    clearKeys: {
                        [channel.key.split(":")[0]]: channel.key.split(":")[1]
                    }
                }
            });

            await player.load(channel.src);
            videoElement.play().catch(error => console.warn("Autoplay failed: User interaction needed", error));
        } catch (error) {
            console.error("Error loading video:", error);
            alert("Error loading channel: " + channel.name);
        }
    }

    function populateChannels() {
        channels.forEach((channel) => {
            const li = document.createElement('li');
            li.textContent = channel.name;
            li.onclick = () => {
                document.querySelectorAll('.channel-list li').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                loadChannel(channel);
            };
            channelListElement.appendChild(li);
        });
    }

    function searchChannels() {
        let input = document.getElementById('searchInput').value.toLowerCase();
        document.querySelectorAll('.channel-list li').forEach(channel => {
            channel.style.display = channel.textContent.toLowerCase().includes(input) ? "block" : "none";
        });
    }

    populateChannels();
    window.searchChannels = searchChannels;
});
