import { Resend } from 'resend'

let resendClient: Resend | null = null

export function getResendClient(): Resend {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY manquant.')
    }
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

export const EMAIL_FROM = 'Campus Market <onboarding@resend.dev>'
export const EMAIL_REPLY_TO = 'support@campusmarket.bj'