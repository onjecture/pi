const piDisplay = document.getElementById("piDisplay");
const digitCount = document.getElementById("digitCount");
const status = document.getElementById("status");
const runtimeDisplay = document.getElementById("runtime");
const speedDisplay = document.getElementById("speed");

let digits = "";
let totalDigits = 0;

const startTime = performance.now();

status.textContent = "CALCULATING";


// Chudnovsky algorithm
function calculatePi(digitsToCalculate) {

    const C = 426880 * Math.sqrt(10005);

    let M = 1n;
    let L = 13591409n;
    let X = 1n;
    let K = 6n;
    let S = L;

    const terms = Math.ceil(digitsToCalculate / 14);

    for (let i = 1; i < terms; i++) {

        const iBig = BigInt(i);

        M =
            (K * K * K - 16n * K) *
            M /
            (iBig * iBig * iBig);

        L += 545140134n;

        X *= -262537412640768000n;

        S += (M * L * 1000000000000000000n) / X;

        K += 12n;
    }

    const scale = 10n ** BigInt(digitsToCalculate);

    const sqrt10005 = BigInt(
        Math.floor(Math.sqrt(10005) * 1e15)
    );

    const Cscaled =
        426880n *
        sqrt10005;

    const pi =
        (Cscaled * scale * 1000n) /
        (S * 1000000000000000n);

    return pi.toString();
}


// Calculate in chunks so the browser can update the interface
async function run() {

    let calculated = "";

    while (true) {

        const chunk = 100;

        const result = calculatePi(
            calculated.length + chunk
        );

        calculated = result;

        digits = calculated;

        totalDigits = digits.length - 1;

        piDisplay.textContent =
            digits[0] + "." + digits.slice(1);

        digitCount.textContent =
            totalDigits.toLocaleString();

        const elapsed =
            (performance.now() - startTime) / 1000;

        runtimeDisplay.textContent =
            elapsed.toFixed(1) + "s";

        speedDisplay.textContent =
            Math.round(totalDigits / elapsed).toLocaleString()
            + " digits/s";

        await new Promise(resolve =>
            setTimeout(resolve, 10)
        );
    }
}

run();
