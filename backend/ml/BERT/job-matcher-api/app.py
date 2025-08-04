# flask_ml_service.py
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util
import fitz  # PyMuPDF
import base64
import io

app = Flask(__name__)
model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_text_from_pdf(base64_pdf):
    pdf_bytes = base64.b64decode(base64_pdf)
    pdf_stream = io.BytesIO(pdf_bytes)
    doc = fitz.open(stream=pdf_stream, filetype='pdf')
    text = ""
    for page in doc:
        text += page.get_text()
    return text.strip()

@app.route('/match-jobs', methods=['POST'])
def match_jobs():
    try:
        data = request.get_json()
        resume_b64 = data['resume']
        jobs = data['jobs']  # Expecting array of jobs with 'description'

        resume_text = extract_text_from_pdf(resume_b64)
        if not resume_text:
            return jsonify({'message': 'No text found in resume', 'matches': []}), 400

        job_texts = [job['description'] for job in jobs]
        resume_embedding = model.encode(resume_text, convert_to_tensor=True)
        job_embeddings = model.encode(job_texts, convert_to_tensor=True)

        scores = util.cos_sim(resume_embedding, job_embeddings)[0]
        sorted_indices = scores.argsort(descending=True)

        matched_jobs = []
        for idx in sorted_indices[:5]:  # Return top 5 matches
            job = jobs[int(idx)]
            matched_jobs.append({
                'jobId': str(job['_id']),
                'score': float(scores[int(idx)])
            })

        return jsonify({'message': 'Jobs matched successfully', 'matches': matched_jobs}), 200

    except Exception as e:
        return jsonify({'message': 'Error processing request', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001)
