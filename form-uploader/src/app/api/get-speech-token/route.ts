import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;

  if (!speechKey || !speechRegion) {
    console.error('Missing Azure Speech credentials in environment variables');
    return NextResponse.json(
      { error: 'Speech key or region not configured' },
      { status: 400 }
    );
  }

  try {
    const headers = {
      'Ocp-Apim-Subscription-Key': speechKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const tokenResponse = await axios.post(
      `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      null,
      { headers }
    );

    return NextResponse.json({
      token: tokenResponse.data,
      region: speechRegion
    });
  } catch (error) {
    console.error('Error generating Azure Speech token:', error);
    return NextResponse.json(
      { error: 'There was an error authorizing your speech key' },
      { status: 401 }
    );
  }
} 