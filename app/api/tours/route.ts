export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, logHistory } from "@/lib/supabase-server";
export async function GET() {
  const { data, error } = await supabaseAdmin.from("tours").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabaseAdmin.from("tours").insert(body).select().single();
  if (error) return NextResponse.json({ error }, { status: 400 });
  await logHistory(data.id, "created", data);
  return NextResponse.json(data, { status: 201 });
}
export async function PUT(req: NextRequest) {
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { data: before } = await supabaseAdmin.from("tours").select().eq("id", id).single();
  const { data, error } = await supabaseAdmin.from("tours").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error }, { status: 400 });
  await logHistory(id, "updated", { before, after: data });
  return NextResponse.json(data);
}
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { data: tour } = await supabaseAdmin.from("tours").select().eq("id", id).single();
  const { error } = await supabaseAdmin.from("tours").delete().eq("id", id);
  if (error) return NextResponse.json({ error }, { status: 400 });
  await logHistory(id, "deleted", tour ?? {});
  return NextResponse.json({ success: true });
}
