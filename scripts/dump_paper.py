import os
import docx

base_dir = r"C:\Users\SAMEER\.gemini\antigravity\scratch\disasteros"
path = os.path.join(base_dir, "24BDS1154_24BDS1171_Project1_Paper1-1-1.docx")
doc = docx.Document(path)

with open(os.path.join(base_dir, "scripts", "paper_structure.txt"), "w", encoding="utf-8") as f:
    for i, p in enumerate(doc.paragraphs):
        txt = p.text.strip()
        if txt:
            f.write(f"[{i:03d}] {txt}\n")

print("Dumped structure to scripts/paper_structure.txt")
