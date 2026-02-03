import unittest
import os
import sys
from pathlib import Path
import unittest.mock as mock

# Add current directory to path to import app
sys.path.append(str(Path(__file__).parent))
from app import DocParserService

# Try to import docx, if not available, we skip docx tests or mock them
try:
    from docx import Document
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False

class TestDocParserService(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path("test_files")
        self.test_dir.mkdir(exist_ok=True)
        
    def tearDown(self):
        for f in self.test_dir.glob("*"):
            try:
                os.remove(f)
            except:
                pass
        try:
            os.rmdir(self.test_dir)
        except:
            pass

    def create_dummy_docx(self, filename, content):
        path = self.test_dir / filename
        doc = Document()
        doc.add_paragraph(content)
        doc.save(path)
        return str(path)

    def test_extract_docx(self):
        if not HAS_DOCX:
            self.skipTest("python-docx not installed")
        content = "Hello World DOCX"
        path = self.create_dummy_docx("test.docx", content)
        text = DocParserService.extract_text(path, "docx")
        self.assertIn(content, text)

    def test_extract_pdf_mock(self):
        # Mock pypdf.PdfReader to avoid needing a real PDF with text
        with mock.patch('app.pypdf.PdfReader') as MockReader:
            mock_page = mock.Mock()
            mock_page.extract_text.return_value = "Hello World PDF"
            
            instance = MockReader.return_value
            instance.pages = [mock_page]
            
            path = self.test_dir / "test.pdf"
            # Create a dummy file so file existence check passes if any
            with open(path, "wb") as f:
                f.write(b"dummy pdf content")
                
            text = DocParserService.extract_text(str(path), "pdf")
            self.assertIn("Hello World PDF", text)

    def test_unsupported_type(self):
        text = DocParserService.extract_text("dummy", "txt")
        self.assertEqual(text, "")

if __name__ == '__main__':
    unittest.main()
