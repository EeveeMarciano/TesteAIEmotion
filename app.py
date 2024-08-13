import os
from flask import Flask, render_template, request, jsonify
import openai
from deepface import DeepFace
import cv2
import numpy as np
import logging
from dotenv import load_dotenv

app = Flask(__name__)

# Configuração da API OpenAI
#openai.api_key = ''

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Configuração da API OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# Configuração de logging
logging.basicConfig(level=logging.INFO)

# Rota para a página principal
@app.route('/')
def index():
    logging.info("Acessando a página principal")
    return render_template('index.html')

# Rota para o chat
@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_input = request.json.get('message')
        emotion = request.json.get('emotion')
        logging.info(f"Received message: {user_input}, emotion: {emotion}")

        # Gera resposta usando OpenAI
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": f"O usuário está se sentindo {emotion}. Responda com empatia."},
                {"role": "user", "content": user_input}
            ]
        )
        logging.info(f"OpenAI response: {response}")

        #return jsonify({"response": response.choices[0].message['content'].strip()})
        message_content = response.choices[0].message.content
        logging.info(f"message_content response: {message_content}")
        #logging.info(f"message_content response: {message_content} (Sua emoção: {emotion})")
                     
        return jsonify({"response": message_content, "emotion":emotion})
    except Exception as e:
        logging.error(f"Erro no chat: {e}")
        return jsonify({"error": str(e)}), 500

# Rota para analisar emoção
@app.route('/analyze_emotion', methods=['POST'])
def analyze_emotion():
    
    try:
        logging.info("Iniciando análise de emoção")
        file = request.files['image'].read()
        npimg = np.frombuffer(file, np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
        logging.info("Imagem recebida e decodificada")

        result = DeepFace.analyze(img, actions=['emotion'], enforce_detection=False)
        logging.info(f"Resultado da análise de emoção: {result}")
        
        emotion = result[0]['dominant_emotion'][:]
    except Exception as e:
        logging.error(f"Erro na detecção de face: {e}")
        emotion = 'neutro'
    
    return jsonify({"emotion": emotion})

if __name__ == '__main__':
    logging.info("Iniciando aplicação Flask")
    app.run(debug=True)