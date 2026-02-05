import argparse
import sqlite3
from pathlib import Path
from typing import Iterable, List, Sequence, Tuple


def _sql_escape(value):
    if value is None:
        return "NULL"
    if isinstance(value, (int, float)):
        return str(value)
    s = str(value)
    s = s.replace("\\", "\\\\").replace("'", "''")
    return "'" + s + "'"


def _write_inserts(
    *,
    cur: sqlite3.Cursor,
    out,
    table: str,
    columns: Sequence[str],
    select_sql: str,
) -> None:
    rows = cur.execute(select_sql).fetchall()
    if not rows:
        return
    col_list = ",".join(f"`{c}`" for c in columns)
    for r in rows:
        values = ",".join(_sql_escape(r[c]) for c in columns)
        out.write(f"INSERT INTO `{table}` ({col_list}) VALUES ({values});\n")


def export_mysql_import_sql(*, sqlite_path: Path, out_path: Path) -> None:
    conn = sqlite3.connect(str(sqlite_path))
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    with out_path.open("w", encoding="utf-8", newline="\n") as f:
        f.write("SET NAMES utf8mb4;\n")
        f.write("SET FOREIGN_KEY_CHECKS=0;\n")
        for t in [
            "kb_item_category",
            "kb_favorite",
            "kb_download_log",
            "kb_attachment",
            "kb_item",
            "kb_category",
            "kb_column",
        ]:
            f.write(f"TRUNCATE TABLE `{t}`;\n")

        _write_inserts(
            cur=cur,
            out=f,
            table="kb_column",
            columns=["code", "name", "description", "sort_no", "created_at"],
            select_sql="SELECT code,name,description,sort_no,created_at FROM kb_column ORDER BY sort_no,code",
        )
        _write_inserts(
            cur=cur,
            out=f,
            table="kb_category",
            columns=["id", "column_code", "name", "sort_no", "created_at"],
            select_sql="SELECT id,column_code,name,sort_no,created_at FROM kb_category ORDER BY id",
        )
        _write_inserts(
            cur=cur,
            out=f,
            table="kb_item",
            columns=[
                "id",
                "column_code",
                "title",
                "author",
                "summary",
                "content",
                "publish_org",
                "doc_no",
                "publish_time",
                "image_urls",
                "views",
                "download_count",
                "favorite_count",
                "created_at",
                "updated_at",
                "user_id",
                "view_count",
                "collect_count",
                "subtitle",
                "tags",
                "is_top",
                "seo_keywords",
            ],
            select_sql=(
                "SELECT id,column_code,title,author,summary,content,publish_org,doc_no,publish_time,"
                "image_urls,views,download_count,favorite_count,created_at,updated_at,user_id,view_count,"
                "collect_count,subtitle,tags,is_top,seo_keywords "
                "FROM kb_item ORDER BY id"
            ),
        )
        _write_inserts(
            cur=cur,
            out=f,
            table="kb_attachment",
            columns=["id", "item_id", "file_name", "file_type", "file_size", "file_url", "created_at"],
            select_sql="SELECT id,item_id,file_name,file_type,file_size,file_url,created_at FROM kb_attachment ORDER BY id",
        )
        _write_inserts(
            cur=cur,
            out=f,
            table="kb_item_category",
            columns=["item_id", "category_id", "created_at"],
            select_sql="SELECT item_id,category_id,created_at FROM kb_item_category ORDER BY item_id,category_id",
        )
        _write_inserts(
            cur=cur,
            out=f,
            table="kb_favorite",
            columns=["user_id", "item_id", "created_at"],
            select_sql="SELECT user_id,item_id,created_at FROM kb_favorite ORDER BY created_at",
        )
        _write_inserts(
            cur=cur,
            out=f,
            table="kb_download_log",
            columns=["id", "user_id", "item_id", "created_at"],
            select_sql="SELECT id,user_id,item_id,created_at FROM kb_download_log ORDER BY id",
        )

        for table, pk in [
            ("kb_category", "id"),
            ("kb_item", "id"),
            ("kb_attachment", "id"),
            ("kb_download_log", "id"),
        ]:
            row = cur.execute(f"SELECT MAX({pk}) AS m FROM {table}").fetchone()
            m = int((row["m"] if row else 0) or 0)
            f.write(f"ALTER TABLE `{table}` AUTO_INCREMENT={m + 1};\n")

        f.write("SET FOREIGN_KEY_CHECKS=1;\n")

    conn.close()


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--sqlite", required=True, help="Path to SQLite kb.sqlite3")
    p.add_argument("--out", required=True, help="Output MySQL import .sql")
    args = p.parse_args()

    sqlite_path = Path(args.sqlite).expanduser().resolve()
    out_path = Path(args.out).expanduser().resolve()
    export_mysql_import_sql(sqlite_path=sqlite_path, out_path=out_path)
    print(str(out_path))


if __name__ == "__main__":
    main()
