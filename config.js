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
      getUpdates: {
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
      getUpdate: {
        method: 'GET',
        path: '/api/member/updates/:uuid'
      },
      getSegments: {
        method: 'GET',
        path: '/api/member/segments/order'
      },
      createSegment: {
        method: 'POST',
        path: '/api/member/segments'
      },
      getDevices: {
        method: 'GET',
        path: '/api/member/segments/:segmentId/devices?size=20'
      },
      editUpdate: {
        method: 'PUT',
        path: '/api/member/updates/:uuid'
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