from __future__ import annotations
import aiosqlite
from datetime import datetime, timezone
from config import DB_PATH


async def init_db() -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS inspections (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp_in  TEXT NOT NULL,
                timestamp_out TEXT,
                dwell_seconds REAL,
                object_class  TEXT,
                confidence    REAL,
                result        TEXT CHECK(result IN ('PASS','FAIL')),
                llm_desc      TEXT,
                created_at    TEXT DEFAULT (datetime('now'))
            )
        """)
        await db.commit()


async def log_inspection(
    timestamp_in: str,
    timestamp_out: str | None,
    dwell_seconds: float | None,
    object_class: str,
    confidence: float,
    result: str,
    llm_desc: str | None,
) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO inspections
              (timestamp_in, timestamp_out, dwell_seconds, object_class,
               confidence, result, llm_desc)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                timestamp_in,
                timestamp_out,
                dwell_seconds,
                object_class,
                confidence,
                result,
                llm_desc,
            ),
        )
        await db.commit()


async def get_recent_logs(limit: int = 20) -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM inspections ORDER BY id DESC LIMIT ?", (limit,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


async def get_session_stats(since: str) -> dict:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            """
            SELECT
                COUNT(*)                                     AS total,
                SUM(CASE WHEN result='PASS' THEN 1 ELSE 0 END) AS pass_count,
                SUM(CASE WHEN result='FAIL' THEN 1 ELSE 0 END) AS fail_count,
                AVG(dwell_seconds)                           AS avg_dwell
            FROM inspections
            WHERE created_at >= ?
            """,
            (since,),
        ) as cursor:
            row = await cursor.fetchone()
            total = row[0] or 0
            pass_count = row[1] or 0
            fail_count = row[2] or 0
            avg_dwell = row[3] or 0.0
            pass_rate = (pass_count / total * 100) if total > 0 else 0.0
            return {
                "total": total,
                "pass_count": pass_count,
                "fail_count": fail_count,
                "pass_rate": round(pass_rate, 1),
                "avg_dwell": round(avg_dwell, 2),
            }
