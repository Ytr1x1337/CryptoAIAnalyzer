import os
from dotenv import load_dotenv
from mistralai import Mistral

load_dotenv()

class AIService:

    @staticmethod
    def generate_analysis(data: dict) -> str:
        try:
            prompt = f"""
                Ты финансовый аналитик крипторынка.

                Правила:
                - Не повторяй числовые данные из входных параметров.
                - Не используй цифры и проценты.
                - Пиши только словесный анализ.
                - Текст должен быть связным, четким и понятным.
                - Без кавычек.
                - Без списков.
                - Без повторов.
                - Без технических данных.
                - Только качественная оценка состояния актива и возможных сценариев.
                - Средняя волатильность для дня=2%, недели=4%, месяца=7%.
                Сделай краткий профессиональный анализ криптовалюты на основе данных:

                Цена: {data.get("price")}
                Дневная волатильность: {data.get("volatility_day")}%
                Недельная волатильность: {data.get("volatility_week")}%
                Месячная волатильность: {data.get("volatility_month")}%
                Максимальная просадка: {data.get("max_drawdown")}%
                Цены за последние 30 дней: {data.get("chart_prices")}%

                Ответ дай кратко и профессионально. Не более 4 предложений.
                """

            with Mistral(
                api_key=os.getenv("API_KEY", "")
            ) as mistral:

                res = mistral.chat.complete(
                    model="mistral-large-latest",
                    messages=[
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    stream=False,
                    response_format={"type": "text"},
                    temperature=0
                )

            return str(res.choices[0].message.content)


        except Exception as e:
            print("AI ERROR:", e)
            return "AI-анализ временно недоступен."

