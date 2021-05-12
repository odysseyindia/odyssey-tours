// `process.env` is the one defined in the webpack's DefinePlugin
const envVariables = process.env;

// Read vars from envVariables object
const {
  appHost,
  hugoRoot
} = envVariables;

/**
 * @const _getRowString
 * @description Concatenate `description` and `envVar` for creating a row text.
 * @param description 
 * @param envVar 
 * 
 * @returns {string}
 */
const _getRowString = (description, envVar) => { 
  return `<p>${description}: <strong>${envVar}</strong></p>`;
}

// Append rows to `.env-vars` class
document.querySelector('.env-vars').innerHTML = `
  ${_getRowString('App host', process.env.appHost)}
  ${_getRowString('Current root', process.env.hugoRoot)}
`;
alert('ok');
// Expose envVariables to the window object
window.envVariables = envVariables;