/**
 * pipe - concatenate function helper
 * https://www.freecodecamp.org/news/pipe-and-compose-in-javascript-5b04004ac937/
 * https://medium.com/javascript-scene/reduce-composing-software-fe22f0c39a1d

     const fn1 = inputVal => n => n * inputVal;
     const fn2 = () => n => n + 1;
     const fn3 = inputVal => n => n - inputVal;

     const result = pipe(
         fn1(2),
         fn2(),
         fn3(2),
     )(2)

     inputVal => input value
     n => value returned fom previous function

 *
 * @param  {function} fns pipe function
 * @param  {any} x initial value
 * @returns {any} final value
 */
export const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
