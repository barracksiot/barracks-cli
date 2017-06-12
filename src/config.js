const path = require('path');

module.exports = {
  barracks: {
    baseUrl: process.env.BARRACKS_BASE_URL || 'https://app.barracks.io',
    messaging: {
      mqtt: {
        endpoint: process.env.BARRACKS_MQTT_ENDPOINT || 'mqtt://mqtt.barracks.io'
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
