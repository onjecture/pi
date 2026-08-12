```javascript
const piDisplay = document.getElementById("piDisplay");
const digitCount = document.getElementById("digitCount");
const status = document.getElementById("status");
const runtimeDisplay = document.getElementById("runtime");
const speedDisplay = document.getElementById("speed");

const startTime = performance.now();

const MAX_DIGITS = 1000000;
const DISPLAY_LIMIT = 5000;

let calculatedPi = "";
let displayedDigits = 0;
let calculatedDigits = 0;

status.textContent = "CALCULATING";

function integerSqrt(n) {
    if (n < 0n) {
        throw new Error("Square root of negative number");
    }

    if (n < 2n) {
        return n;
    }

    let x = 1n << BigInt(
        Math.ceil(n.toString(2).length / 2)
    );

    while (true) {
        const y = (x + n / x) >> 1n;

        if (y >= x) {
            return x;
        }

        x = y;
    }
}

const C3_OVER_24 = 10939058860032000n;

function binarySplit(a, b) {
    if (b - a === 1) {
        if (a === 0) {
            return {
                P: 1n,
                Q: 1n,
                T: 13591409n
            };
        }

        const n = BigInt(a);

        const P =
            -(6n * n - 5n) *
            (2n * n - 1n) *
            (6n * n - 1n);

        const Q =
            n * n * n * C3_OVER_24;

        const T =
            P * (13591409n + 545140134n * n);

        return { P, Q, T };
    }

    const mid = Math.floor((a + b) / 2);

    const left = binarySplit(a, mid);
    const right = binarySplit(mid, b);

    return {
        P: left.P * right.P,
        Q: left.Q * right.Q,
        T: left.T * right.Q + left.P * right.T
    };
}

function calculatePi(decimalDigits) {
    const guardDigits = 20;
    const precision = decimalDigits + guardDigits;

    const scale = 10n ** BigInt(precision);

    const sqrt10005 = integerSqrt(
        10005n * scale * scale
    );

    const terms = Math.ceil(precision / 14) + 1;

    const result = binarySplit(0, terms);

    const C = 426880n * sqrt10005;

    const piScaled =
        (C * result.Q * scale) / result.T;

    let value = piScaled.toString();

    while (value.length <= precision) {
        value = "0" + value;
    }

    const decimalIndex =
        value.length - precision;

    const integerPart =
        value.slice(0, decimalIndex);

    const decimalPart =
        value.slice(
            decimalIndex,
            decimalIndex + decimalDigits
        );

    return integerPart + "." + decimalPart;
}

function updateStats() {
    const elapsed =
        (performance.now() - startTime) / 1000;

    digitCount.textContent =
        calculatedDigits.toLocaleString();

    runtimeDisplay.textContent =
        elapsed.toFixed(1) + "s";

    if (elapsed > 0) {
        speedDisplay.textContent =
            Math.round(
                calculatedDigits / elapsed
            ).toLocaleString() + " digits/s";
    }
}

async function renderPiSlowly() {
    while (displayedDigits < calculatedDigits) {

        const target =
            Math.min(
                displayedDigits + 50,
                calculatedDigits,
                DISPLAY_LIMIT
            );

        if (calculatedPi.length > 0) {
            piDisplay.textContent =
                calculatedPi.slice(
                    0,
                    target + 2
                );
        }

        displayedDigits = target;

        await new Promise(resolve =>
            setTimeout(resolve, 50)
        );
    }
}

async function run() {
    let target = 100;

    while (target <= MAX_DIGITS) {

        status.textContent = "CALCULATING";

        const calculation = calculatePi(target);

        calculatedPi = calculation;

        calculatedDigits =
            calculation.length -
            calculation.indexOf(".") -
            1;

        updateStats();

        renderPiSlowly();

        if (target >= MAX_DIGITS) {
            status.textContent = "COMPLETE";
            break;
        }

        if (target < 1000) {
            target += 100;
        } else if (target < 10000) {
            target += 500;
        } else if (target < 100000) {
            target += 5000;
        } else {
            target += 25000;
        }

        await new Promise(resolve =>
            setTimeout(resolve, 20)
        );
    }
}

run();
```
