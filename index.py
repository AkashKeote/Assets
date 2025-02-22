from flask import Flask, request, session, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import datetime
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build

app = Flask(__name__)
CORS(app)

app.secret_key = os.getenv("SECRET_KEY", "default_secret")

# API Keys from Environment Variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
CHATGPT_API_KEY = os.getenv("CHATGPT_API_KEY")
GOOGLE_CREDENTIALS_JSON = os.getenv("GOOGLE_CREDENTIALS_JSON")  
SHEET_ID = os.getenv("SHEET_ID")  

# Google Sheets API setup
def init_google_sheets(sheet_name):
    try:
        creds = service_account.Credentials.from_service_account_info(
            json.loads(os.getenv("GOOGLE_CREDENTIALS_JSON")),
            scopes=["https://www.googleapis.com/auth/spreadsheets"]
        )
        service = build("sheets", "v4", credentials=creds)
        return service, os.getenv("SHEET_ID"), sheet_name
    except Exception as e:
        print("❌ Google Sheets Error:", str(e))
        return None, None, None

@app.route("/")
def serve_index():
    github_url = "https://raw.githubusercontent.com/AkashKeote/Assets/main/index.html"
    response = requests.get(github_url)
    
    if response.status_code == 200:
        return response.text  
    else:
        return "Failed to load the page", 500

@app.route("/static/<path:filename>")
def serve_static(filename):
    return send_from_directory("static", filename)

@app.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory('images', filename)

def chat_with_gemini(user_input):
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "google/gemini-pro",
        "messages": [{"role": "user", "content": user_input}]
    }
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()  
        return response.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"Gemini Error: {str(e)}")
        return "Sorry, I couldn't process that request."

def chat_with_chatgpt(user_input):
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {CHATGPT_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "openai/gpt-3.5-turbo",
        "messages": [{"role": "user", "content": user_input}]
    }
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()  
        return response.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"ChatGPT Error: {str(e)}")
        return "Sorry, I couldn't process that request."

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message")

    # Initialize session if not present
    if "userData" not in session:
        session["userData"] = {"bot_choice": None, "name": None, "email": None, "contact": None}
    
    userData = session["userData"]

    # Bot selection
    if not userData["bot_choice"]:
        userData["bot_choice"] = user_input.lower()
        session["userData"] = userData
        session.modified = True
        return jsonify({"response": "Great! Now, what's your name?"})

    # Collect name
    if not userData["name"]:
        userData["name"] = user_input
        session["userData"] = userData  
        session.modified = True  
        return jsonify({"response": "Got your name! What's your email?"})

    # Collect email
    if not userData["email"]:
        userData["email"] = user_input
        session["userData"] = userData
        session.modified = True
        return jsonify({"response": "Thanks! What's your mobile number?"})

    # Collect contact
    if not userData["contact"]:
        userData["contact"] = user_input
        session["userData"] = userData
        session.modified = True
        return jsonify({"response": "Now, how can I assist you?"})

    # Get AI Response based on bot choice
    bot_choice = userData["bot_choice"]
    bot_response = chat_with_chatgpt(user_input) if bot_choice == "chatgpt" else chat_with_gemini(user_input)

    # Log conversation to Google Sheets
    try:
        service, SHEET_ID, sheet_name = init_google_sheets("akashkeote")
        if service:
            values = [[userData["name"], userData["email"], userData["contact"], user_input, datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), bot_choice, bot_response]]
            body = {"values": values}
            service.spreadsheets().values().append(
                spreadsheetId=SHEET_ID,
                range=f"{sheet_name}!A1",
                valueInputOption="RAW",
                body=body
            ).execute()
            print("📊 Conversation logged successfully")
        else:
            print("❌ Logging Failed: Google Sheets service initialization failed")
    except Exception as e:
        print("❌ Logging Failed:", str(e))

    return jsonify({"response": bot_response})

if __name__ == "__main__":
    app.run(debug=True)
