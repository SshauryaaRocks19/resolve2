import { connectDB } from '@/lib/mongodb';
import { ConceptMastery } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { userId, topic, wrongAnswers } = await request.json();

        await connectDB();

        console.log("Received wrong answers from frontend:", wrongAnswers?.length || 0);

        if (!wrongAnswers || wrongAnswers.length === 0) {
            return NextResponse.json({ success: true, message: "No wrong answers to process" });
        }


        for (const wa of wrongAnswers) {
            const weakness = wa.diagnosed_weakness || 'Unknown concept gap';

            const existing = await ConceptMastery.findOne({
                user_id: userId,
                topic,
                micro_concept: weakness,
            });

            if (existing) {
                existing.error_weight += 2;
                existing.last_tested_at = new Date();
                await existing.save();
                console.log(`Updated weakness: "${weakness}" → error_weight: ${existing.error_weight}`);
            } else {
                await ConceptMastery.create({
                    user_id: userId,
                    topic,
                    micro_concept: weakness,
                    error_weight: 3,
                });
                console.log(`Created new weakness: "${weakness}"`);
            }
        }

        return NextResponse.json({ success: true, message: `Saved ${wrongAnswers.length} weakness(es) to MongoDB` });

    } catch (error: any) {
        console.error("MongoDB Error:", error);
        return NextResponse.json({ error: error.message || "Database connection failed" }, { status: 500 });
    }
}