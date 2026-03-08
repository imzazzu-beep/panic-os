import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { activeAgents, activeMeetings } from '../store';

export async function GET() {
  const meetings = Array.from(activeMeetings.values());
  return NextResponse.json(meetings);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const meetingId = uuidv4();
    
    const meeting = {
      id: meetingId,
      title: body.title || 'Untitled Meeting',
      participants: body.participants || [],
      status: 'active',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    
    // Activate all participant agents
    for (const agentId of meeting.participants) {
      activeAgents.set(agentId, {
        id: agentId,
        task: `Participating in meeting: ${meeting.title}`,
        lastActivity: new Date(),
        meetingId: meetingId,
      });
    }
    
    activeMeetings.set(meetingId, meeting);
    
    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}