import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { userId, topic, wrongAnswers } = await request.json();

        // 1. BYPASS GEMINI: Create a fake weakness string to save your API limits
        const fakeWeakness = "TEST DATA: Fails to understand basic Supabase plumbing";

        console.log("Received wrong answers from frontend:", wrongAnswers);
        console.log("Attempting to insert into Supabase...");

        // 2. Talk directly to Supabase
        const { data: existing, error: fetchError } = await supabase
            .from('user_concept_mastery')
            .select('id, error_weight')
            .eq('user_id', userId)
            .eq('micro_concept', fakeWeakness)
            .single();

        if (existing) {
            // Update existing record
            const { error: updateError } = await supabase
                .from('user_concept_mastery')
                .update({ error_weight: existing.error_weight + 2, last_tested_at: new Date() })
                .eq('id', existing.id);

            if (updateError) throw updateError;
        } else {
            // Insert new record
            const { error: insertError } = await supabase
                .from('user_concept_mastery')
                .insert([{
                    user_id: userId,
                    topic: topic,
                    micro_concept: fakeWeakness,
                    error_weight: 3
                }]);

            if (insertError) throw insertError;
        }

        return NextResponse.json({ success: true, message: "Test data successfully forced into Supabase!" });

    } catch (error) {
        console.error("Supabase Error:", error);
        return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }
}