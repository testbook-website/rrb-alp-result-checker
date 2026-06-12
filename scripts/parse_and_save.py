import os
import re
import json
import sys
import pypdf

# Ensure console supports UTF-8
sys.stdout.reconfigure(encoding='utf-8')

def extract_roll_numbers_from_pdf(pdf_path):
    print(f"Parsing {pdf_path}...")
    try:
        reader = pypdf.PdfReader(pdf_path)
        digits_pattern = re.compile(r'\b\d{16}\b')
        roll_numbers = set()
        
        for page_num, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                matches = digits_pattern.findall(text)
                roll_numbers.update(matches)
                
        print(f"Extracted {len(roll_numbers)} unique roll numbers from {pdf_path}.")
        return sorted(list(roll_numbers))
    except Exception as e:
        print(f"Error parsing {pdf_path}: {e}")
        return []

def main():
    workspace = r"c:\Users\Admin\Desktop\rrb-alp-result-checker"
    data_dir = os.path.join(workspace, "data")
    os.makedirs(data_dir, exist_ok=True)
    
    zones = ["Ahmedabad", "Gorakhpur", "Prayagraj"]
    results = {}
    
    total_extracted = 0
    for zone in zones:
        pdf_name = f"{zone}.pdf"
        pdf_path = os.path.join(workspace, pdf_name)
        if os.path.exists(pdf_path):
            roll_list = extract_roll_numbers_from_pdf(pdf_path)
            results[zone] = roll_list
            total_extracted += len(roll_list)
        else:
            print(f"Warning: PDF file for zone {zone} not found at {pdf_path}")
            
    output_path = os.path.join(data_dir, "roll_numbers.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
        
    print(f"\nAll done! Saved {total_extracted} roll numbers to {output_path}")

if __name__ == "__main__":
    main()
