/**
 * Get environement variable and remove all unnecessary
 * character like space, new line, etc
 * @param {string} envVarName environement variable
 */
const get = (envVarName) => {
  if (typeof (envVarName) !== 'string') throw new TypeError('envVarName must be a string.');

  const varName = envVarName.toUpperCase();
  const varValue = process.env[`REACT_APP_${varName}`];
  const trimedValue = varValue && varValue.replace(/(\r\n|\n|\r)/gm, '');

  return trimedValue;
};

export {
  get
};
