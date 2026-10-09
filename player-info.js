module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uid = String(req.query.uid || '').trim();
  const region = String(req.query.region || 'sg').trim().toLowerCase();

  if (!/^\d{5,15}$/.test(uid)) {
    return res.status(400).json({ error: 'UID phải gồm 5–15 chữ số.' });
  }
  if (!/^[a-z]{2,3}$/.test(region)) {
    return res.status(400).json({ error: 'Region không hợp lệ.' });
  }

  const apiKey = process.env.FREE_FIRE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Máy chủ chưa cấu hình API key.' });
  }

  const url = new URL('https://developers.freefirecommunity.com/api/v1/info');
  url.searchParams.set('uid', uid);
  url.searchParams.set('region', region);

  try {
    const upstream = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });

    const data = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      if (upstream.status === 429) {
        return res.status(429).json({ error: 'API đang giới hạn lượt gọi. Vui lòng thử lại sau.' });
      }
      return res.status(502).json({ error: 'Dịch vụ tra cứu từ chối yêu cầu hoặc đang gặp lỗi.' });
    }

    // API schema may vary by account/endpoint version; avoid claiming success without player data.
    const player = data && (data.basicInfo || data.player || data.data?.basicInfo);
    if (!player) {
      return res.status(502).json({ error: 'API phản hồi theo định dạng chưa được nhận diện. Kiểm tra tài liệu API hiện hành.' });
    }

    const clan = data.clanBasicInfo || data.data?.clanBasicInfo || {};
    return res.status(200).json({
      basicInfo: {
        accountId: String(player.accountId || player.uid || uid),
        nickname: String(player.nickname || player.name || ''),
        level: player.level ?? null,
        region: String(player.region || region).toUpperCase()
      },
      clanBasicInfo: { clanName: String(clan.clanName || '') }
    });
  } catch (err) {
    return res.status(502).json({ error: 'Không kết nối được dịch vụ tra cứu. Vui lòng thử lại.' });
  }
};
