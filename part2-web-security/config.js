const requested = (process.argv[2] || process.env.APP_MODE || 'vulnerable').toLowerCase();
const mode = requested === 'safe' ? 'safe' : 'vulnerable';

module.exports = {
  mode,
  isSafe: mode === 'safe',
  port: Number(process.env.PORT) || 3000,
};
