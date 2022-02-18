export const api = {
  getMoralCodeSummary,
  registerSheet,
  registerTheme,
  _sheets: [],
  _themes: [
    { class: 'solarized', label: 'MC.Theme.Solarized' },
    { class: 'solarized-dark', label: 'MC.Theme.SolarizedDark' },
  ],
};

/**
 * Register a sheet to the API, so that Moral Code an add itself onto the sheet
 * @param {Object} sheet - The sheet info to register
 * @param {string} sheet.sheetClass - The sheet class to look for
 * @param {string} sheet.target - The selector used to select the element that will be replaced by the moral code button
 * @param {string} sheet.class - The class(es) to apply to the button to make it look good
 * @param {boolean} [sheet.insert] - If `true`, the Moral Code button will be inserted as a standalone button instead of replacing an element
 */
function registerSheet(sheet) {
  game.modules.get('moral-code').api._sheets.push(sheet);
}

/**
 * Register a theme to the API.
 * @param {Object} theme - The theme object
 * @param {string} theme.label - The label of the theme to show in the dropdown
 * @param {string} theme.class - The CSS class of the theme.
 * @example
 * ```js
 * Hooks.on('moralCodeReady', (api) => {
 *   const myCoolTheme = {
 *     label: 'Some Cool Theme',
 *     class: 'cool-theme'
 *   };
 *   api.registerTheme(myCoolTheme);
 * });
 * ```
 *
 * To avoid CSS collisions always scope your theme under the parent class `moral-code`
 * @example
 * ```css
 *  .moral-code.cool-theme{
 *    //add CSS here
 *  }
 * ```
 */
function registerTheme(theme) {
  game.modules.get('moral-code').api._themes.push(theme);
  console.debug(`moral-code | Registered theme ${theme.label} with class ${theme.class}`);
}

/**
 * Looks at an actor and constructs the summary text for their moral code
 * @param {Actor} actor The actor to look at
 */
function getMoralCodeSummary(actor) {
  const code = actor.getFlag('moral-code', 'code');
  if (!code) return null;
  const listItems = [];
  for (const [key, value] of Object.entries(code)) {
    const leaning = getLeaning(key, value);
    const strength = getLeaningStrength(value);
    const text = game.i18n.format(strength, { action: game.i18n.localize(`MC.${leaning}.Hint`) });
    listItems.push(`<li>${game.i18n.localize(`MC.${leaning}.${leaning}`)}: ${text}</li>`);
  }
  ChatMessage.create({
    content: `<ul>${listItems.join('\n')}</ul>`,
    speaker: { actor: actor },
    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
  });
}

/**
 * Get the strength of the moral leaning based on it's value
 * @param {number} value The value of the moral
 * @returns {string} the translation key for the prefix
 */
function getLeaningStrength(value) {
  let strength = '';
  switch (value) {
    case 1:
    case 4:
      strength = 'MC.AlmostAlways';
      break;
    case 2:
    case 3:
      strength = 'MC.Usually';
      break;
    default:
      break;
  }
  return strength;
}

/**
 *  Gets the general moral leaning of an actor
 * @param {string} key
 * @param {number} value
 */
function getLeaning(key, value) {
  const leanings = key.split('-');
  let leaning = '';
  if (value.between(1, 2)) {
    leaning = leanings[0];
  } else if (value.between(3, 4)) {
    leaning = leanings[1];
  }
  return leaning.capitalize();
}
