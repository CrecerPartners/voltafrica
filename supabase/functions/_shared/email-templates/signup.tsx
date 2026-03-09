/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Img,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  token: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  token,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Volt verification code: {token}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://yaojxewpkrjonrvqpsxi.supabase.co/storage/v1/object/public/logos/logo.png"
            width="120"
            height="auto"
            alt="Volt Logo"
          />
        </Section>
        
        <Heading style={h1}>Verify your email</Heading>
        
        <Text style={text}>
          Welcome to Volt! We're excited to have you on board. Pan-African commerce starts here.
        </Text>
        
        <Section style={codeBlock}>
          <Text style={codeTitle}>Your Verification Code</Text>
          <Text style={codeValue}>{token}</Text>
        </Section>

        <Text style={text}>
          Copy and paste this code into the verification screen to claim your <strong>₦500 signup bonus</strong> and start selling.
        </Text>

        <Text style={footer}>
          This code will expire in 10 minutes. If you didn't request this email, you can safely ignore it.
        </Text>
        
        <Section style={footerSection}>
          <Text style={footerText}>
            © 2026 Volt Africa. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '40px 48px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  maxWidth: '560px',
}

const header = {
  marginBottom: '32px',
}

const h1 = {
  color: '#111827',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const codeBlock = {
  backgroundColor: '#00d2ff',
  background: 'linear-gradient(135deg, #00d2ff 0%, #0078ff 50%, #a06dee 100%)',
  borderRadius: '12px',
  padding: '32px 20px',
  margin: '24px 0',
}

const codeTitle = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '14px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 12px',
}

const codeValue = {
  color: '#ffffff',
  fontSize: '42px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  letterSpacing: '8px',
  margin: '0',
}

const footer = {
  color: '#9ca3af',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '24px 0 0',
}

const footerSection = {
  borderTop: '1px solid #e5e7eb',
  paddingTop: '24px',
  marginTop: '32px',
}

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
}
