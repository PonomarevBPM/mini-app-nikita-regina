import { NextRequest, NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// Initialize the auth
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY as string)
    .split(String.raw`\n`)
    .join("\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetId = process.env.GOOGLE_REGISTER_SHEET;
    const sheetIndex = parseInt(searchParams.get("sheetIndex") || "0");
    const data = await request.json();

    if (!sheetId) {
      return NextResponse.json(
        { error: "Sheet ID is required" },
        { status: 400 }
      );
    }

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Valid data is required" },
        { status: 400 }
      );
    }

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo();

    // Get the specific sheet
    const sheet = doc.sheetsByIndex[sheetIndex];
    if (!sheet) {
      return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
    }

    // Load header row to get the field name of the first column
    await sheet.loadHeaderRow();
    const firstColumnHeader = sheet.headerValues[0];

    const rows = await sheet.getRows();

    // Access using the header name
    const firstColumnValues = rows
      .map((row) => row.get(firstColumnHeader))
      .filter(Boolean);

    if (!firstColumnValues.includes(String(data.chat_id))) {
      await sheet.addRow(data);
    }

    return NextResponse.json({
      success: true,
      message: "Data added successfully",
    });
  } catch (error) {
    console.error("Google Sheets API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to add data to Google Sheets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
