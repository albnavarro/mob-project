export const pipe =
    (...functions) =>
    (input) =>
        functions.reduce(
            (chain, func) => chain.then(func),
            Promise.resolve(input)
        );
