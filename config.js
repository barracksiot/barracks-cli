const path = require('path');

module.exports = {

  barracks: {
    baseUrl: process.env.BARRACKS_BASE_URL || 'https://app.barracks.io',
    endpoints: {
      login: {
        method: 'POST',
        path: '/api/auth/login'
      },
      me: {
        method: 'GET',
        path: '/api/auth/me'
      },
      updates: {
        method: 'GET',
        path: '/api/member/updates?size=20'
      },
      publishUpdate: {
        method: 'PUT',
        path: '/api/member/updates/:uuid/status/published'
      },
      archiveUpdate: {
        method: 'PUT',
        path: '/api/member/updates/:uuid/status/archived'
      },
      createPackage: {
        method: 'POST',
        path: '/api/member/packages'
      },
      createUpdate: {
        method: 'POST',
        path: '/api/member/updates'
      },
      getChannels: {
        method: 'GET',
        path: '/api/member/channels'
      }
    }
  },

  userConfig: {
    folder: path.join(
      process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.barracks'
    )
  }

};