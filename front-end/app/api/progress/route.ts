import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// POST: Save a test result
export async function POST(request: Request) {
    try {
        const { userId, topic, score, total, weaknesses } = await request.json();

        const { error } = await supabase
            .from('test_results')
            .insert([{
                user_id: userId,
                topic,
                score,
                total,
                weaknesses: weaknesses || [],
            }]);

        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Progress POST error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
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

        // Fetch test results (ordered by date)
        const { data: tests } = await supabase
            .from('test_results')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        // Fetch concept mastery / weaknesses
        const { data: mastery } = await supabase
            .from('user_concept_mastery')
            .select('*')
            .eq('user_id', userId)
            .order('error_weight', { ascending: false });

        return NextResponse.json({
            tests: tests || [],
            mastery: mastery || [],
        });
    } catch (err: any) {
        console.error('Progress GET error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
