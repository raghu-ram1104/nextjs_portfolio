import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Check for Supabase environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase env vars missing. URL:', !!supabaseUrl, 'Key:', !!supabaseServiceKey)
      console.error('Available env keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('NEXT_PUBLIC')).join(', '))
      return NextResponse.json(
        { error: 'Contact form is not configured yet. Please set up database credentials.' },
        { status: 500 }
      )
    }

    // Create server-side Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Insert contact message into Supabase
    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          name,
          email,
          subject,
          message,
          created_at: new Date().toISOString(),
          read: false,
        },
      ])
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save message. Please try again later.' },
        { status: 500 }
      )
    }

    // Send email notification via Resend
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey)
        await resend.emails.send({
          from: 'Portfolio Contact <onboarding@resend.dev>',
          to: 'raghuramsrikanth1104@gmail.com',
          subject: `New Portfolio Message: ${subject}`,
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0a2e; border-radius: 12px; overflow: hidden; border: 1px solid #1e1b4b;">
              <div style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); padding: 24px 32px;">
                <h1 style="color: white; margin: 0; font-size: 22px;">📬 New Contact Message</h1>
                <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">Someone reached out through your portfolio</p>
              </div>
              <div style="padding: 28px 32px; color: #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #06b6d4; font-weight: 600; width: 90px; vertical-align: top;">Name</td>
                    <td style="padding: 10px 0; color: #f1f5f9;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #06b6d4; font-weight: 600; vertical-align: top;">Email</td>
                    <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #a78bfa; text-decoration: none;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #06b6d4; font-weight: 600; vertical-align: top;">Subject</td>
                    <td style="padding: 10px 0; color: #f1f5f9;">${subject}</td>
                  </tr>
                </table>
                <div style="margin-top: 20px; padding: 20px; background: #1a1545; border-radius: 8px; border-left: 3px solid #8b5cf6;">
                  <p style="color: #06b6d4; font-weight: 600; margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
                  <p style="color: #e2e8f0; margin: 0; line-height: 1.7; white-space: pre-wrap;">${message}</p>
                </div>
                <div style="margin-top: 24px; text-align: center;">
                  <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="display: inline-block; padding: 10px 28px; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Reply to ${name}</a>
                </div>
              </div>
              <div style="padding: 16px 32px; background: #0a0620; text-align: center; color: #64748b; font-size: 12px;">
                Sent from your portfolio contact form
              </div>
            </div>
          `,
        })
        console.log('Email notification sent successfully')
      } catch (emailError) {
        // Don't fail the request if email fails — message is already saved in DB
        console.error('Email notification failed:', emailError)
      }
    }

    return NextResponse.json(
      { success: true, message: 'Message sent successfully!' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
