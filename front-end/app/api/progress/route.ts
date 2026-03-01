import { connectDB } from '@/lib/mongodb';
import { TestResult, ConceptMastery } from '@/lib/models';
import { NextResponse } from 'next/server';

// POST: Save a test result
export async function POST(request: Request) {
    try {
        const { userId, topic, score, total, weaknesses } = await request.json();

        await connectDB();

        const result = await TestResult.create({
            user_id: userId,
            topic,
            score,
            total,
            weaknesses: weaknesses || [],
        });

        console.log('Test result saved to MongoDB:', result._id);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Progress POST error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// GET: Fetch test history and weaknesses for a user
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        await connectDB();

        // Fetch test results ordered by date
        const tests = await TestResult.find({ user_id: userId })
            .sort({ created_at: 1 })
            .lean();

        // Fetch concept mastery sorted by error_weight desc
        const mastery = await ConceptMastery.find({ user_id: userId })
            .sort({ error_weight: -1 })
            .lean();

        return NextResponse.json({
            tests: tests || [],
            mastery: mastery || [],
        });
    } catch (err: any) {
        console.error('Progress GET error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
