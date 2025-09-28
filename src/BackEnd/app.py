from flask import Flask
from flask_cors import CORS

# Importa os módulos (Blueprints)
from CadastroEstudante import estudantes_bp
from CadastroDeRotas import rotas_bp
from InscricaoEstudante import inscricoes_bp
from CadastroMotorista import motoristas_bp  # módulo motoristas
from notificacoes import notificacoes_bp


app = Flask(__name__)
CORS(app)

# Registra os Blueprints
app.register_blueprint(estudantes_bp, url_prefix="/api/estudantes")
app.register_blueprint(rotas_bp, url_prefix="/api/rotas")
app.register_blueprint(inscricoes_bp, url_prefix="/inscricaoEstudante")
app.register_blueprint(motoristas_bp, url_prefix="/api/motoristas")  # motoristas
app.register_blueprint(notificacoes_bp, url_prefix="/api/notificacoes")

# Rota de teste
@app.route("/")
def index():
    return "API do TCC Unibus funcionando!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
