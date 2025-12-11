
const IMAGES_PER_PAGE = 4;
let currentPage = 1;
let currentImageIds = new Set(); 
let isFetching = false; 

const gallery = document.getElementById('gallery');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const clearGalleryBtn = document.getElementById('clearGalleryBtn');
const removeLastBtn = document.getElementById('removeLastBtn');
const reverseGalleryBtn = document.getElementById('reverseGalleryBtn');
const statusMessage = document.getElementById('statusMessage');
const emptyState = document.getElementById('emptyState');
const loader = document.getElementById('loader'); 


function updateStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle('error', isError);
}

function toggleLoader(show) {
    loader.style.display = show ? 'block' : 'none';
    gallery.style.opacity = show ? '0.5' : '1'; 
}

function updateGalleryState() {
    const cardCount = gallery.children.length;
    
    emptyState.style.display = cardCount === 0 ? 'block' : 'none';

    const hasImages = cardCount > 0;
    removeLastBtn.disabled = !hasImages;
    reverseGalleryBtn.disabled = cardCount < 2;

    if (cardCount > 0) {
        if (!isFetching) { 
            updateStatus(`Загальна кількість картинок: ${cardCount}`);
        }
    } else {
        updateStatus('Галерея очікує на завантаження картинок.');
    }
}


function handleLikeClick(event) {
    const button = event.currentTarget;
    button.classList.toggle('liked');

    const card = button.closest('.image-card');
    const author = card.querySelector('.author-link strong').textContent;
    const isLiked = button.classList.contains('liked');

    updateStatus(isLiked ? `❤️ Сподобалось фото від ${author}!` : `💔 Лайк скасовано.`, false);
}


function createImageCard(image) {
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


function renderImages(images) {
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

        updateStatus(`Успішно додано ${addedCount} нових картинок.`);
    }
    
    updateGalleryState();
}


async function fetchImages(page) {
    if (isFetching) return;
    isFetching = true;
    loadMoreBtn.disabled = true;
    toggleLoader(true); 

    const url = `https://picsum.photos/v2/list?page=${page}&limit=${IMAGES_PER_PAGE}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Помилка HTTP: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        
        const uniqueImages = data.filter(img => !currentImageIds.has(img.id));

        if (uniqueImages.length > 0) {
            renderImages(uniqueImages);
            currentPage++; 
        } else if (data.length > 0) {
            updateStatus('Знайдені картинки вже є в галереї. Спробую завантажити наступну сторінку...', false);
            currentPage++;
            await fetchImages(currentPage);
        } else {
            updateStatus('Більше унікальних картинок для завантаження немає.', true);
        }

    } catch (error) {
        updateStatus(`❌ Помилка завантаження: ${error.message}`, true);
        console.error('Fetch error:', error);
    } finally {
        isFetching = false;
        loadMoreBtn.disabled = false;
        toggleLoader(false); 
        updateGalleryState(); 
    }
}

function handleLoadMore() {
    fetchImages(currentPage);
}

function handleClearGallery() {
    if (gallery.children.length === 0) {
        updateStatus('Галерея вже порожня.', false);
        return;
    }
    
    gallery.innerHTML = '';
    currentImageIds.clear();
    currentPage = 1; 
    
    updateStatus('✅ Галерея повністю очищена.', false);
    updateGalleryState();
}

function handleRemoveLast() {
    const cards = gallery.querySelectorAll('.image-card');
    if (cards.length > 0) {
        const lastCard = cards[cards.length - 1];
        const lastId = lastCard.dataset.id;
        
        lastCard.remove();
        currentImageIds.delete(lastId); 
        
        updateStatus('🗑️ Остання картинка видалена.', false);
        updateGalleryState();
    }
}

function handleReverseGallery() {
    const cards = Array.from(gallery.querySelectorAll('.image-card'));
    if (cards.length < 2) {
        updateStatus('Потрібно щонайменше 2 картинки для перевороту.', false);
        return;
    }

    cards.reverse();

    gallery.innerHTML = '';

    cards.forEach(card => gallery.appendChild(card));
    
    gallery.querySelectorAll('.like-button').forEach(button => {
        button.onclick = handleLikeClick; 
    });
    
    updateStatus('🔄 Галерея перевернута.', false);
    updateGalleryState();
}


function initializeGallery() {
    loadMoreBtn.addEventListener('click', handleLoadMore);
    clearGalleryBtn.addEventListener('click', handleClearGallery);
    removeLastBtn.addEventListener('click', handleRemoveLast);
    reverseGalleryBtn.addEventListener('click', handleReverseGallery);

    fetchImages(currentPage);
}

document.addEventListener('DOMContentLoaded', initializeGallery);