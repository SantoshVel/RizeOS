from sentence_transformers import SentenceTransformer, util
import fitz  # PyMuPDF

# Load BERT model
model = SentenceTransformer('all-MiniLM-L6-v2')  # Lightweight & fast, you can also try 'paraphrase-MiniLM-L12-v2'

# Extract text from PDF resume
def extract_resume_text(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

# Recommend jobs
def recommend_jobs_bert(resume_text, job_descriptions, top_n=3):
    # Encode the resume and job descriptions
    resume_embedding = model.encode(resume_text, convert_to_tensor=True)
    job_embeddings = model.encode(job_descriptions, convert_to_tensor=True)

    # Calculate cosine similarity
    cosine_scores = util.cos_sim(resume_embedding, job_embeddings)[0]

    # Sort by similarity
    top_results = sorted(list(enumerate(cosine_scores)), key=lambda x: x[1], reverse=True)[:top_n]
    recommendations = [(job_descriptions[i], float(score)) for i, score in top_results]
    return recommendations
    job_descriptions = [
    "Looking for a data scientist with Python, Pandas, Machine Learning.",
    "Frontend Developer with React, JavaScript, HTML, CSS.",
    "Backend Developer with Node.js, Express, MongoDB, APIs.",
    "AI/ML Engineer with experience in NLP, Deep Learning, PyTorch.",
    "DevOps engineer with Docker, Kubernetes, AWS, CI/CD.",
    "Software engineer skilled in Java, Spring Boot, Microservices.",
    "Data Analyst with SQL, Excel, Tableau, and data cleaning skills.",
    "Cybersecurity analyst with experience in network protection, firewalls, and risk management.",
    "Cloud architect familiar with Azure, AWS, infrastructure scaling.",
    "Research scientist in machine learning and computer vision.",
]

# Upload and read resume
resume_text = extract_resume_text("")  # Change to your file
# Get top 3 recommended jobs
results = recommend_jobs_bert(resume_text, job_descriptions, top_n=3)

for idx, (job, score) in enumerate(results):
    print(f"{idx+1}. Score: {score:.2f} | Job: {job}")