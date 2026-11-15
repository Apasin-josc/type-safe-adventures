function myBind(fn, context, ...presetArgs) {
  // La función que regresamos ignora su propio `this` y siempre usa `context`.
  return function (...laterArgs) {
    return fn.apply(context, [...presetArgs, ...laterArgs]);
  };
}

module.exports = { myBind };
