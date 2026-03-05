/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Volt login link ⚡</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>⚡ Volt</Text>
        <Heading style={h1}>Your login link</Heading>
        <Text style={text}>
          Tap the button below to log in to your Volt account. This link expires shortly, so use it while it's hot! 🔥
        </Text>
        <Button style={button} href={confirmationUrl}>
          Log In to Volt ⚡
        </Button>
        <Text style={footer}>
          If you didn't request this link, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '480px' }
const brand = {
  fontSize: '20px',
  fontWeight: 'bold' as const,
  fontFamily: "'Space Grotesk', Arial, sans-serif",
  color: '#1E90FF',
  margin: '0 0 24px',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  fontFamily: "'Space Grotesk', Arial, sans-serif",
  color: '#171717',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: '#737373',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const button = {
  backgroundColor: '#1E90FF',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  fontFamily: "'Space Grotesk', Arial, sans-serif",
  borderRadius: '12px',
  padding: '14px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#a3a3a3', margin: '32px 0 0' }
