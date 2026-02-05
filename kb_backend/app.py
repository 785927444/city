import os
import sys
import shutil
import json
import io
import zipfile
import sqlite3
import datetime
from pathlib import Path
from typing import Any, Dict, List, Sequence, Tuple, Optional

import uuid
from urllib.parse import urlparse
import pymysql
import pypdf
import docx
from fastapi import FastAPI, Query, UploadFile, File, Form, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


def _env_int(name: str, default: int) -> int:
    val = os.getenv(name)
    if not val:
        return default
    try:
        return int(val)
    except ValueError:
        return default


def _env_bool(name: str, default: bool) -> bool:
    val = os.getenv(name)
    if val is None:
        return default
    s = str(val).strip().lower()
    if s in {"1", "true", "yes", "y", "on"}:
        return True
    if s in {"0", "false", "no", "n", "off"}:
        return False
    return default


def _app_base_dir() -> Path:
    env = os.getenv("KB_BASE_DIR")
    if env:
        return Path(env)
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent


def _bundled_path(rel: str) -> Path:
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        return Path(getattr(sys, "_MEIPASS")) / rel
    return Path(rel)


def _candidate_public_dirs(base: Path) -> List[Path]:
    return [
        base / "public",
        base / "kb_backend" / "public",
        base / "vue" / "public",
        base.parent / "public",
        base.parent / "kb_backend" / "public",
        base.parent / "vue" / "public",
    ]


def _resolve_public_dir(base: Path) -> Path:
    for p in _candidate_public_dirs(base):
        if (p / "static" / "uploads").exists():
            return p
    for p in _candidate_public_dirs(base):
        if p.exists() and p.is_dir():
            return p
    return base / "public"



APP_BASE_DIR = _app_base_dir()
PUBLIC_DIR = _resolve_public_dir(APP_BASE_DIR)
STATIC_DIR = PUBLIC_DIR / "static"


def _normalize_attachment_url(url: str) -> str:
    raw = str(url or "").strip()
    if not raw:
        return ""
    if raw.startswith("http://") or raw.startswith("https://"):
        parsed = urlparse(raw)
        raw = parsed.path or ""
    pos = raw.find("/static/")
    if pos != -1:
        return raw[pos:]
    if raw.startswith("static/"):
        return f"/{raw}"
    if raw.startswith("/static/"):
        return raw
    return raw


def _resolve_attachment_path(url: str) -> Path | None:
    raw = _normalize_attachment_url(url)
    if not raw:
        return None
    public_dirs: List[Path] = []
    for p in [PUBLIC_DIR, *_candidate_public_dirs(APP_BASE_DIR)]:
        if p not in public_dirs:
            public_dirs.append(p)
    if raw.startswith("/static/"):
        for pub in public_dirs:
            p = pub / raw.lstrip("/")
            if p.exists() and p.is_file():
                return p
    if raw.startswith("static/"):
        for pub in public_dirs:
            p = pub / raw
            if p.exists() and p.is_file():
                return p
    p = Path(raw)
    if p.exists() and p.is_file():
        return p
    upload_dir_env = os.getenv("KB_UPLOAD_DIR")
    if upload_dir_env:
        upload_dir = Path(upload_dir_env)
    else:
        upload_dir = None
        for pub in public_dirs:
            p = pub / "static" / "uploads"
            if p.exists() and p.is_dir():
                upload_dir = p
                break
        if upload_dir is None:
            upload_dir = STATIC_DIR / "uploads"
    if raw:
        name = Path(raw).name
        p2 = upload_dir / name
        if p2.exists() and p2.is_file():
            return p2
    return None


def _resolve_upload_by_meta(file_name: str, file_size: int | None) -> Path | None:
    ext = Path(file_name or "").suffix.lower()
    public_dirs: List[Path] = []
    for p in [PUBLIC_DIR, *_candidate_public_dirs(APP_BASE_DIR)]:
        if p not in public_dirs:
            public_dirs.append(p)
    upload_dirs: List[Path] = []
    upload_dir_env = os.getenv("KB_UPLOAD_DIR")
    if upload_dir_env:
        upload_dirs.append(Path(upload_dir_env))
    for pub in public_dirs:
        p = pub / "static" / "uploads"
        if p.exists() and p.is_dir() and p not in upload_dirs:
            upload_dirs.append(p)
    for ud in upload_dirs:
        if not ud.exists():
            continue
        candidates = []
        for p in ud.iterdir():
            if not p.is_file():
                continue
            if ext and p.suffix.lower() != ext:
                continue
            if file_size is not None:
                try:
                    if p.stat().st_size != int(file_size):
                        continue
                except Exception:
                    continue
            candidates.append(p)
        if len(candidates) == 1:
            return candidates[0]
        if len(candidates) > 1:
            candidates.sort(key=lambda x: x.stat().st_mtime, reverse=True)
            return candidates[0]
    return None


DEFAULT_COLUMNS: List[Tuple[str, str, str, int]] = [
    ("policy", "政策法规", "政策法规文件浏览与检索", 10),
    ("standard", "标准规范", "标准规范文件浏览与检索", 20),
    ("mechanism", "工作机制", "工作机制文件资料浏览与检索", 30),
    ("expert", "专家智库", "专家信息浏览与检索", 40),
    ("case", "优秀案例", "优秀案例浏览与检索", 50),
    ("course", "培训课程", "培训课程浏览与检索", 60),
]

DEFAULT_CATEGORIES: Dict[str, List[Tuple[str, int]]] = {
    "policy": [("城市体检", 10), ("城市更新", 20), ("城市设计", 30), ("人居环境改善", 40)],
    "standard": [("城市体检", 10), ("城市更新", 20), ("城市设计", 30), ("人居环境改善", 40)],
    "mechanism": [("城市更新专项小组", 10), ("城市更新工作联席会议", 20), ("人居环境改善工作机制", 30)],
    "expert": [("城市体检", 10), ("城市更新", 20), ("城市设计", 30), ("人居环境改善", 40)],
    "case": [("城市体检", 10), ("城市更新", 20), ("城市设计", 30), ("人居环境改善", 40)],
    "course": [("城市体检", 10), ("城市更新", 20), ("城市设计", 30), ("人居环境改善", 40)],
}


class Storage:
    def fetchall(self, sql: str, params: Sequence[Any] = ()) -> List[Dict[str, Any]]:
        raise NotImplementedError

    def fetchone(self, sql: str, params: Sequence[Any] = ()) -> Dict[str, Any] | None:
        raise NotImplementedError

    def execute(self, sql: str, params: Sequence[Any] = ()) -> int:
        raise NotImplementedError

    def insert(self, sql: str, params: Sequence[Any] = ()) -> int:
        raise NotImplementedError

    def executemany(self, sql: str, params: Sequence[Sequence[Any]]) -> int:
        raise NotImplementedError


