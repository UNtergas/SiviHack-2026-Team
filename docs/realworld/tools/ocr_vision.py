"""OCR the text-less pages of a PDF with macOS Vision (free, offline). Text pages keep their layer."""
import sys, time
import pymupdf
import Quartz, Vision
from Foundation import NSURL

src, out = sys.argv[1], sys.argv[2]
doc = pymupdf.open(src)
parts = []
t0 = time.time()
ocr_pages = 0
for i, page in enumerate(doc):
    text = page.get_text().strip()
    if len(text) >= 50:
        parts.append(f"\n\n<!-- page {i + 1} (text) -->\n\n{text}")
        continue
    png = f"/tmp/ocr_page_{i + 1}.png"
    page.get_pixmap(dpi=200).save(png)
    url = NSURL.fileURLWithPath_(png)
    isrc = Quartz.CGImageSourceCreateWithURL(url, None)
    img = Quartz.CGImageSourceCreateImageAtIndex(isrc, 0, None)
    req = Vision.VNRecognizeTextRequest.alloc().init()
    req.setRecognitionLevel_(Vision.VNRequestTextRecognitionLevelAccurate)
    req.setUsesLanguageCorrection_(True)
    handler = Vision.VNImageRequestHandler.alloc().initWithCGImage_options_(img, None)
    ok, err = handler.performRequests_error_([req], None)
    lines = [o.topCandidates_(1)[0].string() for o in (req.results() or [])]
    parts.append(f"\n\n<!-- page {i + 1} (ocr) -->\n\n" + "\n".join(lines))
    ocr_pages += 1
    if ocr_pages % 20 == 0:
        print(f"ocr {ocr_pages} pages, {time.time() - t0:.0f}s", flush=True)
open(out, "w").write("".join(parts))
print(f"done: {len(doc)} pages, {ocr_pages} via OCR, {len(''.join(parts))} chars, {time.time() - t0:.0f}s")
