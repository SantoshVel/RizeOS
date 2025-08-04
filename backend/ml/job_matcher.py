from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util
import fitz  # PyMuPDF
import base64

app = Flask(__name__)

# Load BERT model - your exact model
model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_resume_text_from_base64(base64_string):
    """Extract text from base64 PDF data"""
    pdf_data = base64.b64decode(base64_string)
    doc = fitz.open(stream=pdf_data, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text

# Your exact recommendation function
def recommend_jobs_bert(resume_text, job_descriptions, top_n=5):
    # Encode the resume and job descriptions
    resume_embedding = model.encode(resume_text, convert_to_tensor=True)
    job_embeddings = model.encode(job_descriptions, convert_to_tensor=True)

    # Calculate cosine similarity
    cosine_scores = util.cos_sim(resume_embedding, job_embeddings)[0]

    # Sort by similarity
    top_results = sorted(list(enumerate(cosine_scores)), key=lambda x: x[1], reverse=True)[:top_n]
    recommendations = [(job_descriptions[i], float(score)) for i, score in top_results]
    return recommendations

@app.route('/match', methods=['POST'])
def match_jobs():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    if 'resume' not in data:
        return jsonify({'error': 'Resume not found in request'}), 400
    
    if 'jobs' not in data:
        return jsonify({'error': 'Jobs not found in request'}), 400

    try:
        # Extract resume text from base64
        resume_base64 = data['resume']
        resume_text = extract_resume_text_from_base64(resume_base64)
        
        # Get jobs data
        jobs_data = data['jobs']
        
        # Prepare job descriptions for matching
        job_descriptions = []
        
        for job in jobs_data:
            # Combine title, description, and skills for better matching
            description = job.get('description', '')
            title = job.get('title', '')
            skills = job.get('skills', '')
            
            # Create full description text
            if isinstance(skills, list):
                skills_text = ', '.join(skills)
            else:
                skills_text = str(skills) if skills else ''
            
            full_description = f"{title}. {description}. Skills: {skills_text}".strip()
            job_descriptions.append(full_description)

        # Use your exact recommendation function with top 5 matches
        recommendations = recommend_jobs_bert(resume_text, job_descriptions, top_n=5)
        
        # Create matches in the format your Node.js expects
        matches = []
        for i, (job_desc, score) in enumerate(recommendations):
            # Find the job index in original data
            job_index = job_descriptions.index(job_desc)
            matches.append({
                "job_id": jobs_data[job_index]['id'],
                "score": score
            })

        return jsonify({"matches": matches})

    except Exception as e:
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)