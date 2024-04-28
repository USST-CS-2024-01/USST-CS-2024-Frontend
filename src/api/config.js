const ENVIRONMENT = process.env.NODE_ENV || 'development';

const config = {
    development: {
        API_URL: 'http://192.168.19.2:9999/api/v1',
    },
    production: {
        API_URL: 'http://192.168.19.2:9999/api/v1',
    },
}

export default config[ENVIRONMENT];