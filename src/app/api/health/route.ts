import { NextResponse } from "next/server";

/** Health check simples (sem tocar no banco nesta fase). */
export async function GET() {
  return NextResponse.json({ status: "ok", name: "vitrine" });
}
