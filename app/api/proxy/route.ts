/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const matchLink: any = searchParams.get("matchLink");

  try {
    const response = await fetch(matchLink, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",

        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",

        "Accept-Language": "en-US,en;q=0.9",

        Referer: "https://cricheroes.com/",

        Origin: "https://cricheroes.com",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `HTTP ${response.status}`,
        },
        {
          status: response.status,
        },
      );
    }
    const html = await response.text();

    const $ = cheerio.load(html);

    // EXAMPLES
    // const score =
    //   $('.team-score')
    //     .first()
    //     .text()
    //     .trim();

    const runRate = $(".runRateStat").first().text().trim();

    const requiredRunRate = $(".runRateStat").eq(1).text().trim() || "";

    const battingFirst =
      requiredRunRate === "" || requiredRunRate.includes("RPO") ? true : false;

    const overs = battingFirst
      ? $(".bfKBqI").first().text().trim()
      : $(".bfKBqI").eq(1).text().trim();

    const battingTeam = $(".iwkYwe").first().text().trim();

    const bowlingTeam = $(".jZwYNW").first().text().trim();

    const balls = $(".balls").first().text().trim();

    const current = balls ? balls.split("|") : [];

    const currentOver =
      current.length > 0 ? current[current.length - 1].trim().split("") : [];

    const batsman1Balls = $("table")
      .first()
      .find("tbody tr")
      .first()
      .find("td")
      .eq(2)
      .text()
      .trim();

    const batsman1StrikeRate = $("table")
      .first()
      .find("tbody tr")
      .first()
      .find("td")
      .eq(5)
      .text()
      .trim();
    const batsman1 =
      $("table").first().find("tbody tr td span a span").first().text().trim() +
      ": " +
      getRuns(batsman1Balls, batsman1StrikeRate) +
      " " +
      `(${batsman1Balls})`;

    const batsman2Balls = $("table")
      .first()
      .find("tbody tr")
      .eq(1)
      .find("td")
      .eq(2)
      .text()
      .trim();

    const batsman2StrikeRate = $("table")
      .first()
      .find("tbody tr")
      .eq(1)
      .find("td")
      .eq(5)
      .text()
      .trim();

    const batsman2 =
      $("table")
        .first()
        .find("tbody tr")
        .eq(1)
        .find("td span a span")
        .first()
        .text()
        .trim() +
      ": " +
      getRuns(batsman2Balls, batsman2StrikeRate) +
      " " +
      `(${batsman2Balls})`;

    const bowlerEconomy = $("table")
      .eq(1)
      .find("tbody tr")
      .first()
      .find("td")
      .eq(5)
      .text()
      .trim();

    const bowlerOvers = $("table")
      .eq(1)
      .find("tbody tr")
      .first()
      .find("td")
      .eq(1)
      .text()
      .trim();

    const bowlerMaidens = $("table")
      .eq(1)
      .find("tbody tr")
      .first()
      .find("td")
      .eq(2)
      .text()
      .trim();

    const bowlerWickets = $("table")
      .eq(1)
      .find("tbody tr")
      .first()
      .find("td")
      .eq(4)
      .text()
      .trim();

    const bowler =
      $("table").eq(1).find("tbody tr td span a span").first().text().trim() +
      ": " +
      bowlerOvers +
      "-" +
      bowlerMaidens +
      "-" +
      calculateRunsConceded(
        parseFloat(bowlerEconomy),
        parseFloat(bowlerOvers),
      ) +
      "-" +
      bowlerWickets;

    const matchOver = $(".jMCptV").first().text().trim();

    let result = "";
    if (matchOver) {
      result = $(".HcRBV").first().text().trim();
    }

    function getRuns(balls: any, strikeRate: any) {
      return Math.round((parseInt(balls) * parseFloat(strikeRate)) / 100);
    }

    function calculateRunsConceded(economy: any, oversBowled: any) {
      // Convert overs like 4.3 => 4 overs + 3 balls
      const overs = Math.floor(oversBowled);
      const balls = Math.round((oversBowled - overs) * 10);

      // Total balls bowled
      const totalBalls = overs * 6 + balls;

      // Runs conceded = economy * overs in decimal
      const runs = economy * (totalBalls / 6);

      return Math.round(runs);
    }

    const batsman1Runs = getRuns(batsman1Balls, batsman1StrikeRate);

    return NextResponse.json({
      overs,
      battingTeam,
      batsman1,
      batsman2,
      bowler,
      runRate,
      bowlingTeam,
      battingFirst,
      requiredRunRate,
      result,
      currentOver,
      batsman1Balls,
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
