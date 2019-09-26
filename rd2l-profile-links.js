const Plugin = require('../plugin');
const https = require('https');

module.exports = new Plugin({
  name: 'RD2L profile links',
  author: 'TinT#9384',
  description: 'Links to users accounts.',
  color: '#00ddff',

  load: async function() {
    let userPopoutModule = findModule('userPopout');
    let activityNameModule = findModule('activityName');
    let anchorModule = findModule('anchorUnderlineOnHover');
    let popoutsModule = findModule('popouts');
    let layerContainerModule = findModule('layerContainer');

    // Get the links information
    let userInformation;
    https.get('https://raw.githubusercontent.com/tristan-gill/RD2L-ED-plugin/master/usernames.json', (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        userInformation = JSON.parse(data);
        this.log(userInformation);
      });
    });

    // The two places that user profile popouts can be opened from
    let popout = document.querySelector('.'+popoutsModule.popouts);
    let layerContainer = document.querySelector('.'+layerContainerModule.layerContainer);

    let observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.addedNodes.length)) {
        const profilePopout = document.querySelector('.'+userPopoutModule.userPopout);
        if (!profilePopout) return;

        const userTagElement = profilePopout.querySelector('.'+(userPopoutModule.headerTag || 'bite_my_shiny_metal_ass').split(' ').join('.'));
        if (!userTagElement) return;

        const userTagUnformatted = userTagElement.textContent;

        // Dont need to add the links if they are already there
        const existingLinks = profilePopout.querySelector('.rd2l-links');

        // spaces be damned
        const userDiscord = userTagUnformatted.replace(/\s/g, '');
        const userInfo = userInformation.find((info) => {
          return info.d === userDiscord;
        });

        if (userInfo && !existingLinks) {
          const parent = profilePopout.querySelector(`.${userPopoutModule.headerTop}`);

          let linksElement = document.createElement('div');
          linksElement.className = 'rd2l-links';
          parent.appendChild(linksElement);

          const classNames = `${activityNameModule.activityName} ${anchorModule.anchorUnderlineOnHover} ${anchorModule.anchor}`;

          linksElement.innerHTML = `
            <a tabindex='0' class='${classNames}' href='${userInfo.s}' target='_blank' role='button'>
              steam
            </a>
            &bull;
            <a tabindex='0' class='${classNames}' href='${userInfo.r}' target='_blank' role='button'>
              rd2l
            </a>
            &bull;
            <a tabindex='0' class='${classNames}' href='${userInfo.b}' target='_blank' role='button'>
              dotabuff
            </a>
          `;
        }
      }
    });

    observer.observe(popout, { childList: true });
    observer.observe(layerContainer, { childList: true });
    this._observer = observer;
  },

  unload: function() {
    this._observer.disconnect();
  }
});
