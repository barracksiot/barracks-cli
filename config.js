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
      setGoogleAnalyticsTrackingId: {
        method: 'PUT',
        path: '/api/auth/me/gaTrackingId'
      },
      getUpdates: {
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
      createFilter: {
        method: 'POST',
        path: '/api/member/filters'
      },
      editSegment: {
        method: 'PUT',
        path: '/api/member/segments/:id'
      },
      getSegment: {
        method: 'GET',
        path: '/api/member/segments/:id'
      },
      getFilters: {
        method: 'GET',
        path: '/api/member/filters/'
      },
      getSegmentDevices: {
        method: 'GET',
        path: '/api/member/segments/:segmentId/devices'
      },
      getFilters: {
        method: 'GET',
        path: '/api/member/filters?size=20'
      },
      getDevices: {
        method: 'GET',
        path: '/api/member/devices?size=20'
      },
      getDevicesWithQuery: {
        method: 'GET',
        path: '/api/member/devices?size=20&query=:query'
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
      },
      createToken: {
        method: 'POST',
        path: '/api/auth/tokens'
      },
      getTokens: {
        method: 'GET',
        path: '/api/auth/tokens'
      },
      revokeToken: {
        method: 'PUT',
        path: '/api/auth/tokens/:token/revoke'
      },
      createComponent: {
        method: 'POST',
        path: '/api/member/components'
      },
      createVersion: {
        method: 'POST',
        path: '/api/member/components/:componentRef/versions'
      },
      getComponents: {
        method: 'GET',
        path: '/api/member/components'
      },
      getComponentVersions: {
        method: 'GET',
        path: '/api/member/components/:componentRef/versions'
      }
    }
  },
  userConfig: {
    folder: path.join(
      process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.barracks'
    )
  },
  debug: !!(process.env.DEBUG ? parseInt(process.env.DEBUG) : false),
  experimental: !!(process.env.BARRACKS_ENABLE_EXPERIMENTAL ? parseInt(process.env.BARRACKS_ENABLE_EXPERIMENTAL) : false)
};
