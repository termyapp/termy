module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: 'https://github.com/termyapp/termy',
        permanent: false,
      },
    ]
  },
}
