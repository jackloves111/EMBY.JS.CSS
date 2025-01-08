// add a morebutton to trailers

(function () {
    "use strict";
    var item, viewnode, parentItem, paly_mutation1;
    //var paly_mutation2;
    document.addEventListener("viewbeforeshow", function (e) {    
        paly_mutation1?.disconnect();
        //paly_mutation2?.disconnect(); 
        if (e.detail.type === "video-osd") {
            viewnode = e.target;
            if (!e.detail.isRestored) {
                const mutation = new MutationObserver(async function () {
                    item = viewnode.controller?.osdController?.currentItem || viewnode.controller?.currentPlayer?.streamInfo?.item;
                    if (item) {
                        mutation.disconnect();
                        (item.Type === 'Trailer') && insertMoreButton();                  
                    }
                });
                mutation.observe(document.body, {
                    childList: true,
                    characterData: true,
                    subtree: true,
                });
            }
            else {
                item = viewnode.controller.osdController.currentItem;
            }
     
        }
    });


    async function getParentItem() {
        const userId = await ApiClient.getCurrentUserId();
        if (item.Id) {
            !item.ParentId && (item = await ApiClient.getItem(userId, item.Id));
            parentItem = await ApiClient.getItem(userId, item.ParentId);
        } else {
            parentItem = await ApiClient.getItem(userId, item.ParentThumbItemId);
        }
    }

    async function insertMoreButton() {
        const bottomSection = viewnode.querySelector('.videoOsdBottom');
        if (!bottomSection) return

        await getParentItem();

        let videoElement = document.querySelector(".htmlVideoPlayerContainer video")
        if (!videoElement) videoElement = document.querySelector(".youtubePlayerContainer iframe")
        videoElement.addEventListener('play', handleStreamInfoChange);

        updateTitle();

        //setTimeout(() => {
        //    unhidePeople();
        //}, 500);


        paly_mutation1 = new MutationObserver(function () {
            let itemsContainer = viewnode.querySelector('[data-index="0"].videoosd-tab .itemsContainer');  
            if (itemsContainer) {
                paly_mutation1.disconnect();
                itemsContainer.fetchData = fetchItem; 
            }
        });
        paly_mutation1.observe(viewnode.querySelector('[data-index="0"].videoosd-tab'), {
            childList: true,
            characterData: true,
            subtree: true,
        });
        /*
        paly_mutation2 = new MutationObserver(function () {
            let itemsContainer = viewnode.querySelector('[data-index="2"].videoosd-tab .itemsContainer');
            if (itemsContainer) {
                paly_mutation2.disconnect();
                itemsContainer.fetchData = fetchPeople;
            }
        });
        paly_mutation2.observe(viewnode.querySelector('[data-index="2"].videoosd-tab'), {
            childList: true,
            characterData: true,
            subtree: true,
        });
        */

    }

    function updateTitle() {
        viewnode.controller.osdController.currentDisplayItem.Name = 'trailer: ' + parentItem.Name;
        viewnode.controller.osdController.currentDisplayItem.People = parentItem.People;
        //viewnode.controller.osdController.currentDisplayItem.Id = parentItem.Id;
        //viewnode.controller.osdController.currentDisplayItem.ImageTags = parentItem.ImageTags;
        
        const titleElement = viewnode.querySelectorAll('.videoOsdBottom .videoOsdParentTitleContainer .videoOsdParentTitle')[0];
        titleElement.textContent = `trailer: ${parentItem.Name}`;
        /*
        let count = 0;
        const intervalId = setInterval(() => {
            titleElements.forEach(element => {
                if (!element.textContent.includes(parentItem.Name)) {
                    element.textContent = `trailer: ${parentItem.Name}`;
                }   
            });
            count++;
            if (count >= 3) {
                clearInterval(intervalId);
            }
        }, 300);
        */
    }

    /*
    function unhidePeople() {
        if (parentItem.People.length == 0) return
        const peopleButton = viewnode.querySelector('[data-index="2"].videoosd-tab-button')
        let count = 0;
        const intervalId = setInterval(() => {
            if (peopleButton.classList.contains('hide')) {
                peopleButton.classList.remove('hide');
            }
            count++;
            if (count >= 3) {
                clearInterval(intervalId);
            }
        }, 500);
    }
    */

    function updateAttribute() {
        let count = 0;
        const intervalId = setInterval(() => {
            let card = viewnode.querySelector('[data-index="0"].videoosd-tab .itemsContainer .card .cardOverlayContainer');
            let cardImage = viewnode.querySelector('[data-index="0"].videoosd-tab .itemsContainer .card .cardImageContainer');
            if (card && card.getAttribute('data-action') === 'none') {
                card.setAttribute('data-action', 'link');
            }
            if (cardImage && cardImage.getAttribute('data-action') === 'none') {
                cardImage.setAttribute('data-action', 'link');
            }
            count++;
            if (count >= 3) {
                clearInterval(intervalId);
            }
        }, 500);
    }

    async function handleStreamInfoChange() {
        item = viewnode.controller.osdController.currentItem || viewnode.controller.currentPlayer.streamInfo.item;
        if (item.Type === 'Trailer') { 
            await getParentItem();
            updateTitle();
            //setTimeout(() => {
            //    unhidePeople();
            //}, 500);
        } else {
            parentItem = item;
            paly_mutation1?.disconnect();
            //paly_mutation2?.disconnect();   
        }
    }

    function fetchItem() {  
        setTimeout(() => {
            updateAttribute();
        }, 500);
        var itemThis = parentItem
            , items = [];
        return itemThis && (itemThis.SeriesPrimaryImageTag && (itemThis = {
            Id: itemThis.SeriesId,
            Name: itemThis.SeriesName,
            ServerId: itemThis.ServerId,
            ImageTags: {
                Primary: itemThis.SeriesPrimaryImageTag
            },
            IsFolder: !0,
            PrimaryImageAspectRatio: 2 / 3
        }),
            items.push(itemThis)),
            Promise.resolve({
                Items: items,
                TotalRecordCount: items.length
            })
    }
    /*
    function fetchPeople(query) {
        var itemThis = parentItem
            , serverId = itemThis.ServerId
            , totalRecordCount = (itemThis = (itemThis.People || []).map(function (p) {
                return (p = Object.assign({}, p)).ServerId = serverId,
                    "Person" !== p.Type && (p.PersonType = p.Type,
                        p.Type = "Person"),
                    p
            })).length;
        return query && (itemThis = itemThis.slice(query.StartIndex || 0),
            query.Limit) && itemThis.length > query.Limit && (itemThis.length = query.Limit),
            Promise.resolve({
                Items: itemThis,
                TotalRecordCount: totalRecordCount
            })
    }
    */

})();
