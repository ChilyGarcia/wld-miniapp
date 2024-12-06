import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const uuid = crypto.randomUUID().replace(/-/g, "");

  // Aquí deberías guardar el UUID en tu base de datos para validarlo más tarde
  console.log("Generated Payment Reference:", uuid);

  return NextResponse.json({ id: uuid });
}
