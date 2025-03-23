import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '49494878-a83b49de675fb1096ea2738a3';

let counter = 1;
let query = '';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const target = document.querySelector('.js-guard');

const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
});

const options = {
    root: null,
    rootMargin: '200px',
    threshold: 1.0,
};

const observer = new IntersectionObserver(onLoad, options);

function onLoad(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            searchImg();
        }
    });
}

form.addEventListener('submit', onFormSubmit);

function onFormSubmit(e) {
    e.preventDefault();

    query = form.elements[0].value.trim();
    if (!query) {
        return Notiflix.Notify.failure('Вибачте, поле для пошуку не може бути пустим');
    }

    counter = 1;
    clearGallery();
    fetchData()
        .then(data => {
            message(data.hits);
            createMarkup(data.hits);
            observer.observe(target);
        })
        .catch(e => Notiflix.Notify.failure(e.message));
}

function fetchData() {
    return fetch(
        `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=20&page=${counter}`
    )
        .then(resp => {
            if (!resp.ok) {
                throw new Error('Вибачте, щось пішло не так');
            }
            return resp.json();
        });
}

function searchImg() {
    fetchData()
        .then(data => {
            createMarkup(data.hits);
            stopSearch(data.hits);
            lightbox.refresh();
        })
        .catch(e => console.log(e));

    counter += 1;
}

function createMarkup(arr) {
    const markup = arr
        .map(
            ({
                webformatURL,
                largeImageURL,
                tags,
                likes,
                downloads,
                views,
                comments,
            }) => {
                return `<div class="photo-card">
                    <a class="gallery-link" href="${largeImageURL}">
                        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                    </a>
                    <div class="info">
                        <p class="info-item"><b>Likes: ${likes}</b></p>
                        <p class="info-item"><b>Views: ${views}</b></p>
                        <p class="info-item"><b>Comments: ${comments}</b></p>
                        <p class="info-item"><b>Downloads: ${downloads}</b></p>
                    </div>
                </div>`;
            }
        )
        .join('');

    gallery.insertAdjacentHTML('beforeend', markup);
}

function clearGallery() {
    gallery.innerHTML = '';
}

function message(hits) {
    if (hits.length === 0) {
        Notiflix.Notify.warning(
            'Вибачте, по результатам вашого пошуку не було знайдено зображень.'
        );
    }
}

function stopSearch(hits) {
    if (hits.length < 20) {
        observer.unobserve(target);
        Notiflix.Notify.info('Ви досягли кінця результатів.');
    }
}
