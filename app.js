
        const resultDisplay = document.getElementById("result");
        const historyDisplay = document.getElementById("history");
        const buttons = document.querySelector(".buttons");
        const themeButton = document.getElementById("themeButton");

        let expression = "";
        let history = [];

        function updateDisplay() {
            resultDisplay.textContent = expression || "0";
        }

        function addValue(value) {
            if (expression.length >= 30) return;

            if (expression === "Ошибка") {
                expression = "";
            }

            if ("+-*/%".includes(value)) {
                const last = expression.slice(-1);

                if ("+-*/%".includes(last)) {
                    expression = expression.slice(0, -1);
                }

                if (!expression && value !== "-") return;

                expression += value;
            } else if (value === ".") {
                const currentNumber = expression.split(/[+\-*/%]/).pop();

                if (currentNumber.includes(".")) return;

                expression += currentNumber === "" ? "0." : ".";
            } else {
                expression += value;
            }

            updateDisplay();
        }

        function calculate() {
            if (!expression) return;

            try {
                let safeExpression = expression;

                if (/[+\-*/%.]$/.test(safeExpression)) {
                    return;
                }

                if (!/^[0-9+\-*/%.() ]+$/.test(safeExpression)) {
                    throw new Error("Недопустимое выражение");
                }

                const calculation = Function(
                    '"use strict"; return (' + safeExpression + ')'
                )();

                if (!Number.isFinite(calculation)) {
                    throw new Error("Ошибка вычисления");
                }

                const formatted = Number(
                    calculation.toPrecision(12)
                ).toString();

                historyDisplay.textContent = expression + " =";

                history.unshift(expression + " = " + formatted);
                history = history.slice(0, 10);

                localStorage.setItem(
                    "calculatorHistory",
                    JSON.stringify(history)
                );

                expression = formatted;
                updateDisplay();

            } catch (error) {
                expression = "Ошибка";
                updateDisplay();

                setTimeout(() => {
                    expression = "";
                    updateDisplay();
                }, 1200);
            }
        }

        buttons.addEventListener("click", event => {
            const button = event.target.closest("button");

            if (!button) return;

            const action = button.dataset.action;
            const value = button.dataset.value;

            if (action === "clear") {
                expression = "";
                historyDisplay.textContent = "";
                updateDisplay();
            } else if (action === "delete") {
                expression = expression.slice(0, -1);
                updateDisplay();
            } else if (action === "calculate") {
                calculate();
            } else if (value !== undefined) {
                addValue(value);
            }
        });

        document.addEventListener("keydown", event => {
            const key = event.key;

            if (/^[0-9.+\-*/%]$/.test(key)) {
                addValue(key);
            } else if (key === "Enter" || key === "=") {
                event.preventDefault();
                calculate();
            } else if (key === "Backspace") {
                expression = expression.slice(0, -1);
                updateDisplay();
            } else if (key === "Escape") {
                expression = "";
                historyDisplay.textContent = "";
                updateDisplay();
            }
        });

        themeButton.addEventListener("click", () => {
            document.body.classList.toggle("light");

            themeButton.textContent =
                document.body.classList.contains("light")
                    ? "☀️ Светлая тема"
                    : "🌙 Тёмная тема";
        });

        try {
            history = JSON.parse(
                localStorage.getItem("calculatorHistory")
            ) || [];
        } catch {
            history = [];
        }

        updateDisplay();
