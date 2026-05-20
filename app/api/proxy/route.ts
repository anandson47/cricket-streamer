import { NextResponse } from "next/server";

import * as cheerio from "cheerio";

export async function GET() {
  try {
    const response = await fetch(
      "https://cricheroes.com/scorecard/24884465/individual/crcf-vs-test1/live",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      },
    );

    const html = await response.text();

    const $ = cheerio.load(html);

    // EXAMPLES
    // const score =
    //   $('.team-score')
    //     .first()
    //     .text()
    //     .trim();

    const overs = $(".bfKBqI").first().text().trim();

    const battingTeam = $(".iwkYwe").first().text().trim();

    const batsman1 = $("table")
      .first()
      .find("tbody tr td span a span")
      .first()
      .text()
      .trim();

    const batsman2 = $("table")
      .first()
      .find("tbody tr")
      .eq(1)
      .find("td span a span")
      .first()
      .text()
      .trim();

    const bowler = $("table")
      .eq(1)
      .find("tbody tr td span a span")
      .first()
      .text()
      .trim();

    const runRate = $(".runRateStat").first().text().trim();

   

    return NextResponse.json({
      overs,
      battingTeam,
      batsman1,
      batsman2,
      bowler,
      runRate,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to parse",
      },
      {
        status: 500,
      },
    );
  }
}
