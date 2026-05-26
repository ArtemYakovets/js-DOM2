export function createImageCard(image) {
    const imageUrl = `https://picsum.photos/id/${image.id}/400/300`;

    return `
        <div class="image-card" data-id="${image.id}">
            <img src="${imageUrl}" alt="Зображення від ${image.author}" loading="lazy">
            <div class="image-info">
                <div class="author-link">
                    <strong>${image.author}</strong>
                    <a href="${image.url}" target="_blank" rel="noopener noreferrer">Переглянути оригінал</a>
                </div>
                <button class="like-button" data-action="like">&#x2764;</button>
            </div>
        </div>
    `;
}

export function renderImages(images, gallery, currentImageIds, handleLikeClick) {
    let htmlContent = '';
    let addedCount = 0;

    images.forEach(image => {
        if (!currentImageIds.has(image.id)) {
            htmlContent += createImageCard(image);
            currentImageIds.add(image.id);
            addedCount++;
        }
    });

    if (addedCount > 0) {
        gallery.insertAdjacentHTML('beforeend', htmlContent);

        gallery.querySelectorAll('.like-button').forEach(button => {
            button.onclick = handleLikeClick;
        });
    }

    return addedCount;
}

export function reverseGalleryCards(gallery, handleLikeClick) {
    const cards = Array.from(gallery.querySelectorAll('.image-card'));

    cards.reverse();
    gallery.innerHTML = '';

    cards.forEach(card => gallery.appendChild(card));

    gallery.querySelectorAll('.like-button').forEach(button => {
        button.onclick = handleLikeClick;
    });
}