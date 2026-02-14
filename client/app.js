import {
    debounce,
    safeFetch,
    showDropdown,
    closeDropdown,
    initOutsideClick,
    showNotification
} from "./utils.js";

import { initAnalysis } from "./analysis.js";

document.addEventListener("DOMContentLoaded", () => {

    const API_BASE = "http://127.0.0.1:8000/crypto";

    const exchangeInput = document.getElementById("exchange");
    const exchangeDropdown = document.getElementById("exchange-dropdown");

    const symbolInput = document.getElementById("symbol");
    const symbolDropdown = document.getElementById("symbol-dropdown");

    let selectedExchange = null;

    async function loadExchanges(value = "") {

        const exchanges = await safeFetch(`${API_BASE}/exchanges`);
        if (!exchanges) return;

        const filtered = exchanges.filter(ex =>
            ex.toLowerCase().includes(value.toLowerCase())
        );

        showDropdown(exchangeDropdown, filtered, (exchange) => {
            exchangeInput.value = exchange;
            selectedExchange = exchange;
            symbolInput.value = "";
            symbolInput.disabled = false;
            closeDropdown(exchangeDropdown);
        });
    }

    exchangeInput.addEventListener("focus", () => loadExchanges());

    exchangeInput.addEventListener("input",
        debounce((e) => loadExchanges(e.target.value))
    );

    async function loadSymbols(value = "") {

        if (!selectedExchange) {
            showNotification("Сначала выберите биржу");
            return;
        }

        const symbols = await safeFetch(
            `${API_BASE}/markets?exchange=${selectedExchange}`
        );

        if (!symbols) return;

        const filtered = symbols.filter(sym =>
            sym.toLowerCase().includes(value.toLowerCase())
        );

        showDropdown(symbolDropdown, filtered, (symbol) => {
            symbolInput.value = symbol;
            closeDropdown(symbolDropdown);
        });
    }

    symbolInput.addEventListener("focus", () => loadSymbols());

    symbolInput.addEventListener("input",
        debounce((e) => loadSymbols(e.target.value))
    );


    initOutsideClick(
        exchangeInput.parentElement,
        symbolInput.parentElement,
        exchangeDropdown,
        symbolDropdown
    );

    initAnalysis(() => selectedExchange);
});
