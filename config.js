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
      updatesBySegmentId: {
        method: 'GET',
        path: '/api/member/segments/:segmentId/updates'
      },
      publishUpdate: {
        method: 'PUT',
        path: '/api/member/updates/:uuid/status/published'
      },
      archiveUpdate: {
        method: 'PUT',
        path: '/api/member/updates/:uuid/status/archived'
      },
      scheduleUpdate: {
        method: 'PUT',
        path: '/api/member/updates/:uuid/status/scheduled?time=:time'
      },
      createPackage: {
        method: 'POST',
        path: '/api/member/packages'
      },
      createUpdate: {
        method: 'POST',
        path: '/api/member/updates'
      },
      getSegments: {
        method: 'GET',
        path: '/api/member/segments/order'
      },
      getDevices: {
        method: 'GET',
        path: '/api/member/segments/:segmentId/devices?size=20'
      },
      getDeviceEvents: {
        method: 'GET',
        path: '/api/member/devices/:unitId/events?size=20&sort=receptionDate,DESC'
      },
      setActiveSegments: {
        method: 'POST',
        path: '/api/member/segments/order'
      }
    }
  },
  userConfig: {
    folder: path.join(
      process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.barracks'
    )
  },
  debug: process.env.DEBUG || false
};