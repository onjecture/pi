const piDisplay = document.getElementById("piDisplay");
const digitCount = document.getElementById("digitCount");
const status = document.getElementById("status");
const runtimeDisplay = document.getElementById("runtime");
const speedDisplay = document.getElementById("speed");

let calculatedDigits = "";
let totalDigits = 0;

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


function calculatePi(decimalDigits) {

    const guardDigits = 20;

    const precision = decimalDigits + guardDigits;

    const scale = 10n ** BigInt(precision);

    /*
        Chudnovsky constant:

        C = 426880 * sqrt(10005)
    */

    const sqrt10005 = integerSqrt(
        10005n * scale * scale
    );

    const C = 426880n * sqrt10005;


    /*
        Chudnovsky series
    */

    let M = 1n;
    let L = 13591409n;
    let X = 1n;
    let K = 6n;

    let S = L * scale;

    const terms = Math.ceil(precision / 14) + 1;


    for (let i = 1; i < terms; i++) {

        const iBig = BigInt(i);

        M =
            ((K * K * K) - (16n * K)) *
            M /
            (iBig * iBig * iBig);

        L += 545140134n;

        X *= -262537412640768000n;

        S += (M * L * scale) / X;

        K += 12n;
    }


    /*
        Calculate pi
    */

    const piScaled =
        (C * scale) / S;


    /*
        Convert BigInt to decimal string
    */

    let result = piScaled.toString();

    while (result.length <= precision) {
        result = "0" + result;
    }

    const integerPart =
        result.slice(0, result.length - precision);

    const decimalPart =
        result.slice(result.length - precision);


    return integerPart + "." + decimalPart;
}


async function run() {

    let digitsToCalculate = 100;

    while (true) {

        const pi = calculatePi(digitsToCalculate);

        calculatedDigits = pi;

        /*
            Everything after the decimal point
            is a calculated digit.
        */

        totalDigits =
            pi.split(".")[1].length;


        /*
            Display π
        */

        piDisplay.textContent = pi;


        /*
            Statistics
        */

        digitCount.textContent =
            totalDigits.toLocaleString();


        const elapsed =
            (performance.now() - startTime) / 1000;


        runtimeDisplay.textContent =
            elapsed.toFixed(1) + "s";


        speedDisplay.textContent =
            Math.round(totalDigits / elapsed)
                .toLocaleString()
            + " digits/s";


        /*
            Increase the requested precision.

            Chudnovsky gives roughly 14 digits
            per term, so increasing by 100
            gives us another chunk.
        */

        digitsToCalculate += 100;


        /*
            Let the browser update the page
            before starting the next calculation.
        */

        await new Promise(resolve =>
            setTimeout(resolve, 10)
        );
    }
}


run();
