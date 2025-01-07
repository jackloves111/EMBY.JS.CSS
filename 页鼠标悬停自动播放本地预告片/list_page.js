// emby list page

(function () {
    "use strict";

    var paly_mutation;
    document.addEventListener("viewbeforeshow", function (e) {
        paly_mutation?.disconnect(); // Disconnect previous observer if exists

        // Filter specific context paths
        if (e.detail.contextPath.startsWith("/list/") ||
            e.detail.contextPath.startsWith("/videos?") ||
            e.detail.contextPath.startsWith("/tv?") &&
            !e.detail.contextPath.includes("type=Person")) {

            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints;
            if (isTouchDevice) return;

            const setupObserver = (itemsContainer) => {
                if (!itemsContainer) return;

                paly_mutation = new MutationObserver(async (mutationsList) => {
                    for (let mutation of mutationsList) {
                        for (let node of mutation.addedNodes) {
                            if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('virtualScrollItem')) {
                                await addTrailer(node); // Wait for addTrailer to finish before moving on to the next one
                            }
                        }
                    }
                });

                // Start observing for child additions
                paly_mutation.observe(itemsContainer, {
                    childList: true,
                    subtree: false,
                });
            };

            const mutation = new MutationObserver(() => {
                const viewnode = e.target;
                const itemsContainer = viewnode?.querySelector("div[is='emby-scroller']:not(.hide) .virtualItemsContainer");
                if (itemsContainer) {
                    mutation.disconnect(); // Stop observing once the container is found
                    setupObserver(itemsContainer);
                }
            });

            if (!e.detail.isRestored) {
                //loadCSSFile('./style.css');
                mutation.observe(document.body, {
                    childList: true,
                    subtree: true, // Observe all descendants for better detection
                });
            } else {
                //loadCSSFile('./style.css');
                const viewnode = e.target;
                const itemsContainer = viewnode?.querySelector("div[is='emby-scroller']:not(.hide) .virtualItemsContainer");
                setupObserver(itemsContainer); // Reattach observer for restored views
            }
        }
    });


    async function addTrailer(node) {
        const cardBox = node.querySelector('.cardBox');
        const imgContainer = cardBox?.querySelector('.cardImageContainer');
        const img = imgContainer?.querySelector('.cardImage');
        if (!img) return;
        const itemId = getItemIdFromUrl(img.src);
        if (!itemId || itemId.length === 0) return;

        const item = await ApiClient.getItem(ApiClient.getCurrentUserId(), itemId);
        let trailerUrl;

        if (item.LocalTrailerCount > 0) {
            const localTrailers = await ApiClient.getLocalTrailers(ApiClient.getCurrentUserId(), itemId);
            const trailerItem = await ApiClient.getItem(ApiClient.getCurrentUserId(), localTrailers[0].Id);
            trailerUrl = getTrailerUrl(trailerItem);
        } else if (item.RemoteTrailers && item.RemoteTrailers.length > 0) {
            trailerUrl = item.RemoteTrailers[0].Url;
        } else {
            return;
        }

        imgContainer.classList.add('has-trailer');

        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        // Wait for API to load
        await new Promise((resolve) => {
            const checkYT = () => {
                if (window.YT && window.YT.Player) resolve();
                else setTimeout(checkYT, 50);
            };
            checkYT();
        });

        let isHovered = false; // Flag to track hover status

        const handleMouseLeave = () => {
            isHovered = false;
            imgContainer.classList.add('has-trailer');
            img.style.filter = ''; // Remove blur effect

            const playerContainer = imgContainer.querySelector(`#player-${itemId}`);
            if (playerContainer) {
                const player = window.YT.get(playerContainer.id);
                if (player) player.destroy();
                playerContainer.remove();
            } else {
                const allVideos = imgContainer.querySelectorAll('video');
                allVideos.forEach(video => {
                    video.remove(); // Remove each video element
                });
            }
        };

        node.addEventListener('mouseenter', () => {
            if (isHovered) return; // Prevent duplicate mouseenter logic
            isHovered = true;
            imgContainer.classList.remove('has-trailer');

            // Add the mouseleave listener only once
            if (!node.hasMouseLeaveListener) {
                node.addEventListener('mouseleave', handleMouseLeave);
                node.hasMouseLeaveListener = true;
            }

            // Check if the trailer is a YouTube URL
            if (trailerUrl.includes('youtube.com') || trailerUrl.includes('youtu.be')) {
                const embedUrl = trailerUrl.includes('watch')
                    ? trailerUrl.replace('watch?v=', 'embed/')
                    : trailerUrl.replace('youtu.be/', 'youtube.com/embed/');

                const playerContainer = document.createElement('div');
                playerContainer.style.position = 'absolute';
                playerContainer.style.top = '50%';
                playerContainer.style.left = '0';
                playerContainer.style.transform = 'translate(0, -50%)';
                playerContainer.style.width = '100%';
                playerContainer.style.height = '100%';
                playerContainer.style.zIndex = '3';
                playerContainer.id = `player-${itemId}`;
                imgContainer.appendChild(playerContainer);

                const player = new YT.Player(playerContainer.id, {
                    videoId: new URL(embedUrl).pathname.split('/').pop(),
                    playerVars: {
                        autoplay: 1,
                        mute: 1, // Mute the video
                        controls: 0, // Hide player controls
                        modestbranding: 1, // Remove YouTube logo
                    },
                    events: {
                        onReady: (event) => {
                            event.target.playVideo();
                        },
                    },
                });
            } else {
                const videoElement = document.createElement('video');
                videoElement.src = trailerUrl;
                videoElement.autoplay = true;
                videoElement.muted = true;
                videoElement.classList.add('video-element');

                imgContainer.appendChild(videoElement);
                img.style.filter = 'blur(5px)';
            }
        });
    }


    function getItemIdFromUrl(url) {
        const match = url.match(/\/Items\/(\d+)\/Images\//);
        return match ? match[1] : null; // Return the ID if found, otherwise null
    }

    function getTrailerUrl(item) {
        return `${ApiClient._serverAddress}/emby/videos/${item.Id}/original.${item.MediaSources[0].Container}?MediaSourceId=${item.MediaSources[0].Id}&api_key=${ApiClient.accessToken()}`;
    }

    /*   
    function getOS() {
        let u = navigator.userAgent
        if (!!u.match(/compatible/i) || u.match(/Windows/i)) {
            return 'windows'
        } else if (!!u.match(/Macintosh/i) || u.match(/MacIntel/i)) {
            return 'macOS'
        } else if (!!u.match(/iphone/i)) {
            return 'iphone'
        } else if (!!u.match(/Ipad/i)) {
            return 'ipad'
        } else if (u.match(/android/i)) {
            return 'android'
        } else if (u.match(/Ubuntu/i)) {
            return 'Ubuntu'
        } else {
            return 'other'
        }
    }
    */

})();
