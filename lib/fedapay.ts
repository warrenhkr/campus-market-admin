const SANDBOX_API_URL = 'https://sandbox-api.fedapay.com/v1'
const LIVE_API_URL = 'https://api.fedapay.com/v1'

function isLiveMode() {
  const mode = (process.env.FEDAPAY_ENV ?? 'sandbox').toLowerCase()
  return mode === 'live' || mode === 'production'
}

export function getFedaPayPayoutConfig() {
  return {
    apiUrl: isLiveMode() ? LIVE_API_URL : SANDBOX_API_URL,
    secretKey: isLiveMode()
      ? process.env.FEDAPAY_LIVE_SECRET_KEY ?? process.env.FEDAPAY_SECRET_KEY
      : process.env.FEDAPAY_SECRET_KEY,
  }
}