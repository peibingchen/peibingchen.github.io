"""Compose the two original ReCast figures without changing their content."""

from pathlib import Path
import shutil
import subprocess
import tempfile

from PIL import Image
from pypdf import PdfReader, PdfWriter, Transformation


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "images"
SOURCES = [ASSETS / "teaser.pdf", ASSETS / "overall_pipeline.pdf"]
OUTPUT = ASSETS / "recast-figures.pdf"


def main():
    pages = []
    for source in SOURCES:
        reader = PdfReader(source)
        if len(reader.pages) != 1:
            raise ValueError(f"Expected one figure page in {source.name}")
        page = reader.pages[0]
        page.transfer_rotation_to_content()
        pages.append(page)

    # Match the two figure widths and stack the teaser above the pipeline.
    width, padding, gap = 1200, 20, 20
    content_width = width - 2 * padding
    scales = [content_width / float(page.mediabox.width) for page in pages]
    heights = [float(page.mediabox.height) * scale for page, scale in zip(pages, scales)]
    height = sum(heights) + 2 * padding + gap
    writer = PdfWriter()
    canvas = writer.add_blank_page(width=width, height=height)
    y = height - padding
    for index, (page, scale, page_height) in enumerate(zip(pages, scales, heights)):
        y -= page_height
        x0, y0 = float(page.mediabox.left), float(page.mediabox.bottom)
        transform = Transformation().translate(-x0, -y0).scale(scale).translate(padding, y)
        canvas.merge_transformed_page(page, transform)
        if index == 0:
            y -= gap
    writer.add_metadata({"/Title": "ReCast - Teaser and Overall Pipeline"})
    with OUTPUT.open("wb") as stream:
        writer.write(stream)

    renderer = shutil.which("pdftoppm")
    if not renderer:
        raise RuntimeError("pdftoppm is required to render the combined PDF")
    with tempfile.TemporaryDirectory(prefix="recast-figure-") as scratch:
        prefix = str(Path(scratch) / "combined")
        subprocess.run([renderer, "-f", "1", "-singlefile", "-scale-to-x", "2400",
                        "-scale-to-y", "-1", "-png", str(OUTPUT), prefix], check=True)
        with Image.open(prefix + ".png") as source:
            figure = source.convert("RGB")
            figure.save(ASSETS / "recast-preview.png", optimize=True)
            preview = figure.copy()
            preview.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
            preview.save(ASSETS / "recast-preview.webp", quality=92, method=6)
            print(f"Combined PDF: {OUTPUT.name}, {width} x {height:.1f} pt")
            print(f"Preview: {preview.width} x {preview.height} px")


if __name__ == "__main__":
    main()
