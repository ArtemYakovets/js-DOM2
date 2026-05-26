export const IMAGES_PER_PAGE = 4;

export async function fetchImagesFromApi(page) {
    const url = `https://picsum.photos/v2/list?page=${page}&limit=${IMAGES_PER_PAGE}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Помилка HTTP: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}