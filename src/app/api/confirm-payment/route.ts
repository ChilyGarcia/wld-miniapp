import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { payload } = await req.json();
  const referenceFromDB = "reference-from-database"; // Aquí recupera el reference almacenado

  if (payload.reference === referenceFromDB) {
    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${process.env.APP_ID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
        },
      }
    );
    const transaction = await response.json();

    if (
      transaction.reference === referenceFromDB &&
      transaction.status !== "failed"
    ) {
      return NextResponse.json({ success: true });
    }
  }
  return NextResponse.json({ success: false });
}
