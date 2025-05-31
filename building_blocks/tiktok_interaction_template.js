function simulateGift() {
    const randomNumber = Math.floor(Math.random() * 1000);
    const user = {
        username: 'user' + randomNumber,
        photoUrl: 'https://picsum.photos/40?' + Math.random(),
        gift_name: 'rose'
    };
    handleSimulatedGift(user);
}

function simulateComment() {
    const randomNumber = Math.floor(Math.random() * 1000);
    const randomComment = Math.floor(Math.random() * 10);
    const comments = [
        'This is a comment',
        'This is another comment',
        'This is a third comment',
        'This is a fourth comment',
        'This is a fifth comment',
        'This is a sixth comment',
        'This is a seventh comment',
        'This is a eighth comment',
        'This is a ninth comment',
        'This is a tenth comment'
    ];
    const user = {
        username: 'user' + randomNumber,
        photoUrl: 'https://picsum.photos/40?' + Math.random(),
        comment: comments[randomComment]
    };
    handleSimulatedComment(user);
}

window.addEventListener('handleRealGiftEvent', function(event) {
    const user = {
        username: event.detail.username,
        photoUrl: event.detail.photoUrl,
        gift_name: event.detail.gift_name,
        comment: ''
    };
    handleRealGift(user);
});

window.addEventListener('handleRealCommmentEvent', function(event) {
    const user = {
        username: event.detail.username,
        photoUrl: event.detail.photoUrl,
        gift_name: '',
        comment: event.detail.comment
    };
    handleRealComment(user);
});


function handleSimulatedGift(user) {
    console.log('Simulated gift received from:', user.username);
}

function handleRealGift(user) {
    console.log('Real gift received from:', user.username);
}

function handleSimulatedComment(user) {
    console.log('Simulated comment received from:', user.username);
}

function handleRealComment(user) {
    console.log('Real comment received from:', user.username);
}
