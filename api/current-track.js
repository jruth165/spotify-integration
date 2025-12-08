const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN
    })
  });
  
  return response.json();
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    // Get fresh access token
    const { access_token } = await getAccessToken();
    
    // Fetch currently playing track
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    if (response.status === 204 || response.status === 404) {
      return res.status(200).json({ isPlaying: false });
    }
    
    const song = await response.json();
    
    if (!song.item) {
      return res.status(200).json({ isPlaying: false });
    }
    
    const isPlaying = song.is_playing;
    const title = song.item.name;
    const artist = song.item.artists.map(artist => artist.name).join(', ');
    const album = song.item.album.name;
    const albumImageUrl = song.item.album.images[0]?.url;
    const songUrl = song.item.external_urls.spotify;
    
    return res.status(200).json({
      isPlaying,
      title,
      artist,
      album,
      albumImageUrl,
      songUrl
    });
    
  } catch (error) {
    console.error('Error fetching currently playing:', error);
    return res.status(500).json({ error: 'Failed to fetch currently playing track' });
  }
}
