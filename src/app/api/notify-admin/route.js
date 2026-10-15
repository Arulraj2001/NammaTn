import { NextResponse } from 'next/server';
import {
  notifyAdminContactMessage,
  notifyAdminCivicReport,
} from '@/lib/emailNotifier';

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
    }

    let result = { success: false };

    switch (type) {
      case 'contact_message':
        result = await notifyAdminContactMessage(data);
        break;
      case 'civic_report':
        result = await notifyAdminCivicReport(data);
        break;
      default:
        return NextResponse.json({ error: `Unknown event type: ${type}` }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[API /api/notify-admin ERROR]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
