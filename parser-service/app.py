from fastapi import FastAPI, UploadFile, File
import fitz
import tempfile
import os

app = FastAPI()


@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename)[1]

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        temp_path = tmp.name

    doc = fitz.open(temp_path)

    text = ""

    for page in doc:
        text += page.get_text()

    doc.close()
    os.remove(temp_path)

    return {
        "pages": len(text.split("\f")),
        "text": text
    }