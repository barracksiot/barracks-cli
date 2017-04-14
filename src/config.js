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
      createFilterV1: {
        method: 'POST',
        path: '/api/member/filters'
      },
      createFilterV2: {
        method: 'POST',
        path: '/v2/api/member/filters'
      },
      getFiltersV1: {
        method: 'GET',
        path: '/api/member/filters?size=20'
      },
      getFiltersV2: {
        method: 'GET',
        path: '/v2/api/member/filters?size=20'
      },
      deleteFilterV1: {
        method: 'DELETE',
        path: '/api/member/filters/:filter'
      },
      deleteFilterV2: {
        method: 'DELETE',
        path: '/v2/api/member/filters/:filter'
      },
      editSegment: {
        method: 'PUT',
        path: '/api/member/segments/:id'
      },
      getSegment: {
        method: 'GET',
        path: '/api/member/segments/:id'
      },
      getSegmentDevices: {
        method: 'GET',
        path: '/api/member/segments/:segmentId/devices'
      },
      getDevicesV1: {
        method: 'GET',
        path: '/api/member/devices?size=20'
      },
      getDevicesV2: {
        method: 'GET',
        path: '/v2/api/member/devices?size=20'
      },
      getDevice: {
        method: 'GET',
        path: '/v2/api/member/devices/:unitId'
      },
      getDevicesWithQueryV1: {
        method: 'GET',
        path: '/api/member/devices?size=20&query=:query'
      },
      getDevicesWithQueryV2: {
        method: 'GET',
        path: '/v2/api/member/devices?size=20&query=:query'
      },
      getDeviceEventsV1: {
        method: 'GET',
        path: '/api/member/devices/:unitId/events?size=20&sort=receptionDate,DESC'
      },
      getDeviceEventsV2: {
        method: 'GET',
        path: '/v2/api/member/devices/:unitId/events?size=20&sort=receptionDate,DESC'
      },
      editUpdate: {
        method: 'PUT',
        path: '/api/member/updates/:uuid'
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
        path: '/v2/api/member/components'
      },
      createVersion: {
        method: 'POST',
        path: '/v2/api/member/components/:componentRef/versions'
      },
      createDeploymentPlan: {
        method: 'POST',
        path: '/v2/api/member/components/:componentRef/deployment-plan'
      },
      getComponents: {
        method: 'GET',
        path: '/v2/api/member/components'
      },
      getComponentVersions: {
        method: 'GET',
        path: '/v2/api/member/components/:componentRef/versions'
      },
      getDeploymentPlan: {
        method: 'GET',
        path: '/v2/api/member/components/:componentRef/deployment-plan'
      },
      getPackage: {
        method: 'GET',
        path: '/v2/api/member/components/:componentRef'
      }
    }
  },
  userConfig: {
    folder: path.join(
      process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.barracks'
    )
  },
  debug: !!(process.env.DEBUG ? parseInt(process.env.DEBUG) : false),
  experimental: !!(process.env.BARRACKS_ENABLE_EXPERIMENTAL ? parseInt(process.env.BARRACKS_ENABLE_EXPERIMENTAL) : false),
  v2Enabled: !!(process.env.BARRACKS_ENABLE_V2 ? parseInt(process.env.BARRACKS_ENABLE_V2) : false)
};
