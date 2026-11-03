const galleryGrid = document.getElementById('galleryGrid');
const pagination = document.getElementById('galleryPagination');
const imagesPerPage = 20;

const images = [];
const totalImages = 18; // 👈 меняешь это число, если добавляешь новые фото

for (let i = 1; i <= totalImages; i++) {
    images.push(`images/gallery/${i}.jpg`);
}

let currentPage = 1;
const totalPages = Math.ceil(images.length / imagesPerPage);

function renderGallery(page) {
    galleryGrid.innerHTML = '';

    const start = (page - 1) * imagesPerPage;
    const end = start + imagesPerPage;
    const pageImages = images.slice(start, end);

    pageImages.forEach((src, index) => {
        const div = document.createElement('div');
        div.classList.add('gallery-item');

        const img = document.createElement('img');
        img.src = src;

        img.addEventListener('click', () => {
            openLightbox(start + index);
        });

        div.appendChild(img);
        galleryGrid.appendChild(div);
    });
}

function renderPagination() {
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    const createButton = (label, page, isActive = false) => {
        const btn = document.createElement('div');
        btn.className = 'gallery-page';
        btn.textContent = label;

        if (isActive) btn.classList.add('active');

        btn.onclick = () => {
            currentPage = page;
            updateGallery();
        };

        return btn;
    };

    const createDots = () => {
        const dots = document.createElement('div');
        dots.className = 'gallery-page';
        dots.textContent = '...';
        dots.style.cursor = 'default';
        dots.style.border = 'none';
        return dots;
    };

    // Prev arrow
    const prev = document.createElement('div');
    prev.className = 'gallery-arrow';
    prev.innerHTML = '&#10094;';
    prev.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            updateGallery();
        }
    };
    pagination.appendChild(prev);

    const range = 1;

    // Первая страница
    if (currentPage > range + 1) {
        pagination.appendChild(createButton(1, 1));
        pagination.appendChild(createDots());
    }

    // Текущий диапазон
    for (let i = currentPage - range; i <= currentPage + range; i++) {
        if (i > 0 && i <= totalPages) {
            pagination.appendChild(createButton(i, i, i === currentPage));
        }
    }

    // Последняя страница
    if (currentPage < totalPages - range) {
        pagination.appendChild(createDots());
        pagination.appendChild(createButton(totalPages, totalPages));
    }

    // Next arrow
    const next = document.createElement('div');
    next.className = 'gallery-arrow';
    next.innerHTML = '&#10095;';
    next.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateGallery();
        }
    };
    pagination.appendChild(next);
}

function updateGallery() {
    renderGallery(currentPage);
    renderPagination();

    // плавный скролл к галерее
    document.querySelector('.media-gallery').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

updateGallery();

/* ===== LIGHTBOX ===== */

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.querySelector('.lightbox-img');
const closeBtn = document.querySelector('.lightbox-close');
const nextBtn = document.querySelector('.lightbox-next');
const prevBtn = document.querySelector('.lightbox-prev');

let currentIndex = 0;

function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = images[index];
    lightbox.classList.add('active');
}

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % images.length;
    lightboxImg.src = images[currentIndex];
});

prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImg.src = images[currentIndex];
});

closeBtn.addEventListener('click', () => {
    lightbox.classList.remove('active');
});

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.classList.remove('active');
    }
});

document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'ArrowRight') nextBtn.click();
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'Escape') lightbox.classList.remove('active');
});

/* ===== SWIPE FOR MOBILE ===== */

let touchStartX = 0;
let touchEndX = 0;

function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;

    // минимальная дистанция свайпа
    if (Math.abs(swipeDistance) < 50) return;

    if (swipeDistance < 0) {
        // свайп влево → следующее фото
        currentIndex = (currentIndex + 1) % images.length;
    } else {
        // свайп вправо → предыдущее фото
        currentIndex = (currentIndex - 1 + images.length) % images.length;
    }

    lightboxImg.src = images[currentIndex];
}

lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});