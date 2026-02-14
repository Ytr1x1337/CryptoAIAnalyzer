export function debounce(func, delay = 400) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}


export function showNotification(message, type = "error") {
    const el = document.getElementById("notification");
    if (!el) return;

    el.textContent = message;
    el.className = `notification show ${type}`;

    setTimeout(() => {
        el.classList.remove("show");
    }, 3000);
}


export function showLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "block";
}

export function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "none";
}


export async function safeFetch(url) {
    try {
        const res = await fetch(url);

        if (!res.ok) throw new Error("Server error");

        return await res.json();
    } catch (err) {
        showNotification("Ошибка подключения к серверу");
        return null;
    }
}


export function showDropdown(dropdown, list, onSelect) {
    dropdown.innerHTML = "";
    dropdown.parentElement.classList.add("open");

    if (!list.length) {
        const item = document.createElement("div");
        item.className = "dropdown-item";
        item.textContent = "Нет результатов";
        dropdown.appendChild(item);
        return;
    }

    list.slice(0, 100).forEach(entry => {
        const item = document.createElement("div");
        item.className = "dropdown-item";
        item.textContent = entry;

        item.addEventListener("mousedown", (e) => {
            e.preventDefault();
            onSelect(entry);
        });

        dropdown.appendChild(item);
    });
}

export function closeDropdown(dropdown) {
    dropdown.parentElement.classList.remove("open");
}

export function initOutsideClick(exchangeWrap, symbolWrap, exchangeDropdown, symbolDropdown) {
    document.addEventListener("mousedown", (e) => {

        if (!exchangeWrap.contains(e.target)) {
            closeDropdown(exchangeDropdown);
        }

        if (!symbolWrap.contains(e.target)) {
            closeDropdown(symbolDropdown);
        }

    });
}
