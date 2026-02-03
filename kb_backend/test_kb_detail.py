import importlib.util
import tempfile
import unittest
from pathlib import Path


def _load_kb_app():
    app_path = Path(__file__).resolve().parent / "app.py"
    spec = importlib.util.spec_from_file_location("kb_app", app_path)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


class KnowledgeBaseDetailTests(unittest.TestCase):
    def setUp(self) -> None:
        self.kb = _load_kb_app()
        tmp = tempfile.NamedTemporaryFile(suffix=".sqlite3", delete=False)
        tmp.close()
        self.db_path = Path(tmp.name)
        self.kb.storage = self.kb.SQLiteStorage(self.db_path)
        self.kb.storage_type = "sqlite"
        self.kb.storage.ensure_schema()
        self.kb._seed_if_empty()
        self.kb._seed_attachments_if_empty()

    def tearDown(self) -> None:
        try:
            self.db_path.unlink(missing_ok=True)
        except Exception:
            pass

    def _first_item_id(self) -> int:
        row = self.kb.storage.fetchone("SELECT id FROM kb_item ORDER BY id ASC LIMIT 1", ())
        self.assertIsNotNone(row)
        return int(row["id"])

    def test_item_detail_contains_attachments_and_favorite_status(self):
        item_id = self._first_item_id()
        res = self.kb.item(self.kb.ItemRequest(id=item_id, user_id="u1"))
        item = (res.get("data") or {}).get("item") or {}
        self.assertEqual(int(item.get("id")), item_id)
        self.assertIn("attachments", item)
        self.assertTrue(isinstance(item["attachments"], list))
        self.assertGreaterEqual(len(item["attachments"]), 1)
        self.assertFalse(bool(item.get("is_favorited")))

    def test_favorite_toggle_updates_count_and_status(self):
        item_id = self._first_item_id()
        res1 = self.kb.favorite_toggle(self.kb.FavoriteToggleRequest(user_id="u1", item_id=item_id))
        data1 = (res1.get("data") or {})
        self.assertTrue(bool(data1.get("is_favorited")))
        self.assertGreaterEqual(int(data1.get("favorite_count") or 0), 1)

        res2 = self.kb.item(self.kb.ItemRequest(id=item_id, user_id="u1"))
        item2 = (res2.get("data") or {}).get("item") or {}
        self.assertTrue(bool(item2.get("is_favorited")))
        self.assertEqual(int(item2.get("favorite_count") or 0), int(data1.get("favorite_count") or 0))

        res3 = self.kb.favorite_toggle(self.kb.FavoriteToggleRequest(user_id="u1", item_id=item_id))
        data3 = (res3.get("data") or {})
        self.assertFalse(bool(data3.get("is_favorited")))

    def test_download_all_increments_download_count_and_returns_url(self):
        item_id = self._first_item_id()
        before = self.kb.storage.fetchone("SELECT download_count FROM kb_item WHERE id = ?", (item_id,))
        before_cnt = int((before or {}).get("download_count", 0) or 0)

        res = self.kb.download_all(self.kb.DownloadAllRequest(user_id="u1", item_id=item_id))
        data = res.get("data") or {}
        self.assertTrue(str(data.get("download_url") or "").startswith("/kb-api/item/download_file"))
        self.assertEqual(int(data.get("download_count") or 0), before_cnt + 1)

        after = self.kb.storage.fetchone("SELECT download_count FROM kb_item WHERE id = ?", (item_id,))
        after_cnt = int((after or {}).get("download_count", 0) or 0)
        self.assertEqual(after_cnt, before_cnt + 1)

    def test_expert_items_have_image_urls(self):
        row = self.kb.storage.fetchone("SELECT id FROM kb_item WHERE column_code = 'expert' ORDER BY id ASC LIMIT 1", ())
        self.assertIsNotNone(row)
        item_id = int(row["id"])
        res = self.kb.item(self.kb.ItemRequest(id=item_id, user_id="u1"))
        item = (res.get("data") or {}).get("item") or {}
        imgs = item.get("image_urls")
        self.assertTrue(isinstance(imgs, list))
        self.assertGreaterEqual(len(imgs), 1)
        self.assertTrue(str(imgs[0]).endswith("/static/uploads/zhuanjia.png"))
