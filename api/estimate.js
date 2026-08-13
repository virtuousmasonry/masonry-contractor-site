// Vercel serverless function — receives the estimate form submission and
// emails it to the business via Resend (https://resend.com).
//
// Requires an environment variable set in the Vercel project:
//   RESEND_API_KEY = <your Resend API key>

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  const { name, phone, email, address, project_type, timeline, message } = req.body || {};

  if (!name || !phone) {
    res.status(400).json({ success: false, message: 'Name and phone are required.' });
    return;
  }

  const lines = [
    `Name: ${name}`,
    `Phone: ${phone}`,
    email ? `Email: ${email}` : null,
    address ? `Address / town: ${address}` : null,
    project_type ? `Project type: ${project_type}` : null,
    timeline ? `Timeline: ${timeline}` : null,
    message ? `Message: ${message}` : null,
  ].filter(Boolean).join('\n');

  if (!process.env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY environment variable');
    res.status(500).json({ success: false, message: 'Server is not configured to send email.' });
    return;
  }

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Virtuous Masonry Website <onboarding@resend.dev>',
        to: ['virtuousmasonry@gmail.com'],
        reply_to: email || undefined,
        subject: `New estimate request — ${name}`,
        text: lines,
      }),
    });

    const data = await resendRes.json();

    if (!resendRes.ok) {
      console.error('Resend API error:', data);
      throw new Error(data && data.message ? data.message : 'Resend API error');
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Estimate form email failed:', err);
    res.status(502).json({ success: false, message: 'Failed to send email.' });
  }
};
