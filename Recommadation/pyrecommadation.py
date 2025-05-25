import cohere
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from langchain.llms import Cohere
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_google_genai import ChatGoogleGenerativeAI # type: ignore

app = Flask(__name__)
CORS(app)

# Initialize Cohere with API key
cohere_client = cohere.Client("BBK74cEhpbUdIj0gyOiSIEeg6F0L9ISHe6Bfo9HF")  # Replace with your Cohere API key

# Initialize LangChain Cohere
cohere_llm = Cohere(cohere_api_key="BBK74cEhpbUdIj0gyOiSIEeg6F0L9ISHe6Bfo9HF")  # Replace with your Cohere API key

# Initialize Langchain with the Gemini API key
# lc = Langchain(api_key="AIzaSyAuVwzksyAl-eATP99mxACJq1Z1MLOscZc")
googleLLM = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key="AIzaSyAuVwzksyAl-eATP99mxACJq1Z1MLOscZc")


# Create a prompt template for LangChain (using the same structure from your example)
template = """Given the following preferences:
- Budget: {budget}
- Risk Tolerance: {risk_tolerance}
- Investment Duration: {duration}
- Investment Goal: {goal}
- Interested Cryptocurrencies: {interest}

Based on this data, recommend cryptocurrencies to invest in from this information: {crypto_data}."""

prompt = PromptTemplate(template=template, input_variables=["budget", "risk_tolerance", "duration", "goal", "interest", "crypto_data"])
llm_chain = LLMChain(prompt=prompt, llm=cohere_llm)
google_llm_chain = LLMChain(llm=googleLLM, prompt=prompt, verbose=True)

def fetch_crypto_data():
    url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd"
    response = requests.get(url)
    return response.json()

@app.route('/recommend', methods=['POST'])
def recommend_crypto():
    data = request.json
    budget = float(data.get("budget", 0)) 
    risk_tolerance = data.get("risk_tolerance")
    duration = data.get("duration")
    goal = data.get("goal")
    interest = data.get("interest")

    # Fetch real-time crypto data
    crypto_data = fetch_crypto_data()

    # Use LangChain and Cohere to generate recommendations
    cohere_recommendation = llm_chain.run({
        "budget": budget,
        "risk_tolerance": risk_tolerance,
        "duration": duration,
        "goal": goal,
        "interest": interest,
        "crypto_data": crypto_data
    })
    
    # Use LangChain and Gemini to generate recommendations
    gemini_recommendation = google_llm_chain.run({
        "budget": budget,
        "risk_tolerance": risk_tolerance,
        "duration": duration,
        "goal": goal,
        "interest": interest,
        "crypto_data": crypto_data
    })

   

    return jsonify({
        "cohere_recommendation": cohere_recommendation,
        "gemini_recommendation": gemini_recommendation
    })

if __name__ == "__main__":
    app.run(debug=True, port=3000)



