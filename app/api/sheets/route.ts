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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetId =
      searchParams.get("sheetId") || process.env.GOOGLE_SPREADSHEET_ID;
    const sheetIndex = parseInt(searchParams.get("sheetIndex") || "0");

    if (!sheetId) {
      return NextResponse.json(
        { error: "Sheet ID is required" },
        { status: 400 }
      );
    }

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);

    // Load document properties and worksheets
    await doc.loadInfo();

    // Get the specific sheet
    const sheet = doc.sheetsByIndex[sheetIndex];
    if (!sheet) {
      return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
    }

    // Get all rows
    const rows = await sheet.getRows();

    // Convert rows to plain objects
    const data = rows.map((row) => {
      const rowData: Record<string, any> = {};
      sheet.headerValues?.forEach((header) => {
        rowData[header] = row.get(header);
      });
      return rowData;
    });

    return NextResponse.json({
      success: true,
      data,
      sheetTitle: sheet.title,
      headers: sheet.headerValues,
    });
  } catch (error) {
    console.error("Google Sheets API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch data from Google Sheets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetId =
      searchParams.get("sheetId") || process.env.GOOGLE_SPREADSHEET_ID;
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

    // Add new row
    await sheet.addRow(data);

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
