/**
 * Reads an environment variable of the app, without its line breaks.
 *
 * @param {string} envVarName - Name of the variable without its `VITE_` prefix, in any case.
 * @returns {string | undefined} The value, undefined when the variable is not set.
 * @throws {TypeError} When envVarName is not a string.
 * @example
 * get('core_service'); // the value of VITE_CORE_SERVICE
 */
const get = (envVarName) => {
  if (typeof (envVarName) !== 'string') throw new TypeError('envVarName must be a string.');

  const varName = envVarName.toUpperCase();
  const varValue = import.meta.env[`VITE_${varName}`];
  const trimmedValue = varValue && varValue.replace(/(\r\n|\n|\r)/gm, '');

  return trimmedValue;
};

export {
  get
};
