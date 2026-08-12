const piDisplay = document.getElementById("piDisplay");
const digitCount = document.getElementById("digitCount");
const status = document.getElementById("status");
const runtimeDisplay = document.getElementById("runtime");
const speedDisplay = document.getElementById("speed");

const startTime = performance.now();

status.textContent = "CALCULATING";

function integerSqrt(n) {
    if (n < 0n) {
        throw new Error("Square root of negative number");
    }

    if (n < 2n) {
        return n;
    }

    let x = 1n << BigInt(Math.ceil(n.toString(2).length / 2));

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

        const aBig = BigInt(a);

        const P =
            -(6n * aBig - 5n) *
            (2n * aBig - 1n) *
            (6n * aBig - 1n);

        const Q =
            aBig * aBig * aBig *
            C3_OVER_24;

        const T =
            P *
            (13591409n + 545140134n * aBig);

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

    const { Q, T } = binarySplit(0, terms);

    const C = 426880n * sqrt10005;

    const piScaled =
        (C * Q * scale) / T;

    let result = piScaled.toString();

    while (result.length <= precision) {
        result = "0" + result;
    }

    const decimalIndex =
        result.length - precision;

    const integerPart =
        result.slice(0, decimalIndex);

    const decimalPart =
        result.slice(decimalIndex, decimalIndex + decimalDigits);

    return integerPart + "." + decimalPart;
}

async function run() {
    const targetDigits = 1000000;

    let digitsToCalculate = 100;

    while (digitsToCalculate <= targetDigits) {
        status.textContent = "CALCULATING";

        const calculationStart = performance.now();

        const pi = calculatePi(digitsToCalculate);

        piDisplay.textContent = pi;

        const digits =
            pi.length - pi.indexOf(".") - 1;

        digitCount.textContent =
            digits.toLocaleString();

        const elapsed =
            (performance.now() - startTime) / 1000;

        runtimeDisplay.textContent =
            elapsed.toFixed(1) + "s";

        const calculationTime =
            (performance.now() - calculationStart) / 1000;

        speedDisplay.textContent =
            Math.round(
                digits / Math.max(calculationTime, 0.001)
            ).toLocaleString() + " digits/s";

        if (digitsToCalculate >= targetDigits) {
            status.textContent = "COMPLETE";
            break;
        }

        if (digitsToCalculate < 1000) {
            digitsToCalculate += 100;
        } else if (digitsToCalculate < 10000) {
            digitsToCalculate += 1000;
        } else if (digitsToCalculate < 100000) {
            digitsToCalculate += 10000;
        } else {
            digitsToCalculate += 100000;
        }

        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

run();
