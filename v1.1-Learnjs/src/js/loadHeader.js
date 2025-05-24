function loadHeader() {
    fetch('../../public/components/header.html')
    .then(response => {
        if (!response.ok) throw new Error("Header not found");
        return response.text();
    })
    .then(data => {
        document.body.insertAdjacentHTML('afterbegin', data);
    })
    .catch(error => {
        console.error("Error loading header: ", error);
    })
}

document.addEventListener('DOMContentLoaded', loadHeader);