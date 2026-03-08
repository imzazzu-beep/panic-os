import { NextRequest, NextResponse } from 'next/server';
import { activeAgents, activeMeetings } from '../../store';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const meeting = activeMeetings.get(id);
  
  if (meeting) {
    return NextResponse.json(meeting);
  } else {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const meeting = activeMeetings.get(id);
  
  if (meeting) {
    meeting.status = 'ended';
    meeting.endedAt = new Date().toISOString();
    
    // Deactivate all participant agents
    meeting.participants.forEach((agentId: string) => {
      activeAgents.delete(agentId);
    });
    
    return NextResponse.json({ success: true, meeting });
  } else {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  }
}