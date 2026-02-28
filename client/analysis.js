import { safeFetch, showLoader, hideLoader, showNotification } from "./utils.js";

const API_BASE = "http://127.0.0.1:8000/crypto";

let priceChart = null;
let volChart = null;

const priceEl = document.getElementById("price");
const drawdownEl = document.getElementById("drawdown");
const volDayEl = document.getElementById("vol-day");
const volWeekEl = document.getElementById("vol-week");
const volMonthEl = document.getElementById("vol-month");
const aiEl = document.getElementById("aiAnalysis");



const percentFormatter = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
});

function formatPercent(value) {
    if (value === null || value === undefined) return "—";
    return percentFormatter.format(value) + " %";
}

function formatDrawdown(value) {
    if (value === null || value === undefined) return "—";
    return percentFormatter.format(value) + " %";
}

function formatPrice(value) {
    if (value === null || value === undefined) return "—";

    if (value < 1) return parseFloat(value.toFixed(6));
    if (value < 100) return parseFloat(value.toFixed(2));
    return value.toLocaleString();
}


function setVolatility(el, value, type) {
    if (!el) return;

    el.textContent = formatPercent(value);

    if (value === null || value === undefined) return;

    let low, medium;

    switch (type) {
        case "day":
            low = 1;
            medium = 3;
            break;
        case "week":
            low = 3;
            medium = 7;
            break;
        case "month":
            low = 7;
            medium = 15;
            break;
        default:
            low = 1;
            medium = 3;
    }

    if (value < low) {
        el.style.color = "#00ff88";
    } else if (value < medium) {
        el.style.color = "#ffd166";
    } else {
        el.style.color = "#ff4d6d";
    }
}

function setDrawdown(el, value) {
    if (!el) return;

    el.textContent = formatDrawdown(value);

    if (value > -5) {
        el.style.color = "#00ff88";
    } else if (value > -15) {
        el.style.color = "#ffd166";
    } else {
        el.style.color = "#ff4d6d";
    }
}



export function initAnalysis(getExchange) {

    const btn = document.getElementById("analyze-btn");

    btn.addEventListener("click", async () => {

        const exchange = getExchange();
        const symbol = document.getElementById("symbol").value;

        if (!exchange) return showNotification("Выберите биржу");
        if (!symbol) return showNotification("Выберите монету");

        showLoader();
        let loaderInterval;

        if (aiEl) {
            loaderInterval = showWaitingState(aiEl);
            }

        const data = await safeFetch(
            `${API_BASE}/analyze?exchange=${exchange}&symbol=${symbol}`
        );

        hideLoader();
        if (!data) return;

        if (priceEl) {
            priceEl.textContent =
            data.price !== null && data.price !== undefined
                ? formatPrice(Number(data.price))
                : "—";
}


        
        console.log(data)
        setVolatility(volDayEl, data.volatility_day, "day");
        setVolatility(volWeekEl, data.volatility_week, "week");
        setVolatility(volMonthEl, data.volatility_month, "month");
        setDrawdown(drawdownEl, data.max_drawdown);

        drawCharts(data);

        if (aiEl && data.analysis_text) {
            clearInterval(loaderInterval);
            aiEl.classList.remove("loading");
            aiEl.classList.add("visible");

            typeText(aiEl, data.analysis_text, 35);
        }


        showNotification("Анализ завершён", "success");
    });
}



function drawCharts(chartData) {

    if (!chartData) return;

    const prices = chartData.chart_prices;
    const volatility = chartData.chart_volatility;

    if (!Array.isArray(prices)) return;

    const today = new Date();
    const dates = prices.map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (prices.length - 1 - i));
        return d.toLocaleDateString();
    });

    if (priceChart) priceChart.destroy();
    if (volChart) volChart.destroy();

    const priceCanvas = document.getElementById("priceChart");
    const volCanvas = document.getElementById("volChart");

    if (!priceCanvas || !volCanvas) return;


    priceChart = new Chart(priceCanvas, {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                label: "Цена (30 дней)",
                data: prices,
                borderColor: "#00f5ff",
                backgroundColor: "rgba(0,245,255,0.15)",
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });



    if (Array.isArray(volatility) && volatility.length > 0) {

        const avg = volatility.reduce((a, b) => a + b, 0) / volatility.length;

        const std = Math.sqrt(
            volatility.map(v => (v - avg) ** 2)
                      .reduce((a, b) => a + b, 0) / volatility.length
        );

        const colors = volatility.map(v =>
            v > avg + std ? "#ff3b3b" : "#f7b731"
        );

        volChart = new Chart(volCanvas, {
            type: "bar",
            data: {
                labels: dates.slice(dates.length - volatility.length),
                datasets: [{
                    label: "Дневная волатильность (%)",
                    data: volatility,
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return percentFormatter.format(value) + "%";
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return percentFormatter.format(context.raw) + "%";
                            }
                        }
                    }
                }
            }
        });
    }
}

function typeText(element, text, speed = 40) {
    element.innerHTML = "";
    element.style.opacity = 1;

    const words = text.split(" ");
    let index = 0;

    function type() {
        if (index < words.length) {
            const span = document.createElement("span");
            span.textContent = words[index] + " ";
            span.style.opacity = 0;
            span.style.transition = "opacity 0.4s ease";

            element.appendChild(span);

            setTimeout(() => {
                span.style.opacity = 1;
            }, 50);

            index++;
            setTimeout(type, speed);
        }
    }

    type();
}


function showWaitingState(element) {
    if (!element) return;

    element.classList.add("loading");
    element.innerHTML = "Ждём анализа";
    element.style.opacity = 1;

    let dots = 0;

    return setInterval(() => {
        dots = (dots + 1) % 4;
        element.innerHTML = "Ждём анализа" + ".".repeat(dots);
    }, 400);
}