class MySQLStorage(Storage):
    def __init__(self) -> None:
        self._cfg = {
            "host": os.getenv("MYSQL_HOST", "127.0.0.1"),
            "port": _env_int("MYSQL_PORT", 3306),
            "user": os.getenv("MYSQL_USER", "root"),
            "password": os.getenv("MYSQL_PASSWORD", ""),
            "charset": "utf8mb4",
            "cursorclass": pymysql.cursors.DictCursor,
            "autocommit": True,
        }
        self._db = os.getenv("MYSQL_DB", "knowledge_base")

    def _connect(self, with_db: bool) -> pymysql.Connection:
        cfg = dict(self._cfg)
        if with_db:
            cfg["database"] = self._db
        return pymysql.connect(**cfg)

    def ensure_schema(self) -> None:
        with self._connect(with_db=False) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"CREATE DATABASE IF NOT EXISTS `{self._db}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci"
                )
        with self._connect(with_db=True) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS kb_column (
                      code VARCHAR(32) PRIMARY KEY,
                      name VARCHAR(64) NOT NULL,
                      description VARCHAR(255) DEFAULT NULL,
                      sort_no INT NOT NULL DEFAULT 0,
                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """
                )
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS kb_category (
                      id BIGINT PRIMARY KEY AUTO_INCREMENT,
                      column_code VARCHAR(32) NOT NULL,
                      name VARCHAR(64) NOT NULL,
                      sort_no INT NOT NULL DEFAULT 0,
                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      UNIQUE KEY uk_kb_category_col_name (column_code, name),
                      KEY idx_kb_category_col (column_code),
                      KEY idx_kb_category_sort (sort_no)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """
                )
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS kb_item (
                      id BIGINT PRIMARY KEY AUTO_INCREMENT,
                      column_code VARCHAR(32) NOT NULL,
                      title VARCHAR(255) NOT NULL,
                      author VARCHAR(64) DEFAULT NULL,
                      summary TEXT DEFAULT NULL,
                      content LONGTEXT DEFAULT NULL,
                      publish_org VARCHAR(255) DEFAULT NULL,
                      doc_no VARCHAR(255) DEFAULT NULL,
                      publish_time DATE DEFAULT NULL,
                      image_urls JSON DEFAULT NULL,
                      views INT NOT NULL DEFAULT 0,
                      download_count INT NOT NULL DEFAULT 0,
                      favorite_count INT NOT NULL DEFAULT 0,
                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                      user_id VARCHAR(64) DEFAULT NULL,
                      view_count INT NOT NULL DEFAULT 0,
                      collect_count INT NOT NULL DEFAULT 0,
                      subtitle VARCHAR(255) DEFAULT NULL,
                      tags VARCHAR(255) DEFAULT NULL,
                      is_top TINYINT(1) NOT NULL DEFAULT 0,
                      seo_keywords VARCHAR(255) DEFAULT NULL,
                      KEY idx_kb_item_column (column_code),
                      KEY idx_kb_item_created (created_at),
                      KEY idx_kb_item_user (user_id)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """
                )
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS kb_attachment (
                      id BIGINT PRIMARY KEY AUTO_INCREMENT,
                      item_id BIGINT NOT NULL,
                      file_name VARCHAR(255) NOT NULL,
                      file_type VARCHAR(32) DEFAULT NULL,
                      file_size BIGINT NOT NULL DEFAULT 0,
                      file_url VARCHAR(512) DEFAULT NULL,
                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      KEY idx_kb_attachment_item (item_id),
                      CONSTRAINT fk_kb_attachment_item FOREIGN KEY (item_id) REFERENCES kb_item(id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """
                )
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS kb_item_category (
                      item_id BIGINT NOT NULL,
                      category_id BIGINT NOT NULL,
                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      PRIMARY KEY (item_id, category_id),
                      KEY idx_kb_item_category_cat (category_id),
                      CONSTRAINT fk_kb_item_category_item FOREIGN KEY (item_id) REFERENCES kb_item(id) ON DELETE CASCADE,
                      CONSTRAINT fk_kb_item_category_category FOREIGN KEY (category_id) REFERENCES kb_category(id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """
                )
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS kb_favorite (
                      user_id VARCHAR(64) NOT NULL,
                      item_id BIGINT NOT NULL,
                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      PRIMARY KEY (user_id, item_id),
                      KEY idx_kb_favorite_item (item_id),
                      CONSTRAINT fk_kb_favorite_item FOREIGN KEY (item_id) REFERENCES kb_item(id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """
                )
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS kb_download_log (
                      id BIGINT PRIMARY KEY AUTO_INCREMENT,
                      user_id VARCHAR(64) NOT NULL,
                      item_id BIGINT NOT NULL,
                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      KEY idx_kb_download_item (item_id),
                      KEY idx_kb_download_user (user_id),
                      CONSTRAINT fk_kb_download_item FOREIGN KEY (item_id) REFERENCES kb_item(id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """
                )

                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS t_scheme_project (
                      id VARCHAR(64) PRIMARY KEY,
                      num VARCHAR(64) DEFAULT NULL,
                      code VARCHAR(64) DEFAULT NULL,
                      name VARCHAR(255) DEFAULT NULL,
                      scheme_id VARCHAR(64) DEFAULT NULL,
                      scheme_name VARCHAR(255) DEFAULT NULL,
                      task_type VARCHAR(64) DEFAULT NULL,
                      completion_status VARCHAR(64) DEFAULT NULL,
                      construct_scale VARCHAR(255) DEFAULT NULL,
                      construct_nature VARCHAR(255) DEFAULT NULL,
                      construct_price DECIMAL(18,2) DEFAULT NULL,
                      construct_datetime_start VARCHAR(32) DEFAULT NULL,
                      construct_datetime_end VARCHAR(32) DEFAULT NULL,
                      construct_datetime VARCHAR(64) DEFAULT NULL,
                      apply_status VARCHAR(32) DEFAULT NULL,
                      user_id VARCHAR(64) DEFAULT NULL,
                      user_name VARCHAR(255) DEFAULT NULL,
                      province VARCHAR(64) DEFAULT NULL,
                      city VARCHAR(64) DEFAULT NULL,
                      district VARCHAR(64) DEFAULT NULL,
                      province_name VARCHAR(64) DEFAULT NULL,
                      city_name VARCHAR(64) DEFAULT NULL,
                      district_name VARCHAR(64) DEFAULT NULL,
                      rate_time VARCHAR(64) DEFAULT NULL,
                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      INDEX idx_scheme_project_name (name),
                      INDEX idx_scheme_project_district (district_name)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """
                )
                cur.executemany(
                    """
                    INSERT INTO kb_column(code, name, description, sort_no)
                    VALUES (%s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), sort_no=VALUES(sort_no)
                    """,
                    DEFAULT_COLUMNS,
                )
                cat_rows: List[Tuple[str, str, int]] = []
                for col_code, cats in DEFAULT_CATEGORIES.items():
                    for cat_name, sort_no in cats:
                        cat_rows.append((col_code, cat_name, sort_no))
                cur.executemany(
                    """
                    INSERT INTO kb_category(column_code, name, sort_no)
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE sort_no=VALUES(sort_no)
                    """,
                    cat_rows,
                )
                for ddl in [
                    "ALTER TABLE kb_item ADD COLUMN author VARCHAR(64) DEFAULT NULL",
                    "ALTER TABLE kb_item ADD COLUMN download_count INT NOT NULL DEFAULT 0",
                    "ALTER TABLE kb_item ADD COLUMN favorite_count INT NOT NULL DEFAULT 0",
                    "ALTER TABLE kb_item ADD COLUMN image_urls JSON DEFAULT NULL",
                    "ALTER TABLE kb_item ADD COLUMN user_id VARCHAR(64) DEFAULT NULL",
                    "ALTER TABLE kb_item ADD COLUMN view_count INT NOT NULL DEFAULT 0",
                    "ALTER TABLE kb_item ADD COLUMN collect_count INT NOT NULL DEFAULT 0",
                    "ALTER TABLE kb_item ADD COLUMN subtitle VARCHAR(255) DEFAULT NULL",
                    "ALTER TABLE kb_item ADD COLUMN tags VARCHAR(255) DEFAULT NULL",
                    "ALTER TABLE kb_item ADD COLUMN is_top TINYINT(1) NOT NULL DEFAULT 0",
                    "ALTER TABLE kb_item ADD COLUMN seo_keywords VARCHAR(255) DEFAULT NULL",
                    "ALTER TABLE kb_attachment ADD COLUMN file_url VARCHAR(512) DEFAULT NULL",
                ]:
                    try:
                        cur.execute(ddl)
                    except Exception:
                        pass
                expert_img = json.dumps(["/static/uploads/zhuanjia.png"], ensure_ascii=False)
                case_img = json.dumps(["/static/uploads/youxiuanli.png"], ensure_ascii=False)
                try:
                    cur.execute(
                        "UPDATE kb_item SET image_urls = %s WHERE column_code = 'expert' AND image_urls IS NULL",
                        (expert_img,),
                    )
                    cur.execute(
                        "UPDATE kb_item SET image_urls = %s WHERE column_code = 'case' AND image_urls IS NULL",
                        (case_img,),
                    )
                except Exception:
                    pass

    def fetchall(self, sql: str, params: Sequence[Any] = ()) -> List[Dict[str, Any]]:
        with self._connect(with_db=True) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, tuple(params))
                return list(cur.fetchall())

    def fetchone(self, sql: str, params: Sequence[Any] = ()) -> Dict[str, Any] | None:
        with self._connect(with_db=True) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, tuple(params))
                return cur.fetchone()

    def execute(self, sql: str, params: Sequence[Any] = ()) -> int:
        with self._connect(with_db=True) as conn:
            with conn.cursor() as cur:
                return cur.execute(sql, tuple(params))

    def insert(self, sql: str, params: Sequence[Any] = ()) -> int:
        with self._connect(with_db=True) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, tuple(params))
                return int(cur.lastrowid or 0)

    def executemany(self, sql: str, params: Sequence[Sequence[Any]]) -> int:
        with self._connect(with_db=True) as conn:
            with conn.cursor() as cur:
                return cur.executemany(sql, params)


