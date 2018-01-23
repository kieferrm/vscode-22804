

function primes(max: number): number[] {
    const sieve: boolean[] = [];
    let index = max - 1;
    while (index--) sieve[index] = true;

    for (index = 2; index < max; index++) {
        // optimization
        // if (!sieve[index]) {
        //     continue;
        // }
        let runner = 2 * index;
        while (runner < max) {
            sieve[runner] = false;
            runner += index;
        }
    }

    let result: number[] = [];
    for (index = 2; index < max; index++) {
        if (sieve[index]) {
            result.push(index);
        }
    }
    return result;
}

function factorization(n: number): number[] {
    if (n == 2) {
        return [2];
    }
    let result: number[] = [];
    // optimization
    // for (let factor = 2; factor < Math.sqrt(n); factor++) {
    for (let factor = 2; factor < n; factor++) {
        while (n % factor == 0) {
            result.push(factor);
            n = n / factor;
        }
    }
    if (n > 2) {
        result.push(n);
    }
    return result;
}

function isPrime(prime: number): boolean {
    let f = factorization(prime);
    return f.length == 1 && f[0] == prime;
}


const MAX = 500000;
export function compute(): number[] {
    let falsePrimes = [];
    let p = primes(MAX);
    for (let i = 0; i < p.length; i++) {
        if (!isPrime(p[i])) {
            falsePrimes.push(p[i]);
        }
    }
    return falsePrimes.length == 0 ? p : falsePrimes;
}


export function computeJson(): string {
    return JSON.stringify(compute());
}
