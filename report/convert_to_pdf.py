import os
import sys
import win32com.client

def convert_docx_to_pdf(docx_path, pdf_path):
    print(f"Converting:\n  Input:  {docx_path}\n  Output: {pdf_path}")
    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    try:
        doc = word.Documents.Open(os.path.abspath(docx_path))
        # 17 represents wdExportFormatPDF in Word COM
        doc.SaveAs(os.path.abspath(pdf_path), FileFormat=17)
        doc.Close()
        print("Conversion successful!")
    except Exception as e:
        print("Error during conversion:", e)
        raise
    finally:
        word.Quit()

if __name__ == "__main__":
    docx = r"C:\Users\LENOVO\.gemini\antigravity\scratch\RepairSathi\report\RepairSathi_AI_Project_Report.docx"
    pdf = r"C:\Users\LENOVO\.gemini\antigravity\scratch\RepairSathi\report\RepairSathi_AI_Project_Report.pdf"
    convert_docx_to_pdf(docx, pdf)
