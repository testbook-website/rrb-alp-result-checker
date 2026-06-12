import os
import re
import sys
import pypdf

# Set standard output to use UTF-8 encoding to avoid Windows console errors
sys.stdout.reconfigure(encoding='utf-8')

def inspect_pdf(pdf_path):
    print(f"=== Inspecting {pdf_path} ===")
    try:
        reader = pypdf.PdfReader(pdf_path)
        num_pages = len(reader.pages)
        print(f"Total Pages: {num_pages}")
        
        # Print text from the first page
        first_page_text = reader.pages[0].extract_text()
        print("\n--- FIRST PAGE TEXT PREVIEW (FIRST 1500 CHARS) ---")
        print(first_page_text[:1500])
        print("\n--- END OF PREVIEW ---")
        
        # Let's search for potential roll numbers (e.g., sequences of digits, 15 to 17 digits long)
        digits_pattern = re.compile(r'\b\d{15,17}\b')
        matches = digits_pattern.findall(first_page_text)
        print(f"Found {len(matches)} potential roll numbers (15-17 digits) on first page:")
        print(matches[:20])
        
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")

def main():
    workspace = r"c:\Users\Admin\Desktop\rrb-alp-result-checker"
    files = [f for f in os.listdir(workspace) if f.endswith('.pdf')]
    for file in files:
        inspect_pdf(os.path.join(workspace, file))

if __name__ == "__main__":
    main()
