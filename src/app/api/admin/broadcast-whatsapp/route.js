import { NextResponse } from 'next/server';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, summary, url, category = 'news', urgency = 'normal', district = '', helpline = '' } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: 'Missing required fields: title and url are mandatory.' },
        { status: 400 }
      );
    }

    // Dynamically import the WhatsApp channel helper
    const channelModulePath = path.resolve(process.cwd(), 'scripts/lib/whatsappChannel.mjs');
    const { postToWhatsAppChannel } = await import(`file://${channelModulePath.replace(/\\/g, '/')}`);

    console.log(`[API /admin/broadcast-whatsapp] Broadcasting "${title}" to WhatsApp Channel...`);

    const result = await postToWhatsAppChannel({
      title,
      summary,
      url,
      category,
      urgency,
      district,
      helpline,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Broadcast could not be sent. Check if Baileys session is active or WHATSAPP_SESSION is set.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result?.key?.id,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[API /admin/broadcast-whatsapp] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while broadcasting to WhatsApp' },
      { status: 500 }
    );
  }
}
