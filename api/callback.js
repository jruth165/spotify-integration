const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

export default async function handler(req, res) {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      })
    });

    const data = await tokenResponse.json();

    // Return the refresh token so you can save it
    res.send(`
      <html>
        <head>
          <style>
            body { 
              font-family: Arial; 
              background: #000; 
              color: #fff; 
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
            }
            code { 
              background: #1db954; 
              padding: 10px; 
              display: block; 
              margin: 20px 0;
              word-break: break-all;
            }
            h1 { color: #1db954; }
          </style>
        </head>
        <body>
          <h1>✅ Authentication Successful!</h1>
          <p>Save this refresh token as an environment variable:</p>
          <code>SPOTIFY_REFRESH_TOKEN=${data.refresh_token}</code>
          <p>Go to your Vercel dashboard → Project Settings → Environment Variables → Add this token</p>
          <p>Then redeploy your project.</p>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
}
