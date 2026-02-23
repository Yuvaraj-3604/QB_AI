const getZoomAccessToken = async () => {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
        throw new Error('Zoom credentials missing in environment variables');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Zoom Auth Error: ${data.message || JSON.stringify(data)}`);
    }

    return data.access_token;
};

const createZoomMeeting = async (topic, startTime, duration) => {
    const accessToken = await getZoomAccessToken();

    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            topic: topic || 'New Event Meeting',
            type: 2,
            start_time: startTime || new Date().toISOString(),
            duration: duration || 60,
            settings: {
                host_video: true,
                participant_video: true,
                join_before_host: true,
                mute_upon_entry: true,
                waiting_room: false
            }
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Zoom API Error: ${data.message || JSON.stringify(data)}`);
    }

    return data;
};

module.exports = { createZoomMeeting };