class SQLiteStorage(Storage):
    def __init__(self, path: Path) -> None:
        self._path = path

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self._path))
        conn.row_factory = sqlite3.Row
        return conn

    def ensure_schema(self) -> None:
        with self._connect() as conn:
            cur = conn.cursor()
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS kb_column (
                  code TEXT PRIMARY KEY,
                  name TEXT NOT NULL,
                  description TEXT DEFAULT NULL,
                  sort_no INTEGER NOT NULL DEFAULT 0,
                  created_at TEXT NOT NULL DEFAULT (datetime('now'))
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS kb_category (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  column_code TEXT NOT NULL,
                  name TEXT NOT NULL,
                  sort_no INTEGER NOT NULL DEFAULT 0,
                  created_at TEXT NOT NULL DEFAULT (datetime('now')),
                  UNIQUE (column_code, name)
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS kb_item (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  column_code TEXT NOT NULL,
                  title TEXT NOT NULL,
                  author TEXT DEFAULT NULL,
                  summary TEXT DEFAULT NULL,
                  content TEXT DEFAULT NULL,
                  publish_org TEXT DEFAULT NULL,
                  doc_no TEXT DEFAULT NULL,
                  publish_time TEXT DEFAULT NULL,
                      image_urls TEXT DEFAULT NULL,
                  views INTEGER NOT NULL DEFAULT 0,
                  download_count INTEGER NOT NULL DEFAULT 0,
                  favorite_count INTEGER NOT NULL DEFAULT 0,
                  created_at TEXT NOT NULL DEFAULT (datetime('now')),
                  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                  user_id TEXT DEFAULT NULL,
                  view_count INTEGER NOT NULL DEFAULT 0,
                  collect_count INTEGER NOT NULL DEFAULT 0,
                  subtitle TEXT DEFAULT NULL,
                  tags TEXT DEFAULT NULL,
                  is_top INTEGER NOT NULL DEFAULT 0,
                  seo_keywords TEXT DEFAULT NULL
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS kb_attachment (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  item_id INTEGER NOT NULL,
                  file_name TEXT NOT NULL,
                  file_type TEXT DEFAULT NULL,
                  file_size INTEGER NOT NULL DEFAULT 0,
                  file_url TEXT DEFAULT NULL,
                  created_at TEXT NOT NULL DEFAULT (datetime('now')),
                  FOREIGN KEY (item_id) REFERENCES kb_item(id) ON DELETE CASCADE
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS kb_item_category (
                  item_id INTEGER NOT NULL,
                  category_id INTEGER NOT NULL,
                  created_at TEXT NOT NULL DEFAULT (datetime('now')),
                  PRIMARY KEY (item_id, category_id),
                  FOREIGN KEY (item_id) REFERENCES kb_item(id) ON DELETE CASCADE,
                  FOREIGN KEY (category_id) REFERENCES kb_category(id) ON DELETE CASCADE
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS kb_favorite (
                  user_id TEXT NOT NULL,
                  item_id INTEGER NOT NULL,
                  created_at TEXT NOT NULL DEFAULT (datetime('now')),
                  PRIMARY KEY (user_id, item_id),
                  FOREIGN KEY (item_id) REFERENCES kb_item(id) ON DELETE CASCADE
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS kb_download_log (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id TEXT NOT NULL,
                  item_id INTEGER NOT NULL,
                  created_at TEXT NOT NULL DEFAULT (datetime('now')),
                  FOREIGN KEY (item_id) REFERENCES kb_item(id) ON DELETE CASCADE
                )
                """
            )

            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS t_scheme_project (
                  id TEXT PRIMARY KEY,
                  num TEXT DEFAULT NULL,
                  code TEXT DEFAULT NULL,
                  name TEXT DEFAULT NULL,
                  scheme_id TEXT DEFAULT NULL,
                  scheme_name TEXT DEFAULT NULL,
                  task_type TEXT DEFAULT NULL,
                  completion_status TEXT DEFAULT NULL,
                  construct_scale TEXT DEFAULT NULL,
                  construct_nature TEXT DEFAULT NULL,
                  construct_price REAL DEFAULT NULL,
                  construct_datetime_start TEXT DEFAULT NULL,
                  construct_datetime_end TEXT DEFAULT NULL,
                  construct_datetime TEXT DEFAULT NULL,
                  apply_status TEXT DEFAULT NULL,
                  user_id TEXT DEFAULT NULL,
                  user_name TEXT DEFAULT NULL,
                  province TEXT DEFAULT NULL,
                  city TEXT DEFAULT NULL,
                  district TEXT DEFAULT NULL,
                  province_name TEXT DEFAULT NULL,
                  city_name TEXT DEFAULT NULL,
                  district_name TEXT DEFAULT NULL,
                  rate_time TEXT DEFAULT NULL,
                  created_at TEXT NOT NULL DEFAULT (datetime('now'))
                )
                """
            )
            try:
                cur.execute("CREATE INDEX IF NOT EXISTS idx_scheme_project_name ON t_scheme_project(name)")
            except Exception:
                pass
            try:
                cur.execute("CREATE INDEX IF NOT EXISTS idx_scheme_project_district ON t_scheme_project(district_name)")
            except Exception:
                pass
            for ddl in [
                "ALTER TABLE kb_item ADD COLUMN author TEXT DEFAULT NULL",
                "ALTER TABLE kb_item ADD COLUMN download_count INTEGER NOT NULL DEFAULT 0",
                "ALTER TABLE kb_item ADD COLUMN favorite_count INTEGER NOT NULL DEFAULT 0",
                "ALTER TABLE kb_item ADD COLUMN image_urls TEXT DEFAULT NULL",
                "ALTER TABLE kb_item ADD COLUMN user_id TEXT DEFAULT NULL",
                "ALTER TABLE kb_item ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0",
                "ALTER TABLE kb_item ADD COLUMN collect_count INTEGER NOT NULL DEFAULT 0",
                "ALTER TABLE kb_item ADD COLUMN subtitle TEXT DEFAULT NULL",
                "ALTER TABLE kb_item ADD COLUMN tags TEXT DEFAULT NULL",
                "ALTER TABLE kb_item ADD COLUMN is_top INTEGER NOT NULL DEFAULT 0",
                "ALTER TABLE kb_item ADD COLUMN seo_keywords TEXT DEFAULT NULL",
                "ALTER TABLE kb_attachment ADD COLUMN file_url TEXT DEFAULT NULL",
            ]:
                try:
                    cur.execute(ddl)
                except Exception:
                    pass
            cur.executemany(
                """
                INSERT INTO kb_column(code, name, description, sort_no)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(code) DO UPDATE SET
                  name=excluded.name,
                  description=excluded.description,
                  sort_no=excluded.sort_no
                """,
                DEFAULT_COLUMNS,
            )
            cat_rows: List[Tuple[str, str, int]] = []
            for col_code, cats in DEFAULT_CATEGORIES.items():
                for cat_name, sort_no in cats:
                    cat_rows.append((col_code, cat_name, sort_no))
            cur.executemany(
                """
                INSERT INTO kb_category(column_code, name, sort_no)
                VALUES (?, ?, ?)
                ON CONFLICT(column_code, name) DO UPDATE SET
                  sort_no=excluded.sort_no
                """,
                cat_rows,
            )
            expert_img = json.dumps(["/static/uploads/zhuanjia.png"], ensure_ascii=False)
            case_img = json.dumps(["/static/uploads/youxiuanli.png"], ensure_ascii=False)
            try:
                cur.execute(
                    "UPDATE kb_item SET image_urls = ? WHERE column_code = 'expert' AND (image_urls IS NULL OR image_urls = '')",
                    (expert_img,),
                )
                cur.execute(
                    "UPDATE kb_item SET image_urls = ? WHERE column_code = 'case' AND (image_urls IS NULL OR image_urls = '')",
                    (case_img,),
                )
            except Exception:
                pass
            conn.commit()

    def fetchall(self, sql: str, params: Sequence[Any] = ()) -> List[Dict[str, Any]]:
        with self._connect() as conn:
            cur = conn.cursor()
            cur.execute(sql, tuple(params))
            rows = cur.fetchall()
            return [dict(r) for r in rows]

    def fetchone(self, sql: str, params: Sequence[Any] = ()) -> Dict[str, Any] | None:
        with self._connect() as conn:
            cur = conn.cursor()
            cur.execute(sql, tuple(params))
            row = cur.fetchone()
            return dict(row) if row else None

    def execute(self, sql: str, params: Sequence[Any] = ()) -> int:
        with self._connect() as conn:
            cur = conn.cursor()
            cur.execute(sql, tuple(params))
            conn.commit()
            return cur.rowcount

    def insert(self, sql: str, params: Sequence[Any] = ()) -> int:
        with self._connect() as conn:
            cur = conn.cursor()
            cur.execute(sql, tuple(params))
            conn.commit()
            return int(cur.lastrowid or 0)

    def executemany(self, sql: str, params: Sequence[Sequence[Any]]) -> int:
        with self._connect() as conn:
            cur = conn.cursor()
            cur.executemany(sql, params)
            conn.commit()
            return cur.rowcount


class HotRequest(BaseModel):
    limit: int = Field(default=10, ge=1, le=50)


class ItemsRequest(BaseModel):
    column_code: str = ""
    category_id: int | str | None = None
    q: str = ""
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    user_id: str = ""  # Added for filtering by user


class ArticleCreateRequest(BaseModel):
    title: str
    column_code: str
    content: str
    # Optional fields
    subtitle: str = ""
    author: str = ""
    summary: str = ""
    publish_org: str = ""
    doc_no: str = ""
    publish_time: str = ""
    image_urls: List[str] = []  # First one is cover
    user_id: str = ""
    tags: str = ""
    is_top: int = 0
    seo_keywords: str = ""
    category_id: int | str | None = None
    attachments: List[Dict[str, Any]] = []


class ArticleUpdateRequest(BaseModel):
    id: int | str
    title: str
    column_code: str
    content: str
    subtitle: str = ""
    author: str = ""
    summary: str = ""
    publish_org: str = ""
    doc_no: str = ""
    publish_time: str = ""
    image_urls: List[str] = []
    user_id: str = ""
    tags: str = ""
    is_top: int = 0
    seo_keywords: str = ""
    category_id: int | str | None = None
    attachments: List[Dict[str, Any]] = []

class MyArticleListRequest(BaseModel):
    user_id: str
    page: int = 1
    limit: int = 20
    q: str = ""

class ArticleDeleteRequest(BaseModel):
    id: int | str



class ArticleStatsUpdate(BaseModel):
    view_count: int | None = None
    collect_count: int | None = None


class DocParserService:
    @staticmethod
    def extract_text(file_path: str, file_type: str) -> str:
        text = ""
        try:
            if file_type == "pdf":
                reader = pypdf.PdfReader(file_path)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            elif file_type in ["doc", "docx"]:
                doc = docx.Document(file_path)
                for para in doc.paragraphs:
                    text += para.text + "\n"
        except Exception as e:
            print(f"Error extracting text: {e}")
        return text



class ItemRequest(BaseModel):
    id: int | str
    user_id: str = ""


class FavoriteToggleRequest(BaseModel):
    user_id: str = ""
    item_id: int | str


class DownloadAllRequest(BaseModel):
    user_id: str = ""
    item_id: int | str


class CategoryAddRequest(BaseModel):
    column_code: str = ""
    name: str = ""


app = FastAPI(title="Knowledge Base API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
STATIC_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

storage: Storage | None = None
storage_type: str = "unknown"
API_PREFIX = os.getenv("KB_API_PREFIX", "/kb-api")


def _init_storage() -> Tuple[Storage, str]:
    mode = (os.getenv("KB_STORAGE") or "auto").strip().lower()
    if mode not in {"auto", "mysql", "sqlite"}:
        mode = "auto"

    if mode in {"auto", "mysql"}:
        try:
            mysql = MySQLStorage()
            mysql.ensure_schema()
            return mysql, "mysql"
        except Exception as e:
            if mode == "mysql":
                raise
            try:
                sys.stderr.write(f"MySQL init failed, fallback to sqlite: {e}\n")
            except Exception:
                pass

    sqlite_env = os.getenv("KB_SQLITE_PATH")
    if sqlite_env:
        sqlite_path = Path(sqlite_env)
    else:
        candidates = [
            APP_BASE_DIR / "kb_backend" / "kb.sqlite3",
            APP_BASE_DIR / "kb.sqlite3",
            APP_BASE_DIR.parent / "kb_backend" / "kb.sqlite3",
            APP_BASE_DIR.parent / "kb.sqlite3",
        ]
        sqlite_path = next((p for p in candidates if p.exists()), APP_BASE_DIR / "kb.sqlite3")
    sqlite_path.parent.mkdir(parents=True, exist_ok=True)
    if not sqlite_path.exists():
        bundled = _bundled_path("kb.sqlite3")
        if bundled.exists() and bundled.is_file():
            try:
                shutil.copy2(str(bundled), str(sqlite_path))
            except Exception:
                pass
    sqlite = SQLiteStorage(sqlite_path)
    sqlite.ensure_schema()
    return sqlite, "sqlite"


def _seed_on_startup_enabled() -> bool:
    return _env_bool("KB_SEED_DEMO", True)


@app.on_event("startup")
def _startup() -> None:
    global storage, storage_type
    st, st_type = _init_storage()
    storage = st
    storage_type = st_type
    if _seed_on_startup_enabled():
        _seed_if_empty()
        _seed_attachments_if_empty()
        _seed_scheme_projects_if_empty()


def _seed_scheme_projects_if_empty() -> None:
    assert storage is not None
    cnt_row = storage.fetchone(
        "SELECT COUNT(1) AS cnt FROM t_scheme_project" if storage_type == "sqlite" else "SELECT COUNT(1) AS cnt FROM t_scheme_project",
        (),
    )
    cnt = int((cnt_row or {}).get("cnt", 0) or 0)
    if cnt > 0:
        return

    now = datetime.datetime.now()
    y = now.year
    prefix = now.strftime("%Y%m%d")
    district_names = ["小店区", "迎泽区", "杏花岭区", "万柏林区", "尖草坪区", "晋源区", "清徐县", "阳曲县", "娄烦县"]
    scales = ["新建", "改造", "扩建", "提升", "维修", "数字化改造"]
    natures = ["市政设施", "公共服务", "交通改善", "生态修复", "老旧小区改造", "产业园配套"]
    stage_options = ["0", "1", "2"]
    type_options = ["1", "2", "3", "4"]

    rows: List[Tuple[Any, ...]] = []
    for i in range(50):
        idx = f"{i+1:02d}"
        district_name = district_names[i % len(district_names)]
        years_start = str(y - (i % 2))
        years_end = str(y + (i % 3))
        price = float(80 + (i * 997) % 50000)
        rate = str(int((now - datetime.timedelta(days=(i % 40))).timestamp() * 1000))
        num = f"TY{prefix}{1000 + i}{idx}"
        name = f"基础项目{idx}-{district_name}-{scales[i % len(scales)]}"
        nature = natures[i % len(natures)]
        if len(nature) > 20:
            nature = nature[:20]
        rows.append(
            (
                str(uuid.uuid4()),
                num,
                f"CODE-{prefix}-{10000 + i}",
                name,
                "",
                "",
                type_options[i % len(type_options)],
                stage_options[i % len(stage_options)],
                scales[i % len(scales)],
                nature,
                price,
                years_start,
                years_end,
                f"{years_start}-{years_end}",
                str(i % 3),
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                district_name,
                rate,
            )
        )

    if storage_type == "sqlite":
        storage.executemany(
            """
            INSERT INTO t_scheme_project(
              id,num,code,name,scheme_id,scheme_name,task_type,completion_status,construct_scale,construct_nature,
              construct_price,construct_datetime_start,construct_datetime_end,construct_datetime,apply_status,user_id,user_name,
              province,city,district,province_name,city_name,district_name,rate_time
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            rows,
        )
    else:
        storage.executemany(
            """
            INSERT INTO t_scheme_project(
              id,num,code,name,scheme_id,scheme_name,task_type,completion_status,construct_scale,construct_nature,
              construct_price,construct_datetime_start,construct_datetime_end,construct_datetime,apply_status,user_id,user_name,
              province,city,district,province_name,city_name,district_name,rate_time
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            rows,
        )


@app.post(f"{API_PREFIX}/upload")
async def upload_file(file: UploadFile = File(...), type: str = Query(None)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename")
    
    upload_dir = Path(os.getenv("KB_UPLOAD_DIR") or (STATIC_DIR / "uploads"))
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    ext = file.filename.split(".")[-1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    file_path = upload_dir / unique_name
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
        
    url = f"/static/uploads/{unique_name}"
    
    if type == "simple":
        return {"code": 200, "data": url, "errno": 0}

    return {"code": 200, "data": {"url": url, "href": url}, "errno": 0}  # WangEditor format


@app.post(f"{API_PREFIX}/doc/extract-text")
async def extract_text(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename")
    
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "doc", "docx"]:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    temp_dir = Path(os.getenv("KB_TEMP_DIR") or (APP_BASE_DIR / "temp_uploads"))
    temp_dir.mkdir(exist_ok=True)
    temp_path = temp_dir / file.filename
    
    try:
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        
        text = DocParserService.extract_text(str(temp_path), ext)
        return {"code": 200, "data": {"text": text}}
    finally:
        if temp_path.exists():
            try:
                os.remove(temp_path)
            except:
                pass

@app.post(f"{API_PREFIX}/article/create")
async def create_article(req: ArticleCreateRequest):
    if not storage:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    
    # Prepare image_urls JSON
    img_json = json.dumps(req.image_urls, ensure_ascii=False)
    
    sql = """
        INSERT INTO kb_item (
            column_code, title, subtitle, author, summary, content, 
            publish_org, doc_no, publish_time, image_urls, user_id, 
            tags, is_top, seo_keywords, view_count, collect_count,
            views, favorite_count
        ) VALUES (
            ?, ?, ?, ?, ?, ?, 
            ?, ?, ?, ?, ?, 
            ?, ?, ?, 0, 0,
            0, 0
        )
    """
    params = [
        req.column_code, req.title, req.subtitle, req.author, req.summary, req.content,
        req.publish_org, req.doc_no, req.publish_time, img_json, req.user_id,
        req.tags, req.is_top, req.seo_keywords
    ]
    
    if storage_type == "mysql":
        sql = sql.replace("?", "%s")
    
    try:
        item_id = storage.insert(sql, params)
        atts = req.attachments if isinstance(req.attachments, list) else []
        if item_id and atts:
            insert_sql = "INSERT INTO kb_attachment(item_id, file_name, file_type, file_size, file_url) VALUES (?, ?, ?, ?, ?)"
            if storage_type == "mysql":
                insert_sql = insert_sql.replace("?", "%s")
            rows: List[Tuple[Any, Any, Any, Any, Any]] = []
            for a in atts:
                if not isinstance(a, dict):
                    continue
                file_name = str(a.get("file_name") or "").strip()
                if not file_name:
                    continue
                file_type = str(a.get("file_type") or "").strip()
                file_size = int(a.get("file_size") or 0)
                file_url = _normalize_attachment_url(str(a.get("url") or a.get("file_url") or "").strip())
                rows.append((item_id, file_name, file_type, file_size, file_url))
            if rows:
                storage.executemany(insert_sql, rows)
        return {"code": 200, "data": {"id": item_id}}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post(f"{API_PREFIX}/article/update")
async def update_article(req: ArticleUpdateRequest):
    if not storage:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    
    img_json = json.dumps(req.image_urls, ensure_ascii=False)
    
    sql = """
        UPDATE kb_item SET
            column_code=?, title=?, subtitle=?, author=?, summary=?, content=?,
            publish_org=?, doc_no=?, publish_time=?, image_urls=?, user_id=?,
            tags=?, is_top=?, seo_keywords=?
        WHERE id=?
    """
    params = [
        req.column_code, req.title, req.subtitle, req.author, req.summary, req.content,
        req.publish_org, req.doc_no, req.publish_time, img_json, req.user_id,
        req.tags, req.is_top, req.seo_keywords, req.id
    ]
    
    if storage_type == "mysql":
        sql = sql.replace("?", "%s")
        
    storage.execute(sql, params)

    item_id = _as_int(req.id)
    if item_id:
        storage.execute(
            "DELETE FROM kb_attachment WHERE item_id = ?" if storage_type == "sqlite" else "DELETE FROM kb_attachment WHERE item_id = %s",
            (item_id,),
        )
        atts = req.attachments if isinstance(req.attachments, list) else []
        if atts:
            insert_sql = "INSERT INTO kb_attachment(item_id, file_name, file_type, file_size, file_url) VALUES (?, ?, ?, ?, ?)"
            if storage_type == "mysql":
                insert_sql = insert_sql.replace("?", "%s")
            rows2: List[Tuple[Any, Any, Any, Any, Any]] = []
            for a in atts:
                if not isinstance(a, dict):
                    continue
                file_name = str(a.get("file_name") or "").strip()
                if not file_name:
                    continue
                file_type = str(a.get("file_type") or "").strip()
                file_size = int(a.get("file_size") or 0)
                file_url = _normalize_attachment_url(str(a.get("url") or a.get("file_url") or "").strip())
                rows2.append((item_id, file_name, file_type, file_size, file_url))
            if rows2:
                storage.executemany(insert_sql, rows2)

    return {"code": 200, "data": {"id": req.id}}

@app.post(f"{API_PREFIX}/article/delete")
async def delete_article(req: ArticleDeleteRequest):
    if not storage:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    
    sql = "DELETE FROM kb_item WHERE id=?"
    if storage_type == "mysql":
        sql = sql.replace("?", "%s")
        
    storage.execute(sql, [req.id])
    return {"code": 200, "message": "Success"}

@app.post(f"{API_PREFIX}/article/my-list")
async def my_article_list(req: MyArticleListRequest):
    if not storage:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    
    user_id = req.user_id
    page = req.page
    limit = req.limit
    q = req.q

    offset = (page - 1) * limit
    where_clause = "WHERE user_id = ?"
    params = [user_id]
    
    if q:
        where_clause += " AND (title LIKE ? OR summary LIKE ?)"
        params.extend([f"%{q}%", f"%{q}%"])
        
    sql = f"""
        SELECT id, title, column_code, author, publish_time, view_count, collect_count, is_top, created_at
        FROM kb_item
        {where_clause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    """
    
    count_sql = f"SELECT COUNT(*) as total FROM kb_item {where_clause}"
    
    if storage_type == "mysql":
        sql = sql.replace("?", "%s")
        count_sql = count_sql.replace("?", "%s")
        
    params_limit = params + [limit, offset]
    
    rows = storage.fetchall(sql, params_limit)
    total_row = storage.fetchone(count_sql, params)
    total = total_row["total"] if total_row else 0
    
    return {"code": 200, "data": {"items": rows, "total": total, "page": page, "limit": limit}}

@app.get(f"{API_PREFIX}/article/{{item_id}}/stats")
async def get_stats(item_id: int):
    if not storage:
        raise HTTPException(status_code=500, detail="Storage not initialized")
        
    sql = "SELECT view_count, collect_count FROM kb_item WHERE id=?"
    if storage_type == "mysql":
        sql = sql.replace("?", "%s")
        
    row = storage.fetchone(sql, [item_id])
    if not row:
        raise HTTPException(status_code=404, detail="Article not found")
        
    return {"code": 200, "data": row}

@app.post(f"{API_PREFIX}/article/{{item_id}}/stats")
async def update_stats(item_id: int, stats: ArticleStatsUpdate):
    if not storage:
        raise HTTPException(status_code=500, detail="Storage not initialized")
        
    updates = []
    params = []
    
    if stats.view_count is not None:
        updates.append("view_count = ?")
        updates.append("views = ?") # Sync with legacy field
        params.append(stats.view_count)
        params.append(stats.view_count)
        
    if stats.collect_count is not None:
        updates.append("collect_count = ?")
        updates.append("favorite_count = ?") # Sync with legacy field
        params.append(stats.collect_count)
        params.append(stats.collect_count)
        
    if not updates:
        return {"code": 200, "message": "No changes"}
        
    sql = f"UPDATE kb_item SET {', '.join(updates)} WHERE id=?"
    params.append(item_id)
    
    if storage_type == "mysql":
        sql = sql.replace("?", "%s")
        
    storage.execute(sql, params)
    return {"code": 200, "message": "Success"}
    _seed_attachments_if_empty()


def _as_int(v: Any) -> int | None:
    if v is None:
        return None
    if isinstance(v, int):
        return v
    s = str(v).strip()
    if not s:
        return None
    if s.isdigit():
        return int(s)
    return None


def _normalize_image_urls(v: Any) -> List[str]:
    if v is None:
        return []
    if isinstance(v, (list, tuple)):
        return [str(x) for x in v if str(x).strip()]
    if isinstance(v, (bytes, bytearray)):
        try:
            v = v.decode("utf-8", errors="ignore")
        except Exception:
            v = str(v)
    s = str(v).strip()
    if not s:
        return []
    try:
        obj = json.loads(s)
        if isinstance(obj, list):
            return [str(x) for x in obj if str(x).strip()]
    except Exception:
        pass
    return [s]


def _pick_page(arr: List[Dict[str, Any]], page: int, limit: int) -> List[Dict[str, Any]]:
    safe_page = page if page and page > 0 else 1
    safe_limit = limit if limit and limit > 0 else 20
    start = (safe_page - 1) * safe_limit
    return arr[start : start + safe_limit]


def _build_long_content(title: str, area: str, topic: str) -> str:
    p1 = (
        f"为更好推进{area}相关工作，结合{topic}重点，现将有关情况梳理如下："
        "本材料用于演示展示效果，内容为示例文本，可根据实际项目材料替换。"
        "在实施过程中，应坚持问题导向、目标导向与结果导向相统一，做到数据可追溯、过程可检查、成效可评估。"
        "同时强调部门协同、上下联动与公众参与，形成可复制、可推广的工作机制与经验做法。"
    )
    p2 = (
        "一是完善组织保障。建立统筹协调机制，明确牵头部门与责任分工，形成“任务清单—责任清单—时限清单”。"
        "二是夯实数据底座。统一口径标准，推动数据治理与共享交换，确保基础数据真实、准确、完整、及时。"
        "三是优化实施路径。围绕重点片区、重点项目与重点指标，分阶段推进、分步骤落地，强化过程管理与闭环整改。"
        "四是强化风险防控。关注资金、工程、运营与安全等风险点，完善预案与应急处置机制，守住底线。"
    )
    p3 = (
        "在指标体系方面，建议从空间品质、公共服务、市政设施、生态修复、韧性安全等维度进行综合评估；"
        "在项目策划方面，兼顾短期可落地与长期可持续，既突出民生获得感，也注重城市发展质量；"
        "在成果应用方面，加强成果转化，推动评估结论进入项目库、进入年度计划、进入考核体系，形成常态化工作。"
    )
    blocks: List[str] = []
    for i in range(18):
        blocks.append(f"<p>{p1 if i % 3 == 0 else (p2 if i % 3 == 1 else p3)}</p>")
    head = f"<p><strong>{title}</strong></p><p>领域：{area}；主题：{topic}。</p>"
    return head + "".join(blocks)


def _seed_if_empty() -> None:
    assert storage is not None
    cnt_row = storage.fetchone("SELECT COUNT(1) AS cnt FROM kb_item", ())
    cnt = int((cnt_row or {}).get("cnt", 0) or 0)
    if cnt > 0:
        return

    cols = storage.fetchall("SELECT code, name FROM kb_column ORDER BY sort_no ASC", ())
    cat_rows = storage.fetchall(
        """
        SELECT id, column_code, name
        FROM kb_category
        ORDER BY column_code ASC, sort_no ASC, id ASC
        """,
        (),
    )
    cat_map: Dict[str, List[Dict[str, Any]]] = {}
    for r in cat_rows:
        cat_map.setdefault(r["column_code"], []).append(r)

    orgs = [
        "住房和城乡建设局",
        "自然资源和规划局",
        "城市更新中心",
        "市政工程管理处",
        "人居环境改善专班",
        "城市体检评估工作组",
        "城乡建设研究院",
        "规划设计研究院",
    ]
    topics = ["指标体系", "数据治理", "空间品质", "公共服务", "老旧小区", "历史街区", "市政设施", "生态修复", "风险防控", "实施路径"]
    areas = ["城市体检", "城市更新", "城市设计", "人居环境改善", "韧性城市", "智慧城市"]

    from datetime import date, timedelta

    to_insert: List[Tuple[str, str, str, str, str, str, str, str, Any, int]] = []
    for c in cols:
        col_code = c["code"]
        col_name = c["name"]
        for i in range(1, 21):
            d = date.today() - timedelta(days=(i * 6 + len(col_code)))
            publish_time = d.strftime("%Y-%m-%d")
            area = areas[(i + len(col_code)) % len(areas)]
            t = topics[(i + 3) % len(topics)]
            title = f"{col_name}：{area}{t}条目{i}"
            summary = f"围绕{area}的{t}整理要点与实施建议。"
            content = _build_long_content(title=title, area=area, topic=t)
            org = orgs[(i + len(col_code)) % len(orgs)]
            doc_no = f"KB-{col_code.upper()}-{i:03d}"
            views = 200 + (20 - i) * 13 + len(col_code) * 7
            author = "系统管理员" if i % 2 == 0 else "业务专员"
            image_urls = None
            if col_code == "expert":
                image_urls = json.dumps(["/static/uploads/zhuanjia.png"], ensure_ascii=False)
            elif col_code == "case":
                image_urls = json.dumps(["/static/uploads/youxiuanli.png"], ensure_ascii=False)
            to_insert.append((col_code, title, author, summary, content, org, doc_no, publish_time, image_urls, views))

    if storage_type == "sqlite":
        storage.executemany(
            """
            INSERT INTO kb_item(column_code, title, author, summary, content, publish_org, doc_no, publish_time, image_urls, views)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            to_insert,
        )
        rows = storage.fetchall("SELECT id, column_code FROM kb_item ORDER BY id ASC", ())
        rels: List[Tuple[int, int]] = []
        for r in rows:
            item_id = int(r["id"])
            col_code = r["column_code"]
            cats = cat_map.get(col_code, [])
            if not cats:
                continue
            picked = [cats[(item_id - 1) % len(cats)], cats[item_id % len(cats)]]
            if item_id % 3 == 0:
                picked.append(cats[(item_id + 1) % len(cats)])
            uniq: List[int] = []
            for p in picked:
                cid = int(p["id"])
                if cid not in uniq:
                    uniq.append(cid)
            for cid in uniq:
                rels.append((item_id, cid))
        storage.executemany(
            """
            INSERT OR IGNORE INTO kb_item_category(item_id, category_id)
            VALUES (?, ?)
            """,
            rels,
        )
    else:
        storage.executemany(
            """
            INSERT INTO kb_item(column_code, title, author, summary, content, publish_org, doc_no, publish_time, image_urls, views)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            to_insert,
        )
        rows = storage.fetchall("SELECT id, column_code FROM kb_item ORDER BY id ASC", ())
        rels: List[Tuple[int, int]] = []
        for r in rows:
            item_id = int(r["id"])
            col_code = r["column_code"]
            cats = cat_map.get(col_code, [])
            if not cats:
                continue
            picked = [cats[(item_id - 1) % len(cats)], cats[item_id % len(cats)]]
            if item_id % 3 == 0:
                picked.append(cats[(item_id + 1) % len(cats)])
            uniq: List[int] = []
            for p in picked:
                cid = int(p["id"])
                if cid not in uniq:
                    uniq.append(cid)
            for cid in uniq:
                rels.append((item_id, cid))
        storage.executemany(
            """
            INSERT IGNORE INTO kb_item_category(item_id, category_id)
            VALUES (%s, %s)
            """,
            rels,
        )


def _seed_attachments_if_empty() -> None:
    assert storage is not None
    cnt_row = storage.fetchone("SELECT COUNT(1) AS cnt FROM kb_attachment", ())
    cnt = int((cnt_row or {}).get("cnt", 0) or 0)
    if cnt > 0:
        return

    items = storage.fetchall(
        "SELECT id, title, column_code FROM kb_item ORDER BY id ASC LIMIT 200" if storage_type == "sqlite" else "SELECT id, title, column_code FROM kb_item ORDER BY id ASC LIMIT 200",
        (),
    )
    rows: List[Tuple[Any, str, str, int, str]] = []
    for it in items:
        item_id = int(it["id"])
        title = str(it.get("title") or "附件")
        col_code = str(it.get("column_code") or "kb")
        base = f"{col_code}-{item_id}"
        for idx in range(1, 4):
            file_type = "pdf" if idx == 1 else ("docx" if idx == 2 else "xlsx")
            file_name = f"{title[:20]}-{base}-附件{idx}.{file_type}"
            file_size = 120_000 * idx + (item_id % 97) * 100
            rows.append((item_id, file_name, file_type, file_size, ""))

    if storage_type == "sqlite":
        storage.executemany(
            """
            INSERT INTO kb_attachment(item_id, file_name, file_type, file_size, file_url)
            VALUES (?, ?, ?, ?, ?)
            """,
            rows,
        )
    else:
        storage.executemany(
            """
            INSERT INTO kb_attachment(item_id, file_name, file_type, file_size, file_url)
            VALUES (%s, %s, %s, %s, %s)
            """,
            rows,
        )


@app.post(f"{API_PREFIX}/columns")
def columns() -> Dict[str, Any]:
    assert storage is not None
    if storage_type == "mysql":
        rows = storage.fetchall(
            """
            SELECT c.code, c.name, c.description AS `desc`, c.sort_no,
                   (SELECT COUNT(1) FROM kb_item i WHERE i.column_code = c.code) AS count
            FROM kb_column c
            ORDER BY c.sort_no ASC
            """
        )
    else:
        rows = storage.fetchall(
            """
            SELECT c.code, c.name, c.description AS "desc", c.sort_no,
                   (SELECT COUNT(1) FROM kb_item i WHERE i.column_code = c.code) AS count
            FROM kb_column c
            ORDER BY c.sort_no ASC
            """
        )
    cats = storage.fetchall(
        """
        SELECT id, column_code, name, sort_no
        FROM kb_category
        ORDER BY column_code ASC, sort_no ASC, id ASC
        """,
        (),
    )
    cat_map: Dict[str, List[Dict[str, Any]]] = {}
    for c in cats:
        cat_map.setdefault(c["column_code"], []).append(c)
    columns = []
    for r in rows:
        code = r.get("code")
        children = [{"id": str(x["id"]), "name": x["name"]} for x in cat_map.get(code, [])]
        columns.append({**r, "children": children})
    return {"code": 200, "data": {"columns": columns}}


@app.post(f"{API_PREFIX}/category/add")
def category_add(req: CategoryAddRequest) -> Dict[str, Any]:
    assert storage is not None
    column_code = (req.column_code or "").strip()
    name = (req.name or "").strip()
    if not column_code or not name:
        return {"code": 400, "data": {"category": None}}

    exists = storage.fetchone(
        "SELECT id, column_code, name, sort_no FROM kb_category WHERE column_code = ? AND name = ? LIMIT 1"
        if storage_type == "sqlite"
        else "SELECT id, column_code, name, sort_no FROM kb_category WHERE column_code = %s AND name = %s LIMIT 1",
        (column_code, name),
    )
    if exists:
        return {"code": 200, "data": {"category": {**exists, "id": str(exists["id"])}}}

    if storage_type == "sqlite":
        storage.execute(
            """
            INSERT INTO kb_category(column_code, name, sort_no)
            VALUES (?, ?, 999)
            """,
            (column_code, name),
        )
    else:
        storage.execute(
            """
            INSERT INTO kb_category(column_code, name, sort_no)
            VALUES (%s, %s, 999)
            """,
            (column_code, name),
        )
    row = storage.fetchone(
        "SELECT id, column_code, name, sort_no FROM kb_category WHERE column_code = ? AND name = ? LIMIT 1"
        if storage_type == "sqlite"
        else "SELECT id, column_code, name, sort_no FROM kb_category WHERE column_code = %s AND name = %s LIMIT 1",
        (column_code, name),
    )
    if row:
        row["id"] = str(row["id"])
    return {"code": 200, "data": {"category": row}}


@app.post(f"{API_PREFIX}/favorite/toggle")
def favorite_toggle(req: FavoriteToggleRequest) -> Dict[str, Any]:
    assert storage is not None
    user_id = (req.user_id or "").strip()
    item_id = _as_int(req.item_id)
    if not user_id or not item_id:
        return {"code": 400, "data": {"is_favorited": False, "favorite_count": 0}}

    exists = storage.fetchone(
        "SELECT 1 AS ok FROM kb_favorite WHERE user_id = ? AND item_id = ? LIMIT 1"
        if storage_type == "sqlite"
        else "SELECT 1 AS ok FROM kb_favorite WHERE user_id = %s AND item_id = %s LIMIT 1",
        (user_id, item_id),
    )
    if exists:
        storage.execute(
            "DELETE FROM kb_favorite WHERE user_id = ? AND item_id = ?"
            if storage_type == "sqlite"
            else "DELETE FROM kb_favorite WHERE user_id = %s AND item_id = %s",
            (user_id, item_id),
        )
        is_favorited = False
    else:
        storage.execute(
            "INSERT OR IGNORE INTO kb_favorite(user_id, item_id) VALUES(?, ?)"
            if storage_type == "sqlite"
            else "INSERT IGNORE INTO kb_favorite(user_id, item_id) VALUES(%s, %s)",
            (user_id, item_id),
        )
        is_favorited = True

    cnt_row = storage.fetchone(
        "SELECT COUNT(1) AS cnt FROM kb_favorite WHERE item_id = ?"
        if storage_type == "sqlite"
        else "SELECT COUNT(1) AS cnt FROM kb_favorite WHERE item_id = %s",
        (item_id,),
    )
    favorite_count = int((cnt_row or {}).get("cnt", 0) or 0)
    storage.execute(
        "UPDATE kb_item SET favorite_count = ? WHERE id = ?"
        if storage_type == "sqlite"
        else "UPDATE kb_item SET favorite_count = %s WHERE id = %s",
        (favorite_count, item_id),
    )
    return {"code": 200, "data": {"is_favorited": is_favorited, "favorite_count": favorite_count}}


@app.post(f"{API_PREFIX}/item/download_all")
def download_all(req: DownloadAllRequest) -> Dict[str, Any]:
    assert storage is not None
    user_id = (req.user_id or "").strip() or "anonymous"
    item_id = _as_int(req.item_id)
    if not item_id:
        return {"code": 400, "data": {"download_url": "", "download_count": 0}}

    storage.execute(
        "INSERT INTO kb_download_log(user_id, item_id) VALUES(?, ?)"
        if storage_type == "sqlite"
        else "INSERT INTO kb_download_log(user_id, item_id) VALUES(%s, %s)",
        (user_id, item_id),
    )
    storage.execute(
        "UPDATE kb_item SET download_count = download_count + 1, updated_at = datetime('now') WHERE id = ?"
        if storage_type == "sqlite"
        else "UPDATE kb_item SET download_count = download_count + 1 WHERE id = %s",
        (item_id,),
    )
    row = storage.fetchone(
        "SELECT download_count FROM kb_item WHERE id = ? LIMIT 1"
        if storage_type == "sqlite"
        else "SELECT download_count FROM kb_item WHERE id = %s LIMIT 1",
        (item_id,),
    )
    download_count = int((row or {}).get("download_count", 0) or 0)
    return {
        "code": 200,
        "data": {
            "download_url": f"{API_PREFIX}/item/download_file?item_id={item_id}",
            "download_count": download_count,
        },
    }


@app.get(f"{API_PREFIX}/item/download_file")
def download_file(item_id: int = Query(..., ge=1)) -> StreamingResponse:
    assert storage is not None
    rows = storage.fetchall(
        "SELECT file_name, file_type, file_size, file_url FROM kb_attachment WHERE item_id = ? ORDER BY id ASC"
        if storage_type == "sqlite"
        else "SELECT file_name, file_type, file_size, file_url FROM kb_attachment WHERE item_id = %s ORDER BY id ASC",
        (item_id,),
    )
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        if not rows:
            zf.writestr("README.txt", "no attachments")
        else:
            missing: List[str] = []
            name_seen: Dict[str, int] = {}
            for r in rows:
                name = str(r.get("file_name") or "file.bin")
                if name in name_seen:
                    name_seen[name] += 1
                    stem, dot, ext = name.rpartition(".")
                    if dot:
                        name = f"{stem}({name_seen[name]}).{ext}"
                    else:
                        name = f"{name}({name_seen[name]})"
                else:
                    name_seen[name] = 0

                url = str(r.get("file_url") or "").strip()
                local_path = _resolve_attachment_path(url)
                if not local_path:
                    local_path = _resolve_upload_by_meta(name, r.get("file_size"))
                if local_path:
                    zf.write(str(local_path), arcname=name)
                else:
                    missing.append(name)
            if missing:
                zf.writestr("README.txt", "missing files:\n" + "\n".join(missing))
    buf.seek(0)
    headers = {"Content-Disposition": f'attachment; filename="attachments-{item_id}.zip"'}
    return StreamingResponse(buf, media_type="application/zip", headers=headers)


class AdminUserFavoritesRequest(BaseModel):
    user_id: str = ""


@app.post(f"{API_PREFIX}/admin/user-favorites")
def admin_user_favorites(req: AdminUserFavoritesRequest) -> Dict[str, Any]:
    assert storage is not None
    user_id = (req.user_id or "").strip() or "anonymous"
    items_sql = """
    SELECT i.id, i.title, i.column_code, COALESCE(c.name, i.column_code) AS column_name,
           i.publish_time AS publish_time, i.download_count AS download_count, i.favorite_count AS favorite_count,
           f.created_at AS favorited_at
    FROM kb_favorite f
    JOIN kb_item i ON i.id = f.item_id
    LEFT JOIN kb_column c ON c.code = i.column_code
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
    """
    stats_sql = """
    SELECT i.column_code AS column_code, COALESCE(c.name, i.column_code) AS column_name, COUNT(1) AS cnt
    FROM kb_favorite f
    JOIN kb_item i ON i.id = f.item_id
    LEFT JOIN kb_column c ON c.code = i.column_code
    WHERE f.user_id = ?
    GROUP BY i.column_code, c.name
    ORDER BY cnt DESC
    """
    if storage_type == "mysql":
        items_sql = items_sql.replace("?", "%s").replace("i.publish_time AS publish_time", "DATE_FORMAT(i.publish_time, '%%Y-%%m-%%d') AS publish_time")
        stats_sql = stats_sql.replace("?", "%s")
    items = storage.fetchall(items_sql, (user_id,))
    stats_rows = storage.fetchall(stats_sql, (user_id,))
    series = [{"name": s.get("column_name"), "value": int(s.get("cnt") or 0)} for s in stats_rows]
    return {"code": 200, "data": {"items": items, "stats": series, "total": len(items)}}


@app.post(f"{API_PREFIX}/hot")
def hot(req: HotRequest) -> Dict[str, Any]:
    assert storage is not None
    rows = storage.fetchall(
        """
        SELECT i.id, i.title, i.summary, i.column_code, c.name AS column_name, i.views, i.created_at
        FROM kb_item i
        LEFT JOIN kb_column c ON c.code = i.column_code
        ORDER BY i.views DESC, i.created_at DESC
        LIMIT ?
        """
        if storage_type == "sqlite"
        else """
        SELECT i.id, i.title, i.summary, i.column_code, c.name AS column_name, i.views, i.created_at
        FROM kb_item i
        LEFT JOIN kb_column c ON c.code = i.column_code
        ORDER BY i.views DESC, i.created_at DESC
        LIMIT %s
        """,
        (req.limit,),
    )
    return {"code": 200, "data": {"items": rows}}


@app.post(f"{API_PREFIX}/items")
def items(req: ItemsRequest) -> Dict[str, Any]:
    assert storage is not None
    where: List[str] = []
    params: List[Any] = []
    if req.column_code:
        where.append("i.column_code = ? " if storage_type == "sqlite" else "i.column_code = %s")
        params.append(req.column_code)
    cat_id = _as_int(req.category_id)
    if cat_id:
        where.append(
            "EXISTS (SELECT 1 FROM kb_item_category ic WHERE ic.item_id = i.id AND ic.category_id = ?)"
            if storage_type == "sqlite"
            else "EXISTS (SELECT 1 FROM kb_item_category ic WHERE ic.item_id = i.id AND ic.category_id = %s)"
        )
        params.append(cat_id)
    if req.q:
        where.append(
            "(i.title LIKE ? OR i.summary LIKE ? OR i.content LIKE ? OR i.publish_org LIKE ? OR i.doc_no LIKE ?)"
            if storage_type == "sqlite"
            else "(i.title LIKE %s OR i.summary LIKE %s OR i.content LIKE %s OR i.publish_org LIKE %s OR i.doc_no LIKE %s)"
        )
        like = f"%{req.q}%"
        params.extend([like, like, like, like, like])
    where_sql = (" WHERE " + " AND ".join([w.strip() for w in where])) if where else ""
    offset = (req.page - 1) * req.limit

    total_row = storage.fetchone(f"SELECT COUNT(1) AS total FROM kb_item i {where_sql}", tuple(params))
    total = int((total_row or {}).get("total", 0))

    if storage_type == "sqlite":
        rows = storage.fetchall(
            f"""
            SELECT i.id, i.title, i.author, i.summary, i.publish_org, i.doc_no,
                   i.publish_time AS publish_time,
                   i.image_urls, i.views, i.download_count, i.favorite_count,
                   i.column_code, c.name AS column_name, i.created_at, i.updated_at
            FROM kb_item i
            LEFT JOIN kb_column c ON c.code = i.column_code
            {where_sql}
            ORDER BY i.created_at DESC
            LIMIT ? OFFSET ?
            """,
            tuple(params + [req.limit, offset]),
        )
    else:
        rows = storage.fetchall(
            f"""
            SELECT i.id, i.title, i.author, i.summary, i.publish_org, i.doc_no,
                   DATE_FORMAT(i.publish_time, '%%Y-%%m-%%d') AS publish_time,
                   i.image_urls, i.views, i.download_count, i.favorite_count,
                   i.column_code, c.name AS column_name, i.created_at, i.updated_at
            FROM kb_item i
            LEFT JOIN kb_column c ON c.code = i.column_code
            {where_sql}
            ORDER BY i.created_at DESC
            LIMIT %s OFFSET %s
            """,
            tuple(params + [req.limit, offset]),
        )
    ids = [int(r["id"]) for r in rows]
    cat_by_item: Dict[int, List[Dict[str, Any]]] = {}
    if ids:
        if storage_type == "sqlite":
            placeholders = ",".join(["?"] * len(ids))
            rel_rows = storage.fetchall(
                f"""
                SELECT ic.item_id, c.id AS category_id, c.name AS category_name
                FROM kb_item_category ic
                JOIN kb_category c ON c.id = ic.category_id
                WHERE ic.item_id IN ({placeholders})
                ORDER BY ic.item_id ASC, c.sort_no ASC, c.id ASC
                """,
                tuple(ids),
            )
        else:
            placeholders = ",".join(["%s"] * len(ids))
            rel_rows = storage.fetchall(
                f"""
                SELECT ic.item_id, c.id AS category_id, c.name AS category_name
                FROM kb_item_category ic
                JOIN kb_category c ON c.id = ic.category_id
                WHERE ic.item_id IN ({placeholders})
                ORDER BY ic.item_id ASC, c.sort_no ASC, c.id ASC
                """,
                tuple(ids),
            )
        for rr in rel_rows:
            cat_by_item.setdefault(int(rr["item_id"]), []).append(rr)

    out_items: List[Dict[str, Any]] = []
    for r in rows:
        item_id = int(r["id"])
        cats = cat_by_item.get(item_id, [])
        category_ids = [str(c["category_id"]) for c in cats]
        category_names = [c["category_name"] for c in cats]
        first_id = category_ids[0] if category_ids else ""
        first_name = category_names[0] if category_names else ""
        out_items.append(
            {
                **r,
                "image_urls": _normalize_image_urls(r.get("image_urls")),
                "category_id": first_id,
                "category_name": first_name,
                "category_ids": category_ids,
                "category_names": category_names,
            }
        )
    return {"code": 200, "data": {"total": total, "items": out_items}}


@app.post(f"{API_PREFIX}/item")
def item(req: ItemRequest) -> Dict[str, Any]:
    assert storage is not None
    item_id = _as_int(req.id)
    if not item_id:
        return {"code": 400, "data": {"item": {}}}
    if storage_type == "sqlite":
        storage.execute("UPDATE kb_item SET views = views + 1, updated_at = datetime('now') WHERE id = ?", (item_id,))
        row = storage.fetchone(
            """
            SELECT i.id, i.title, i.author, i.summary, i.content, i.publish_org, i.doc_no,
                   i.publish_time AS publish_time,
                   i.image_urls, i.views, i.download_count, i.favorite_count,
                   i.column_code, c.name AS column_name, i.created_at, i.updated_at
            FROM kb_item i
            LEFT JOIN kb_column c ON c.code = i.column_code
            WHERE i.id = ?
            LIMIT 1
            """,
            (item_id,),
        )
    else:
        storage.execute("UPDATE kb_item SET views = views + 1 WHERE id = %s", (item_id,))
        row = storage.fetchone(
            """
            SELECT i.id, i.title, i.author, i.summary, i.content, i.publish_org, i.doc_no,
                   DATE_FORMAT(i.publish_time, '%%Y-%%m-%%d') AS publish_time,
                   i.image_urls, i.views, i.download_count, i.favorite_count,
                   i.column_code, c.name AS column_name, i.created_at, i.updated_at
            FROM kb_item i
            LEFT JOIN kb_column c ON c.code = i.column_code
            WHERE i.id = %s
            LIMIT 1
            """,
            (item_id,),
        )
    if not row:
        return {"code": 200, "data": {"item": {}}}
    user_id = (req.user_id or "").strip()
    cat_rows = storage.fetchall(
        """
        SELECT c.id AS category_id, c.name AS category_name
        FROM kb_item_category ic
        JOIN kb_category c ON c.id = ic.category_id
        WHERE ic.item_id = ?
        ORDER BY c.sort_no ASC, c.id ASC
        """
        if storage_type == "sqlite"
        else """
        SELECT c.id AS category_id, c.name AS category_name
        FROM kb_item_category ic
        JOIN kb_category c ON c.id = ic.category_id
        WHERE ic.item_id = %s
        ORDER BY c.sort_no ASC, c.id ASC
        """,
        (item_id,),
    )
    att_rows = storage.fetchall(
        "SELECT id, file_name, file_type, file_size, file_url AS url FROM kb_attachment WHERE item_id = ? ORDER BY id ASC"
        if storage_type == "sqlite"
        else "SELECT id, file_name, file_type, file_size, file_url AS url FROM kb_attachment WHERE item_id = %s ORDER BY id ASC",
        (item_id,),
    )
    is_favorited = False
    if user_id:
        fav = storage.fetchone(
            "SELECT 1 AS ok FROM kb_favorite WHERE user_id = ? AND item_id = ? LIMIT 1"
            if storage_type == "sqlite"
            else "SELECT 1 AS ok FROM kb_favorite WHERE user_id = %s AND item_id = %s LIMIT 1",
            (user_id, item_id),
        )
        is_favorited = bool(fav)
    category_ids = [str(c["category_id"]) for c in cat_rows]
    category_names = [c["category_name"] for c in cat_rows]
    first_id = category_ids[0] if category_ids else ""
    first_name = category_names[0] if category_names else ""
    out = {
        **row,
        "image_urls": _normalize_image_urls(row.get("image_urls")),
        "category_id": first_id,
        "category_name": first_name,
        "category_ids": category_ids,
        "category_names": category_names,
        "is_favorited": is_favorited,
        "attachments": [
            {
                "id": str(a.get("id")),
                "file_name": a.get("file_name"),
                "file_type": a.get("file_type"),
                "file_size": a.get("file_size"),
                "url": a.get("url"),
            }
            for a in att_rows
        ],
    }
    return {"code": 200, "data": {"item": out}}


def _sp_placeholder() -> str:
    return "?" if storage_type == "sqlite" else "%s"


def _sp_build_where(
    keyword: str | None,
    province: str | None,
    city: str | None,
    project_stage: str | None,
    project_type: str | None,
    invest_level: str | None,
    start: str | None,
    end: str | None,
    ids: str | None,
) -> Tuple[str, List[Any]]:
    where = ["1=1"]
    params: List[Any] = []
    ph = _sp_placeholder()
    if keyword:
        where.append(f"name LIKE {ph}")
        params.append(f"%{keyword}%")
    if province:
        where.append(f"province = {ph}")
        params.append(province)
    if city:
        where.append(f"city = {ph}")
        params.append(city)
    if project_stage:
        where.append(f"completion_status = {ph}")
        params.append(project_stage)
    if project_type:
        where.append(f"task_type = {ph}")
        params.append(project_type)
    if start:
        where.append(f"construct_datetime_start >= {ph}")
        params.append(start)
    if end:
        where.append(f"construct_datetime_end <= {ph}")
        params.append(end)
    if invest_level:
        s = str(invest_level).strip()
        if s.endswith("+"):
            try:
                v = float(s[:-1])
                where.append(f"construct_price >= {ph}")
                params.append(v)
            except Exception:
                pass
        elif "-" in s:
            a, b = s.split("-", 1)
            try:
                va = float(a)
                vb = float(b)
                where.append(f"construct_price >= {ph}")
                params.append(va)
                where.append(f"construct_price < {ph}")
                params.append(vb)
            except Exception:
                pass
    if ids:
        id_list = [x.strip() for x in str(ids).split(",") if x.strip()]
        if id_list:
            in_ph = ",".join([ph] * len(id_list))
            where.append(f"id IN ({in_ph})")
            params.extend(id_list)
    return " AND ".join(where), params


@app.get(f"{API_PREFIX}/scheme-projects")
def scheme_projects(
    page: int = Query(1),
    limit: int = Query(20),
    keyword: str | None = Query(None),
    province: str | None = Query(None),
    city: str | None = Query(None),
    project_stage: str | None = Query(None),
    project_type: str | None = Query(None),
    invest_level: str | None = Query(None),
    start: str | None = Query(None),
    end: str | None = Query(None),
    ids: str | None = Query(None),
) -> Dict[str, Any]:
    assert storage is not None
    safe_page = max(1, int(page or 1))
    safe_limit = max(1, min(int(limit or 20), 500))
    where_sql, params = _sp_build_where(keyword, province, city, project_stage, project_type, invest_level, start, end, ids)

    cnt_row = storage.fetchone(
        f"SELECT COUNT(1) AS cnt FROM t_scheme_project WHERE {where_sql}",
        tuple(params),
    )
    total = int((cnt_row or {}).get("cnt", 0) or 0)

    if storage_type == "sqlite":
        sql = f"SELECT * FROM t_scheme_project WHERE {where_sql} ORDER BY CAST(rate_time AS INTEGER) DESC, created_at DESC LIMIT ? OFFSET ?"
        rows = storage.fetchall(sql, tuple(params + [safe_limit, (safe_page - 1) * safe_limit]))
    else:
        sql = f"SELECT * FROM t_scheme_project WHERE {where_sql} ORDER BY rate_time DESC, created_at DESC LIMIT %s OFFSET %s"
        rows = storage.fetchall(sql, tuple(params + [safe_limit, (safe_page - 1) * safe_limit]))
    return {"code": 200, "data": {"list": rows, "total": total}}


@app.get(f"{API_PREFIX}/scheme-projects/stats/district")
def scheme_projects_district_stats(
    keyword: str | None = Query(None),
    province: str | None = Query(None),
    city: str | None = Query(None),
    project_stage: str | None = Query(None),
    project_type: str | None = Query(None),
    invest_level: str | None = Query(None),
    start: str | None = Query(None),
    end: str | None = Query(None),
) -> Dict[str, Any]:
    assert storage is not None
    where_sql, params = _sp_build_where(keyword, province, city, project_stage, project_type, invest_level, start, end, None)
    rows = storage.fetchall(
        f"SELECT district_name, COUNT(1) AS cnt FROM t_scheme_project WHERE {where_sql} GROUP BY district_name ORDER BY cnt DESC",
        tuple(params),
    )
    return {"code": 200, "data": {"rows": rows}}


@app.post(f"{API_PREFIX}/scheme-projects")
def scheme_projects_create(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    assert storage is not None
    row = dict(payload or {})
    row_id = str(row.get("id") or "") or str(uuid.uuid4())
    row["id"] = row_id
    cols = [
        "id",
        "num",
        "code",
        "name",
        "scheme_id",
        "scheme_name",
        "task_type",
        "completion_status",
        "construct_scale",
        "construct_nature",
        "construct_price",
        "construct_datetime_start",
        "construct_datetime_end",
        "construct_datetime",
        "apply_status",
        "user_id",
        "user_name",
        "province",
        "city",
        "district",
        "province_name",
        "city_name",
        "district_name",
        "rate_time",
    ]
    values = [row.get(c) for c in cols]
    if storage_type == "sqlite":
        ph = ",".join(["?"] * len(cols))
        sql = f"INSERT INTO t_scheme_project({','.join(cols)}) VALUES ({ph})"
        storage.execute(sql, tuple(values))
    else:
        ph = ",".join(["%s"] * len(cols))
        sql = f"INSERT INTO t_scheme_project({','.join(cols)}) VALUES ({ph})"
        storage.execute(sql, tuple(values))
    return {"code": 200, "data": {"id": row_id}}


if __name__ == "__main__":
    import argparse
    import uvicorn

    parser = argparse.ArgumentParser()
    parser.add_argument("--init-db", action="store_true")
    parser.add_argument("--seed-demo", action="store_true")
    parser.add_argument("--no-seed-demo", action="store_true")
    args = parser.parse_args()

    seed_demo = _seed_on_startup_enabled()
    if args.seed_demo:
        seed_demo = True
    if args.no_seed_demo:
        seed_demo = False

    if args.init_db:
        st, st_type = _init_storage()
        storage = st
        storage_type = st_type
        if seed_demo:
            _seed_if_empty()
            _seed_attachments_if_empty()
            _seed_scheme_projects_if_empty()
        print(f"init-db ok: storage={st_type}")
        raise SystemExit(0)

    uvicorn.run(app, host="0.0.0.0", port=_env_int("KB_PORT", 9010))
